import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Dashboard } from '../pages/Dashboard'
import { api } from '../api/client'
import type { WindowState, WindowListResponse } from '../api/client'

const mockWindows: WindowState[] = [
  {
    id: 1,
    window_id: 'win-1',
    title: 'Window 1',
    state: 'visible',
    x: 0, y: 0, width: 800, height: 600,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    window_id: 'win-2',
    title: 'Window 2',
    state: 'hidden',
    x: 100, y: 100, width: 1024, height: 768,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

vi.mock('../api/client', () => ({
  api: {
    windows: {
      list: vi.fn(),
      create: vi.fn(),
      hide: vi.fn(),
      show: vi.fn(),
    },
    health: {
      check: vi.fn(),
    },
  },
  WindowState: {} as WindowState,
  WindowListResponse: {} as WindowListResponse,
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.windows.list.mockResolvedValue({ windows: mockWindows, total: 2, page: 1, page_size: 20 })
  })

  it('renders window list on load', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Window 1')).toBeInTheDocument()
      expect(screen.getByText('Window 2')).toBeInTheDocument()
    })
  })

  it('shows empty state when no windows', async () => {
    api.windows.list.mockResolvedValue({ windows: [], total: 0, page: 1, page_size: 20 })
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/No windows created yet/i)).toBeInTheDocument()
    })
  })

  it('creates a new window', async () => {
    const newWindow: WindowState = { ...mockWindows[0], window_id: 'new-win', title: 'New Window' }
    api.windows.create.mockResolvedValue(newWindow)
    api.windows.list.mockResolvedValue({ windows: [...mockWindows, newWindow], total: 3, page: 1, page_size: 20 })

    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText('Window 1')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Window ID'), { target: { value: 'new-win' } })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Window' } })
    fireEvent.click(screen.getByText('Create Window'))

    await waitFor(() => {
      expect(api.windows.create).toHaveBeenCalledWith({ window_id: 'new-win', title: 'New Window' })
    })
  })

  it('handles hide action', async () => {
    api.windows.hide.mockResolvedValue({ ...mockWindows[0], state: 'hidden' })
    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText('Window 1')).toBeInTheDocument())

    const hideButton = screen.getByText('Hide')
    fireEvent.click(hideButton)

    await waitFor(() => {
      expect(api.windows.hide).toHaveBeenCalledWith('win-1')
    })
  })

  it('handles show action', async () => {
    api.windows.show.mockResolvedValue({ ...mockWindows[1], state: 'visible' })
    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText('Window 2')).toBeInTheDocument())

    const showButton = screen.getByText('Show')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(api.windows.show).toHaveBeenCalledWith('win-2')
    })
  })
})