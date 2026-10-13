// Proxy da IA do Estúdio de Cards (função da Vercel).
// A chave da Anthropic fica só na Vercel; o app manda o código de acesso.
// Variáveis de ambiente na Vercel:
//   ANTHROPIC_API_KEY  chave sk-ant-… (obrigatória)
//   APP_CODE           código de acesso que você digita no app (obrigatório)
//   ALLOWED_ORIGINS    opcional, separado por vírgula (padrão: GitHub Pages + localhost)

const DEFAULT_ORIGINS = ["https://ljhonatta.github.io", "http://localhost:8000", "http://127.0.0.1:8000"];
const MAX_TOKENS = 1600;

function origins() {
  const env = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return env.length ? env : DEFAULT_ORIGINS;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  if (origins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, x-app-code");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST." } });
  if (origin && !origins().includes(origin)) return res.status(403).json({ error: { message: "Origem não permitida." } });

  const key = process.env.ANTHROPIC_API_KEY, code = process.env.APP_CODE;
  if (!key || !code) return res.status(500).json({ error: { message: "Proxy sem ANTHROPIC_API_KEY ou APP_CODE na Vercel." } });
  if (req.headers["x-app-code"] !== code) return res.status(401).json({ error: { message: "Código de acesso inválido." } });

  const b = req.body || {};
  if (typeof b.model !== "string" || !b.model.startsWith("claude-") || !Array.isArray(b.messages)) {
    return res.status(400).json({ error: { message: "Pedido inválido." } });
  }

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: b.model, max_tokens: Math.min(Number(b.max_tokens) || MAX_TOKENS, MAX_TOKENS), messages: b.messages }),
    });
  } catch (e) {
    return res.status(502).json({ error: { message: "Não conectou na Anthropic." } });
  }
  res.status(r.status).setHeader("content-type", "application/json");
  res.end(await r.text());
};
