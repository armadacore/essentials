# @timi/essentials

Foundational TypeScript building blocks extracted from the [`timi`](https://github.com/anomalyco/timi) project.

Provides:

- **`Option<T>`** — explicit absence handling, inspired by Rust's `Option`.
- **`Result<T>`** — error-as-value with a fixed `Exception` failure type.
- **`Exception`** hierarchy — HTTP-status-aware error types with `info` tag and `cause` propagation.
- **`Callback<T>`** — wrapper around an optional function value.

## Status

This repository is the standalone extraction of `timi-essentials` from the originating monorepo.  
A full code analysis and a four-sprint cleanup plan are documented in [`ANALYSIS.md`](./ANALYSIS.md).

## Install

```bash
npm install @timi/essentials
```

## Build

```bash
npm install
npm run build
```

The compiled bundle is written to `dist/`. Path aliases declared in `tsconfig.json` (`essentials:*`) are resolved at build time via [`tsc-alias`](https://github.com/justkey007/tsc-alias).

## Scripts

| Script | Purpose |
|---|---|
| `npm run build` | Produce `dist/` (TS compile + alias resolution). |
| `npm run dev` | Watch-mode build. |
| `npm run lint` | Type-check **and** ESLint with the project's strict ruleset. |
| `npm run lint:type` | TypeScript type-check only. |
| `npm run lint:eslint` | ESLint only. |
| `npm run lint:kb` | `lintkb` knowledge-base lookup for the project's custom rules. |
| `npm run format` | Run Prettier across `src/`. |
| `npm run format:check` | Verify Prettier formatting. |
| `npm run clean` | Remove `dist/`. |

## Project conventions

The project enforces a strict set of conventions, mirrored from the original monorepo:

- **`null` / `undefined` are forbidden** in domain types — use `Option<T>` instead.
- **Feature folder structure** (`core/`, `models/`, `guards/`, optional `Constants.ts`) — see `ANALYSIS.md`.
- **Barrel-only imports** between features — internal paths (`feature/core/foo`) are off-limits to consumers.
- **Strict `naming-convention`** rules for interfaces (`I*`), guards (`is*`), classes, etc.

ESLint custom rules live in [`.eslint-rules/`](./.eslint-rules/) and the human-readable rationales in [`.rules/`](./.rules/).

## License

See [LICENSE](./LICENSE).
