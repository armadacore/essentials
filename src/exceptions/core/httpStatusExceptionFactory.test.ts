import { describe, expect, it } from 'vitest';
import { BadGatewayException } from './badGatewayException';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { GatewayTimeoutException } from './gatewayTimeoutException';
import { HttpStatusExceptionFactory } from './httpStatusExceptionFactory';
import { InternalServerErrorException } from './internalServerErrorException';
import { MethodNotAllowedException } from './methodNotAllowedException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { TooManyRequestsException } from './tooManyRequestsException';
import { UnauthorizedException } from './unauthorizedException';
import { UnprocessableEntityException } from './unprocessableEntityException';

describe('HttpStatusExceptionFactory.createFromStatus', () => {
	const cases: ReadonlyArray<readonly [number, new (...args: never[]) => Exception]> = [
		[400, BadRequestException],
		[401, UnauthorizedException],
		[403, ForbiddenException],
		[404, NotFoundException],
		[405, MethodNotAllowedException],
		[409, ConflictException],
		[422, UnprocessableEntityException],
		[429, TooManyRequestsException],
		[500, InternalServerErrorException],
		[502, BadGatewayException],
		[503, ServiceUnavailableException],
		[504, GatewayTimeoutException],
	];

	for (const [status, Class] of cases) {
		it(`maps status ${status} to ${Class.name}`, () => {
			const ex = HttpStatusExceptionFactory.createFromStatus(status);

			expect(ex).toBeInstanceOf(Class);
			expect(ex).toBeInstanceOf(Exception);
		});

		it(`forwards a custom message for status ${status}`, () => {
			const ex = HttpStatusExceptionFactory.createFromStatus(status, 'explicit');

			expect(ex.message).toBe('explicit');
		});
	}

	describe('unknown status codes', () => {
		it('falls back to a generic Exception (not a subclass)', () => {
			const ex = HttpStatusExceptionFactory.createFromStatus(418);

			expect(ex).toBeInstanceOf(Exception);
			expect(ex).not.toBeInstanceOf(BadRequestException);
			expect(ex).not.toBeInstanceOf(InternalServerErrorException);
		});

		it('synthesises an "HTTP <status> Error" message when none is given', () => {
			const ex = HttpStatusExceptionFactory.createFromStatus(418);

			expect(ex.message).toBe('HTTP 418 Error');
		});

		it('uses the provided message when given for an unknown status', () => {
			const ex = HttpStatusExceptionFactory.createFromStatus(418, 'teapot');

			expect(ex.message).toBe('teapot');
		});

		it('treats an empty string as a falsy override (current behaviour)', () => {
			// `message || \`HTTP ...\`` — empty string falls back to the default.
			const ex = HttpStatusExceptionFactory.createFromStatus(418, '');

			expect(ex.message).toBe('HTTP 418 Error');
		});
	});
});
