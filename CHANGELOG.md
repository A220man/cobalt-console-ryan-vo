# Changelog

## 1.1.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

## 1.0.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-22

### Added
- FastAPI backend with health and window management endpoints
- React + TypeScript + Vite frontend with Dashboard UI
- Window hide/show API addressing GPUI Kit issue #3008
- Keycloak OIDC realm configuration with admin/operator/analyst roles
- Docker Compose with backend, frontend, and Keycloak services
- CI pipeline with backend tests, frontend typecheck/build/test, Docker builds
- Portfolio.json manifest for portfolio tracking
- Backend JWT validation middleware with Keycloak JWKS
- Protected API endpoints with Bearer token authentication
- Role-based access control (admin, operator, analyst)
- Auth endpoints: /me, /logout, /admin-only
- Test authentication override for integration testing

### Infrastructure
- SQLite persistent storage with SQLAlchemy async
- Pytest test suite with 13 backend tests
- Vitest frontend tests with React Testing Library
- Nginx reverse proxy for production frontend serving
- Health checks for all Docker services