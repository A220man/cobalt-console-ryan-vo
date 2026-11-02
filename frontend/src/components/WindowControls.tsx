import { useState } from 'react'
import { api } from '../api/client'

interface WindowControlsProps {
  windowId: string
  title: string
  initialState: 'visible' | 'hidden' | 'minimized' | 'maximized'
  onStateChange?: (state: 'visible' | 'hidden' | 'minimized' | 'maximized') => void
}

const badgeStyles: Record<'visible' | 'hidden' | 'minimized' | 'maximized', React.CSSProperties> = {
  visible: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    color: 'var(--color-success)',
  },
  hidden: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    color: 'var(--color-error)',
  },
  minimized: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    color: 'var(--color-warning)',
  },
  maximized: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    color: 'var(--color-info)',
  },
}

export function WindowControls({ windowId, title, initialState, onStateChange }: WindowControlsProps) {
  const [state, setState] = useState<'visible' | 'hidden' | 'minimized' | 'maximized'>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function hide() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.windows.hide(windowId)
      setState(result.state)
      onStateChange?.(result.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to hide window')
    } finally {
      setLoading(false)
    }
  }

  async function show() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.windows.show(windowId)
      setState(result.state)
      onStateChange?.(result.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to show window')
    } finally {
      setLoading(false)
    }
  }

  async function minimize() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.windows.minimize(windowId)
      setState(result.state)
      onStateChange?.(result.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to minimize window')
    } finally {
      setLoading(false)
    }
  }

  async function maximize() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.windows.maximize(windowId)
      setState(result.state)
      onStateChange?.(result.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to maximize window')
    } finally {
      setLoading(false)
    }
  }

  function renderActions() {
    switch (state) {
      case 'visible':
        return (
          <>
            <button style={styles.buttonSecondary} onClick={minimize} disabled={loading}>
              {loading ? 'Minimizing...' : 'Minimize'}
            </button>
            <button style={styles.buttonSecondary} onClick={maximize} disabled={loading}>
              {loading ? 'Maximizing...' : 'Maximize'}
            </button>
            <button style={styles.buttonSecondary} onClick={hide} disabled={loading}>
              {loading ? 'Hiding...' : 'Hide'}
            </button>
          </>
        )
      case 'minimized':
        return (
          <>
            <button style={styles.buttonPrimary} onClick={show} disabled={loading}>
              {loading ? 'Restoring...' : 'Restore'}
            </button>
            <button style={styles.buttonSecondary} onClick={maximize} disabled={loading}>
              {loading ? 'Maximizing...' : 'Maximize'}
            </button>
            <button style={styles.buttonSecondary} onClick={hide} disabled={loading}>
              {loading ? 'Hiding...' : 'Hide'}
            </button>
          </>
        )
      case 'maximized':
        return (
          <>
            <button style={styles.buttonPrimary} onClick={show} disabled={loading}>
              {loading ? 'Restoring...' : 'Restore'}
            </button>
            <button style={styles.buttonSecondary} onClick={minimize} disabled={loading}>
              {loading ? 'Minimizing...' : 'Minimize'}
            </button>
            <button style={styles.buttonSecondary} onClick={hide} disabled={loading}>
              {loading ? 'Hiding...' : 'Hide'}
            </button>
          </>
        )
      case 'hidden':
        return (
          <button style={styles.buttonPrimary} onClick={show} disabled={loading}>
            {loading ? 'Showing...' : 'Show'}
          </button>
        )
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <span style={{ ...styles.badge, ...badgeStyles[state] }}>
          {state}
        </span>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.actions}>
        {renderActions()}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    maxWidth: '320px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  error: {
    color: 'var(--color-error)',
    fontSize: '0.875rem',
    marginBottom: 'var(--spacing-sm)',
  },
  actions: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
  },
  buttonPrimary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-bg)',
    padding: 'var(--spacing-xs) var(--spacing-md)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    transition: 'background-color 0.15s',
  },
  buttonSecondary: {
    backgroundColor: 'var(--color-border)',
    color: 'var(--color-fg)',
    padding: 'var(--spacing-xs) var(--spacing-md)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    transition: 'background-color 0.15s',
  },
}
