#!/usr/bin/env python3
"""Gera os arquivos publicados a partir de src/.

  src/app.html    -> página (fragmento, com __AVATAR__ no lugar da foto)
  src/avatar.jpg  -> foto padrão do card
  src/sw.template.js -> service worker (recebe a versão do build)

Saída:
  index.html      -> web app (GitHub Pages), documento completo com manifest e ícones
  sw.js           -> service worker com cache versionado
  dist/artifact.html -> mesma página para publicar como artifact no Claude
"""
import base64, hashlib, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"

app = (SRC / "app.html").read_text(encoding="utf-8")
avatar = base64.b64encode((SRC / "avatar.jpg").read_bytes()).decode()
page = app.replace("__AVATAR__", avatar)

HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b0c">
<meta name="description" content="Estúdio de Cards @ojhonatta1: remonta Reels no formato card, cria frases e legendas com IA.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Estúdio">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
img{max-width:100%}
[hidden]{display:none!important}
</style>
</head>
<body>
"""
TAIL = "\n</body>\n</html>\n"

(ROOT / "index.html").write_text(HEAD + page + TAIL, encoding="utf-8")

dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
(dist / "artifact.html").write_text(page, encoding="utf-8")

version = hashlib.sha1((HEAD + page).encode()).hexdigest()[:10]
sw = (SRC / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", version)
(ROOT / "sw.js").write_text(sw, encoding="utf-8")

print(f"ok · versão {version} · index.html {len(HEAD + page + TAIL)//1024} KB")
