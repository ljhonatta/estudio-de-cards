# Estúdio de Cards · @ojhonatta1

Web app que transforma um Reels de referência no formato card do perfil @ojhonatta1: foto, nome, frase e a cena embaixo, em 1080×1920, enquadrado para o Feed e para o Reels.

## O que ele faz

1. **Lê o vídeo:** separa a cena (o que se mexe) do texto parado e corta as bordas.
2. **Lê a frase original** com IA (ou, sem IA, com leitura no próprio aparelho) e sugere 3 versões que geram identificação e marcação. Se o vídeo não tiver frase, analisa o vídeo inteiro (7 quadros e legendas de fala na tela) e cria 3 ideias.
3. **Exporta o card** em MP4 (no iPhone) com o áudio original.
4. **Escreve a legenda** enquanto exporta: gancho, reflexão, CTA de marcação + seguir/stories e 3 hashtags.
5. **Login no aparelho:** na primeira vez você cria e-mail e senha; o login fica automático por 30 dias. Configurações e legendas ficam no menu ⋮.
6. **Guarda no aparelho:** os 3 últimos vídeos e as 50 últimas legendas (IndexedDB). Nada vai para servidor.

## Instalar

O app fica publicado no GitHub Pages deste repositório.

- **iPhone:** abra no Safari → Compartilhar → "Adicionar à Tela de Início".
- **Android:** Chrome → menu ⋮ → "Instalar app".
- **Computador:** Chrome ou Edge → ícone de instalar na barra de endereço.

## IA

- **Dentro do app do Claude** (versão artifact), usa o Claude da própria conta, sem chave.
- **No web app instalado**, usa o proxy na Vercel (`api/claude.js`). A chave da Anthropic fica só na Vercel; no app você digita apenas o **código de acesso** em **Ajustes do web app**.
- Sem proxy, ainda dá para colar uma chave (`sk-ant-…`) direto em Ajustes ("Sem proxy"). Ela fica no `localStorage` do aparelho.
- Modelos padrão: `claude-sonnet-5-5` (ideias e legendas) e `claude-haiku-5-5` (leitura da frase). Dá para trocar em Ajustes.

### Proxy na Vercel

1. vercel.com → Add New → Project → importe `ljhonatta/estudio-de-cards` (sem build, framework "Other").
2. Settings → Environment Variables: `ANTHROPIC_API_KEY` (sua chave) e `APP_CODE` (um código que só você sabe).
3. Deploy. O endereço fica `https://estudio-de-cards.vercel.app/api/claude` (se a Vercel der outro nome, troque em Ajustes).

O proxy só aceita pedidos do GitHub Pages e do localhost, com o código certo, e limita a resposta a 1600 tokens.

## Estrutura

```
src/app.html          página (fonte); __AVATAR__ é trocado pela foto
src/avatar.jpg        foto padrão do card
src/sw.template.js    service worker (offline + atualização)
api/claude.js         proxy da IA (função da Vercel)
build.py              gera index.html, sw.js e dist/artifact.html
index.html            web app publicado (gerado)
sw.js                 service worker publicado (gerado)
dist/artifact.html    versão para publicar como artifact no Claude (gerada)
manifest.webmanifest  instalação como app
icons/                ícones do app
```

## Atualizar

```bash
# edite src/app.html
python3 build.py
git add -A && git commit -m "..." && git push
```

O service worker muda de versão a cada build, então o app instalado pega a atualização na próxima abertura.

## Limites conhecidos

- A fala do vídeo só é entendida quando há legenda escrita na tela ou quando você preenche "Do que o vídeo fala?". Transcrição de áudio (Whisper) é o próximo passo, num backend.
- O áudio em alta do Instagram precisa ser adicionado no app do Instagram na hora de postar.
- Exportação em tempo real: um vídeo de 15 s leva cerca de 15 s. Limite de 2 minutos por vídeo.
