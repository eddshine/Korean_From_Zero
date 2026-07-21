import { useState, useEffect } from 'react'

const api = (window as any).electronAPI

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!api) return
    api.isMaximized().then(setIsMaximized)
    api.onMaximizedChange(setIsMaximized)
  }, [])

  if (!api) return null

  return (
    <div className="titlebar">
      <div className="titlebar-title" />
      <div className="titlebar-controls">
        <button className="titlebar-btn" onClick={() => api.minimize()} title="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button className="titlebar-btn" onClick={async () => { const m = await api.maximize(); if (m !== undefined) setIsMaximized(m) }} title={isMaximized ? 'Restore' : 'Maximize'}>
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2.5" y="0.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0.5" y="2.5" width="9" height="9" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="0.5" y="0.5" width="11" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button className="titlebar-btn titlebar-btn-close" onClick={() => api.close()} title="Close">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
