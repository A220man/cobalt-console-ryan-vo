const API_BASE = '/api/v1'

export interface WindowState {
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

export interface WindowListResponse {
  windows: WindowState[]
  total: number
  page: number
  page_size: number
}

export interface WindowCreate {
  window_id: string
  title: string
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface WindowUpdate {
  title?: string
  state?: 'visible' | 'hidden' | 'minimized' | 'maximized'
  x?: number
  y?: number
  width?: number
  height?: number
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
type MockableFn<T> = T & { mockResolvedValue: any; mockImplementation: any }

export const api = {
  windows: {
    list: ((page = 1, pageSize = 20) =>
      request<WindowListResponse>(`/windows?page=${page}&page_size=${pageSize}`)) as MockableFn<
      (page?: number, pageSize?: number) => Promise<WindowListResponse>
    >,

    get: ((windowId: string) =>
      request<WindowState>(`/windows/${encodeURIComponent(windowId)}`)) as MockableFn<
      (windowId: string) => Promise<WindowState>
    >,

    create: ((data: WindowCreate) =>
      request<WindowState>('/windows', {
        method: 'POST',
        body: JSON.stringify(data),
      })) as MockableFn<
      (data: WindowCreate) => Promise<WindowState>
    >,

    update: ((windowId: string, data: WindowUpdate) =>
      request<WindowState>(`/windows/${encodeURIComponent(windowId)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })) as MockableFn<
      (windowId: string, data: WindowUpdate) => Promise<WindowState>
    >,

    hide: ((windowId: string) =>
      request<WindowState>(`/windows/${encodeURIComponent(windowId)}/hide`, {
        method: 'POST',
      })) as MockableFn<
      (windowId: string) => Promise<WindowState>
    >,

    show: ((windowId: string) =>
      request<WindowState>(`/windows/${encodeURIComponent(windowId)}/show`, {
        method: 'POST',
      })) as MockableFn<
      (windowId: string) => Promise<WindowState>
    >,

    delete: ((windowId: string) =>
      request<void>(`/windows/${encodeURIComponent(windowId)}`, {
        method: 'DELETE',
      })) as MockableFn<
      (windowId: string) => Promise<void>
    >,
  },

  health: {
    check: (() => request<{ status: string; service: string }>('/health')) as MockableFn<
      () => Promise<{ status: string; service: string }>
    >,
  },
}