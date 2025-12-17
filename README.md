# LeseTextr

Differenzierte Lesetexte für Lehrpersonen – generiert mit KI nach CEFR-Niveaus und LP21.

## Features

- ✅ **Ohne Registrierung nutzbar** – Textgenerierung für alle
- 🔐 **Mit Registrierung** – Favoriten speichern & zusätzliche Export-Formate
- 📚 **6 CEFR-Niveaus** (A1-C2)
- 📝 **4 Textsorten** (Sachtext, Erzählung, Bericht, Beschreibung)
- ❓ **Automatische Verständnisfragen**
- 💾 **Favoriten-Verwaltung** (nur für eingeloggte Nutzer)
- 📄 **Export-Formate**: PDF, TXT (alle) | CSV, Markdown (nur eingeloggt)

## Setup

### 1. Environment Variables

Erstelle eine `.env.local` Datei:

```bash
# OpenAI API Key
OPENAI_API_KEY=dein_openai_api_key

# Supabase (für Auth & Favoriten)
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
```

### 2. Supabase Setup

1. Erstelle ein Supabase-Projekt: https://supabase.com
2. Führe das SQL-Schema aus (`supabase-schema.sql`) im SQL Editor aus
3. Kopiere die Keys aus Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Installation & Start

```bash
npm install
npm run dev
```

Die App läuft auf http://localhost:3000

## Deployment auf Vercel

1. Push zu GitHub
2. In Vercel: Neues Projekt → GitHub Repo verbinden
3. Environment Variables setzen (siehe oben)
4. Deploy!

## Wichtige Hinweise

- **Ohne Login**: Nutzer können Texte generieren, kopieren, als PDF/TXT exportieren
- **Mit Login**: Zusätzlich Favoriten speichern, CSV/Markdown exportieren
- **Favoriten**: Werden nur für eingeloggte Nutzer gespeichert (user_id)
- **Supabase Auth**: Email/Password basiert, keine E-Mail-Verifizierung erforderlich (kannst du später aktivieren)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Supabase (Auth + Database)
- OpenAI API
- Lucide React (Icons)

