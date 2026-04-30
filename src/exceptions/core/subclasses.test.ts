import { describe, expect, it } from 'vitest';
import { type IOption, None, Some } from 'essentials:option';
import { BadGatewayException } from './badGatewayException';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { GatewayTimeoutException } from './gatewayTimeoutException';
import { HttpStatusException } from './httpStatusException';
import { InternalServerErrorException } from './internalServerErrorException';
import { InvalidStateException } from './invalidStateException';
import { MethodNotAllowedException } from './methodNotAllowedException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { TooManyRequestsException } from './tooManyRequestsException';
import { UnauthorizedException } from './unauthorizedException';
import { UnprocessableEntityException } from './unprocessableEntityException';

/**
 * Tests document the behaviour of all Exception subclasses. They share
 * a uniform structural contract:
 *   - extend {@link Exception} (and therefore {@link Error})
 *   - own a fixed `info` token
 *   - own a fixed default `name`
 *   - own a fixed human-readable default `message`
 *
 * The previous asymmetry where {@link BadRequestException} and
 * {@link NotFoundException} were constructible with `message === ''`
 * has been removed (Sprint 4 #33 / F-45).
 *
 * Subclasses representing an HTTP response additionally extend
 * {@link HttpStatusException} and carry a `static readonly httpStatus`
 * (Sprint 4 #27 / F-48). {@link InvalidStateException} is library-internal
 * and deliberately does **not** participate in that contract; its
 * httpStatus spec entry is `None()`.
 */

interface ISubclassSpec {
	readonly ctor: new (message?: string, options?: { cause?: unknown }) => Exception;
	readonly name: string;
	readonly info: string;
	readonly defaultMessage: string;
	/** HTTP status carried by the class. `None()` for non-HTTP subclasses. */
	readonly httpStatus: IOption<number>;
}

const subclasses: readonly ISubclassSpec[] = [
	{
		ctor: BadRequestException,
		name: 'BadRequestException',
		info: 'BAD_REQUEST',
		defaultMessage: 'Bad Request',
		httpStatus: Some(400),
	},
	{
		ctor: ConflictException,
		name: 'ConflictException',
		info: 'CONFLICT',
		defaultMessage: 'Conflict',
		httpStatus: Some(409),
	},
	{
		ctor: ForbiddenException,
		name: 'ForbiddenException',
		info: 'FORBIDDEN',
		defaultMessage: 'Forbidden',
		httpStatus: Some(403),
	},
	{
		ctor: InternalServerErrorException,
		name: 'InternalServerErrorException',
		info: 'INTERNAL_SERVER_ERROR',
		defaultMessage: 'Internal Server Error',
		httpStatus: Some(500),
	},
	{
		ctor: InvalidStateException,
		name: 'InvalidStateException',
		info: 'INVALID_STATE',
		defaultMessage: 'Invalid State',
		httpStatus: None(),
	},
	{
		ctor: NotFoundException,
		name: 'NotFoundException',
		info: 'NOT_FOUND',
		defaultMessage: 'Not Found',
		httpStatus: Some(404),
	},
	{
		ctor: ServiceUnavailableException,
		name: 'ServiceUnavailableException',
		info: 'SERVICE_UNAVAILABLE',
		defaultMessage: 'Service Unavailable',
		httpStatus: Some(503),
	},
	{
		ctor: UnauthorizedException,
		name: 'UnauthorizedException',
		info: 'UNAUTHORIZED',
		defaultMessage: 'Unauthorized',
		httpStatus: Some(401),
	},
	{
		ctor: MethodNotAllowedException,
		name: 'MethodNotAllowedException',
		info: 'METHOD_NOT_ALLOWED',
		defaultMessage: 'Method Not Allowed',
		httpStatus: Some(405),
	},
	{
		ctor: UnprocessableEntityException,
		name: 'UnprocessableEntityException',
		info: 'UNPROCESSABLE_ENTITY',
		defaultMessage: 'Unprocessable Entity',
		httpStatus: Some(422),
	},
	{
		ctor: TooManyRequestsException,
		name: 'TooManyRequestsException',
		info: 'TOO_MANY_REQUESTS',
		defaultMessage: 'Too Many Requests',
		httpStatus: Some(429),
	},
	{
		ctor: BadGatewayException,
		name: 'BadGatewayException',
		info: 'BAD_GATEWAY',
		defaultMessage: 'Bad Gateway',
		httpStatus: Some(502),
	},
	{
		ctor: GatewayTimeoutException,
		name: 'GatewayTimeoutException',
		info: 'GATEWAY_TIMEOUT',
		defaultMessage: 'Gateway Timeout',
		httpStatus: Some(504),
	},
];

describe('Exception subclasses', () => {
	for (const spec of subclasses) {
		describe(spec.name, () => {
			it('extends Exception and Error', () => {
				const ex = new spec.ctor();

				expect(ex).toBeInstanceOf(Error);
				expect(ex).toBeInstanceOf(Exception);
				expect(ex).toBeInstanceOf(spec.ctor);
			});

			it(`exposes info "${spec.info}"`, () => {
				expect(new spec.ctor().info).toBe(spec.info);
			});

			it(`exposes name "${spec.name}"`, () => {
				expect(new spec.ctor().name).toBe(spec.name);
			});

			it('uses the documented default message', () => {
				expect(new spec.ctor().message).toBe(spec.defaultMessage);
			});

			it('preserves a custom message', () => {
				expect(new spec.ctor('explicit').message).toBe('explicit');
			});

			it('emits the subclass info via toJSON() under "info"', () => {
				expect(new spec.ctor().toJSON()['info']).toBe(spec.info);
			});

			it('forwards the cause onto the native Error and toJSON()', () => {
				const inner = new Error('inner');
				const ex = new spec.ctor('msg', { cause: inner });

				expect((ex as Error & { cause?: unknown }).cause).toBe(inner);
				expect(ex.toJSON().cause).toBe(inner);
			});

			spec.httpStatus.match(
				(expected) => {
					it(`extends HttpStatusException and exposes httpStatus ${expected}`, () => {
						const ex = new spec.ctor();

						expect(ex).toBeInstanceOf(HttpStatusException);
						expect((spec.ctor as unknown as typeof HttpStatusException).httpStatus).toBe(expected);
					});
				},
				() => {
					it('does NOT extend HttpStatusException (library-internal, no HTTP mapping)', () => {
						expect(new spec.ctor()).not.toBeInstanceOf(HttpStatusException);
					});
				},
			);
		});
	}
});
