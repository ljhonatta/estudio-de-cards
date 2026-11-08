# Estúdio de Cards — guia para o Claude

Web app pessoal do Jhonatta (@ojhonatta1) para produzir Reels no formato card. Tudo roda no navegador; o backend são as funções da Vercel em `api/` (login, IA, transcrição). Uso pessoal: só o Jhonatta, no iPhone e no MacBook.

## Regras do projeto

- Edite só `src/app.html` (e `src/sw.template.js`; o servidor fica em `api/`). Depois rode `python3 build.py`. Nunca edite `index.html`, `sw.js` ou `dist/` à mão: são gerados.
- A mesma página roda em dois lugares:
  - **Artifact do Claude** (`IN_VIEWER` = `window.claude` existe): IA via `claude.use('sample')`, salvar via `claude.use('downloads')`. Publicar `dist/artifact.html` com capabilities `{"sample":{"images":true},"downloads":true}`.
  - **Web app** (GitHub Pages): IA via servidor na Vercel (`SERVER_URL`, token do `api/login` em `Authorization: Bearer`; env `LOGIN_EMAIL`, `LOGIN_PASSWORD`, `SESSION_SECRET`, `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`) ou, sem servidor, chave direta (Anthropic ou OpenAI); config em `localStorage['estudioCards.ia']`; salvar via Web Share (iPhone) ou link de download.
- Os dois caminhos de IA passam por `getAI()`, que devolve `{json(prompt, {images, signal, modelTier}), limits()}`. Erros sempre como `{code}` (`not_granted`, `rate_limited`, `cancelled`, `upstream_error`, `invalid_json`).
- Acesso: login pelo servidor (`estudioCards.sessao` = `{mode:'server',token,until,email}`, 30 dias). Se o servidor não responder, acesso só do aparelho (`estudioCards.conta` = hash PBKDF2), apagado no primeiro login pelo servidor. Nunca coloque e-mail, senha ou chave no código (repositório público). No artifact (`IN_VIEWER`) não há login.
- Menu ⋮ (gaveta lateral): Legendas geradas, Perfis (`estudioCards.perfis`, perfil atual em `estudioCards.perfilAtual`; `curProf()` alimenta o card, `voz()` e a legenda), Configurações (salvam sozinhas no `change`) e Conta.
- Fala do vídeo: `transcribe()` → WAV 16 kHz → `api/transcribe` ou OpenAI direto; `falaCtx()` entra nas ideias e na legenda. Legenda gera 3 opções (`job.captions`, `job.capSel`).
- **Modo automático (VPR Insta Full Postagens)**: projeto em `~/Insta Auto/vpr-insta-full`, mesmo Supabase. Conexão em ⋮ → Conexão VPR (`estudioCards.vpr` = `{url, anon, bucket, email}`; sessão do Supabase em `estudioCards.vpr.auth`). Nunca coloque URL/chave/senha no código.
  - Contrato: tabela `videos` (`numero`, `status` `baixando|na_fila|editando|pronto|agendado|postado|erro`, `autor_origem`, `legenda_origem`, `legenda`, `frases_alternativas` jsonb de textos, `arquivo_entrada`, `arquivo_pronto`, `conta_id`, `ordem`, `erro_msg`); bucket `videos` com `entrada/video-N.mp4` → `prontos/video-N.mp4` + `prontos/legenda-N.txt`. O agendador do VPR posta só `pronto` com `conta_id`.
  - Loop (`autoLoop`): `claimNext` pega o menor `numero` em `na_fila` e trava com update condicional (`status=na_fila` → `editando`; preso em `editando` há 20 min volta para a fila) → baixa a entrada → `loadVideo` (cena × texto, transcrição) → `state.pipeP` (frase lida + 3 ideias com `melhor`) → usa a melhor, salva as outras 2 em `frases_alternativas` → `exportCard()` (precisa sair MP4) → legenda (`job.capP`, melhor das 3) + `🎥 @autor_origem` → sobe os dois arquivos (`upsert`) → `status=pronto` com `legenda`, `arquivo_pronto`, `conta_id` (primeira conta ativa se vazio) e `ordem`. Erro → `status=erro`, `erro_msg='Edição: …'` e segue. Modos (`auto.mode`): `agora` (botão Rastrear: edita até a fila esvaziar e para, ou passa para `hora`), `hora` (checkbox, `estudioCards.vpr.hora`; re-rastreia a cada 60 min e retoma ao reabrir no primeiro toque), `continuo` (30 s).
  - Revisão (`openReview`/`reRender`): trava `pronto`→`editando`, re-renderiza com a frase alternativa sem IA (`loadVideo(file,{noAI:true})`, `exportCard({noCaption:true})`), sobrescreve o mesmo N e volta para `pronto`. A frase em uso fica em `estudioCards.vpr.frases` (só no aparelho).
  - Falhas que não são culpa do vídeo voltam para `na_fila` em vez de `erro`: IA sem resposta (`Frases:`/`Legenda:`, espera 5 min, vira erro na 3ª vez) e render incompleto (`exportCard` conta quadros e vigia `visibilitychange`; espera a aba voltar). Botão "Devolver erros de edição para a fila" = `erro_msg like 'Edição:%'` → `na_fila`.
  - `freeMemory()` entre vídeos (iPhone), aviso acima de 90 s no iPhone, Wake Lock enquanto liga; com a aba em segundo plano o render pausa (a trava de segurança do `exportCard` aborta com erro).
- Persistência: IndexedDB `estudio-cards` com stores `videos` (máx. 3) e `legendas` (máx. 50). Padrão visual em `localStorage['estudioCards.v1']`.
- Layout do card: canvas 1080×1920; todo o conteúdo fica entre `FEED_TOP=285` e `FEED_BOT=1635` (área 4:5 do Feed).

## Voz das frases e legendas

- Frase em cima do vídeo = **reação** que faz a pessoa pensar "isso sou eu" ou lembrar de alguém e enviar.
- Formatos: "Eu quando…", "Você quando…", "POV:", "Aquela sensação de…", "Marca aquele amigo que…", "Manda pra quem…".
- Máx. 140 caracteres, linguagem do dia a dia, sem cara de coach, sem prometer dinheiro.
- Legenda: gancho, 2–3 parágrafos curtos, CTA de marcar/enviar + seguir @ojhonatta1 e ver os stories, exatamente 3 hashtags.
- Referências de viral do perfil (2,1 mi / 1,1 mi / 1 mi views): superação, dinheiro e status, ironia de solidão, humor de empreendedor.

## Próximos passos combinados

1. Radar de referências (Apify + n8n). A publicação no Instagram já é feita pelo VPR Insta Full Postagens.
