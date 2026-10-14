// Transcrição da fala do vídeo (Whisper). Corpo: áudio WAV cru (audio/wav), até ~4 MB.
// Precisa de sessão válida e OPENAI_API_KEY. Modelo opcional: OPENAI_TRANSCRIBE_MODEL.
const { env, preflight, fail, readToken } = require("./_lib");

const MAX_BYTES = 4.4 * 1024 * 1024;

function readRaw(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    const parts = [];
    let size = 0;
    req.on("data", (c) => { size += c.length; if (size > MAX_BYTES) { reject(new Error("grande")); req.destroy(); } else parts.push(c); });
    req.on("end", () => resolve(Buffer.concat(parts)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (preflight(req, res)) return;
  let email;
  try { email = readToken(req); } catch (e) { return fail(res, 500, e.message); }
  if (!email) return fail(res, 401, "Sessão expirada. Entre de novo.");
  if (!env("OPENAI_API_KEY")) return fail(res, 501, "Transcrição precisa de OPENAI_API_KEY no servidor.");

  let audio;
  try { audio = await readRaw(req); } catch (e) { return fail(res, 413, "Áudio grande demais."); }
  if (!audio.length) return fail(res, 400, "Áudio vazio.");

  const form = new FormData();
  form.append("file", new Blob([audio], { type: "audio/wav" }), "audio.wav");
  form.append("model", env("OPENAI_TRANSCRIBE_MODEL") || "whisper-1");
  form.append("language", "pt");
  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { authorization: "Bearer " + env("OPENAI_API_KEY") },
      body: form,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return fail(res, r.status, d?.error?.message || "Erro na transcrição.");
    res.status(200).json({ text: String(d.text || "").trim() });
  } catch (e) {
    fail(res, 502, "Não conectou na OpenAI.");
  }
};
