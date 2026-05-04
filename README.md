# @armadacore/essentials

Foundational TypeScript building blocks for explicit, exception-aware control flow.

Provides:

- **`Option<T>`** — explicit absence handling, inspired by Rust's `Option`.
- **`Result<T>`** — error-as-value with a fixed `Exception` failure type.
- **`Exception`** hierarchy — HTTP-status-aware error types with an `info` tag and `cause` propagation.
- **`Callback<T>`** — wrapper around an optional function value.

All public API surfaces are documented inline via TSDoc; IDE hover shows the full contract per symbol.

## Install

```bash
npm install @armadacore/essentials
```

Requires Node.js `>=20` and TypeScript `~5.7`.

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
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run test:coverage` | Vitest with V8 coverage. |
| `npm run format` | Run Prettier across `src/`. |
| `npm run format:check` | Verify Prettier formatting. |
| `npm run clean` | Remove `dist/`. |

## Project conventions

The project enforces a strict set of conventions:

- **`null` / `undefined` are forbidden** in domain types — use `Option<T>` instead.
- **Feature folder structure** (`core/`, `models/`, `guards/`, optional `Constants.ts`).
- **Barrel-only imports** between features — internal paths (`feature/core/foo`) are off-limits to consumers.
- **Strict `naming-convention`** rules for interfaces (`I*`), guards (`is*`), classes, etc.

ESLint custom rules live in [`.eslint-rules/`](./.eslint-rules/) and the human-readable rationales in [`.rules/`](./.rules/).

## License

See [LICENSE](./LICENSE).
