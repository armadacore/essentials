/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it, vi } from 'vitest';
import { Exception, InvalidStateException } from 'essentials:exceptions';
import { Err, Ok, Result } from 'essentials:result';
import { ErrResult } from './errResult';
import { OkResult } from './okResult';
import { ResultBase } from './resultBase';

/**
 * Tests document the CURRENT (as-is) behaviour of the Result module.
 *
 * Pinned quirks worth noting (see ANALYSIS.md):
 *
 *  - F-29: {@link OkResult.err} and {@link ErrResult.ok} both throw a
 *          fresh {@link Exception} instead of being graceful no-ops.
 *          The base class only protects against this by branching on
 *          `isOk`/`isErr` first.
 *  - {@link Result.from} / {@link Result.fromAsync} unwrap a non-Error
 *          throw via `Exception.fromError(new Error(String(thrown)))`.
 */
describe('Result module (as-is behaviour)', () => {
	describe('Ok / Err constructors', () => {
		it('Ok produces an OkResult', () => {
			const r = Ok(1);

			expect(r).toBeInstanceOf(OkResult);
			expect(r).toBeInstanceOf(ResultBase);
			expect(r.isOk).toBe(true);
			expect(r.isErr).toBe(false);
		});

		it('Err produces an ErrResult', () => {
			const r = Err<number>(new Exception('boom'));

			expect(r).toBeInstanceOf(ErrResult);
			expect(r).toBeInstanceOf(ResultBase);
			expect(r.isOk).toBe(false);
			expect(r.isErr).toBe(true);
		});

		it('Result.ok / Result.err delegate to the constructors', () => {
			expect(Result.ok(1).isOk).toBe(true);
			expect(Result.err<number>(new Exception('boom')).isErr).toBe(true);
		});
	});

	describe('Result.from (sync)', () => {
		it('wraps the return value in Ok', () => {
			expect(Result.from(() => 42).unwrap()).toBe(42);
		});

		it('wraps a thrown Exception verbatim in Err', () => {
			const ex = new Exception('boom');
			const r = Result.from<number>(() => {
				throw ex;
			});

			expect(r.isErr).toBe(true);
			expect(r.err()).toBe(ex);
		});

		it('wraps a thrown native Error via Exception.fromError', () => {
			const native = new Error('native');
			const r = Result.from<number>(() => {
				throw native;
			});

			expect(r.isErr).toBe(true);
			expect(r.err()).toBeInstanceOf(Exception);
			expect(r.err().message).toBe('native');
			// Cause is forwarded into Exception.toJSON() (F-41 still
			// applies: not on `.cause`).
			expect(r.err().toJSON().cause).toBe(native);
		});

		it('wraps a thrown non-Error value via String(...)', () => {
			const r = Result.from<number>(() => {
				throw 'just a string';
			});

			expect(r.isErr).toBe(true);
			expect(r.err()).toBeInstanceOf(Exception);
			expect(r.err().message).toBe('just a string');
		});
	});

	describe('Result.fromAsync', () => {
		it('wraps a resolved value in Ok', async () => {
			const r = await Result.fromAsync(async () => 42);

			expect(r.isOk).toBe(true);
			expect(r.unwrap()).toBe(42);
		});

		it('wraps a rejected Exception verbatim in Err', async () => {
			const ex = new Exception('boom');
			const r = await Result.fromAsync<number>(async () => {
				throw ex;
			});

			expect(r.err()).toBe(ex);
		});

		it('wraps a rejected native Error via Exception.fromError', async () => {
			const native = new Error('native');
			const r = await Result.fromAsync<number>(async () => {
				throw native;
			});

			expect(r.err()).toBeInstanceOf(Exception);
			expect(r.err().message).toBe('native');
		});

		it('wraps a rejected non-Error value via String(...)', async () => {
			const r = await Result.fromAsync<number>(async () => {
				// eslint-disable-next-line @typescript-eslint/only-throw-error
				throw 'boom';
			});

			expect(r.err().message).toBe('boom');
		});
	});
});

