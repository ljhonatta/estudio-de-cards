// Funções comuns do servidor do Estúdio de Cards (arquivos com _ não viram rota na Vercel).
const crypto = require("crypto");

const DEFAULT_ORIGINS = ["https://ljhonatta.github.io", "http://localhost:8000", "http://127.0.0.1:8000"];
const SESSION_DAYS = 30;

function origins() {
  const env = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return env.length ? env : DEFAULT_ORIGINS;
}

// CORS + método. Devolve true quando a resposta já foi enviada.
function preflight(req, res) {
  const origin = req.headers.origin || "";
  const ok = !origin || origins().includes(origin);
  if (origin && ok) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  if (!ok) { fail(res, 403, "Origem não permitida."); return true; }
  if (req.method !== "POST") { fail(res, 405, "Use POST."); return true; }
  return false;
}

function fail(res, status, message) {
  res.status(status).json({ error: { message } });
}

function secret() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length < 16) throw new Error("SESSION_SECRET ausente ou curto (mínimo 16 caracteres).");
  return s;
}

const b64u = (buf) => Buffer.from(buf).toString("base64url");
const sign = (data) => b64u(crypto.createHmac("sha256", secret()).update(data).digest());

function makeToken(email) {
  const until = Date.now() + SESSION_DAYS * 864e5;
  const body = b64u(JSON.stringify({ email, until }));
  return { token: body + "." + sign(body), until };
}

// Devolve o e-mail da sessão ou null.
function readToken(req) {
  const m = /^Bearer\s+(.+)$/.exec(req.headers.authorization || "");
  if (!m) return null;
  const [body, sig] = m[1].split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body)), got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.until > Date.now() ? p.email : null;
  } catch (e) {
    return null;
  }
}

// Compara sem vazar tempo (hash dos dois lados antes).
function sameText(a, b) {
  const h = (s) => crypto.createHash("sha256").update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

module.exports = { preflight, fail, makeToken, readToken, sameText };
