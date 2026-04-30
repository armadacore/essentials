# `timi-essentials` — Analyse & Migrationsplan

Dieses Dokument fasst die vollständige Code-Analyse der Library `@timi/timi-essentials` (ursprünglich Bestandteil des `timi`-Monorepos) zusammen und definiert einen viergliedrigen Sprint-Plan für die Aufräumarbeit, die im Zuge der Auslagerung in dieses eigene Repository erfolgen soll.

Die Analyse wurde im Read-Only-Modus, Datei für Datei, gemeinsam mit dem ursprünglichen Source-Tree durchgeführt. Die ursprünglich vorhandenen Features `check/` und `timer/` wurden bei der Auslagerung in dieses Repository **entfernt**, da sie für `@timi/essentials` als eigenständige Library nicht benötigt werden. Alle anderen Beobachtungen, Befunde und Empfehlungen sind hier vollständig dokumentiert.

---

## Inhaltsverzeichnis

1. [Ausgangs-Struktur](#1-ausgangs-struktur)
2. [Architektur-Übersicht](#2-architektur-übersicht)
3. [Feature-Analyse](#3-feature-analyse)
   - 3.1 [Root `index.ts`](#31-root-srcindexts)
   - 3.2 [Feature `callback/`](#32-feature-callback)
   - 3.3 [Feature `option/`](#33-feature-option)
   - 3.4 [Feature `result/`](#34-feature-result)
   - 3.5 [Feature `exceptions/`](#35-feature-exceptions)
4. [Konsolidierte Findings-Liste](#4-konsolidierte-findings-liste)
5. [Priorisierung](#5-priorisierung)
6. [Test-Strategie](#6-test-strategie)
7. [Vorgeschlagene `.rules/`-Dateien](#7-vorgeschlagene-rules-dateien)
8. [Sprint-Plan](#8-sprint-plan)
9. [Festgelegte Entscheidungen](#9-festgelegte-entscheidungen)
10. [Offene Punkte / Backlog](#10-offene-punkte--backlog)

---

## 1. Ausgangs-Struktur

```
essentials/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── dist/                       # Build-Output (gitignored)
└── src/
    ├── index.ts                # Root-Barrel, Re-Export aller Features
    ├── callback/
    │   ├── index.ts
    │   ├── core/callback.ts
    │   └── models/ICallback.ts
    ├── exceptions/
    │   ├── index.ts
    │   ├── models/IException.ts
    │   └── core/
    │       ├── exception.ts
    │       ├── badRequestException.ts
    │       ├── conflictException.ts
    │       ├── forbiddenException.ts
    │       ├── httpStatusExceptionFactory.ts
    │       ├── internalServerErrorException.ts
    │       ├── notFoundException.ts
    │       ├── serviceUnavailableException.ts
    │       └── unauthorizedException.ts
    ├── option/
    │   ├── index.ts
    │   ├── models/{IOption,AsOptional}.ts
    │   ├── guards/isOption.ts
    │   └── core/
    │       ├── option.ts
    │       ├── optionBase.ts
    │       ├── someOption.ts
    │       └── noneOption.ts
    └── result/
        ├── index.ts
        ├── models/IResult.ts
        ├── guards/isResult.ts
        └── core/
            ├── result.ts
            ├── resultBase.ts
            ├── okResult.ts
            └── errResult.ts
```

> Hinweis: Im ursprünglichen Monorepo enthielt `timi-essentials/src/` zusätzlich die Features `check/` und `timer/`. Diese wurden bei der Migration in dieses Repository entfernt. Die einzige Verwendung im verbleibenden Code (`isArray` aus `check/` in `option/core/option.ts`) wurde durch das Builtin `Array.isArray` ersetzt.

### Build-Setup (`package.json`)

- ESM-Module (`"type": "module"`), privates Workspace-Paket
- Build via `tsc -p tsconfig.json && tsc-alias -p tsconfig.json -f`
- Dev via `concurrently`-Watch
- Keine `devDependencies` deklariert (werden aus dem Workspace-Root bezogen)
- Path-Alias `timi-essentials:*` → `./src/*`

### Stand der `.DS_Store`-Dateien

In `src/` und `src/callback/` befinden sich `.DS_Store`-Dateien. Diese gehören in `.gitignore`.

---

## 2. Architektur-Übersicht

### Dependency-Graph der Features

```
        ┌──────────────┐
        │  exceptions  │   (Wurzel-Feature, keine internen Deps)
        └───────▲──────┘
                │
       ┌────────┼─────────┐
       │        │         │
   ┌───┴──┐ ┌───┴──┐  ┌───┴────┐
   │option│ │result│  │callback│
   └───▲──┘ └──────┘  └────────┘
       │
       │ (Callback.from baut auf Option.from)
       │
   ┌───┴────┐
   │callback│
   └────────┘
```

**Befund:** Keine Zyklen. `exceptions/` ist tatsächlich die unterste Schicht — alle anderen Features dürfen Exception importieren, ohne Architekturschulden zu erzeugen.

### Public-API-Oberfläche (über Root-Barrel)

| Feature | Export-Anzahl (geschätzt) | Vollständig intentional? |
|---|---|---|
| `callback` | 2 (`Callback`, `ICallback`) | ✓ |
| `exceptions` | ~10 (Basis + 7 Subklassen + Factory + Interface) | ✓ |
| `option` | 8+ (`Option`, `Some`, `None`, `IOption`, `SomeOption`, `NoneOption`, `isOption`, `AsOptional`, `toOption`, `toJsonString`, `toJsonObject`) | teilweise **unbeabsichtigt** (siehe F-15, F-16) |
| `result` | 7 (`Result`, `Ok`, `Err`, `IResult`, `OkResult`, `ErrResult`, `isResult`) | teilweise **unbeabsichtigt** (siehe F-40) |

---

## 3. Feature-Analyse

### 3.1 Root `src/index.ts`

```typescript
export * from './callback';
export * from './exceptions';
export * from './option';
export * from './result';
```

#### Beobachtungen

**Positiv**
- Konventionskonform: Re-Exports ausschließlich aus den Feature-Barrels, nicht aus `core/` oder `models/`
- Alphabetisch sortiert (Diff-stabil)
- Keine Implementierung im Root

**Auffälligkeiten**
- **F-01** Inkonsistenz: relative Pfade vs. Path-Alias. Innerhalb der Library werden relative Pfade verwendet, der Alias `timi-essentials:*` ist primär für externe Konsumenten gedacht. Klärung erforderlich, ob das gewollt ist.
- **F-02** _(historisch — durch Migration behoben)_ Fehlendes Semikolon in der letzten Re-Export-Zeile. Bei der Neufassung des Root-Barrels behoben.
- **F-03** `export *`-Wildcards leaken automatisch alles, was ein Feature-Barrel exportiert. Es gibt keine zentrale Public-API-Liste. Alternative: explizite Re-Exports (z.B. `export { Option, isOption } from './option';`). Vorteil: dokumentierte API. Nachteil: Wartungsaufwand pro Feature-Erweiterung.
- **F-04** Kollisionsrisiko bei wachsender Feature-Zahl. Aktuell kollisionsfrei.

---

### 3.2 Feature `callback/`

#### Inhalt
- `index.ts`: Re-Export von Klasse `Callback` und Interface `ICallback`
- `models/ICallback.ts`: Interface mit 4 Methoden (`exists`, `execute`, `executeOr`, `handover`)
- `core/callback.ts`: Klasse `Callback<T>` mit privatem Konstruktor und 3 statischen Factories (`create`, `none`, `from`)

#### Konzept
Wrapper um eine optionale Funktion. Statt `myCb?.(x)` schreibt man `Callback.from(myCb).execute(x)`. Spiegelt das `Option<T>`-Pattern für Funktionen.

#### Beobachtungen

**Positiv**
- Privater Konstruktor + statische Factories (konsistent zum Option/Result-Stil)
- `Callback.from` baut sauber auf `Option.from` auf — schöne Komposition
- Konventionskonforme Struktur (Interface in `models/`, Implementierung in `core/`)

**Kritische Findings**

- **F-05** Vier `eslint-disable`-Direktiven am Dateikopf ohne Begründung:
  - `no-restricted-syntax`
  - `@typescript-eslint/no-restricted-types`
  - `@typescript-eslint/naming-convention`
  - `@typescript-eslint/no-explicit-any`

  Laut Projektregeln verboten ohne Rücksprache. `no-explicit-any` ist legitim (generischer Funktionstyp `T extends (...args: any[]) => any`), `naming-convention` triggert vermutlich auf `_callback`/`_hasCallback`. Die anderen beiden sind unklar — Audit erforderlich.

- **F-06** `execute()` (Zeile 41) — verdächtige Logik:
  ```typescript
  if (!this._callback) return (() => '' as unknown)() as ReturnType<T>;
  ```
  - `this._callback` ist via `none()` immer mit einem `noop` belegt → toter Branch
  - Selbst wenn er triggern würde: leerer String, getypt als `ReturnType<T>` → **Typ-Lüge**

- **F-07** `handover()` (Zeile 53) — gleiche Lügen-Konstruktion:
  ```typescript
  if (!this._callback) return (() => {}) as T;
  ```
  Toter Branch + Typ-Lüge.

- **F-08** `executeOr` ignoriert `args`:
  ```typescript
  public executeOr(orExecute: T, ...args: Parameters<T>): ReturnType<T> {
      if (!this._callback) return orExecute() as ReturnType<T>;  // ← args fehlen!
      return this._callback(...args) as ReturnType<T>;
  }
  ```
  **Bug**: Im Fallback-Pfad wird `orExecute` ohne Argumente aufgerufen.

- **F-09** Doppelte Wahrheitsquelle: `_callback` und `_hasCallback`. `none()` setzt `_callback = noop` und `_hasCallback = false`. Synchronisationspflicht zwischen zwei Feldern, dadurch tote `if (!this._callback)`-Branches.

- **F-10** `from`-Signatur akzeptiert nur `T | undefined`, nicht `null`. Inkonsistent zu `Option.from(value: T | null | undefined)`.

- **F-11** **Keine Tests.**

---

### 3.3 Feature `option/`

#### Inhalt

| Datei | Rolle |
|---|---|
| `index.ts` | Re-Exports aller 6 Untermodule |
| `models/IOption.ts` | Interface mit ~20 Methoden (Rust-Option-inspiriert) |
| `models/AsOptional.ts` | Type-Helper (`Omit & Partial<Pick>`) |
| `guards/isOption.ts` | Strukturelle Type-Guard |
| `core/optionBase.ts` | Abstrakte Basisklasse mit der gesamten Logik |
| `core/someOption.ts` | `Some`-Variante (hält `value`) |
| `core/noneOption.ts` | `None`-Variante (gibt `undefined`) |
| `core/option.ts` | Factories (`Some`, `None`, `Option`) + JSON/Conversion-Helper |

#### Konzept
Klassische Rust-Option-Portierung. Diskriminierung über `isSome`/`isNone` und die abstrakte Methode `getValue(): T | undefined`. `OptionBase` implementiert das gesamte Verhalten, indem es `getValue()` befragt — `SomeOption`/`NoneOption` liefern den Wert.

#### Beobachtungen

**Positiv**
- Saubere Trennung: Interface ↔ abstrakte Basis ↔ konkrete Varianten ↔ Factories
- Reichhaltige API (`unwrapOr*`, `map*`, `and*`, `or*`, `match`, `filter`, `toArray`)
- `Some(value)` validiert gegen `null`/`undefined` und wirft `Exception`
- Konventionskonforme Struktur

**Kritische Findings**

- **F-12** **Fundamentale Designschwäche: `T extends undefined` ist nicht modellierbar.** Die gesamte Logik unterscheidet `Some` und `None` ausschließlich über `getValue() === undefined`. Eine `IOption<undefined>` kann nie `Some(undefined)` halten. Anti-Pattern: der Sentinel-Wert ist auch ein gültiger Domain-Wert. Konkrete Bug-Folge in `optionBase.ts`:
  ```typescript
  unwrap(): T {
      const value = this.getValue();
      if (value !== undefined) return value;
      throw new Exception('Called unwrap on a None value');
  }
  ```
  Wenn `T = number | undefined` und der Konsument irgendwie eine `Some(undefined)` hat (z.B. via `toOption`), wird `unwrap()` fälschlicherweise werfen.
  **Fix-Pfad:** Discrimination über `this.isSome` (existiert bereits) statt `value !== undefined`.

- **F-13** `toOption` ist semantisch überladen:
  - Bei JSON-String → parsen, dann rekursiv
  - Bei Array → Array von Options (mit `as any`-Cast)
  - Bei Objekt → Plain-Objekt mit Option-gewrappten Properties
  - Bei `{ isSome, isNone, value }` → als serialisierte Option behandeln
  Signatur `(value: unknown) => IOption<T>` lügt: gibt im Array-/Objekt-Fall **kein** `IOption<T>` zurück. `!value`-Check (Zeile 48) behandelt `0`/`''`/`false` als "leer". `isJsonString`-Heuristik kann zu unerwarteten `JSON.parse`-Würfen führen (kein try/catch).

- **F-14** Round-Trip `toOption(toJsonString(opt))` nicht verlustfrei (siehe F-13).

- **F-15** Freistehende Funktionen `toJsonObject`/`toJsonString`/`toOption` neben dem `Option`-Namespace. Inkonsistent zur Namespace-Idee.

- **F-16** `SomeOption`/`NoneOption`-Klassen werden im Barrel re-exportiert. Konsumenten können `new SomeOption(x)` schreiben und so die `null`/`undefined`-Validierung umgehen.

- **F-17** `isOption`-Guard ist heuristisch und zu lax:
  ```typescript
  'isSome' in option && 'isNone' in option && ('value' in option || option.isSome === false)
  ```
  Akzeptiert jedes Plain-Objekt mit dieser Form. Korrekter wäre `instanceof OptionBase`. Die strukturelle Variante ist nur sinnvoll, wenn Cross-Realm (Worker/Postmessage) ein echter Use-Case ist.

- **F-18** Inkonsistenz zwischen Rückgabetyp der Factories (`IOption<T>`) und Predicate des Guards (`OptionBase<T>`). Der Guard leakt die Implementierung.

- **F-19** `getValue()` ist faktisch Teil der Public-API (wird von `toJsonObject` aufgerufen), steht aber nicht im `IOption`-Interface.

- **F-20** `&&`-Hack in `onSome`/`onNone` (Zeile 78, 83):
  ```typescript
  value !== undefined && fn(value);
  ```
  Triggert `eslint-disable @typescript-eslint/no-unused-expressions`. Stilfrage.

- **F-21** **Keine Tests.** Besonders schmerzhaft, weil `option/` Fundament für `result/`, `callback/` ist.

- **F-22** `AsOptional<T, K>` (Type-Helper) hat inhaltlich nichts mit `Option<T>` zu tun. Liegt im falschen Feature.

- **F-23** Dependency `option/` → `exceptions/` (für `unwrap()`-Wurf). Architektonisch fragwürdig: Option ist die fundamentalere Abstraktion. Alternative: native `Error` werfen — siehe F-37 für Gesamteinordnung.

- **F-24** Path-Alias-Inkonsistenz: `Exception` wird via `timi-essentials:exceptions` importiert, `IOption` via relativem `'../models/IOption'`. Mischmuster.

- **F-25** ESLint-Disable-Häufung über mehrere Dateien des Features. Strukturell, weil eine Option-Implementierung per Definition mit `undefined` arbeitet. Sollte über `eslint.config.js`-Override für `option/**` gelöst werden statt File-Level-Disables.

---

### 3.4 Feature `result/`

#### Inhalt

| Datei | Rolle |
|---|---|
| `index.ts` | Re-Exports (Interface, Guard, Factories, beide Klassen) |
| `models/IResult.ts` | Interface mit ~15 Methoden |
| `guards/isResult.ts` | Strukturelle Type-Guard |
| `core/resultBase.ts` | Abstrakte Basisklasse mit gesamter Logik |
| `core/okResult.ts` | `Ok`-Variante (hält `value`) |
| `core/errResult.ts` | `Err`-Variante (hält `error: Exception`) |
| `core/result.ts` | Factories `Ok`, `Err`, `Result.from`, `Result.fromAsync` |

#### Konzept
Klassische Rust-Result-Portierung. **Diskriminierung über `isOk`/`isErr`** (anders als Option, die über `value !== undefined` diskriminiert — siehe F-12). Fehlertyp ist **fest verdrahtet auf `Exception`** (nicht generisch wie `Result<T, E>` in Rust).

#### Beobachtungen

**Positiv**
- Bessere Discrimination als Option: `resultBase` nutzt `this.isOk`/`this.isErr` statt `value !== undefined`. Robust auch bei `T = undefined` oder `T = null`. Genau das Pattern, das Option **nicht** hat.
- `Result.from`/`fromAsync` mit sinnvollem Wrap auf `Exception` (keine Doppelverpackung)
- Konsumentenseitig sauber: `result.match(value => ..., error => ...)`
- Konventionskonforme Struktur

**Kritische Findings**

- **F-26** Fehlertyp hart auf `Exception`. Kein generisches `Result<T, E>`. **Bewusste Entscheidung** (siehe Abschnitt 9) — wird als Konvention dokumentiert.

- **F-27** `ok()` und `err()` sind doppeldeutig: Accessor _und_ Werfer:
  ```typescript
  // In OkResult:
  ok(): T { return this.value; }
  err(): Exception { throw new Exception('The Result object isnt in a error state'); }
  ```
  `IResult.ok(): T` ist nominell ein Accessor, kann aber werfen. Möglichkeit eines Wurfs nicht im Typ kommuniziert. In `resultBase.ts` führt das zu überflüssigen `as T` / `as Exception`-Casts.

- **F-28** Tippfehler in Error-Messages:
  - `okResult.ts:17`: `'The Result object isnt in a error state'` (fehlendes Apostroph + sollte "in an" sein)
  - `errResult.ts:13`: `"The Result object isn't in a ok state"` (sollte "in an ok" sein)

- **F-29** `unwrap()`-Message verliert Stack-Trace:
  ```typescript
  throw new Exception(`Called unwrap on an Err value: ${this.err()}`);
  ```
  `this.err()` wird via Template-String stringifiziert; Stack-Trace und Exception-Subtyp gehen verloren.

- **F-30** `expect()`/`expectErr()` werfen `Exception`, nicht den Originalfehler. Original-`Exception` wird zu String degradiert, neu verpackt — Stack-Trace und Exception-Subtyp (z.B. `NotFoundException`) gehen verloren. Schmerzhaft beim Debuggen.

- **F-31** `isResult`-Predicate behauptet `value & error` gleichzeitig:
  ```typescript
  result is ResultBase<T> & { value: T; error: Exception }
  ```
  Niemals wahr (entweder Ok oder Err). Strukturell statt nominal. Predicate-Typ leakt `ResultBase`.

- **F-32** `ErrResult<T>` mit Phantom-`T` (nirgends verwendet außer für Interface-Implementierung). `T = never` als Default in `Err = <T = never>(...)` ist clever (Assignment zu jedem `Result<T>` möglich). Aber: Klasse im Barrel exportiert (siehe F-40) — Konsument könnte `new ErrResult<string>(err)` schreiben, was verwirrend ist.

- **F-33** `Result.from` reduziert non-Error-Würfe (`throw 'string'` etc.) via `String(error)` zur Message. Strukturierte Information geht verloren. Vertretbar, aber dokumentationsbedürftig.

- **F-34** `Result.fromAsync` nutzt `.then()/.catch()` statt `try/await/catch`. Asymmetrie zu `Result.from`. Stilfrage.

- **F-35** API-Asymmetrie zwischen Option und Result:
  | Konzept | Option | Result |
  |---|---|---|
  | Filter | `filter(predicate)` | – |
  | To-Array | `toArray()` | – |
  | To-String | `toString()` | – |

  Result fehlt `filter` (konzeptionell schwierig), aber auch `toString` und `toArray`. Wirkt wie zwei Iterationen.

- **F-36** Fehlende Konversion Result↔Option. In Rust: `Result::ok() -> Option<T>`, `Result::err() -> Option<E>`. Hier heißen die Methoden zwar genauso, machen aber etwas völlig anderes (siehe F-27). **Stolperstein für Rust-Kenner.**

- **F-37** Dependency `result/` → `exceptions/`. `IResult` selbst importiert `Exception`. Zusammen mit F-23 (Option → Exception) — kein Zyklus, weil `exceptions/` nichts zurückimportiert (verifiziert in Schritt 3.5). Coupling akzeptiert.

- **F-38** Path-Alias-Inkonsistenz (selbe Beobachtung wie bei Option, siehe F-24).

- **F-39** **Keine Tests.**

- **F-40** `OkResult`/`ErrResult`-Klassen im Barrel exportiert. Selbe Inkonsistenz wie F-16 für Option.

---

### 3.5 Feature `exceptions/`

#### Inhalt

| Datei | Rolle |
|---|---|
| `index.ts` | Re-Exports aller 9 Untermodule (alphabetisch) |
| `models/IException.ts` | Minimal-Interface: `Error` + `info: string` |
| `core/exception.ts` | Basisklasse `Exception extends Error`, mit `info`, `cause`, `toJSON`, `fromError` |
| `core/badRequestException.ts` | Subklasse, `info='BAD_REQUEST'` |
| `core/unauthorizedException.ts` | Subklasse, `info='UNAUTHORIZED'`, Default-Message |
| `core/forbiddenException.ts` | Subklasse, `info='FORBIDDEN'`, Default-Message |
| `core/notFoundException.ts` | Subklasse, `info='NOT_FOUND'` |
| `core/conflictException.ts` | Subklasse, `info='CONFLICT'`, Default-Message |
| `core/internalServerErrorException.ts` | Subklasse, `info='INTERNAL_SERVER_ERROR'`, Default-Message |
| `core/serviceUnavailableException.ts` | Subklasse, `info='SERVICE_UNAVAILABLE'`, Default-Message |
| `core/httpStatusExceptionFactory.ts` | Klasse mit `static createFromStatus(status, message)` |

#### Konzept
HTTP-Statuscode-zentrierte Exception-Hierarchie mit `info`-Tag (machine-readable Code). Basisklasse erweitert nativ `Error`, mit `cause`-Support und custom `toJSON`. Subklassen sind nahezu identisch.

#### Dependency-Status
`exceptions/` importiert **nichts** aus `option/`, `result/`, `callback/`. **Kein Zyklus** (Sorge aus F-23/F-37 entkräftet).

#### Beobachtungen

**Positiv**
- Saubere Vererbungs-Hierarchie: `Error` → `Exception` → spezifische Subklassen
- `Object.setPrototypeOf(this, new.target.prototype)` in der Basis und `Object.setPrototypeOf(this, XException.prototype)` in jeder Subklasse — korrekter Workaround für TypeScript-`extends Error`-Bug bei kompilierten Targets ≤ ES2015. Defensiv und richtig.
- `fromError` mit Stack-Trace-Erhaltung
- `HttpStatusExceptionFactory` zentralisiert die Status→Exception-Mapping-Logik
- `info`-Tag als machine-readable Code sinnvoll
- `cause`-Support (intern) folgt ES2022-Standard

**Kritische Findings**

- **F-41** `cause` wird **nicht** an `Error` weitergereicht:
  ```typescript
  constructor(message?: string, options?: { cause?: unknown }) {
      super(message);  // ← options.cause wird NICHT an super weitergereicht
      this.options = options;
      ...
  }
  ```
  Konsequenz: `exception.cause` (Standard-API) ist `undefined`. Tools wie Devtools, Pino, Sentry, die nach `error.cause` suchen, finden nichts.
  **Fix:** `super(message, options)` aufrufen. Dann ist `this.cause` automatisch verfügbar.

- **F-42** `options`-Feld redundant zur Native-API. Wenn F-41 gefixt wird, entfällt das ganze Feld.

- **F-43** `info` über `protected setInfo()` — ungewöhnliches Pattern. `protected _info` mit `info`-Getter und `setInfo`-Setter ist Java/C#-Reflex. In TypeScript holpriger, aber pragmatisch funktional.

- **F-44** Massive Code-Duplikation in 7 Subklassen (~77 Zeilen Boilerplate). **Bewusste Entscheidung** (siehe Abschnitt 9): bleibt als eigenständige Klassen wegen `instanceof`-Checks.

- **F-45** Inkonsistente Default-Messages:
  | Subklasse | Default |
  |---|---|
  | `BadRequestException` | – |
  | `UnauthorizedException` | `'Unauthorized'` |
  | `ForbiddenException` | `'Forbidden'` |
  | `NotFoundException` | – |
  | `ConflictException` | `'Conflict'` |
  | `InternalServerErrorException` | `'Internal Server Error'` |
  | `ServiceUnavailableException` | `'Service Unavailable'` |

  `BadRequest` und `NotFound` haben **keinen** Default ohne erkennbaren Grund.

- **F-46** `HttpStatusExceptionFactory` als Klasse mit ausschließlich statischen Methoden — Anti-Pattern in TS. Eine reine Funktion `createFromHttpStatus` wäre direkter.

- **F-47** Status-Mapping unvollständig. Fehlend (Auswahl): `402`, `405`, `408`, `410`, `415`, `422`, `429`, `501`, `502`, `504`. Default fällt auf generische `Exception` mit `info='UNKNOWN_ERROR'` — HTTP-Semantik geht verloren.

- **F-48** Keine Bidirektionalität: kein `getHttpStatus()` auf der Exception. Error-Handler in `timi-api/` muss `instanceof XException`-Switching machen.
  **Verbesserungs-Idee:** `static readonly httpStatus: number = 404` pro Subklasse — Error-Handler kann generisch mappen.

- **F-49** `toJSON` exposed `_info` statt `info` — **API-Vertragsbruch**:
  ```typescript
  toJSON(): Record<string, unknown> {
      return {
          name: this.name,
          message: this.message,
          _info: this._info,    // ← Konsumenten sehen `_info`, nicht `info`
          stack: this.stack,
          cause: this.options?.cause,
      };
  }
  ```
  Der Public-Getter heißt `info`, die JSON-Form aber `_info`. Frontend-Konsumenten bekommen falsches Feldname.

- **F-50** `toJSON` enthält `stack` — **Sicherheitsrisiko in Production**. Information disclosure: Pfade, Versionen, interner Code werden Angreifern preisgegeben (OWASP-Anti-Pattern). Stack-Trace gehört in Logs, nicht in HTTP-Responses.

- **F-51** Drei `eslint-disable` ohne Begründung am Kopf von `exception.ts` (`no-undefined`, `no-restricted-syntax`, `@typescript-eslint/no-restricted-types`). Audit erforderlich.

- **F-52** Inkonsistente Formatierung Basis vs. Subklassen:
  ```typescript
  // exception.ts:
  options?: { cause?: unknown }    // mit Leerzeichen
  // Subklassen:
  options?: {cause?: unknown}      // ohne Leerzeichen
  ```
  Prettier-Frage.

- **F-53** **Keine Tests.**

- **F-54** `Exception.fromError` mutiert `stack` (legitim, aber undokumentiert). Stack-Manipulation ist legitim, aber dokumentationsbedürftig.

---

## 4. Konsolidierte Findings-Liste

### Bugs (konkrete Falsch-Funktion)

| ID | Feature | Schwere | Beschreibung |
|---|---|---|---|
| F-08 | callback | **hoch** | ~~`executeOr` gibt args nicht an Fallback weiter~~ — **resolved (Sprint 1, Commit `9907cde`)**: `executeOr` reicht Spread-Args an Fallback weiter. |
| F-12 | option | **hoch** | ~~`T extends undefined` nicht modellierbar~~ — **resolved (Sprint 2, Commit `78ecd4e`)**: alle `OptionBase`-Methoden diskriminieren über `this.isSome`/`this.isNone` statt `value !== undefined`. |
| F-41 | exceptions | **hoch** | ~~`cause` nicht an Native-Error weitergereicht~~ — **resolved (Sprint 1, Commit `851ad0a`)**: `super(message, options)` reicht `cause` durch; `options`-Feld entfernt. |
| F-49 | exceptions | **hoch** | ~~`toJSON` exposed `_info` statt `info` (API-Vertragsbruch)~~ — **resolved (Sprint 1, Commit `851ad0a`)**: JSON-Key heißt jetzt `info`. |
| F-50 | exceptions | **hoch** | ~~`toJSON` enthält `stack` (Security-Risiko)~~ — **resolved (Sprint 1, Commit `851ad0a`)**: `stack` aus `toJSON` entfernt. |
| F-06 | callback | mittel | ~~`execute()` Typ-Lüge bei totem Branch~~ — **resolved (Callback-Refactor, Commit `b7d3c24`)**: tote Branches durch strikten `IOption<T>`-State entfernt; `execute()` wirft jetzt `Exception` bei `none()`. |
| F-07 | callback | mittel | ~~`handover()` Typ-Lüge~~ — **resolved (Callback-Refactor, Commit `b7d3c24`)**: `handover()` wirft jetzt `Exception` bei `none()`; kein Noop-Fallback mehr. |
| F-13 | option | mittel | `toOption` Signatur lügt |
| F-14 | option | mittel | Round-Trip nicht verlustfrei |
| F-29 | result | mittel | ~~`unwrap()` verliert Stack-Trace~~ — **resolved (Sprint 2, Commit `7352c14`)**: `Exception(message, { cause: this.err() })` reicht Original-Err inkl. Stack/Subtyp/`info`-Tag durch. |
| F-30 | result | mittel | ~~`expect`/`expectErr` degradieren Original-Exception~~ — **resolved (Sprint 2, Commit `7352c14`)**: `cause`-Chain analog zu F-29. |
| F-31 | result | niedrig | `isResult`-Predicate behauptet Unmögliches |

### Design-/Architektur-Fragen

| ID | Feature | Beschreibung |
|---|---|---|
| F-03 | root | `export *` vs. explizite Re-Exports |
| F-22 | option | `AsOptional` gehört nicht zum Option-Feature |
| F-23 / F-37 | option/result | Dependency auf `exceptions` (akzeptiert) |
| F-26 | result | Fehlertyp hart auf `Exception` (akzeptiert) |
| F-27 | result | `ok()`/`err()` als Accessor+Werfer |
| F-35 | result | API-Asymmetrie zu Option |
| F-36 | result | Fehlende Konversion Result↔Option |
| F-44 | exceptions | Code-Duplikation in 7 Subklassen (akzeptiert) |
| F-47 | exceptions | Status-Mapping unvollständig |
| F-48 | exceptions | Keine Bidirektionalität Exception → HTTP-Status |

### Konventions-/Konsistenz-Verstöße

| ID | Feature | Beschreibung |
|---|---|---|
| F-09 | callback | ~~Redundanz `_callback` ⇄ `_hasCallback`~~ — **resolved (Callback-Refactor, Commit `b7d3c24`)**: interner State über `IOption<T>`, einzige Wahrheitsquelle. |
| F-10 | callback | ~~`from`-Signatur ohne `null`~~ — **resolved (Callback-Refactor, Commit `b7d3c24`)**: `Callback.from(callback: T \| undefined)` delegiert an `Option.from(...)`, das `null \| undefined` einheitlich behandelt. |
| F-15 | option | `toJsonObject`/`toJsonString`/`toOption` freistehend |
| F-16 | option | `SomeOption`/`NoneOption` im Barrel |
| F-17 | option | `isOption` heuristisch + leakt Implementierung |
| F-18 | option | Inkonsistenz `IOption` vs. `OptionBase` |
| F-19 | option | `getValue()` faktisch public, nicht im Interface |
| F-32 | result | `ErrResult<T>` Phantom-Type |
| F-40 | result | `OkResult`/`ErrResult` im Barrel |
| F-43 | exceptions | `setInfo()`-Pattern unüblich |
| F-45 | exceptions | Inkonsistente Default-Messages |
| F-46 | exceptions | Statische Klasse als Anti-Pattern |

### Stil / Kosmetik

| ID | Beschreibung |
|---|---|
| F-02 | Fehlendes Semikolon Root `index.ts` |
| F-20 | ~~`&&`-Hack in `onSome`/`onNone`~~ — **resolved (Sprint 2, Commit `78ecd4e`)**: durch `if (this.isSome) fn(...)` ersetzt; `no-unused-expressions`-Disable konnte entfallen. |
| F-28 | Tippfehler in Result-Error-Messages |
| F-33 | `Result.from` reduziert non-Error-Würfe |
| F-34 | `Result.fromAsync` Stil-Asymmetrie |
| F-42 | `options`-Feld redundant zur Native-API |
| F-52 | Inkonsistente Formatierung in exceptions/ |
| F-54 | `Exception.fromError` mutiert `stack` undokumentiert |

### ESLint / Konventions-Setup

| ID | Beschreibung |
|---|---|
| F-01 / F-24 / F-38 | Path-Alias-Inkonsistenz |
| F-04 | Kollisionsrisiko bei `export *` |
| F-05 | callback: 4× `eslint-disable` ohne Begründung |
| F-25 | option: ESLint-Disable-Häufung |
| F-51 | exceptions: 3× `eslint-disable` ohne Begründung |

### Test-Strategie

| ID | Beschreibung |
|---|---|
| F-11, F-21, F-39, F-53 | **Keine Tests in der gesamten Library** |

---

## 5. Priorisierung

### P0 (sofort: Bugs mit Außenwirkung)

1. **F-50** `toJSON` leakt Stack-Trace → Sicherheitsproblem in Production
2. **F-49** `toJSON` exposed `_info` → Frontend-Konsumenten bekommen falsches Feldname
3. **F-41** `cause` wird nicht an `Error.cause` durchgereicht
4. **F-08** `Callback.executeOr` ignoriert args

### P1 (kurzfristig: Bugs mit Debugging-Schmerz)

5. **F-29 + F-30** Result `unwrap`/`expect` verlieren Stack-Trace
6. **F-12** Option-Discrimination via `undefined` (latent)
7. **F-06 + F-07** Callback Typ-Lügen (manifestiert kaum)

### P2 (mittelfristig: Konventions-Aufräumung)

8. **F-15 + F-16 + F-40** Barrel-Aufräumung
9. **F-42** `options`-Feld entfernen sobald F-41 gefixt
10. **F-13** `toOption` aufspalten oder dokumentieren
11. **F-22** `AsOptional` umbenennen oder verschieben

### P3 (langfristig: Architektur)

12. **F-36** Result↔Option-Konversion
13. **F-47 + F-48** Status-Mapping vervollständigen + bidirektional

### Quer durch alles

14. **F-11/F-21/F-39/F-53** Test-Strategie (siehe Abschnitt 6)

---

## 6. Test-Strategie

### Status quo
- Keine Test-Dependencies
- Keine `*.test.ts` / `*.spec.ts`

### Empfehlung: Vitest

**Begründung**
- ESM-nativ (passt zu `"type": "module"`)
- Path-Alias-Support out-of-the-box
- Schnell, watch-mode, gute TS-Integration ohne Babel

### Test-Reihenfolge nach Risiko/Nutzen

| Phase | Feature | Begründung |
|---|---|---|
| 1 | `exceptions` | Fundament; nach F-41/F-49/F-50-Fixes Tests **zuerst** |
| 2 | `option` | Kern-Monade; F-12 lässt sich durch Tests sichtbar machen |
| 3 | `result` | Symmetrisch zu Option; F-29/F-30 als Test-Cases |
| 4 | `callback` | Klein; F-08 als ersten Test |

### Test-Coverage-Ziele

- Unit-Tests pro Methode (besonders `match`/`map`/`andThen`-Kombinationen)
- Property-Based-Tests via `fast-check`: Monaden-Gesetze
- Snapshot für `toJSON` (Wire-Format-Stabilität)
- Round-Trip-Tests: `toOption(toJsonString(opt))` (deckt F-14 auf)

### Test-Datei-Konvention

**Co-located**: `src/option/core/option.test.ts` (festgelegt, siehe Abschnitt 9)

---

## 7. Vorgeschlagene `.rules/`-Dateien

| Datei | Trigger-Findings | Inhalt |
|---|---|---|
| `option-implementation.md` | F-25, F-12 | Option darf `undefined`/`null`/`no-restricted-types` ESLint-Regeln umgehen — als Override-Section, nicht per Datei-Disable |
| `barrel-exports.md` | F-15, F-16, F-40 | Welche Symbole sind Public API? Implementierungsklassen wie `OkResult`/`SomeOption` gehören **nicht** ins Barrel |
| `intra-feature-imports.md` | F-01, F-24, F-38 | Innerhalb eines Features: relative Pfade. Cross-Feature: Workspace-Alias |
| `exception-cause-handling.md` | F-41, F-42 | `cause` muss an Native-`Error` weitergereicht werden; eigene `options`-Felder sind verboten |
| `exception-tojson.md` | F-49, F-50 | `toJSON` darf keine Stack-Traces ausliefern; Feldnamen müssen mit Public-Gettern übereinstimmen |
| `result-error-type.md` | F-26 | Dokumentiert die bewusste Fixierung auf `Exception` als Fehlertyp |
| `eslint-disable-comments.md` | F-05, F-25, F-51 | Jeder `eslint-disable` braucht Kommentar mit Begründung — oder Override-Section |

---

## 8. Sprint-Plan

### 🔴 Sprint 1 — P0-Bugs + Test-Setup ✅ abgeschlossen

**Ziel:** Sicherheit + Vertragsbruch beheben, Test-Infrastruktur einsatzbereit.

**Status:** Alle Aktionen abgeschlossen. Vitest läuft (`316f671`), Exception-Fixes umgesetzt (`851ad0a`), Callback `executeOr`-Bug behoben (`9907cde`). Zusätzlich wurde Callback komplett auf einen strikten Vertrag umgebaut (`b7d3c24`, siehe Anhang Callback-Refactor) — dieser Schritt war ursprünglich nicht in Sprint 1 vorgesehen, schließt aber die Findings F-06, F-07, F-09, F-10 mit. As-is-Tests für alle vier Features liegen vor (227 Tests, Coverage 99.5 %).

| # | Aktion | Findings | Dateien | Status |
|---|---|---|---|---|
| 1 | Vitest einrichten: `vitest`, `@vitest/coverage-v8` als `devDependencies`; `vitest.config.ts` mit Path-Alias-Resolution für `essentials:*`; Script `"test": "vitest"`; `tsconfig.json` exclude für `*.test.ts` | F-21 | `package.json`, `vitest.config.ts`, `tsconfig.json` | ✅ `316f671` |
| 2 | `.rules/exception-tojson.md` abstimmen (kein Stack im JSON, Feldname `info` statt `_info`, optional dev-Mode-Toggle) | F-50, F-49 | neu | ⏭ übersprungen (direkt umgesetzt; `.rules`-Datei nachreichbar) |
| 3 | `Exception.toJSON` fixen: `stack` entfernen (oder hinter NODE_ENV-Guard), `_info` → `info` | F-50, F-49 | `exceptions/core/exception.ts` | ✅ `851ad0a` |
| 4 | `.rules/exception-cause-handling.md` abstimmen (`cause` an Native-Error-Konstruktor; `options`-Feld entfällt) | F-41, F-42 | neu | ⏭ übersprungen (direkt umgesetzt) |
| 5 | `Exception`-Konstruktor: `super(message, options)`; privates `options`-Feld entfernen; `toJSON` nutzt direkt `this.cause` | F-41, F-42 | `exceptions/core/exception.ts` | ✅ `851ad0a` |
| 6 | `Callback.executeOr` fixen: `orExecute(...args)` statt `orExecute()` | F-08 | `callback/core/callback.ts` | ✅ `9907cde` |
| 7 | Test-Suite `exception.test.ts`: instanceof-Chain, cause-Durchreichen, toJSON-Snapshot, fromError-Stack-Erhalt | – | `exceptions/core/exception.test.ts` | ✅ `316f671` (86 Tests insgesamt für exceptions) |
| 8 | Test-Suite `callback.test.ts`: `executeOr` mit args, `from(undefined)`, `from(fn)` | F-08, F-11 | `callback/core/callback.test.ts` | ✅ `5b22001` (initial), `b7d3c24` (Rewrite für strikten Vertrag) |

**Zusatz (außerhalb des ursprünglichen Sprint-1-Plans):**
- As-is-Test-Suiten für `option/` (`df2f89c`, 76 Tests) und `result/` (`1565a6c`, 51 Tests) bereits in Sprint 1 angelegt — pinned Bugs (F-12, F-14, F-15, F-17, F-29, F-30) werden so dokumentiert und sind im Sprint 2 die Failing-Tests.
- **Callback-Refactor** (`b7d3c24`): Der ursprüngliche Sprint-1-Vertrag war "fire and forget" (`execute()` returnt `void | Promise<void>`, läuft Noop bei `none()`). Auf Wunsch des Users wurde das ersetzt durch einen strikten Vertrag analog zu `Option.unwrap` / `Result.unwrap`. Konkrete Änderungen:
  - Generic-Constraint geöffnet auf `T extends (...args: any[]) => any` (Callbacks dürfen jetzt Daten zurückgeben).
  - `Callback.create(fn)` und `Callback.none()` als explizite State-Konstruktoren analog zu `Some` / `None` und `Ok` / `Err`. `Callback.from(fn)` bleibt der Smart-Konstruktor.
  - `execute(...args): ReturnType<T>` und `handover(): T` werfen jetzt `Exception` (Basis) bei `none()`. Damit verschwinden die toten Branches und Typ-Lügen (F-06, F-07).
  - `executeOr(or, ...args): ReturnType<T>` und `handoverOr(or): T` als nachsichtige Varianten analog zu `unwrapOr`.
  - `exists()`-Methode ersetzt durch `hasCallback`-Getter (analog `Option.isSome`).
  - Interner State über `IOption<T>` statt `T | undefined` — schließt `_callback`/`_hasCallback`-Redundanz (F-09) und respektiert die `no-undefined`-Regel ohne `eslint-disable`.

**Nicht-Ziele (eingehalten):** Subklassen-Refactor, Path-Alias-Konvention, Option/Result-Tests (As-is-Tests sind dokumentierend, kein Verhaltens-Refactor).

---

### 🟡 Sprint 2 — P1-Bugs + Verhaltens-Fixes ✅ abgeschlossen

**Ziel:** Stack-Trace-Erhalt in Result, Option-Discrimination-Bug fixen, pinned Bugs in den As-is-Tests durch das tatsächliche Verhalten ersetzen.

**Status:** Alle drei Findings (F-29, F-30, F-12) erledigt. Pinned-Bug-Tests in `result.test.ts` wurden auf das neue Verhalten umgestellt (HARTE REGEL: Paket-Freigabe vom User eingeholt). Option-Tests blieben unverändert grün, weil die offizielle `Some(value)`-Factory `null`/`undefined` bereits am Konstruktor abfängt — der F-12-Bug war strukturell, aber über die Public API praktisch nicht erreichbar. Side-Effekte: F-20 (`&&`-Hack in `onSome`/`onNone`) und ein Großteil der `eslint-disable`-Häufung in `optionBase.ts` (F-25 Teilbeitrag) konnten entfernt werden.

| # | Aktion | Findings | Dateien | Status |
|---|---|---|---|---|
| 9 | Result `unwrap`/`expect`/`expectErr` so anpassen, dass die Original-`Exception` weitergereicht wird (cause-Chain) | F-29, F-30 | `result/core/resultBase.ts`, `result/core/errResult.ts` | ✅ `7352c14` |
| 10 | Pinned-Bug-Tests in `result.test.ts` an neues Verhalten anpassen | F-29, F-30 | `result/core/result.test.ts` | ✅ `7352c14` (Paket-Freigabe) |
| 11 | `.rules/option-undefined-discrimination.md` abstimmen | F-12 | neu | ⏭ übersprungen (direkt umgesetzt; `.rules`-Datei nachreichbar) |
| 12 | F-12 fix: `OptionBase`-Methoden auf `this.isSome` umstellen | F-12, F-20 | `option/core/optionBase.ts` | ✅ `78ecd4e` |
| 13 | Pinned-Bug-Tests in `option.test.ts` an neues Verhalten anpassen | F-12 (und ggf. F-14, F-15) | `option/core/option.test.ts`, `optionBase.test.ts` | ⏭ entfällt (bestehende Tests blieben grün, kein Refactor nötig) |
| 14 | ~~Callback Typ-Lügen aufräumen~~ — **vorgezogen in Sprint 1 (Commit `b7d3c24`)** | F-06, F-07, F-09 | `callback/core/callback.ts` | ✅ erledigt |

---

### 🟠 Sprint 3 — P2-Konventions-Aufräumung

**Ziel:** Public API entrümpeln, ESLint-Setup auf Monaden-Realität anpassen, Tippfehler weg.

| # | Aktion | Findings | Dateien |
|---|---|---|---|
| 15 | ✅ **Erledigt:** `.rules/barrel-exports.md` angelegt. Konvention: Barrels exportieren ausschließlich öffentliche API (Interfaces, Factories, Namespaces, Guards, Exceptions, Free Functions). Implementierungsklassen sind interne Details. | F-15, F-16, F-40 | `.rules/barrel-exports.md` (neu) |
| 16 | ✅ **Erledigt:** `option/index.ts` und `result/index.ts` aufgeräumt — `SomeOption`/`NoneOption`/`OkResult`/`ErrResult` aus den Barrels entfernt (Variante A: Implementierungsklassen internal). Library-interne Importe (Tests, Schwester-Dateien) gehen weiterhin direkt aus den Quelldateien. **Breaking Change** für Konsumenten, die `instanceof SomeOption`/`new OkResult(...)` etc. genutzt haben. | F-15, F-16, F-40 | `option/index.ts`, `result/index.ts` |
| 17 | ✅ **Erledigt:** `toJsonObject` zusätzlich in den `Option`-Namespace aufgenommen (`toJsonString` und `toOption` waren bereits drin). Top-Level-Re-Exporte bleiben bestehen — Konsumenten können beide Stile nutzen. Kleiner Smoke-Test ergänzt. | F-15 | `option/core/option.ts`, `option/core/option.test.ts` |
| 18 | `.rules/eslint-overrides-for-monads.md` abstimmen: Override-Section für `option/**`; pro-Datei-Disables raus | F-25, F-05, F-51 | `eslint.config.js`, Cleanups |
| 19 | ✅ **Erledigt (`0359309`):** Result-Tippfehler korrigiert (`isnt in a error state` → `isn't in an error state`; `isn't in a ok state` → `isn't in an ok state`). Test-Regexes mit-aktualisiert. | F-28 | `result/core/{okResult,errResult}.ts`, `result.test.ts` |
| 20 | `.rules/intra-feature-imports.md` abstimmen | F-01, F-24, F-38 | neu |
| 21 | ✅ **Erledigt (`466f27a`):** `Result.fromAsync` von `.then()/.catch()` auf `try/await/catch` umgestellt — Stilkonsistenz mit `Result.from`. Verhalten unverändert (Tests bleiben grün). | F-34 | `result/core/result.ts` |
| 22 | ✅ **Erledigt:** Callback-Disables auditiert. `naming-convention`-Disable entfernt (triggert nicht mehr seit Static-Constructor-Refactor). Verbleibende Disables (`no-explicit-any`, `no-restricted-types`, `no-restricted-syntax`) mit Begründungs-Kommentaren versehen — sie sind durch das Open-Generic-Pattern `T extends (...args: any[]) => any` und das `T \| undefined`-Argument von `Callback.from` strukturell erforderlich. | F-05 | `callback/core/callback.ts` |
| 23 | ✅ **Erledigt:** `AsOptional` ersatzlos gestrichen (innerhalb der Library nirgends verwendet, gehört konzeptuell auch nicht in das Option-Feature). Datei und Barrel-Re-Export entfernt. | F-22 | `option/models/AsOptional.ts` (gelöscht), `option/index.ts` |
| 24 | ✅ **Erledigt:** `InvalidStateException` als Subklasse von `Exception` eingeführt (`info='INVALID_STATE'`, folgt `BadRequestException`-Pattern). Alle library-internen `throw new Exception(...)` migriert: `Option.unwrap`/`expect`, `Some(null/undefined)`-Guard, `Result.unwrap`/`expect`/`expectErr`, `OkResult.err`, `ErrResult.ok`, `Callback.execute`/`handover`. Tests entsprechend auf `InvalidStateException` geschärft. 227/227 grün. | – (übergreifend, von Callback-Refactor angestoßen) | `exceptions/core/invalidStateException.ts` (neu), `exceptions/index.ts`, Option/Result/Callback-Throw-Sites, alle zugehörigen Tests |

---

### 🔵 Sprint 4 — Backlog / Optional

| # | Aktion | Findings | Begründung |
|---|---|---|---|
| 25 | `Option.toResult(error: Exception): IResult<T>` und `Result.toOption(): IOption<T>` ergänzen | F-36 | Komposition Option↔Result |
| 26 | `HttpStatusExceptionFactory` ausbauen (422, 429, 405, 502, 504); evtl. zu freistehender Funktion | F-46, F-47 | nur wenn Konsumenten es brauchen |
| 27 | `static readonly httpStatus` pro Subklasse → Error-Handler kann generisch mappen | F-48 | nur wenn Konsumenten viel `instanceof`-Switching machen |
| 28 | `isOption` / `isResult` strikter (`instanceof OptionBase`) | F-17, F-31 | nur wenn Cross-Realm kein Use-Case |
| 29 | `getValue()` als `protected` markieren; Konsumenten intern lösen | F-19 | sauberer Public-Vertrag |
| 30 | `toOption` aufspalten oder dokumentieren als JSON-Roundtrip-Helper | F-13, F-14 | abhängig vom Use-Case |
| 31 | `.DS_Store`-Cleanup + `.gitignore`-Eintrag | – | Hygiene |
| 32 | Wurzel `index.ts` Semikolon Z.6 + Stil-Konsistenz | F-02 | Kosmetik |
| 33 | Default-Messages in Exception-Subklassen vereinheitlichen | F-45 | API-Konsistenz |
| 34 | Inkonsistente Formatierung Basis vs. Subklassen durch Prettier glätten | F-52 | Lint-Run |

---

## 9. Festgelegte Entscheidungen

| Frage | Entscheidung |
|---|---|
| P0-Reihenfolge | Security (F-50) → Vertrag (F-49) → cause (F-41) → Callback (F-08) |
| Result-Fehlertyp | `Exception` bleibt fix (kein generisches `Result<T, E>`-Refactor); dokumentiert via `.rules/result-error-type.md` |
| Exception-Subklassen | Bleiben als eigenständige Klassen (für `instanceof`); Boilerplate (F-44) akzeptiert |
| Test-Lage | Co-located (`option.test.ts` neben `option.ts`) |
| **Callback-Vertrag** | Strikter Vertrag analog zu `Option`/`Result` (Variante A): `execute`/`handover` werfen `Exception` bei `none()`; `executeOr`/`handoverOr` als nachsichtige Varianten; `hasCallback` als Getter; explizite State-Konstruktoren `create` / `none` zusätzlich zum Smart-Konstruktor `from`. `tryExecute`/`tryHandover` bewusst weggelassen. Generic-Constraint geöffnet auf `(...args) => any`. |
| **Callback-Throw-Typ (vorläufig)** | `Callback.execute`/`handover` werfen Basis-`Exception` (Status quo der Library, konsequent zu `Option.unwrap`/`Result.unwrap`). Eine library-weite Migration auf `InvalidStateException` ist als Sprint-3-Aufgabe (#24) eingeplant. |
| **Test-Approval** | Pinned-Bug-Tests dürfen erst nach expliziter User-Bestätigung pro Test geändert werden. Gilt für alle Sprint-2+-Verhaltens-Fixes. |

**Folgewirkung:** F-26, F-37, F-44 sind damit **geschlossen** als bewusste Designentscheidung. F-23 wird zu Stilfrage (Coupling Option → Exception akzeptiert).

---

## 10. Offene Punkte / Backlog

- **Konsumenten-Anpassungen** — sobald Public-API-Symbole entfernt werden (z.B. `OkResult`-Klasse aus dem Barrel), müssen Konsumenten in den Vorgänger-Repos angepasst werden.
- **CI-Integration** — Vitest landet in Sprint 1, GitHub-Actions-Hooks für das neue Repo separat einzurichten.
- **Library-Veröffentlichung** — `package.json` ist aktuell `"private": true` mit `"version": "0.0.0"`. Vor Publishing: Versionsschema festlegen, ggf. Release-Tooling (Changesets, semantic-release) evaluieren.
- **README, LICENSE, CONTRIBUTING** — für ein eigenständiges Repo erforderlich. LICENSE ist bereits vorhanden.

---

## Anhang: Schwere-Heuristik

- **hoch** — Bug mit Außenwirkung (Security, API-Vertrag, Silent-Wrong-Behavior)
- **mittel** — Bug mit Debugging-Schmerz oder Datenverlust unter Sonderbedingungen
- **niedrig** — Strukturproblem ohne praktischen Schaden (z.B. unmögliches Predicate)
