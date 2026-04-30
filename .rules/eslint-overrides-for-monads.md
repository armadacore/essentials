# eslint-overrides-for-monads

## Regel

Lint-Regeln, die in Konsumenten-Code Patterns wie `undefined`, `null`,
`any` oder Union-Types mit `undefined` verbieten, gelten weiterhin
projektweit. **Strukturell unvermeidbare Verstöße** in den Modulen, die
diese Patterns gerade in typsichere Monaden überführen (`option/`,
`callback/`, `exception.ts`), werden über zentrale ESLint-Override-
Sections in `eslint.config.js` entsperrt — nicht über Datei-Header-
oder Inline-Disables.

## Konvention im Projekt

### Wo die Lockerungen sitzen

In `eslint.config.js` existiert ein dedizierter Override-Block
„MONAD OVERRIDES" mit einer Section pro betroffenem Feature-Pfad:

| `files`-Pattern | abgeschaltete Regeln | Begründung |
| --------------- | -------------------- | ---------- |
| `src/option/**/*.ts` | `no-undefined`, `no-restricted-syntax`, `no-null/no-null`, `@typescript-eslint/no-restricted-types`, `@typescript-eslint/no-explicit-any` | Option ist die einzige stelle in der Library, an der `null`/`undefined` aus Fremd-APIs in `IOption<T>` überführt werden; die Discriminator-Logik prüft explizit gegen `null`/`undefined`. |
| `src/callback/**/*.ts` | `no-restricted-syntax`, `@typescript-eslint/no-restricted-types`, `@typescript-eslint/no-explicit-any` | `Callback<T>` benutzt das offene Generic `T extends (...args: any[]) => any` (TypeScript-Standardpattern für Funktions-Shape-Constraints); `Callback.from(callback?: T)` akzeptiert `T \| undefined` an der API-Grenze (mirror von `Option.from`). |
| `src/exceptions/core/exception.ts` | `no-undefined`, `no-restricted-syntax`, `@typescript-eslint/no-restricted-types` | `Exception(message?: string, options?: { cause?: unknown })` matcht den Native-`Error`-Vertrag, inkl. optionalem Cause-Argument. |

### Was das für Quelldateien bedeutet

Quelldateien in den genannten Pfaden enthalten **keine** Header-
Disables und **keine** Inline-Disables für die oben aufgeführten Regeln.

```typescript
// FALSCH — pro-Datei-Disable wiederholt sich, was bereits im Override steht
/* eslint-disable no-undefined, no-null/no-null */
export const Some = <T>(value: T): IOption<T> => {
    if (value === null || value === undefined) { ... }
};

// RICHTIG — Override in eslint.config.js übernimmt die Lockerung
import { InvalidStateException } from 'essentials:exceptions';

export const Some = <T>(value: T): IOption<T> => {
    if (value === null || value === undefined) { ... }
};
```

### Was außerhalb der Overrides gilt

In allen anderen Modulen (`result/`, alle Feature-Konsumenten,
`exceptions/core/<andere-exceptions>.ts`, …) bleiben die Regeln aktiv.
Wird dort ausnahmsweise ein `undefined`/`any`/`T | undefined` gebraucht,
gibt es zwei Optionen:

1. **Bevorzugt:** den Code so umbauen, dass er die Regel einhält
   (`Option<T>` statt `T | undefined`, konkreter Typ statt `any`).
2. **Notausgang:** ein `eslint-disable-next-line <regel> -- <Begründung>`
   mit Begründungs-Kommentar direkt an der Stelle. Datei-Header-
   Disables sind außerhalb der Override-Pfade unerwünscht.

### Abgrenzung zur HARTEN-REGEL aus AGENTS.md

Die HARTE REGEL für `.rules/<rule>.md` greift, wenn `lintkb` für eine
Regel keine Knowledge-Base-Datei findet. Sie ist davon unberührt:
auch eine Regel, die in einem Feature pauschal abgeschaltet ist, muss
ihre `.rules/<rule>.md` haben (für die Stellen, an denen sie greift).

### Konsequenzen

- Quelldateien sind frei von repetitiven Disable-Headern, die das
  Wesentliche verschleiern.
- Neue Datei in `option/`/`callback/`/`exception.ts` erbt automatisch
  die strukturellen Lockerungen — kein Vergessen, kein Inkonsistenz-
  Risiko.
- Der „Was-darf-hier"-Vertrag ist an einer einzigen Stelle ablesbar
  (`eslint.config.js` „MONAD OVERRIDES").
- Konsumenten der Library sind nicht betroffen; die Overrides gelten
  ausschließlich für `src/`-Pfade dieser Library.

### Verwandte Regeln

- `.rules/no-undefined.md` — was Konsumenten und nicht-monadischer Code
  zu `undefined` einhalten müssen.
- `.rules/no-null__no-null.md` — entsprechend für `null`.
- `.rules/no-restricted-syntax.md`, `.rules/typescript-eslint__no-restricted-types.md`,
  `.rules/consistent-return.md` — die einzelnen Regeln im Detail.
