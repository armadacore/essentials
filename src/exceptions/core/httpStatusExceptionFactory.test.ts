/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it } from 'vitest';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { HttpStatusExceptionFactory } from './httpStatusExceptionFactory';
import { InternalServerErrorException } from './internalServerErrorException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { UnauthorizedException } from './unauthorizedException';

describe('HttpStatusExceptionFactory.createFromStatus (as-is behaviour)', () => {
	const cases: ReadonlyArray<readonly [number, new (...args: never[]) => Exception]> = [
		[400, BadRequestException],
		[401, UnauthorizedException],
		[403, ForbiddenException],
		[404, NotFoundException],
		[409, ConflictException],
		[500, InternalServerErrorException],
		[503, ServiceUnavailableException],
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
