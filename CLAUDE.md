# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BuilderOS — a workspace platform combining projects, tasks, notes, and (later) documents/knowledge/AI. Currently at Phase 1 of ROADMAP.md: auth + projects + tasks + notes + dashboard, no AI yet. Two apps in one repo:

- `builderOS-api/` — Kotlin 2.x / Spring Boot 4 / Java 21 REST API (Gradle)
- `builderos-web/` — Next.js 16 / React 19 / TypeScript / Tailwind 4 frontend

`builderos-web/` has its own CLAUDE.md → AGENTS.md: this Next.js version has breaking changes vs. training data; consult `builderos-web/node_modules/next/dist/docs/` before writing Next.js code.

## Commands

```bash
# Database (required for local backend)
docker compose up -d          # Postgres 17 on :5432, db/user/pass all "builderos"

# Backend (from builderOS-api/)
./gradlew bootRun             # runs on :8080, profile "local" by default
./gradlew test                # all tests
./gradlew test --tests "mn.zozo.builderOS.Phase1ApiTests"                   # single class
./gradlew test --tests "mn.zozo.builderOS.Phase1ApiTests.someTestMethod"    # single test

# Frontend (from builderos-web/)
npm run dev                   # runs on :3000
npm run build
npm run lint
```

Backend tests run against H2 in PostgreSQL mode (profile `test`); `PostgresMigrationTests` uses Testcontainers and is skipped automatically without Docker. Backend env vars are documented in `builderOS-api/.env.example`; all have local defaults, so nothing is needed for local dev beyond Postgres.

## Architecture

### BFF pattern — the browser never calls Spring directly

The frontend talks only to its own Next.js route handlers under `builderos-web/app/api/`, which proxy to the Spring API (`BUILDEROS_API_BASE_URL`, default `http://localhost:8080`). The JWT lives in an httpOnly cookie (`builderos_session`), never in client JS:

- `lib/server/bff.ts` — the whole proxy layer: `postAuth` (login/register → sets cookie from Spring's token response), `proxyRequest` (reads cookie → forwards as `Authorization: Bearer`), `logout` (clears cookie).
- `app/api/{projects,tasks,notes}/[[...path]]/route.ts` — thin catch-all routes that delegate to `proxyRequest`. Adding a new backend resource to the frontend means adding one of these.
- Client components call these local routes via `lib/api-client.ts` (`apiFetch`/`jsonRequest`) with TanStack Query; errors surface as `ApiClientError` carrying the backend's `{code, message}`.

### Backend: feature packages, user-scoped everything

`builderOS-api/src/main/kotlin/mn/zozo/builderOS/` is organized by feature (`auth`, `projects`, `tasks`, `notes`, `dashboard`, `users`), each with `*Controller.kt`, `*Dtos.kt`, `*Entity.kt`, `*Repository.kt`. Cross-cutting code lives in:

- `security/` — stateless JWT (jjwt): `JwtAuthenticationFilter` puts an `AuthenticatedUser` principal into the security context; only `POST /api/auth/register|login` are public.
- `common/` — `ApiErrors.kt` (`@RestControllerAdvice` mapping exceptions to `ApiError{code, message, details}` — the error contract the frontend parses), `AuditableEntity` (createdAt/updatedAt base class), `Pagination.kt`.

All data is owned by a user. Repositories enforce this with explicit `findByIdAndOwnerId(...)`-style queries — follow that pattern for any new entity; never look up a resource by id alone in a controller.

### Database: Flyway owns the schema

Migrations live in `builderOS-api/src/main/resources/db/migration/`. Hibernate runs with `ddl-auto=validate`, so any entity change requires a new `V<n>__*.sql` migration or the app won't start. Spring profiles: `local` (default, docker-compose Postgres), `test` (H2), `prod` (env-provided datasource).

### Frontend conventions

- All user-facing strings go through `lib/i18n.tsx` — a `useI18n()` dictionary with `en` and `mn` (Mongolian) translations. Don't hardcode UI text; add keys to both dictionaries.
- Shared API types are in `lib/types.ts`; app pages live under `app/app/` (auth-gated shell) vs. `app/login`, `app/register`.
- React Compiler is enabled (`reactCompiler: true` in next.config.ts).

## Gotchas

- Kotlin sources use tabs for indentation.
- Spring Boot 4 renamed several starters/artifacts (e.g. `spring-boot-starter-webmvc`, `spring-boot-flyway`, `tools.jackson.module:jackson-module-kotlin`) — copy dependency coordinates from the existing `build.gradle.kts`, not from Boot 3 examples.
- The `allOpen` plugin is configured for JPA annotations; new entities need `@Entity` (etc.) to be proxy-friendly.
