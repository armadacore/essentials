# no-undefined

## Regel

Eigener Code verwendet **niemals** das Schlüsselwort `undefined` als Wert
oder Vergleichsoperand. Optionale Werte werden ausschließlich über `Option<T>`
aus `@timi/timi-essentials` ausgedrückt; Side-Effects ohne Rückgabewert
werden über die passende API-Methode oder einen impliziten Return formuliert.

## Konvention im Projekt

### Optionale Werte

Statt `undefined` als Marker für „kein Wert" wird `Option<T>` verwendet.
Werte aus Fremd-APIs werden direkt mit `Option.from(...)` konvertiert
(siehe `.rules/no-null__no-null.md`).

```typescript
// FALSCH
const value: Foo | undefined = ...;
if (value === undefined) return;

// RICHTIG
const valueOption: IOption<Foo> = Option.from(...);
if (valueOption.isNone) return;
```

### Side-Effect-Branches in Result/Option

Wenn `match` nur wegen eines Side-Effects auf einem Branch aufgerufen wird
und der Rückgabewert verworfen wird, ist der falsche Operator gewählt.
Stattdessen die dedizierten Side-Effect-Methoden nutzen:

| Monade | Side-Effect auf Wert | Side-Effect auf Fehler |
| ------ | -------------------- | ---------------------- |
| `IOption<T>` | `onSome(fn)` | `onNone(fn)` |
| `IResult<T>` | `onOk(fn)` | `onErr(fn)` |

```typescript
// FALSCH
result.match(
    (value) => doSomething(value),
    () => undefined,
);

// RICHTIG
result.onOk((value) => doSomething(value));
```

### Early-Return statt undefined-Vergleich

Statt einen Wert auf `undefined` zu prüfen, wird die Monaden-Eigenschaft
genutzt:

| Monade       | Early-Return-Check |
| ------------ | ------------------ |
| `IOption<T>` | `if (opt.isNone) return;` / `if (opt.isSome) ...` |
| `IResult<T>` | `if (result.isErr) return;` / `if (result.isOk) ...` |

```typescript
// FALSCH
if (value === undefined) return;
if (value !== undefined) doSomething(value);

// RICHTIG
if (valueOption.isNone) return;
const value = valueOption.unwrap();
doSomething(value);
```

Im Anschluss an einen `isNone`/`isErr`-Check darf `unwrap()` verwendet
werden, weil der gegenteilige Fall ausgeschlossen ist.

### Funktionen ohne Rückgabewert

Funktionen, deren Rückgabewert nicht gebraucht wird, deklarieren `void`
und returnen entweder gar nicht oder mit bare `return;`:

```typescript
// FALSCH
const noOp = (): undefined => undefined;
const onClick = () => undefined;

// RICHTIG
const noOp = (): void => { /* no-op */ };
const onClick = (): void => doSideEffect();
```

### Default-Parameter

Default-Parameter werden nicht explizit auf `undefined` gesetzt — der
Default wird direkt geschrieben oder über `Option<T>` ausgedrückt:

```typescript
// FALSCH
const fn = (input: string | undefined = undefined) => ...;

// RICHTIG
const fn = (input: IOption<string> = None()) => ...;
const fn = (input: string = '') => ...;
```

### Notausgang `void 0`

In den seltenen Fällen, in denen wirklich der Wert `undefined` ausgedrückt
werden muss (z.B. erzwungenes Wire-Format einer 3rd-Party-API, das keinem
der obigen Patterns folgt), wird `void 0` verwendet — niemals das
Schlüsselwort `undefined`. Diese Stellen sind eine Ausnahme und sollten mit
einem kurzen Kommentar begründet werden.

```typescript
// Notausgang — 3rd-Party erwartet konkret undefined als Sentinel-Wert
externalApi.set('key', void 0);
```
