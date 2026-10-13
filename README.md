# Estúdio de Cards · @ojhonatta1

Web app que transforma um Reels de referência no formato card do perfil @ojhonatta1: foto, nome, frase e a cena embaixo, em 1080×1920, enquadrado para o Feed e para o Reels.

## O que ele faz

1. **Lê o vídeo:** separa a cena (o que se mexe) do texto parado e corta as bordas.
2. **Lê a frase original** com IA e sugere 3 versões que geram identificação e marcação. Se o vídeo não tiver frase, analisa o vídeo inteiro (7 quadros e legendas de fala na tela) e cria 3 ideias.
3. **Exporta o card** em MP4 (no iPhone) com o áudio original.
4. **Escreve a legenda** enquanto exporta: gancho, reflexão, CTA de marcação + seguir/stories e 3 hashtags.
5. **Guarda no aparelho:** os 3 últimos vídeos e as 50 últimas legendas (IndexedDB). Nada vai para servidor.

## Instalar

O app fica publicado no GitHub Pages deste repositório.

- **iPhone:** abra no Safari → Compartilhar → "Adicionar à Tela de Início".
- **Android:** Chrome → menu ⋮ → "Instalar app".
- **Computador:** Chrome ou Edge → ícone de instalar na barra de endereço.

## IA

- **Dentro do app do Claude** (versão artifact), usa o Claude da própria conta, sem chave.
- **No web app instalado**, usa a API da Anthropic. Abra **Ajustes do web app** no fim da página e cole sua chave (`sk-ant-…`). A chave fica só no `localStorage` do aparelho e vai direto para `api.anthropic.com`.
- Modelos padrão: `claude-sonnet-5-5` (ideias e legendas) e `claude-haiku-5-5` (leitura da frase). Dá para trocar em Ajustes.

> Não compartilhe o celular desbloqueado com o app aberto em Ajustes: a chave aparece lá. Para uso em equipe, o próximo passo é um proxy (ex.: função na Vercel) que guarda a chave no servidor.

## Estrutura

```
src/app.html          página (fonte); __AVATAR__ é trocado pela foto
src/avatar.jpg        foto padrão do card
src/sw.template.js    service worker (offline + atualização)
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
