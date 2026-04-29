# @typescript-eslint/no-restricted-types

Inhaltlich identisch zu [no-null/no-null](./no-null__no-null.md).

`null` ist als Typ-Annotation verboten. Optionale Werte werden ausschließlich über
`IOption<T>` aus `@timi/timi-essentials` ausgedrückt. Werte aus Fremd-APIs werden
am Aufrufpunkt mit `Option.from(...)` konvertiert.

Siehe [no-null__no-null.md](./no-null__no-null.md) für alle Patterns.
