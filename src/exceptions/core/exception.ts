import { type IException } from '../models/IException';
import { type SerializedException } from '../models/SerializedException';
import { exceptionFactories } from './exceptionFactories';

/**
 * Exception class that extends Error with additional info property.
 * Provides structured error handling with mandatory info context.
 * Maintains full Error compatibility while adding business context.
 */
export class Exception extends Error implements IException {
	protected _info: string = 'UNKNOWN_ERROR';

	/**
	 * Creates a new Exception instance
	 * @param {string} [message] - Error message (optional)
	 * @param {ErrorOptions} [options] - Error options for stack trace and cause (optional)
	 */
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);

		this.name = 'Exception';

		// Maintain proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);
	}

	/**
	 * Gets the info property value
	 * @returns {string} The info context string
	 */
	get info(): string {
		return this._info;
	}

	/**
	 * Sets the info property value (protected for inheritance)
	 * @param {string} value - The info context string
	 */
	protected setInfo(value: string): void {
		this._info = value;
	}

	/**
	 * Custom JSON serialization to include Error properties.
	 *
	 * Intentionally omits `stack` to avoid leaking implementation
	 * details / internal paths into serialised payloads (e.g. API
	 * responses, logs shipped off-host).
	 * @returns {object} Object representation for JSON serialization
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			info: this._info,
			cause: (this as Error & { cause?: unknown }).cause,
		};
	}

	/**
	 * Creates a new Exception from an existing Error
	 * @param {Error} error - The source Error to convert
	 * @returns {Exception} A new Exception instance with preserved stack trace
	 */
	public static fromError(error: Error): Exception {
		const exception = new Exception(error.message, { cause: error });

		// Preserve original stack trace if available
		if (error.stack) {
			exception.stack = error.stack;
		}

		return exception;
	}

	/**
	 * Lossless wire-format conversion: turn an {@link Exception} (or
	 * any subclass) into its {@link SerializedException} envelope.
	 *
	 * Reuses {@link Exception.toJSON} so the serialised shape stays
	 * single-sourced. `name`, `message`, `info` and `cause` survive;
	 * `stack` is dropped (matching the `toJSON` policy of not leaking
	 * implementation details into payloads).
	 *
	 * `cause` is pass-through `unknown` — callers are responsible for
	 * ensuring it is JSON-serialisable if they intend to ship the
	 * envelope through `JSON.stringify`.
	 */
	public static serialize(exception: Exception): SerializedException {
		return exception.toJSON() as SerializedException;
	}

	/**
	 * Inverse of {@link Exception.serialize}. Reconstructs an
	 * {@link Exception} from its {@link SerializedException} envelope.
	 *
	 * Looks up the concrete subclass by `name` against the registry in
	 * {@link exceptionFactories}. Known names (e.g.
	 * `'BadRequestException'`) yield an instance of the matching
	 * subclass; unknown names degrade gracefully to a plain
	 * {@link Exception} so that a sender shipping a subclass the
	 * receiver does not know about still produces a usable error.
	 *
	 * `cause` is restored verbatim. `stack` is not reconstructed —
	 * the receiver's own stack frame at the call site is used.
	 */
	public static deserialize(envelope: SerializedException): Exception {
		const ctor = exceptionFactories.registry.get(envelope.name);

		if (ctor) {
			return new ctor(envelope.message, { cause: envelope.cause });
		}

		// Unknown subclass — fall back to a generic Exception, but
		// preserve the envelope's `info` so the receiver still sees the
		// original business tag rather than the default 'UNKNOWN_ERROR'.
		const exception = new Exception(envelope.message, { cause: envelope.cause });
		exception._info = envelope.info;

		return exception;
	}
}
