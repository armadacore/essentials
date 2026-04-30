# intra-feature-imports

## Regel

Imports innerhalb der Library folgen einer strikten Trennung zwischen
**Intra-Feature** (innerhalb desselben Features) und **Cross-Feature**
(über Feature-Grenzen hinweg):

- **Intra-Feature** → relative Pfade zur konkreten Quelldatei
  (`./optionBase`, `../models/IOption`).
- **Cross-Feature** → ausschließlich über den Alias-Barrel
  (`essentials:option`, `essentials:exceptions`, …).

## Konvention im Projekt

### Intra-Feature: relative Pfade

Innerhalb eines Features (z.B. alle Dateien unter `src/result/`) wird
ausschließlich relativ und ausschließlich auf die konkrete Quelldatei
importiert. Niemals über den eigenen `essentials:<feature>`-Alias —
das würde eine zirkuläre Abhängigkeit über den Barrel erzeugen.

```typescript
// src/result/core/result.ts

// RICHTIG — relative Pfade zur Quelldatei
import { type IResult } from '../models/IResult';
import { ErrResult } from './errResult';
import { OkResult } from './okResult';

// FALSCH — eigener Feature-Alias
import { type IResult, ErrResult, OkResult } from 'essentials:result';
```

Auch Tests innerhalb desselben Features importieren relativ:

```typescript
// src/option/core/option.test.ts

// RICHTIG — gleiches Feature, direkt aus Quelldateien
import { None, Some } from './option';
import { SomeOption } from './someOption';   // ok — Implementierungsklasse,
                                              // intern erlaubt (siehe
                                              // .rules/barrel-exports.md)

// FALSCH — eigener Feature-Alias
import { None, Some } from 'essentials:option';
```

### Cross-Feature: ausschließlich über den Alias-Barrel

Aus einem Feature heraus auf ein anderes Feature wird nur über den
`essentials:<feature>`-Alias zugegriffen — niemals relativ quer. Das
erzwingt den Barrel-Vertrag aus `.rules/barrel-exports.md`:
nur die öffentliche API ist verfügbar, Implementierungsdetails bleiben
gekapselt.

```typescript
// src/callback/core/callback.ts

// RICHTIG — Cross-Feature über Alias
import { InvalidStateException } from 'essentials:exceptions';
import { None, Option, Some, type IOption } from 'essentials:option';

// FALSCH — relativer Cross-Feature-Pfad
import { InvalidStateException } from '../../exceptions/core/invalidStateException';
import { None } from '../../option/core/option';
```

### Konsequenzen

- Refactoring innerhalb eines Features (Datei verschieben, umbenennen,
  Implementierungsklasse umbauen) bleibt eine reine Intra-Feature-Aufgabe;
  andere Features sind nicht betroffen, solange der Barrel-Vertrag
  eingehalten wird.
- Cross-Feature-Konsumenten profitieren automatisch von der Barrel-Regel
  — sie können keine internen Implementierungsklassen importieren, weil
  diese gar nicht im Barrel exportiert werden.
- Zirkuläre Imports über den eigenen Barrel sind unmöglich, weil intra
  immer relativ aufgelöst wird.
- Ein einheitliches Importschema macht Reviews einfacher: ein
  `essentials:`-Import in einer Feature-Datei ist immer ein
  Cross-Feature-Import — keine Mehrdeutigkeit.

### Verwandte Regeln

- `.rules/barrel-exports.md` — was über den Cross-Feature-Alias
  überhaupt verfügbar ist (öffentliche API vs. internal).
