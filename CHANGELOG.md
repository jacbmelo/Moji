# Changelog

All notable changes to Moji Plus are documented in this file. Each release names the version of the original [Moji](https://github.com/alexishida/Moji) it is based on; the original changelog is kept in [docs/upstream/CHANGELOG.md](docs/upstream/CHANGELOG.md).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- PDF export no longer frames every page in a dark margin: the export forces the light color scheme, so the page margins print white.

## [1.0.0] - 2026-09-29 — based on Moji 1.0.7

### Added

- Light and dark themes now apply to the whole app — top bar, tabs, outline, status bar, source editor, settings/export/about panels, and dialogs — not only the Markdown preview. The app follows the OS theme by default, the top-bar toggle switches between light and dark, and Settings > General has a Theme option (System / Light / Dark). Exports still always use the light theme.
- YAML front matter at the top of a document (`---` … `---`) now renders as a syntax-highlighted YAML code block in the preview and in HTML, PDF, and PNG exports, instead of leaking into the page as a rule and a heading.
- Moji Plus identity: own name, app ID (`com.jacbmelo.mojiplus`), version, settings directory (`moji-plus`), and GitHub Releases (`jacbmelo/Moji`), so it installs next to the original Moji without sharing settings or recovery drafts.
- Own app icon and logo: the Markdown mark with "M+", in ink and seal red, with the right leg of the M ending in a brush stroke that crosses the frame, after the original Moji logo. The Welcome screen and About panel use a dark-ink version of the logo in the light theme. Vector sources are in `build/plus/`, and `npm run icons` regenerates the PNG files.
- About panel section "Based on" crediting Moji, its author Alex Ishida, the original repository, and the Moji version this build is based on.
- `scripts/sync-upstream.sh` to merge changes from the original Moji, and `scripts/check-branding.cjs` (run by `npm run verify`) to flag texts still naming the original app outside the credits.

### Changed

- The native title bar is gone: the top bar now fills the top of the window and keeps the native window controls — the traffic lights on macOS and the system controls overlay on Windows and Linux, painted in the colors of the active theme. Empty top bar space drags the window.
