# Estúdio de Cards — guia para o Claude

Web app pessoal do Jhonatta (@ojhonatta1) para produzir Reels no formato card. Tudo roda no navegador; o único backend é o proxy da IA em `api/claude.js` (Vercel).

## Regras do projeto

- Edite só `src/app.html` (e `src/sw.template.js`; o proxy fica em `api/claude.js`). Depois rode `python3 build.py`. Nunca edite `index.html`, `sw.js` ou `dist/` à mão: são gerados.
- A mesma página roda em dois lugares:
  - **Artifact do Claude** (`IN_VIEWER` = `window.claude` existe): IA via `claude.use('sample')`, salvar via `claude.use('downloads')`. Publicar `dist/artifact.html` com capabilities `{"sample":{"images":true},"downloads":true}`.
  - **Web app** (GitHub Pages): IA via proxy na Vercel (`PROXY_URL`, header `x-app-code`; env `ANTHROPIC_API_KEY` e `APP_CODE`) ou, sem proxy, `fetch` direto em `api.anthropic.com` com a chave; config em `localStorage['estudioCards.ia']`; salvar via Web Share (iPhone) ou link de download.
- Os dois caminhos de IA passam por `getAI()`, que devolve `{json(prompt, {images, signal, modelTier}), limits()}`. Erros sempre como `{code}` (`not_granted`, `rate_limited`, `cancelled`, `upstream_error`, `invalid_json`).
- Persistência: IndexedDB `estudio-cards` com stores `videos` (máx. 3) e `legendas` (máx. 50). Padrão visual em `localStorage['estudioCards.v1']`.
- Layout do card: canvas 1080×1920; todo o conteúdo fica entre `FEED_TOP=285` e `FEED_BOT=1635` (área 4:5 do Feed).

## Voz das frases e legendas

- Frase em cima do vídeo = **reação** que faz a pessoa pensar "isso sou eu" ou lembrar de alguém e enviar.
- Formatos: "Eu quando…", "Você quando…", "POV:", "Aquela sensação de…", "Marca aquele amigo que…", "Manda pra quem…".
- Máx. 140 caracteres, linguagem do dia a dia, sem cara de coach, sem prometer dinheiro.
- Legenda: gancho, 2–3 parágrafos curtos, CTA de marcar/enviar + seguir @ojhonatta1 e ver os stories, exatamente 3 hashtags.
- Referências de viral do perfil (2,1 mi / 1,1 mi / 1 mi views): superação, dinheiro e status, ironia de solidão, humor de empreendedor.

## Próximos passos combinados

1. Transcrição de áudio (Whisper) para entender vídeos de fala sem legenda na tela.
2. Radar de referências (Apify + n8n) e publicação via API do Instagram.
