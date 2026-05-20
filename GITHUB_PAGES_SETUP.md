# GitHub Pages Setup Guide

Guida per configurare e deployare l'esempio base su GitHub Pages.

## 📋 Prerequisiti

- Repository su GitHub (https://github.com/riky1/svg-panzoom)
- GitHub Actions abilitato (di default nei repository pubblici)

## 🚀 Configurazione (una sola volta)

### 1. Abilita GitHub Pages nel Repository

1. Vai a **Settings** → **Pages**
2. Sotto **Build and deployment**:
   - **Source**: seleziona `GitHub Actions`
   - Salva

### 2. Verifica il Workflow

Il workflow (`.github/workflows/deploy.yml`) è già configurato. Ogni volta che farai un `push` al branch `main`:

1. GitHub Actions avvia il workflow
2. Compila la demo con `pnpm run build:demo`
3. Genera i file nella cartella `docs`
4. Deploya automaticamente su GitHub Pages

## 🔄 Flusso di Lavoro

### Sviluppo locale della demo:

```bash
# Sviluppo con live reload
pnpm run dev:demo

# Build della demo per produzione
pnpm run build:demo
```

### Deploy su GitHub Pages:

```bash
# 1. Committa i tuoi cambiamenti
git add .
git commit -m "Update demo"

# 2. Pusha al branch main
git push origin main

# 3. GitHub Actions automaticamente:
#    - Compila la demo
#    - Deploya a GitHub Pages
```

### Monitora il deployment:

1. Vai al tab **Actions** del tuo repository
2. Cerca il workflow "Deploy Demo to GitHub Pages"
3. Clicca per vedere i dettagli

## 📍 URL della Demo

Una volta deployata, la demo sarà disponibile a:

```
https://riky1.github.io/svg-panzoom/
```

## 🔧 Dettagli Tecnici

### Cosa succede durante il build:

- **`BUILD_MODE=demo`** attiva la modalità demo in `vite.config.js`
- La cartella `examples/basic/` viene bundlata e compilata
- I file finali vanno in `docs/` (configurato per GitHub Pages)
- Il `base` path è impostato a `/svg-panzoom/` per il URL corretto

### Struttura dei file:

```
docs/
├── index.html          # Entry point dell'app
├── assets/
│   ├── main-xxx.js     # JavaScript compilato
│   └── style-xxx.css   # CSS compilato
└── examples/
    └── basic/
        └── ... (risorse dell'esempio)
```

## 🐛 Troubleshooting

### La demo non carica (errore 404)

- Verifica che il workflow sia completato con successo (tab Actions)
- Controlla che GitHub Pages sia impostato su "GitHub Actions" (Settings → Pages)
- Aspetta qualche minuto per il deploy

### Errori durante il build

- Controlla i log del workflow (tab Actions)
- Assicurati che tutti i file dell'esempio siano committati
- Verifica che `pnpm install` sia eseguito correttamente

### Stili non caricano

- Verifica che `import 'svg-panzoom/style.css'` sia presente in `examples/basic/main.js`
- Controlla la console del browser (F12) per errori di MIME type

## 📝 Note

- La cartella `docs` è ignorata in `.gitignore` per il build locale, ma è inclusa nei workflow di GitHub Actions
- Se sviluppi localmente, usa `pnpm run dev:demo` per il live reload
- Il deployment è completamente automatico dopo ogni push a `main`