describe('OkResult / ErrResult terminal accessors (F-29 pinned)', () => {
	it('OkResult.ok returns the value', () => {
		expect(Ok(1).ok()).toBe(1);
	});

	it('OkResult.err throws an InvalidStateException (F-29)', () => {
		expect(() => Ok(1).err()).toThrow(InvalidStateException);
		expect(() => Ok(1).err()).toThrow(/isn't in an error state/u);
	});

	it('ErrResult.err returns the stored exception', () => {
		const ex = new Exception('boom');
		expect(Err(ex).err()).toBe(ex);
	});

	it('ErrResult.ok throws an InvalidStateException (F-29)', () => {
		expect(() => Err<number>(new Exception('boom')).ok()).toThrow(InvalidStateException);
		expect(() => Err<number>(new Exception('boom')).ok()).toThrow(/isn't in an ok state/u);
	});
});

describe('ResultBase API (as-is behaviour)', () => {
	const sample = (): Exception => new Exception('boom');

	describe('map', () => {
		it('Ok: applies fn and returns Ok<U>', () => {
			expect(Ok(2).map((n) => n * 3).unwrap()).toBe(6);
		});

		it('Err: propagates without invoking fn', () => {
			const fn = vi.fn((n: number) => n + 1);
			const ex = sample();
			const out = Err<number>(ex).map(fn);

			expect(out.isErr).toBe(true);
			expect(out.err()).toBe(ex);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('mapErr', () => {
		it('Err: applies fn to the exception', () => {
			const wrapped = new Exception('wrapped');
			const out = Err<number>(sample()).mapErr(() => wrapped);

			expect(out.err()).toBe(wrapped);
		});

		it('Ok: returns the same value untouched (without invoking fn)', () => {
			const fn = vi.fn(() => sample());
			const out = Ok(1).mapErr(fn);

			expect(out.isOk).toBe(true);
			expect(out.unwrap()).toBe(1);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('and / andThen', () => {
		it('and: returns the second result when self is Ok', () => {
			const other = Ok('x');
			expect(Ok(1).and(other)).toBe(other);
		});

		it('and: returns Err propagating self.err when self is Err', () => {
			const ex = sample();
			expect(Err<number>(ex).and(Ok('x')).err()).toBe(ex);
		});

		it('andThen: chains for Ok', () => {
			expect(Ok(2).andThen((n) => Ok(n * 5)).unwrap()).toBe(10);
		});

		it('andThen: short-circuits Err without invoking fn', () => {
			const fn = vi.fn(() => Ok(99));
			const ex = sample();
			expect(Err<number>(ex).andThen(fn).err()).toBe(ex);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('or / orElse', () => {
		it('or: returns self when Ok', () => {
			const self = Ok(1);
			expect(self.or(Ok(99))).toBe(self);
		});

		it('or: returns the alternative when Err', () => {
			const alt = Ok(99);
			expect(Err<number>(sample()).or(alt)).toBe(alt);
		});

		it('orElse: returns Ok(value) when self is Ok without invoking fn', () => {
			const fn = vi.fn(() => Ok(99));
			expect(Ok(1).orElse(fn).unwrap()).toBe(1);
			expect(fn).not.toHaveBeenCalled();
		});

		it('orElse: invokes fn with the error when self is Err', () => {
			const ex = sample();
			const fn = vi.fn((e: Exception) => Ok(e.message.length));
			expect(Err<number>(ex).orElse(fn).unwrap()).toBe('boom'.length);
			expect(fn).toHaveBeenCalledWith(ex);
		});
	});

	describe('unwrap / unwrapOr / unwrapOrElse', () => {
		it('unwrap returns the inner value for Ok', () => {
			expect(Ok(1).unwrap()).toBe(1);
		});

		it('unwrap throws an InvalidStateException for Err with the original Err preserved on cause', () => {
			const original = new Exception('boom');

			try {
				Err<number>(original).unwrap();
				throw new Error('should have thrown');
			} catch (caught) {
				expect(caught).toBeInstanceOf(InvalidStateException);
				expect(caught).not.toBe(original);
				expect((caught as Exception).message).toBe('Called unwrap on an Err value');
				expect((caught as Exception).cause).toBe(original);
			}
		});

		it('unwrapOr returns the inner value for Ok', () => {
			expect(Ok(1).unwrapOr(99)).toBe(1);
		});

		it('unwrapOr returns the default for Err', () => {
			expect(Err<number>(sample()).unwrapOr(99)).toBe(99);
		});

		it('unwrapOrElse invokes fn for Err', () => {
			const fn = vi.fn(() => 99);
			expect(Err<number>(sample()).unwrapOrElse(fn)).toBe(99);
			expect(fn).toHaveBeenCalledOnce();
		});

		it('unwrapOrElse skips fn for Ok', () => {
			const fn = vi.fn(() => 99);
			expect(Ok(1).unwrapOrElse(fn)).toBe(1);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('expect / expectErr', () => {
		it('expect returns the inner value for Ok', () => {
			expect(Ok(1).expect('msg')).toBe(1);
		});

		it('expect throws an InvalidStateException with the supplied message and the Err preserved on cause', () => {
			const ex = sample();

			try {
				Err<number>(ex).expect('ctx');
				throw new Error('should have thrown');
			} catch (caught) {
				expect(caught).toBeInstanceOf(InvalidStateException);
				expect((caught as Exception).message).toBe('ctx');
				expect((caught as Exception).cause).toBe(ex);
			}
		});

		it('expectErr returns the inner exception for Err', () => {
			const ex = sample();
			expect(Err<number>(ex).expectErr('msg')).toBe(ex);
		});

		it('expectErr throws an InvalidStateException with the supplied message and the Ok value preserved on cause', () => {
			try {
				Ok(1).expectErr('ctx');
				throw new Error('should have thrown');
			} catch (caught) {
				expect(caught).toBeInstanceOf(InvalidStateException);
				expect((caught as Exception).message).toBe('ctx');
				expect((caught as Exception).cause).toBe(1);
			}
		});
	});

	describe('onOk / onErr', () => {
		it('onOk runs fn for Ok with the value', () => {
			const fn = vi.fn();
			Ok(1).onOk(fn);
			expect(fn).toHaveBeenCalledWith(1);
		});

		it('onOk is a no-op for Err', () => {
			const fn = vi.fn();
			Err<number>(sample()).onOk(fn);
			expect(fn).not.toHaveBeenCalled();
		});

		it('onErr runs fn for Err with the error', () => {
			const fn = vi.fn();
			const ex = sample();
			Err<number>(ex).onErr(fn);
			expect(fn).toHaveBeenCalledWith(ex);
		});

		it('onErr is a no-op for Ok', () => {
			const fn = vi.fn();
			Ok(1).onErr(fn);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('match', () => {
		it('runs the Ok branch for Ok', () => {
			expect(Ok(2).match((n) => n + 1, () => 0)).toBe(3);
		});

		it('runs the Err branch for Err with the error', () => {
			const ex = sample();
			expect(
				Err<number>(ex).match(
					() => 'ok',
					(e) => `err:${e.message}`,
				),
			).toBe('err:boom');
		});
	});
});
