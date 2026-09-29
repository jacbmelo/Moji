<p align="center">
  <img src="build/plus/icons/256x256.png" alt="Moji Plus" width="128" />
</p>

<h1 align="center">Moji Plus</h1>

<p align="center">A lightweight, clean desktop app for opening, reading, editing, and exporting Markdown files.</p>

<p align="center"><strong>Current version:</strong> v1.0.0 · based on Moji v1.0.7</p>

> **Moji Plus is a derivative of [Moji](https://github.com/alexishida/Moji), created by [Alex Ishida](https://github.com/alexishida) and distributed under the MIT License.**
> It keeps receiving the changes made to the original project and adds its own changes, maintained independently.
> All credit for the original application goes to its author. See [CREDITS.md](CREDITS.md).

<p align="center">
  <img src="docs/repository-open-graph.png" alt="repository-open-graph" width="100%" />
</p>

<p align="center">
  <strong>Download:</strong>
  <a href="https://github.com/jacbmelo/Moji/releases/latest">GitHub Releases (jacbmelo/Moji)</a>
</p>

## Differences from the original Moji

Moji Plus has its own name, version, and releases, and installs next to the original Moji without sharing settings or recovery drafts.

| | Moji | Moji Plus |
|---|---|---|
| Repository | [alexishida/Moji](https://github.com/alexishida/Moji) | [jacbmelo/Moji](https://github.com/jacbmelo/Moji) |
| App ID | `com.alexishida.moji` | `com.jacbmelo.mojiplus` |
| Settings directory | `moji` | `moji-plus` |
| Updates | alexishida/Moji releases | jacbmelo/Moji releases |

Changes specific to Moji Plus are listed in [CHANGELOG.md](CHANGELOG.md).

## Features

Moji Plus includes every feature of the original Moji: split preview and editing, outline navigation, search and replace, Mermaid diagrams, KaTeX math, a localized UI in 15 languages, and export to PDF, HTML, and PNG. The full description of the original application, its screenshots, and its installation notes are in the original README, kept in [docs/upstream/README.md](docs/upstream/README.md).

On macOS the app is not signed. See [Installation › macOS](docs/upstream/README.md#macos) and replace `Moji.app` with `Moji Plus.app` in the commands.

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- npm

## Development

```bash
npm install
npm run dev
npm run verify
```

- `npm run verify`: TypeScript checks plus `scripts/check-branding.cjs`, which flags texts or links that still identify the app as the original Moji outside the credits.
- `npm run dist`, `dist:win`, `dist:linux`, `dist:mac`: package the app into `release/`.

## Keeping up with the original Moji

The original repository is configured as the `upstream` remote:

```bash
git remote add upstream https://github.com/alexishida/moji.git   # once
scripts/sync-upstream.sh
```

The script merges `upstream/main` into a `sync/upstream-<date>` branch, refreshes the copies in `docs/upstream/`, records the base version in `package.json` (`upstreamVersion`), and runs `npm run verify`. The full workflow, including how to publish a Moji Plus release, is in [.ai-framework/FORK.md](.ai-framework/FORK.md).

## Credits and license

- Original application: **Moji** by **Alex Ishida**, [github.com/alexishida/Moji](https://github.com/alexishida/Moji)
- Moji Plus modifications: João Melo, [github.com/jacbmelo/Moji](https://github.com/jacbmelo/Moji)

MIT © Alex Ishida (Moji) · MIT © João Melo (Moji Plus modifications). See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).
