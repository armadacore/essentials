export interface IException extends Error {
	/**
	 * The info property provides additional context about the exception.
	 * Defaults to 'UNKNOWN_ERROR' when not specified.
	 */
	readonly info: string;
}
