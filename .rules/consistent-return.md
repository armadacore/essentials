# consistent-return

## Grundregel

Alle Return-Pfade einer Funktion müssen **denselben Rückgabe-Typ** liefern — entweder alle einen Wert vom selben Typ oder alle keinen Wert.

Verboten ist insbesondere:
- ein Pfad mit Wert + ein Pfad ohne Wert (`return foo;` neben `return;`)
- ein Pfad mit Typ A + ein Pfad mit unverträglichem Typ B
- impliziter `undefined`-Return in einem Pfad neben explizitem Wert in einem anderen

## Hinweis zu den verwendeten Typen

`Option`, `None`, `Some`, `IOption`, `Result`, `Err`, `Ok` und `IResult` werden aus `@armadacore/essentials` importiert.

## Konvention im Projekt

### Funktionen mit optionalem oder fehlerbehaftetem Ergebnis

Wenn das Ergebnis fehlen oder fehlschlagen kann, ist der einheitliche Rückgabe-Typ `Option<T>` bzw. `Result<T, E>`. Der „leer"-Fall ist `None`, der Fehlerfall ist `Err` — beide Pfade liefern damit denselben Wrapper-Typ. Gilt für generische und nicht-generische Funktionen gleichermaßen.

```typescript
// FALSCH — Pfade mit unterschiedlichem Typ (Thing vs. implizit undefined)
const findThing = (id: string): Thing => {
    if (cache.has(id)) return cache.get(id)!;
    // ← kein return ⇒ impliziter undefined-Return
};

// RICHTIG — beide Pfade liefern denselben Typ IOption<Thing>
const findThing = (id: string): IOption<Thing> => Option.from(cache.get(id));
```

```typescript
// RICHTIG — generisch, beide Pfade liefern denselben Typ IOption<T>
const tryRead = <T>(key: string, parse: (raw: string) => T): IOption<T> =>
    Option.from(localStorage.getItem(key)).map(parse);
```

### useEffect mit Early-Return-Guard

Der Cleanup-Pfad gibt eine Funktion `() => void` zurück. Damit der Guard-Pfad denselben Typ liefert, gibt er eine leere Funktion `() => {}` zurück — beide Pfade haben Typ `() => void`.

```typescript
useEffect(() => {
    const containerOption = Option.from(document.getElementById('x'));
    if (containerOption.isNone) return () => {};   // Typ: () => void

    const container = containerOption.unwrap();
    container.addEventListener('scroll', onScroll);

    return () => container.removeEventListener('scroll', onScroll);   // Typ: () => void
}, []);
```
