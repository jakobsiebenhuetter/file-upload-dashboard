# TS_Webpack Dashboard ✨

**Kurzbeschreibung**

Ein kleines Dashboard/Web-Tool zum Verwalten von Dateien (Ordner, Uploads), automatischen Erzeugen von Thumbnails (Text / PDF / Video) und Anzeigen von Widgets mit UI-Komponenten wie Sidebar, Widget-Kacheln, Tooltip, Toasts, Filter etc. Frontend ist in **TypeScript + Webpack + Tailwind** geschrieben; das Backend läuft mit **Node/Express** und nutzt Puppeteer, ffmpeg und Multer für Thumbnailing und Datei-Uploads.

Der empfohlene Browser für die Verwendung ist Mozilla Firefox.

---

## 🔍 Features

- UI-Komponenten
  - Sidebar mit Ordnern und List-Items
  - Dashboard mit Widget-Kacheln (Titel, Erstellungsdatum, Thumbnail, Delete)
  - Tooltip für List-Items und Widget-Titel (Hover)
  - Toast-Nachrichten (mit Animation)
  - Filter-Komponente zum Suchen von Einträgen
- Backend-Funktionen
  - Datei-Upload (Multer) und Zuordnung zu Ordnern
  - Thumbnail-Generierung:
    - Text-Dateien → gerenderte HTML-Preview via Puppeteer → PNG
    - PDFs → `pdf-to-img`
    - Videos → ffmpeg Screenshots
  - CRUD-Endpunkte für Ordner und Dateien
- Speicherung: Metadata in `data/data.json`, Dateien in `data/Folders/`, Thumbnails in `data/Thumbnails/`

---

## 🗂️ Projektstruktur (Kurz)

- `src/` — Frontend-Komponenten (z. B. `Components/Widget.ts`, `Sidebar.ts`, `Tooltip.ts`, `Toast.ts`, `Filter.ts`) und Dashboard-Logik
- `backend/server.js` — Express-Server mit Upload- und Thumbnail-Logik
- `data/` — `Folders/`, `Thumbnails/`, `data.json`
- `postcss.config.mjs`, `webpack.config.js` — Build-Tooling

---

## ⚙️ Installation & Entwicklung (Windows)

1. Node.js (>=16) & npm installieren
2. Projektabhängigkeiten installieren:

```cmd
npm install
```

3. Frontend (Webpack DevServer) starten:

```cmd
npm run dev:build
```

4. Backend starten (Port 2000):

```cmd
cd backend && node server.js
```

5. App im Browser öffnen: `http://localhost:2000` (Server-setup benutzt `dist`), dieses wird bei nach 'dev:build' immer neu erstellt

---

## 📡 Relevante API-Endpunkte (Express)

- `GET /getJson` — Metadaten (Ordner, Dateien)
- `POST /upload` — Datei hochladen (FormData, Feldname `file`)
- `POST /delete-file` — Datei löschen (body: `{ fileId, folderId }`)
- `POST /create-folder` — Ordner erstellen (body: `{ text, id }`)
- `POST /delete-folder` — Ordner löschen (body: `{ id }`)

---