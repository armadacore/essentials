import { type SerializedException } from 'essentials:exceptions';

/**
 * Wire-format envelope for an {@link IResult} value.
 *
 * Mirrors the {@link SerializedOption} pattern: a discriminated union
 * keyed by `isOk`. The `value` key only exists on the Ok branch and
 * `error` only on the Err branch — both are absent on the opposite
 * variant, which makes the envelope round-trip losslessly through
 * `JSON.stringify` / `JSON.parse`.
 *
 * The `error` payload is itself a {@link SerializedException} envelope
 * — `Result.serialize` delegates to {@link Exception.serialize} for
 * the error branch, so error-side concerns (which fields survive,
 * which are dropped, how subclass identity is preserved) are owned by
 * the exception module, not duplicated here.
 *
 * Use {@link Result.serialize} to produce one and
 * {@link Result.deserialize} to read one back.
 */
export type SerializedResult<T> =
	| { readonly isOk: true; readonly value: T }
	| { readonly isOk: false; readonly error: SerializedException };
