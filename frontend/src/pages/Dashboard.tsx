import { useEffect, useState } from 'react'
import { useKeyboardHook } from '../components/KeyboardHook'
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

  // Keyboard hook for soft keyboard detection on mobile
  const { isKeyboardVisible, keyboardHeight } = useKeyboardHook()

  async function loadWindows() { … }

  async function createWindow() { … }

  async function handleStateChange(windowId: string, newState: 'visible' | 'hidden' | 'minimized' | 'maximized') {
    setWindows(prev => prev.map(w => w.window_id === windowId ? { ...w, state: newState } : w))
  }

  useEffect(() => {
    loadWindows()
  }, [])

  return (
    <Layout>
      <section style={{ ...styles.page, paddingBottom: isKeyboardVisible ? keyboardHeight + 'px' : '0' }}>
        <h1 style={{ ...styles.pageTitle }}>Cobalt Console</h1>
        <p style={{ ...styles.pageSubtitle }}>Window Management</p>

        {/* Keyboard status display for debugging */}
        {isKeyboardVisible && (
          <div style={styles.keyboardBanner}>
            Soft keyboard visible ({keyboardHeight}px)
          </div>
        )}

        {/* Window controls */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Windows</h2>
          {/* Window list and controls would go here */}
        </div>
      </section>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 'var(--spacing-xl)',
    minHeight: '100vh',
  },
  pageHeader: {
    marginBottom: 'var(--spacing-xl)',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 300,
  },
  pageSubtitle: {
    margin: '0.5rem 0 0',
    color: 'var(--muted-foreground)',
    fontSize: '1rem',
  },
  errorBanner: {
    background: 'var(--destructive/10)',
    border: '1px solid var(--destructive)',
    color: 'var(--destructive)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--radius)',
    marginBottom: 'var(--spacing-xl)',
  },
  section: {
    marginBottom: 'var(--spacing-xl)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  keyboardBanner: {
    background: 'var(--primary/5)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--radius)',
    marginBottom: 'var(--spacing-xl)',
    fontSize: '0.875rem',
  },
}
