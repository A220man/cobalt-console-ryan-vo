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
    backgroundColor: 'var(--color-success)',
    color: 'white',
  },
  hidden: {
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-text)',
  },
  minimized: {
    backgroundColor: 'var(--color-warning)',
    color: 'var(--color-text)',
  },
  maximized: {
    backgroundColor: 'var(--color-info)',
    color: 'white',
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

  async function restore() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.windows.restore(windowId)
      setState(result.state)
      onStateChange?.(result.state)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to restore window')
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
            <button style={styles.buttonPrimary} onClick={restore} disabled={loading}>
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
            <button style={styles.buttonPrimary} onClick={restore} disabled={loading}>
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
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--color-surface)',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-md)',
  },
  title: {
    margin: 0,
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  badge: {
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  error: {
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
    marginBottom: 'var(--spacing-sm)',
  },
  actions: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
  },
  buttonSecondary: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
  },
}

