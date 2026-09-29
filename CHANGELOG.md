# Changelog

All notable changes to Moji Plus are documented in this file. Each release names the version of the original [Moji](https://github.com/alexishida/Moji) it is based on; the original changelog is kept in [docs/upstream/CHANGELOG.md](docs/upstream/CHANGELOG.md).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-09-29 — based on Moji 1.0.7

### Added

- Moji Plus identity: own name, app ID (`com.jacbmelo.mojiplus`), version, settings directory (`moji-plus`), and GitHub Releases (`jacbmelo/Moji`), so it installs next to the original Moji without sharing settings or recovery drafts.
- Own app icon and logo: the Markdown mark with "M+", in ink and seal red. Vector sources are in `build/plus/`, and `npm run icons` regenerates the PNG files.
- About panel section "Based on" crediting Moji, its author Alex Ishida, the original repository, and the Moji version this build is based on.
- `scripts/sync-upstream.sh` to merge changes from the original Moji, and `scripts/check-branding.cjs` (run by `npm run verify`) to flag texts still naming the original app outside the credits.
