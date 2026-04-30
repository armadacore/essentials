import { Exception } from './exception';

/**
 * Abstract base class for all exceptions that map directly onto an
 * HTTP response status code.
 *
 * Sits between {@link Exception} and the concrete HTTP subclasses
 * (BadRequestException, NotFoundException, …). Each concrete subclass
 * carries its status as a `static readonly httpStatus` field so error
 * handlers can map class → status without an `instanceof` switch:
 *
 * ```ts
 * if (err instanceof HttpStatusExceptionBase) {
 *     ctx.status((err.constructor as typeof HttpStatusExceptionBase).httpStatus);
 * }
 * ```
 *
 * Library-internal exceptions that are not part of the HTTP contract
 * (e.g. {@link InvalidStateException}) deliberately do **not** extend
 * this class; they extend {@link Exception} directly.
 */
export abstract class HttpStatusExceptionBase extends Exception {
	/** HTTP status code this exception represents. Overridden on every concrete subclass. */
	static readonly httpStatus: number;
}
