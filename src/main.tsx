import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import './styles/theme.css'
import './styles/app.css'
import './styles/markdown.css'
import './i18n'
import { App } from './App'
import { applyDocumentTheme } from './hooks/useAppState'
import { getRendererPerformanceReport } from './lib/performanceMetrics'

declare global {
  interface Window {
    __mojiPerformance?: {
      getRendererReport: () => ReturnType<typeof getRendererPerformanceReport>
      getReport: () => Promise<{
        renderer: ReturnType<typeof getRendererPerformanceReport>
        main: Awaited<ReturnType<typeof window.api.getPerformanceReport>>
      }>
    }
  }
}

// DevTools-only local report. It exposes numeric timings and memory samples, never document data.
window.__mojiPerformance = {
  getRendererReport: getRendererPerformanceReport,
  getReport: async () => ({ renderer: getRendererPerformanceReport(), main: await window.api.getPerformanceReport() })
}

// Window controls are drawn by the OS over the top bar; CSS reserves room for them per platform.
document.documentElement.dataset.platform = window.api.platform
window.api.onFullscreenChange((fullscreen) => {
  document.documentElement.toggleAttribute('data-fullscreen', fullscreen)
})

// Before the first render, so a light start never flashes the dark chrome.
applyDocumentTheme()

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
