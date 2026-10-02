# Changelog

All notable changes to Moji Plus are documented in this file. Each release names the version of the original [Moji](https://github.com/alexishida/Moji) it is based on; the original changelog is kept in [docs/upstream/CHANGELOG.md](docs/upstream/CHANGELOG.md).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.1.0] - 2026-10-02 — based on Moji 1.0.7

### Added

- Open documents are watched for changes made by other applications. A document without unsaved edits reloads automatically with a short notice; one with unsaved edits, or whose file was deleted or moved, asks whether to reload, save under another name, or keep the local version. Background tabs are asked about when selected.
- Moji Plus reopens the tabs from the last session, in the same order and with the same active tab. A new "Reopen open files on startup" option (Settings > General, on by default) controls whether files without changes come back.
- Unsaved changes to files are now kept as recovery drafts, like untitled documents, when "Keep new documents and unsaved changes between sessions" is on: quitting no longer asks, and the files reopen with their changes and the unsaved-changes mark, whatever the reopen option says. Closing the tab still asks. If the file changed or was deleted while Moji Plus was closed, the external-change prompt appears.
- Saving a file that changed on disk since it was read no longer overwrites it silently: Moji Plus offers to replace it, save under another name, reload, or cancel. Atomic saves (temp file + rename) are detected, and the check also runs when the window regains focus.

### Changed

- The app reopens in the mode it was left in (preview or editor), with the outline shown or hidden, full width on or off, and the window maximized if it was. Full width used to reset on every launch.
- Each document keeps its reading position: switching tabs, or quitting and reopening, returns to the place it was read, in the preview and in the editor. A tab no longer opens at the scroll offset of the tab shown before it.
- Closing the tab of an untitled document with content now asks whether to save it, like a file with unsaved changes. With recovery drafts on it used to close without asking and discard the text.
- Undoing every edit (or retyping the original text) clears the unsaved-changes mark instead of leaving the document marked as changed.
- The recovery option is now labelled "Keep new documents and unsaved changes between sessions", since it also covers files.

## [1.0.2] - 2026-10-02 — based on Moji 1.0.7

### Changed

- The status bar token count is now shown as an estimate (~N), with a tooltip explaining it assumes about 4 characters per token.
- Select All (Cmd/Ctrl+A, and Edit > Select All on macOS) in the preview now selects only the rendered document instead of the whole window.

### Fixed

- Local images in raw HTML `<img>` tags with a relative path now load in the preview and in exports, like Markdown `![](...)` images.
- The About panel scrolls when the window is too small to show all of it.

## [1.0.1] - 2026-09-29 — based on Moji 1.0.7

### Added

- macOS now checks GitHub Releases for a newer Moji Plus and shows the same notice as Windows and Linux. Installing the update is still manual.

### Changed

- On Windows and Linux, scrollbars now stay hidden until you scroll or move the pointer over them, and fade out again about a second later, like on macOS. They are also thinner.

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
