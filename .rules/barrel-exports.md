# barrel-exports

## Regel

Jedes Feature exportiert über seinen `index.ts`-Barrel ausschließlich die
**öffentliche API** des Features. Implementierungsklassen (`SomeOption`,
`NoneOption`, `OkResult`, `ErrResult`, …) sind interne Details und werden
**nicht** über den Barrel exportiert.

## Konvention im Projekt

### Was gehört in den Barrel

| Kategorie | Beispiele | Begründung |
| --------- | --------- | ---------- |
| Interfaces / Typen | `IOption<T>`, `IResult<T>`, `ICallback<T>` | Konsumenten-Type-Annotation |
| Factories | `Some`, `None`, `Ok`, `Err`, `Callback.create`, `Callback.none`, `Callback.from` | Einziger sanktionierter Konstruktionsweg |
| Namespaces / Façades | `Option`, `Result`, `Callback` | Statische Helfer (`Option.from`, `Result.fromAsync`, …) |
| Type Guards | `isOption`, `isResult` | Runtime-Discrimination an System­grenzen |
| Exceptions | `Exception`, `InvalidStateException`, `BadRequestException`, … | Werfbare/`instanceof`-prüfbare Fehlerklassen |
| Free Functions | `toJsonObject`, `toJsonString`, `toOption` | Top-Level-Helfer (zusätzlich auch über das Namespace-Objekt erreichbar) |

### Was gehört **nicht** in den Barrel

Implementierungsklassen, die ein Interface erfüllen und über eine Factory
erzeugt werden:

- `SomeOption`, `NoneOption` (erfüllen `IOption<T>`, erzeugt über `Some`/`None`)
- `OkResult`, `ErrResult` (erfüllen `IResult<T>`, erzeugt über `Ok`/`Err`)
- `OptionBase`, `ResultBase` (abstrakte Basisklassen)

Konsumenten arbeiten ausschließlich mit dem Interface und dem Discriminator
(`.isSome` / `.isNone` / `.isOk` / `.isErr`) bzw. dem Type Guard.

```typescript
// FALSCH — koppelt Konsument an Implementierungsklasse
import { SomeOption } from 'essentials:option';
if (value instanceof SomeOption) { ... }

// RICHTIG — Discriminator nutzen
import { isOption } from 'essentials:option';
if (isOption(value) && value.isSome) { ... }

// RICHTIG — Diskriminator direkt am Interface
const opt: IOption<number> = Some(42);
if (opt.isSome) { ... }
```

### Library-interne Importe

Innerhalb desselben Features (z.B. ein Test, der Detailverhalten der
Implementierungsklasse prüft, oder eine Schwester-Datei in `core/`) ist
der Direktimport aus der Quelldatei erlaubt:

```typescript
// option/core/optionBase.test.ts
import { SomeOption } from './someOption';   // ok — gleiches Feature, internal
```

Cross-Feature- und Konsumenten-Importe gehen ausschließlich über den Barrel:

```typescript
// callback/core/callback.ts
import { Option, Some, None } from 'essentials:option';   // ok
import { SomeOption } from 'essentials:option/someOption'; // FALSCH — gibt's nicht
```

Für die Cross-Feature- und Konsumenten-Sicht siehe auch
`.rules/intra-feature-imports.md`.

### Konsequenzen

- Implementierungsklassen können umbenannt oder umstrukturiert werden,
  ohne dass es ein Breaking Change für Konsumenten ist.
- `instanceof`-Checks auf konkrete Klassen sind in Konsumenten-Code
  unmöglich — das ist Absicht, weil `.isSome`/`.isOk`/Type-Guards die
  semantisch korrekte Diskrimination bieten.
- Library-interne Tests bleiben unberührt, weil sie bereits aus den
  Quelldateien direkt importieren.
