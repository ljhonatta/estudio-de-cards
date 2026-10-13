# Publicar no GitHub com o Claude Code

Abra o Terminal nesta pasta e rode `claude`. Depois cole:

> Crie o repositório público ljhonatta/estudio-de-cards no GitHub com esta pasta (git init, commit, gh repo create --public --source . --push), ative o GitHub Pages na branch main, pasta raiz, e me passe o link do app. Leia o CLAUDE.md antes.

Atalho no Terminal (se o `gh` já estiver logado):

```bash
cd ~/Desktop/estudio-de-cards
git init -b main && git add -A && git commit -m "Estúdio de Cards: web app"
gh repo create ljhonatta/estudio-de-cards --public --source . --push
gh api -X POST repos/ljhonatta/estudio-de-cards/pages -f "source[branch]=main" -f "source[path]=/"
```

O app fica em: https://ljhonatta.github.io/estudio-de-cards/
