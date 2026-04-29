# no-restricted-syntax

Inhaltlich identisch zu [no-null/no-null](./no-null__no-null.md).

Union-Typen mit `null` (z.B. `string | null`) sind verboten. Optionale Werte
werden ausschließlich über `IOption<T>` aus `@timi/timi-essentials` ausgedrückt.
Werte aus Fremd-APIs werden am Aufrufpunkt mit `Option.from(...)` konvertiert.

Siehe [no-null__no-null.md](./no-null__no-null.md) für alle Patterns.
