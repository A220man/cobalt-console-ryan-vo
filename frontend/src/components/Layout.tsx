import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 12h6M12 9v6" />
          </svg>
          <span style={styles.logoText}>Cobalt Console</span>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>Dashboard</a>
          <a href="#" style={styles.navLink}>Windows</a>
          <a href="#" style={styles.navLink}>Settings</a>
        </nav>
      </header>
      <main style={styles.main}>{children}</main>
      <footer style={styles.footer}>
        <p>Cobalt Console &copy; 2024 Ryan Vo &mdash; AI/ML Developer Tools for GPUI</p>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-md) var(--spacing-xl)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderBottom: '1px solid var(--color-border)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  },
  logoIcon: {
    width: 32,
    height: 32,
    color: 'var(--color-primary)',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-fg)',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
  },
  navLink: {
    color: 'var(--color-fg-muted)',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  main: {
    flex: 1,
    padding: 'var(--spacing-xl)',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  footer: {
    padding: 'var(--spacing-md) var(--spacing-xl)',
    textAlign: 'center',
    color: 'var(--color-fg-muted)',
    fontSize: '0.875rem',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
}