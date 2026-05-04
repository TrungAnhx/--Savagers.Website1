# Savagers Website

Savagers is a Vite, React, and TypeScript web app built as a calm digital space for reading, music, and focused browsing. The site combines an ambient landing experience, a curated journal archive, a mixtape player, floating notes, and an about page for the Savagers group.

The project is currently hosted on Vercel and is designed as a static frontend app. Production output is generated into `dist/`.

## Highlights

- Cinematic fullscreen video backgrounds across the main routes.
- Journal archive with up to 100 curated articles from Spiderum and txnam.
- Article detail view with sanitized HTML rendering.
- Fallback UI for articles whose full content is not available in the local archive.
- Long URL and media overflow protection inside article content.
- Browser-friendly Journal navigation so Back returns to the article list.
- Music and mixtape experience with playlist, shuffle, repeat, volume, mute, and persisted player preferences.
- Floating ambient notes, including user-added local notes stored in `localStorage`.
- Responsive layout built with Tailwind CSS.
- Display typography tuned for Vietnamese titles through `Noto Serif Display`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Tailwind Typography
- Framer Motion
- Lucide React icons
- Cheerio for article scraping utilities

## Project Structure

```text
.
├── public/
│   ├── backgrounds/        # Video backgrounds served directly
│   ├── data/
│   │   ├── articles.json   # Article metadata index
│   │   └── articles/       # Per-article HTML content payloads
│   ├── musics/             # Audio tracks served directly
│   └── eagle.png           # Site icon asset
├── scripts/
│   └── fetch-spiderum.cjs  # Article collection/update script
├── src/
│   ├── components/         # Shared UI components
│   ├── data/               # Local app data
│   ├── hooks/              # Reusable React hooks
│   ├── pages/              # Route-level pages
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Article helpers and HTML sanitization
│   ├── App.tsx             # App shell, routes, nav, audio player shell
│   ├── index.css           # Tailwind layers and global CSS
│   └── main.tsx            # React entrypoint
├── dist/                   # Generated production build
└── package.json
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing experience with ambient hero and featured journal entries |
| `/journal` | Paginated article archive and article reading view |
| `/mixtapes` | Curated audio playlists and playback controls |
| `/about` | Savagers story, values, and local floating note input |

## Getting Started

### Requirements

- Node.js 20 or newer is recommended.
- npm, using the checked-in `package-lock.json`.

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173/
```

### Build Production Bundle

```bash
npm run build
```

This runs TypeScript project checks and writes the production bundle to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Run `tsc -b` and create a production build |
| `npm run preview` | Serve the built `dist/` output locally |
| `npm run lint` | Run ESLint across the repository |

## Article Data

The Journal reads article metadata from:

```text
public/data/articles.json
```

Each article detail loads its content from:

```text
public/data/articles/{articleId}.json
```

Expected article metadata shape:

```ts
interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  link?: string;
  source?: 'spiderum' | 'txnam';
}
```

Expected article content payload:

```json
{
  "id": "article-id",
  "content": "<p>Sanitized article HTML...</p>"
}
```

The app sanitizes rendered HTML in `src/utils/sanitizeHtml.ts`. Blocked elements include scripts, styles, iframes, embeds, object tags, links, and meta tags. Image loading is set to lazy and async decoding is enabled.

If a content file exists but has no readable content, the Journal shows a fallback message, the excerpt, and a link to the original source when available.

## Updating Articles

The scraping utility is:

```bash
node scripts/fetch-spiderum.cjs
```

Useful environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SPIDERUM_SOURCE_URLS` | Spiderum profile and category URLs | Comma-separated Spiderum source pages |
| `TXNAM_SOURCE_URL` | `https://txnam.net` | txnam source page |
| `SPIDERUM_MAX_ARTICLES` | `28` | Max articles collected per Spiderum source |
| `TXNAM_MAX_ARTICLES` | `10` | Max txnam articles collected |
| `TOTAL_ARTICLE_LIMIT` | `100` | Max total archive items |

Example:

```bash
TOTAL_ARTICLE_LIMIT=100 node scripts/fetch-spiderum.cjs
```

The script writes metadata to `public/data/articles.json` and per-article content files to `public/data/articles/`.

## Media Assets

Static assets in `public/` are served from the site root.

Examples:

```text
public/backgrounds/bg1.mp4        -> /backgrounds/bg1.mp4
public/musics/track1.mp3          -> /musics/track1.mp3
public/data/articles.json         -> /data/articles.json
public/eagle.png                  -> /eagle.png
```

When adding large audio or video files, keep an eye on repository size and Vercel bandwidth. Prefer compressed MP4 and MP3 assets that are already web-ready.

## Styling Notes

- Tailwind CSS is configured in `tailwind.config.js`.
- Global theme variables live in `src/index.css`.
- Display font is `Noto Serif Display`.
- Body font is `Inter`.
- Article typography uses Tailwind Typography plus `.article-content` overflow rules.
- Reusable glass styling is implemented through `.liquid-glass` classes in `src/index.css`.

## Local Storage Keys

The app stores a few user preferences locally in the browser:

| Key | Purpose |
| --- | --- |
| `savagers_showWhispers` | Whether floating notes are visible |
| `savagers_notes` | User-added floating notes |
| `savagers_isShuffle` | Audio shuffle setting |
| `savagers_repeatMode` | Audio repeat mode |
| `savagers_volume` | Current audio volume |
| `savagers_previousVolume` | Volume value restored after mute |

## Deployment

This app can be deployed as a standard Vite static site.

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Every push to the connected production branch, usually `main`, should trigger a Vercel redeploy.

## Git Workflow

Use Conventional Commit style:

```text
feat: add new user-visible feature
fix: correct a bug or regression
perf: improve runtime or loading performance
docs: update documentation
```

Recommended pre-push checks:

```bash
npm run lint
npm run build
```

## Release Workflow

Create a version tag and GitHub Release when publishing a meaningful milestone.

Example for `v1.0.0`:

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin main
git push origin v1.0.0
```

Then create a GitHub Release from the `v1.0.0` tag in the repository Releases tab.

Suggested release note format:

```md
## v1.0.0

### Fixed
- Added fallback UI for archived articles with empty saved content.
- Prevented long article URLs and media links from stretching the page horizontally.
- Fixed Journal article navigation so browser Back returns to the article list.

### Improved
- Switched display typography to Noto Serif Display for better Vietnamese title rendering.
```

## Troubleshooting

### GitHub Push Fails With `Permission denied (publickey)`

The local machine does not have an SSH key that GitHub accepts for the repo.

Check SSH auth:

```bash
ssh -T git@github.com
```

If needed, add a GitHub SSH key or switch the remote to an authenticated HTTPS setup.

### `eslint` or `tsc` Is Not Found

Dependencies are missing. Run:

```bash
npm install
```

Then retry:

```bash
npm run lint
npm run build
```

### Article Opens But Looks Empty

The metadata entry exists, but its matching content file may be empty or missing readable text. The UI will show a fallback message and source link when available. Re-run the article fetch script or manually update the matching file in `public/data/articles/`.

## License

This repository is private. Treat the code, article data, audio, and video assets as project-owned unless a separate license is added.
