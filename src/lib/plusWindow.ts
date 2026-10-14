// Moji Plus: keeps the native window title and edited state in step with the active document.
import { useEffect } from 'react'

export function usePlusWindowDocument(title: string, path: string | null, edited: boolean): void {
  useEffect(() => {
    window.api.setWindowDocument({ title, path, edited })
  }, [title, path, edited])
}
