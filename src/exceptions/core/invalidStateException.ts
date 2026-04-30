import { Exception } from './exception';

/**
 * Thrown when an operation is invoked on an object that is not in a
 * state that supports the operation. Library-internal use:
 *
 *  - {@link Option.unwrap} / {@link Option.expect} on a None value
 *  - {@link Result.unwrap} / {@link Result.expect} / {@link Result.expectErr}
 *    on the wrong variant
 *  - {@link Callback.execute} / {@link Callback.handover} when no
 *    callback is registered
 *  - {@link Some} when called with `null` / `undefined`
 *
 * Carries the canonical `info='INVALID_STATE'` tag for machine-
 * readable categorisation.
 */
export class InvalidStateException extends Exception {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message || 'Invalid State', options);
		this.name = 'InvalidStateException';
		this.setInfo('INVALID_STATE');

		Object.setPrototypeOf(this, InvalidStateException.prototype);
	}
}
