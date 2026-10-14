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

## Servidor (Vercel): login e IA protegidos

O app é público no GitHub Pages, mas o login e a IA passam por funções na Vercel (`api/`). A senha e as chaves ficam só nas variáveis de ambiente da Vercel; o celular guarda apenas o token da sessão (30 dias).

1. vercel.com → Add New → Project → importe `ljhonatta/estudio-de-cards` (framework "Other", sem build).
2. Settings → Environment Variables:
   - `LOGIN_EMAIL`: seu e-mail
   - `LOGIN_PASSWORD`: sua senha do app
   - `SESSION_SECRET`: um texto aleatório longo (40+ caracteres)
   - `OPENAI_API_KEY`: chave da OpenAI (IA + transcrição da fala). Ou `ANTHROPIC_API_KEY` (sem transcrição).
   - Opcionais: `OPENAI_MODEL` (padrão `gpt-4.1`), `OPENAI_MODEL_QUICK` (`gpt-4.1-mini`), `OPENAI_TRANSCRIBE_MODEL` (`whisper-1`).
3. Deploy. O endereço padrão é `https://estudio-de-cards.vercel.app`; se for outro, troque em ⋮ → Configurações.

Rotas: `api/login` (e-mail e senha → token assinado), `api/ai` (frases, ideias e legendas), `api/transcribe` (fala do vídeo, WAV até ~2 min). Só aceitam pedidos do GitHub Pages e do localhost.

Sem servidor no ar, o app ainda funciona: o login vira um acesso só do aparelho e dá para colar uma chave em ⋮ → Configurações → "Sem servidor".

## O que a IA faz

- **Fala do vídeo:** o áudio é convertido no aparelho para WAV 16 kHz e transcrito (Whisper). A transcrição entra nas ideias de frase e nas legendas.
- **Legendas:** 3 opções por vídeo (Reflexão, História, Direta), com CTA para o perfil escolhido. Toque em 1, 2 ou 3 para trocar.
- **Perfis:** ⋮ → Perfis. Cada perfil tem foto, nome, arroba, selo e um texto "sobre o perfil" que a IA usa. No passo 3 do editor você escolhe qual perfil vai no card.

## Estrutura

```
src/app.html          página (fonte); __AVATAR__ é trocado pela foto
src/avatar.jpg        foto padrão do card
src/sw.template.js    service worker (offline + atualização)
api/                  servidor na Vercel: login, IA e transcrição
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

- A transcrição da fala precisa de chave da OpenAI (no servidor ou no aparelho).
- O áudio em alta do Instagram precisa ser adicionado no app do Instagram na hora de postar.
- Exportação em tempo real: um vídeo de 15 s leva cerca de 15 s. Limite de 2 minutos por vídeo.
