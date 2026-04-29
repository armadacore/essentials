# no-null/no-null

## Regel

Eigener Code verwendet **niemals** `null` oder `undefined` — weder als Wert, noch im Vergleich.
Optionale Werte werden ausschließlich über `Option<T>` aus `@timi/timi-essentials` ausgedrückt.

## Konvention im Projekt

### Werte aus Fremd-APIs (DOM, Browser, 3rd-Party)

`null`/`undefined` werden direkt am Aufrufpunkt mit `Option.from(...)` in ein
`Option<T>` überführt. Ab dort gilt nur noch `Option<T>`.

```typescript
Option.from(document.getElementById('x'))
    .onSome((element) => element.scrollTo({ top: 0, behavior: 'smooth' }));
```

### React-Hooks mit `null` oder `undefined` als verlangtem Argument

#### `useState`
Initialwert ist `None()`, State-Typ ist `IOption<T>`:

```typescript
// FALSCH
const [value, setValue] = useState<Foo | null>(null);
const [value, setValue] = useState<Foo>();

// RICHTIG
const [value, setValue] = useState<IOption<Foo>>(None());
// oder
const [value, setValue] = useState(None<Foo>());
```

#### `useRef`
Verwende `useNullableRef<T>()` aus `timi-ui:core/hooks/core/useNullableRef`.

#### `createContext`
Verwende `createNullableCtx<T>()` aus `timi-ui:core/hooks/core/createNullableCtx`.

### Konkrete Patterns für DOM-API in Effect/Handler

#### useEffect mit Early-Return
```typescript
useEffect(() => {
    const containerOption = Option.from(document.getElementById('x'));
    if (containerOption.isNone) return;

    const container = containerOption.unwrap();
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
}, []);
```

#### Event-Handler / Side-Effect ohne Cleanup
```typescript
const onClick = (): void =>
    Option.from(document.getElementById('x'))
        .onSome((container) => container.scrollTo({ top: 0, behavior: 'smooth' }));
```

### JSON-Wire-Adapter (Server-Response)

Im Server-Controller, wenn ein `IOption<T>`-Feld als JSON serialisiert werden
muss und das Wire-Format `null` verlangt (REST-Konvention), wird die Methode
`unwrapOrNull()` an `IOption` verwendet. Die einzige `null`-Konstante im
gesamten Codebase steckt in `OptionBase.unwrapOrNull` mit einem
`eslint-disable-next-line no-null/no-null` an genau dieser Stelle.

```typescript
// FALSCH
pageId: pom.pageId.unwrapOr(null as unknown as string),
pageId: pom.pageId.isSome ? pom.pageId.unwrap() : null,

// RICHTIG
pageId: pom.pageId.unwrapOrNull(),
```

Niemals selbst `null` im eigenen Code schreiben — auch nicht in Wire-Adaptern.
Der Helper wird verwendet.
