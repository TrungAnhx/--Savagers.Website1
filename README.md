# Savagers Website

Savagers is a cinematic Vite + React + TypeScript website for reading, music, and quiet focus. The app combines full-screen ambient backgrounds, Liquid Glass navigation, a curated article archive, local reading history, floating notes, and a lightweight mixtape player.

The production app is deployed as a static Vite site on Vercel. Pushing to the connected `main` branch triggers a redeploy.

## Core Experience

- Full-screen video backgrounds with a dark cinematic visual direction.
- Responsive Liquid Glass navigation with balanced desktop controls.
- Auto-hiding reading chrome on article pages: scroll down to focus, scroll up or hover the top edge to reveal navigation.
- Focused Journal reading surface with stronger contrast for bright or dark backgrounds.
- Paginated archive capped at 100 articles.
- Runtime-loaded article metadata and per-article content files to keep the app lighter.
- Sanitized article HTML before rendering.
- Local saved articles, reading history, and reading progress.
- JSON-driven music playlists with shuffle, repeat, mute, volume, and persisted preferences.
- Floating ambient notes that can be toggled and extended locally.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS + Tailwind Typography
- Framer Motion
- Lucide React
- Cheerio for article-fetch utilities

## Project Structure

```text
.
├── public/
│   ├── backgrounds/        # Video backgrounds served from /backgrounds
│   ├── data/
│   │   ├── articles.json   # Article metadata index
│   │   ├── articles/       # Per-article HTML content payloads
│   │   ├── fetch-status.json
│   │   └── tracks.json     # Music categories and track metadata
│   ├── musics/             # Audio files served from /musics
│   └── eagle.png           # Favicon/app icon asset
├── scripts/
│   └── fetch-spiderum.cjs  # Spiderum/txnam archive updater
├── src/
│   ├── components/         # Shared UI components
│   ├── hooks/              # Audio, articles, bookmarks, history
│   ├── pages/              # Home, Journal, Mixtapes, About, Status
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Sanitizing, article filters, formatting
│   ├── App.tsx             # App shell, routes, nav, audio shell
│   ├── index.css           # Theme, Liquid Glass, reading styles
│   └── main.tsx            # React entrypoint
└── dist/                   # Generated production build
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Article Archive

The Journal uses a split data model:

- `public/data/articles.json` stores lightweight metadata.
- `public/data/articles/{articleId}.json` stores full HTML content.
- `src/hooks/useArticles.ts` loads metadata.
- `src/hooks/useArticleContent.ts` loads full content only when an article is opened.

The fetch script is:

```bash
node scripts/fetch-spiderum.cjs
```

Useful environment variables:

| Variable | Purpose |
| --- | --- |
| `SPIDERUM_SOURCE_URLS` | Comma-separated Spiderum source pages |
| `SPIDERUM_MAX_ARTICLES` | Maximum fresh Spiderum articles to pull |
| `TXNAM_SOURCE_URL` | txnam source URL |
| `TXNAM_MAX_ARTICLES` | Maximum txnam homepage articles to keep |
| `TOTAL_ARTICLE_LIMIT` | Archive cap, currently 100 |
| `FETCH_RETRY_ATTEMPTS` | Retry count for temporary source failures |
| `FETCH_TIMEOUT_MS` | Request timeout in milliseconds |

GitHub Actions runs the same script through `.github/workflows/fetch-articles.yml`. If Spiderum is temporarily unavailable but stored Spiderum articles still exist, the script preserves the archive, records the stored counts, and exits successfully instead of breaking the site.

## Music Workflow

Audio files live in `public/musics/`. Playlist metadata lives in:

```text
public/data/tracks.json
```

To add a track:

1. Add a web-ready MP3, for example `public/musics/track11.mp3`.
2. Add the track metadata and `/musics/track11.mp3` URL to `tracks.json`.
3. Run `npm run build`.
4. Commit and push to `main` for Vercel redeploy.

Large audio/video files increase repository size and Vercel bandwidth usage. Prefer compressed assets that are already web-ready.

## Styling Notes

- Theme variables and Liquid Glass styles are in `src/index.css`.
- Display typography uses `Noto Serif Display`; body text uses `Inter`.
- Article pages use `.reader-shell`, `.reader-meta`, and `.reader-prose` for focused readability.
- Repeated archive items use `.article-list-card` for a darker glass surface over changing backgrounds.
- Keep background assets in `public/backgrounds/` and reference them with root-relative URLs.

## Deployment

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Every push to `main` should trigger a Vercel deployment when the GitHub repository is connected to Vercel.

## Quality Checklist

Before pushing:

```bash
npm run lint
npm run build
```

For UI changes, also verify:

- Home nav spacing on desktop and mobile.
- Journal list readability over multiple backgrounds.
- Article page nav auto-hide and reveal behavior.
- Music playback controls and persisted volume settings.
- Mobile bottom tab bar does not cover critical actions.

## Git Conventions

Use short Conventional Commit style messages:

```text
feat: add reader focus mode
fix: keep article archive on spiderum outages
perf: reduce article loading cost
docs: refresh project readme
```

## Troubleshooting

### Article Fetch Fails

Check `public/data/fetch-status.json` and the latest GitHub Actions run. Spiderum can return `503`; the current script should keep stored content when fallback data exists.

### Article Opens Empty

The metadata exists, but the matching file in `public/data/articles/` may be missing or unreadable. Re-run the fetch script or update the article content file.

### Music Does Not Appear

Confirm the MP3 is inside `public/musics/` and the matching URL exists in `public/data/tracks.json`.

### Build Tools Missing

Run:

```bash
npm install
```

Then retry:

```bash
npm run lint
npm run build
```

## License

This repository is private. Treat the source code, article data, music, and video assets as project-owned unless a separate license is added.
