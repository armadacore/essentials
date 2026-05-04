/**
 * Wire-format envelope for an {@link Exception} (or any subclass).
 *
 * Mirrors the shape produced by {@link Exception.toJSON} so the two
 * stay in sync — `toJSON` defines what an exception looks like on the
 * wire; this type names that shape so it can be referenced explicitly.
 *
 * `name` is the discriminator the registry uses to reconstruct the
 * concrete subclass (e.g. `'BadRequestException'`). Unknown names
 * degrade gracefully to a plain {@link Exception} during
 * {@link Exception.deserialize}.
 *
 * `cause` is pass-through `unknown` — whatever the original exception
 * carried, the envelope carries verbatim. If a caller needs guarantees
 * about what survives `JSON.stringify`, they own that responsibility.
 *
 * `stack` is intentionally omitted, matching {@link Exception.toJSON}.
 *
 * Use {@link Exception.serialize} to produce one and
 * {@link Exception.deserialize} to read one back.
 */
export type SerializedException = {
	readonly name: string;
	readonly message: string;
	readonly info: string;
	readonly cause?: unknown;
};
