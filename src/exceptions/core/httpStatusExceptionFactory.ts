import { BadGatewayException } from './badGatewayException';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { GatewayTimeoutException } from './gatewayTimeoutException';
import { HttpStatusException } from './httpStatusException';
import { InternalServerErrorException } from './internalServerErrorException';
import { MethodNotAllowedException } from './methodNotAllowedException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { TooManyRequestsException } from './tooManyRequestsException';
import { UnauthorizedException } from './unauthorizedException';
import { UnprocessableEntityException } from './unprocessableEntityException';

/**
 * Constructor signature shared by every {@link HttpStatusException}
 * subclass. Used by the lookup table to instantiate the correct class
 * for a given HTTP status code without an `instanceof`-cascade.
 */
type IHttpExceptionConstructor = new (message?: string, options?: { cause?: unknown }) => HttpStatusException;

/**
 * Single source of truth for the status-code → class mapping. Every
 * concrete {@link HttpStatusException} subclass registers itself here
 * via its `static httpStatus` field. Adding a new subclass is a
 * one-line addition to this list — the rest of the factory adapts
 * automatically.
 */
const httpStatusExceptions: readonly IHttpExceptionConstructor[] = [
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
	MethodNotAllowedException,
	ConflictException,
	UnprocessableEntityException,
	TooManyRequestsException,
	InternalServerErrorException,
	BadGatewayException,
	ServiceUnavailableException,
	GatewayTimeoutException,
];

/**
 * Lookup table built from {@link httpStatusExceptions}. Keyed by the
 * `static httpStatus` of each registered class. Built once at module
 * load — adding a new subclass requires only registering it in the
 * list above.
 */
const httpStatusLookup: ReadonlyMap<number, IHttpExceptionConstructor> = new Map(
	httpStatusExceptions.map((ctor) => [
		(ctor as unknown as typeof HttpStatusException).httpStatus,
		ctor,
	]),
);

export class HttpStatusExceptionFactory {
	/**
	 * Creates the {@link HttpStatusException} subclass that represents
	 * the given HTTP status code. Falls back to a generic
	 * {@link Exception} (with a synthesised `HTTP <status> Error`
	 * message) for any status without a registered subclass.
	 */
	static createFromStatus(status: number, message?: string): Exception {
		const ctor = httpStatusLookup.get(status);

		if (ctor) return new ctor(message);

		return new Exception(message || `HTTP ${status} Error`);
	}
}
