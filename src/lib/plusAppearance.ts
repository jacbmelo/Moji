// Moji Plus: applies the OS accent color to the app chrome (see plus-hig.css and FORK.md).

function applyAccentColor(color: string | null): void {
  const root = document.documentElement
  if (color) {
    root.style.setProperty('--system-accent', color)
    root.dataset.systemAccent = ''
  } else {
    root.style.removeProperty('--system-accent')
    delete root.dataset.systemAccent
  }
}

export function installSystemAccentColor(): void {
  void window.api.getAccentColor().then(applyAccentColor)
  window.api.onAccentColorChange(applyAccentColor)
}
