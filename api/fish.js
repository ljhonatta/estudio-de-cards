// Ponte para o Fish Audio: o navegador não consegue chamar a API deles direto (sem CORS).
// A chave vem do painel de quem usa e só é repassada ao Fish Audio; nada fica guardado aqui.
const { preflight, fail } = require("./_lib");

module.exports = async (req, res) => {
  if (preflight(req, res)) return;
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const key = String(b.key || "").trim();
    const text = String(b.text || "").trim();
    if (!key || !text) return fail(res, 400, "Faltou a chave do Fish Audio ou o texto.");
    if (text.length > 2000) return fail(res, 400, "Texto longo demais para uma cena (máximo 2.000 caracteres).");
    const corpo = { text, format: "mp3", mp3_bitrate: 128, normalize: true, latency: "normal" };
    if (b.voz) corpo.reference_id = String(b.voz).trim();
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", model: String(b.modelo || "s1") },
      body: JSON.stringify(corpo),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return fail(res, r.status, "Fish Audio: " + t.slice(0, 200));
    }
    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", r.headers.get("content-type") || "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(audio);
  } catch (e) {
    fail(res, 500, "Erro no servidor: " + String(e && e.message || e).slice(0, 200));
  }
};
