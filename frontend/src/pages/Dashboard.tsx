import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Layout } from '../components/Layout'
import { WindowControls } from '../components/WindowControls'

interface WindowInfo {
  id: number
  window_id: string
  title: string
  state: 'visible' | 'hidden' | 'minimized' | 'maximized'
  x: number
  y: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

export function Dashboard() {
  const [windows, setWindows] = useState<WindowInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newWindowId, setNewWindowId] = useState('')
  const [newWindowTitle, setNewWindowTitle] = useState('')

  async function loadWindows() {
    try {
      setError(null)
      const response = await api.windows.list()
      setWindows(response.windows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load windows')
    } finally {
      setLoading(false)
    }
  }

  async function createWindow() {
    if (!newWindowId.trim() || !newWindowTitle.trim()) return
    setCreating(true)
    try {
      await api.windows.create({ window_id: newWindowId, title: newWindowTitle })
      setNewWindowId('')
      setNewWindowTitle('')
      await loadWindows()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create window')
    } finally {
      setCreating(false)
    }
  }

  async function handleStateChange(windowId: string, newState: 'visible' | 'hidden' | 'minimized' | 'maximized') {
    setWindows(prev => prev.map(w => w.window_id === windowId ? { ...w, state: newState } : w))
  }

  useEffect(() => {
    loadWindows()
  }, [])

  return (
    <Layout>
      <div style={styles.page}>
        <header style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Window Management</h1>
          <p style={styles.pageSubtitle}>Control GPUI application windows - hide, show, and manage state</p>
        </header>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Create New Window</h2>
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="window-id" style={styles.label}>Window ID</label>
              <input
                id="window-id"
                type="text"
                value={newWindowId}
                onChange={e => setNewWindowId(e.target.value)}
                placeholder="my-window-1"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="window-title" style={styles.label}>Title</label>
              <input
                id="window-title"
                type="text"
                value={newWindowTitle}
                onChange={e => setNewWindowTitle(e.target.value)}
                placeholder="My Application Window"
                style={styles.input}
              />
            </div>
            <button onClick={createWindow} disabled={creating || !newWindowId.trim() || !newWindowTitle.trim()} style={styles.buttonPrimary}>
              {creating ? 'Creating...' : 'Create Window'}
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Managed Windows ({windows.length})</h2>
          {loading ? (
            <div style={styles.loading}>Loading windows...</div>
          ) : windows.length === 0 ? (
            <div style={styles.empty}>No windows created yet. Create your first window above.</div>
          ) : (
            <div style={styles.grid}>
              {windows.map(window => (
                <WindowControls
                  key={window.window_id}
                  windowId={window.window_id}
                  title={window.title}
                  initialState={window.state}
                  onStateChange={s => handleStateChange(window.window_id, s)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  pageHeader: {
    marginBottom: 'var(--spacing-xl)',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-fg)',
    marginBottom: 'var(--spacing-xs)',
  },
  pageSubtitle: {
    color: 'var(--color-fg-muted)',
    fontSize: '1.125rem',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    color: 'var(--color-error)',
    marginBottom: 'var(--spacing-lg)',
  },
  section: {
    marginBottom: 'var(--spacing-xl)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
    marginBottom: 'var(--spacing-md)',
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
    alignItems: 'flex-end',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-lg)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    minWidth: '200px',
    flex: 1,
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-fg-muted)',
  },
  input: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    color: 'var(--color-fg)',
    fontSize: '1rem',
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-bg)',
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'background-color 0.15s, transform 0.05s',
    height: 'fit-content',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  loading: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--color-fg-muted)',
  },
  empty: {
    textAlign: 'center',
    padding: 'var(--spacing-xl)',
    color: 'var(--color-fg-muted)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-md)',
  },
}