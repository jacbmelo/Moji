import packageJson from '../package.json'

/**
 * Identity of this distribution, kept in one place so upstream Moji changes merge with
 * as few conflicts as possible. Moji Plus is a derivative of Moji by Alex Ishida; the
 * `UPSTREAM` credits must stay visible in the app and in the documentation.
 */
export const APP_NAME = 'Moji Plus'
export const APP_VERSION: string = packageJson.version

/** Separate from upstream's `moji` directory so both apps can be installed side by side. */
export const SETTINGS_DIRECTORY = 'moji-plus'
export const DESKTOP_NAME = 'moji-plus.desktop'

export const REPOSITORY_URL = 'https://github.com/jacbmelo/Moji'
export const RELEASES_URL = `${REPOSITORY_URL}/releases`

export const AUTHOR = {
  name: 'João Melo',
  profileUrl: 'https://github.com/jacbmelo'
} as const

export const UPSTREAM = {
  name: 'Moji',
  author: 'Alex Ishida',
  profileUrl: 'https://github.com/alexishida',
  repositoryUrl: 'https://github.com/alexishida/Moji',
  license: 'MIT',
  /** Upstream release this build is based on; updated by `scripts/sync-upstream.sh`. */
  baseVersion: packageJson.upstreamVersion
} as const
