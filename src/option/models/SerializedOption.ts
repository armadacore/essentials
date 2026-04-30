/**
 * Wire-format envelope for an {@link IOption} value.
 *
 * Designed for round-trippability through `JSON.stringify` /
 * `JSON.parse`: the `value` key is only present on the Some branch,
 * which means the envelope survives `JSON.stringify` losslessly even
 * when the inner value is `undefined`-equivalent — the absent key is
 * the carrier of "no value here", not a `value: undefined` placeholder.
 *
 * Use {@link Option.serialize} to produce one and
 * {@link Option.deserialize} to read one back.
 */
export type SerializedOption<T> = { readonly isSome: true; readonly value: T } | { readonly isSome: false };
