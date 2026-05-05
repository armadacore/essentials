# @armadacore/essentials

[![npm version](https://img.shields.io/npm/v/@armadacore/essentials.svg)](https://www.npmjs.com/package/@armadacore/essentials)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/armadacore/essentials/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@armadacore/essentials.svg)](https://nodejs.org)

> This library exists because I wanted Rust's robustness and explicit control flow in TypeScript. TypeScript's type system is strong enough to express "this value might be missing" or "this call might fail" — but the language itself doesn't force you to handle those cases. `null`, `undefined`, and thrown exceptions slip through type signatures and surface as runtime bugs. `essentials` brings the patterns that solve this in Rust — `Option`, `Result`, typed exceptions — to TypeScript in a form that the compiler actually enforces.

## The problem this solves

In an average TypeScript codebase, three things tend to go wrong silently:

1. **Absence is invisible.** A function returns `User | null` or `User | undefined`. The caller forgets the check. The bug shows up in production.
2. **Failure is invisible.** A function throws. The signature says `: User`. Nothing in the type system tells the caller that this call can blow up, or with what.
3. **Errors lose context.** An exception bubbles up, gets re-thrown, and somewhere along the way the original cause is lost — leaving you with a stack trace that points nowhere useful.

`essentials` makes all three of these explicit at the type level. You can't accidentally ignore an absent value, you can't accidentally ignore a failure, and you can't accidentally drop the cause of an error.

## What you get

- **`Option<T>`** — a value that is either `Some(value)` or `None`. Replaces `T | null` and `T | undefined` in your domain types. The compiler forces you to handle both branches before you can touch the value.
- **`Result<T>`** — a value that is either `Ok(value)` or `Err(exception)`. Replaces "this function throws". The failure becomes part of the return type, with a fixed `Exception` error channel so handling stays uniform.
- **`Exception`** — a typed error hierarchy with HTTP-status awareness, an `info` discriminator, and proper `cause` propagation. Built so you can throw, catch, re-wrap, and serialize without losing the original failure.
- **`Callback<T>`** — an `Option`-shaped wrapper for optional function values, so "the consumer might or might not have provided a handler" stops being a special case.

All public API is documented inline via TSDoc — IDE hover shows the full contract per symbol.

## The benefit, in one snippet

```typescript
// Before — the compiler is fine with all of this. Production isn't.
const findUser = (id: string): User | null => { /* ... */ };

const user = findUser(id);
console.log(user.name);   // runtime: Cannot read properties of null

// After — the compiler refuses to let you ignore the absent case.
const findUser = (id: string): IOption<User> => { /* ... */ };

const userOption = findUser(id);
userOption.onSome((user) => console.log(user.name));
userOption.onNone(() => console.log("not found"));
```

The same shift applies to fallible operations (`Result` instead of `throw`) and to error handling (`Exception` instead of bare `Error`). The pattern is always the same: **make the failure mode part of the type, so the compiler enforces handling**.

## Documentation

Full documentation lives in the [project wiki](https://github.com/armadacore/essentials/wiki) — start there for the per-building-block pages, common patterns and the wire-format / cross-monad reference.

Every public symbol is also annotated with TSDoc — your IDE hover shows the same contract that the wiki documents.

## Install

```bash
npm install @armadacore/essentials
```

Requires Node.js `>=20` and TypeScript `~5.7`.

## License

See [LICENSE](./LICENSE).
