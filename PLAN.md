# Product development plan

Each round completes one feature or repair. Future items are planned, not implemented claims.

## Current round

project-skeleton

## Roadmap

### project-skeleton — Project Skeleton with FastAPI Backend and React Frontend

Status: done

Acceptance:
- FastAPI backend with health endpoints
- React + TypeScript + Vite frontend
- Window management API (CRUD + hide/show)
- Dashboard UI with window controls
- Dockerfiles for both services
- docker-compose.yml with Keycloak
- CI workflow with backend/frontend tests and Docker builds
- SQLite persistent storage with async SQLAlchemy
- OIDC-ready configuration

Implementation: `backend/app/main.py`, `backend/app/api/health.py`, `backend/app/api/v1/windows.py`, `backend/app/models/window.py`, `backend/app/services/window_service.py`, `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/requirements.txt`, `backend/Dockerfile`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/pages/Dashboard.tsx`, `frontend/src/components/Layout.tsx`, `frontend/src/components/WindowControls.tsx`, `frontend/src/api/client.ts`, `frontend/src/styles/global.css`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/Dockerfile`, `frontend/nginx.conf`, `compose.yaml`, `.github/workflows/ci.yml`, `README.md`, `portfolio.json`, `.env.example`

Tests: `backend/app/tests/test_health.py`, `backend/app/tests/test_windows.py`, `frontend/src/pages/Dashboard.test.tsx`

### auth-oidc — OIDC Authentication with Keycloak

Status: planned

Acceptance:
- Keycloak realm configuration imported
- Backend JWT validation middleware
- Frontend PKCE flow with sessionStorage
- Protected routes and API endpoints
- Role-based access (admin/operator/analyst)

### window-management — Window Hide/Show Management (Issue #3008)

Status: planned

Acceptance:
- Window hide/show API endpoints working
- Frontend window controller component
- Persistent window state in SQLite
- State machine: visible <-> hidden

Implementation: `backend/app/api/v1/windows.py`, `backend/app/services/window_service.py`, `frontend/src/components/WindowControls.tsx`, `frontend/src/pages/Dashboard.tsx`

Tests: `backend/app/tests/test_windows.py`, `frontend/src/pages/Dashboard.test.tsx`

### touch-support — Touch Input Support for Mobile (Issue #3310)

Status: planned

Acceptance:
- Soft keyboard triggers for text inputs
- Long-press context menus
- Touch drag handlers for sliders/dividers
- Responsive breakpoints for phone width

### animation-system — Animation System (Issue #2967)

Status: planned

Acceptance:
- Animation core with spring physics
- Preset animations (fade, slide, scale)
- Configurable duration/easing
- Reduced motion media query support

### grid-component — Responsive Grid Component (Issue #2967)

Status: planned

Acceptance:
- Fixed, flexible, and auto columns
- Responsive column counts by viewport
- Row/column spanning
- Virtualization for large datasets

### media-overlays — Media Overlays (Issue #2967)

Status: planned

Acceptance:
- Overlay positioning system (9 positions)
- Hover-triggered content
- Multi-overlay composition
- Text, icon, badge, button overlays

### file-attachments — File Attachments (Issue #2967)

Status: planned

Acceptance:
- Drag and drop zone
- Folder tree preservation
- Thumbnail generation
- Upload progress tracking

### video-player — Video Player (Issue #2967)

Status: planned

Acceptance:
- Play/pause/seek with timeline
- Fullscreen and PiP support
- Keyboard shortcuts
- Custom controls overlay

