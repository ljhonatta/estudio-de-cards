// IA do Estúdio de Cards. Só responde com sessão válida (api/login).
// Usa OPENAI_API_KEY se existir; senão ANTHROPIC_API_KEY.
// Modelos opcionais: OPENAI_MODEL, OPENAI_MODEL_QUICK, ANTHROPIC_MODEL, ANTHROPIC_MODEL_QUICK.
const { env, preflight, fail, readToken } = require("./_lib");

const MAX_TOKENS = 3000;

module.exports = async (req, res) => {
  if (preflight(req, res)) return;
  let email;
  try { email = readToken(req); } catch (e) { return fail(res, 500, e.message); }
  if (!email) return fail(res, 401, "Sessão expirada. Entre de novo.");

  const b = req.body || {};
  const quick = b.tier === "quick";
  const prompt = String(b.prompt || "");
  const images = (Array.isArray(b.images) ? b.images : []).slice(0, 7).filter((x) => typeof x === "string");
  if (!prompt) return fail(res, 400, "Pedido sem texto.");

    let r;
  try {
    if (env("OPENAI_API_KEY")) {
      const content = images.map((d) => ({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + d } }));
      content.push({ type: "text", text: prompt });
      r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + env("OPENAI_API_KEY") },
        body: JSON.stringify({
          model: quick ? env("OPENAI_MODEL_QUICK") || "gpt-4.1-mini" : env("OPENAI_MODEL") || "gpt-4.1",
          max_completion_tokens: MAX_TOKENS,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content }],
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return fail(res, r.status, d?.error?.message || "Erro na OpenAI.");
      return res.status(200).json({ text: d.choices?.[0]?.message?.content || "" });
    }
    if (env("ANTHROPIC_API_KEY")) {
      const content = images.map((d) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: d } }));
      content.push({ type: "text", text: prompt });
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: quick ? env("ANTHROPIC_MODEL_QUICK") || "claude-haiku-5-5" : env("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content }],
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return fail(res, r.status, d?.error?.message || "Erro na Anthropic.");
      return res.status(200).json({ text: (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("") });
    }
    return fail(res, 500, "Servidor sem OPENAI_API_KEY nem ANTHROPIC_API_KEY.");
  } catch (e) {
    return fail(res, 502, "Não conectou na IA.");
  }
};
