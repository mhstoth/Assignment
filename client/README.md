# discoverRegensburg - SvelteKit Frontend

SvelteKit (TypeScript) Frontend für die discoverRegensburg Placemark-Anwendung.

## Setup

1. Installiere Dependencies:
```sh
npm install
```

2. Erstelle eine `.env` Datei (siehe `.env.example`):
```env
PUBLIC_API_BASE_URL=http://localhost:3000
```

Für Production:
```env
PUBLIC_API_BASE_URL=https://discover-regensburg-3.onrender.com
```

## Entwicklung

Starte den Development-Server:

```sh
npm run dev

# oder mit automatischem Browser-Öffnen
npm run dev -- --open
```

Die Anwendung läuft standardmäßig auf `http://localhost:5173`.

**Wichtig:** Stelle sicher, dass das Backend auf `http://localhost:3000` läuft (siehe Root-README).

## Scripts

- `npm run dev` - Startet den Development-Server
- `npm run build` - Erstellt eine Production-Build
- `npm run preview` - Vorschau der Production-Build
- `npm run check` - TypeScript-Typ-Check
- `npm run lint` - ESLint ausführen
- `npm run format` - Prettier ausführen

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Build Tool**: Vite
- **Linting**: ESLint
- **Formatting**: Prettier

## Projektstruktur

```
client/
├── src/
│   ├── lib/          # Shared components & utilities
│   └── routes/       # SvelteKit routes (file-based routing)
├── static/           # Static assets
└── .env              # Environment variables
```
