/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it } from 'vitest';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { InternalServerErrorException } from './internalServerErrorException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { UnauthorizedException } from './unauthorizedException';

/**
 * Tests document the CURRENT (as-is) behaviour of all HTTP-status
 * Exception subclasses. They share a structural contract:
 *   - extend {@link Exception} (and therefore {@link Error})
 *   - own a fixed `info` token
 *   - own a fixed default `name`
 *   - have a fixed default message (with one exception: see below)
 *
 * Pinned quirks worth noting:
 *  - {@link BadRequestException} and {@link NotFoundException} do NOT
 *    set a default message — they are constructible with `message ===
 *    ''`. The other five subclasses fall back to a human-readable
 *    default. This asymmetry is intentional to lock the current
 *    behaviour; see ANALYSIS.md (F-43, F-46).
 */

interface ISubclassSpec {
	readonly ctor: new (message?: string, options?: { cause?: unknown }) => Exception;
	readonly name: string;
	readonly info: string;
	readonly defaultMessage: string;
}

const subclasses: readonly ISubclassSpec[] = [
	{ ctor: BadRequestException, name: 'BadRequestException', info: 'BAD_REQUEST', defaultMessage: '' },
	{ ctor: ConflictException, name: 'ConflictException', info: 'CONFLICT', defaultMessage: 'Conflict' },
	{ ctor: ForbiddenException, name: 'ForbiddenException', info: 'FORBIDDEN', defaultMessage: 'Forbidden' },
	{ ctor: InternalServerErrorException, name: 'InternalServerErrorException', info: 'INTERNAL_SERVER_ERROR', defaultMessage: 'Internal Server Error' },
	{ ctor: NotFoundException, name: 'NotFoundException', info: 'NOT_FOUND', defaultMessage: '' },
	{ ctor: ServiceUnavailableException, name: 'ServiceUnavailableException', info: 'SERVICE_UNAVAILABLE', defaultMessage: 'Service Unavailable' },
	{ ctor: UnauthorizedException, name: 'UnauthorizedException', info: 'UNAUTHORIZED', defaultMessage: 'Unauthorized' },
];

describe('HTTP-status Exception subclasses (as-is behaviour)', () => {
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

			it('emits the subclass info via toJSON() under "_info" (F-49 pinned)', () => {
				expect(new spec.ctor().toJSON()['_info']).toBe(spec.info);
			});

			it('drops the cause from the native Error (F-41 pinned)', () => {
				const inner = new Error('inner');
				const ex = new spec.ctor('msg', { cause: inner });

				expect((ex as Error & { cause?: unknown }).cause).toBeUndefined();
				expect(ex.toJSON().cause).toBe(inner);
			});
		});
	}
});
