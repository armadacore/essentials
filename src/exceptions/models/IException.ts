/**
 * Library-wide exception contract: extends the standard {@link Error}
 * with a machine-readable {@link info} tag for categorisation.
 *
 * All thrown values inside the library implement this interface — see
 * {@link Exception} for the concrete root and {@link HttpStatusExceptionBase}
 * for the HTTP-aware subtree.
 */
export interface IException extends Error {
	/**
	 * Stable, machine-readable category tag (e.g. `'BAD_REQUEST'`,
	 * `'INVALID_STATE'`). Distinct from the human-facing {@link Error.message}.
	 * Defaults to `'UNKNOWN_ERROR'` when not specified.
	 */
	readonly info: string;
}
