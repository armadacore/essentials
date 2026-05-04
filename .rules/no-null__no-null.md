# no-null/no-null

## Regel

Eigener Code verwendet **niemals** `null` oder `undefined` — weder als Wert, noch im Vergleich.
Optionale Werte werden ausschließlich über `Option<T>` aus `@armadacore/essentials` ausgedrückt.

## Konvention im Projekt

### Werte aus Fremd-APIs

`null`/`undefined` werden direkt am Aufrufpunkt mit `Option.from(...)` in ein
`Option<T>` überführt. Ab dort gilt nur noch `Option<T>`.

```typescript
const idOption = Option.from(input.id);
idOption.onSome((id) => doSomething(id));
```

### Wire-Format-Adapter

Wenn ein `IOption<T>` an eine Schnittstelle übergeben werden muss, deren
Vertrag `null` verlangt, wird die Methode `unwrapOrNull()` an `IOption`
verwendet. Die einzige `null`-Konstante im gesamten Codebase steckt in
`OptionBase.unwrapOrNull` mit einem `eslint-disable-next-line no-null/no-null`
an genau dieser Stelle.

```typescript
// FALSCH
pageId: pom.pageId.unwrapOr(null as unknown as string),
pageId: pom.pageId.isSome ? pom.pageId.unwrap() : null,

// RICHTIG
pageId: pom.pageId.unwrapOrNull(),
```

Niemals selbst `null` im eigenen Code schreiben — auch nicht in Wire-Adaptern.
Der Helper wird verwendet.
