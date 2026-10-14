// Login do Estúdio de Cards. E-mail e senha ficam só nas variáveis de ambiente da Vercel:
//   LOGIN_EMAIL, LOGIN_PASSWORD, SESSION_SECRET (texto aleatório longo)
const { env, preflight, fail, makeToken, sameText } = require("./_lib");

module.exports = async (req, res) => {
  if (preflight(req, res)) return;
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  const password = String((req.body || {}).password || "");
  const wantEmail = String(env("LOGIN_EMAIL") || "").trim().toLowerCase();
  const wantPass = String(env("LOGIN_PASSWORD") || "");
  if (!wantEmail || !wantPass) return fail(res, 500, "Servidor sem LOGIN_EMAIL ou LOGIN_PASSWORD.");
  const okEmail = sameText(email, wantEmail), okPass = sameText(password, wantPass);
  if (!okEmail || !okPass) {
    await new Promise((r) => setTimeout(r, 800)); // freia tentativa de adivinhar senha
    return fail(res, 401, "E-mail ou senha errados.");
  }
  try {
    const { token, until } = makeToken(wantEmail);
    res.status(200).json({ token, until, email: wantEmail });
  } catch (e) {
    fail(res, 500, e.message);
  }
};
