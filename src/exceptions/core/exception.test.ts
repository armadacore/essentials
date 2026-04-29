/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it } from 'vitest';
import { Exception } from './exception';

/**
 * Tests document the CURRENT (as-is) behaviour of {@link Exception}.
 *
 * Several of these assertions intentionally pin known bugs from
 * `ANALYSIS.md` so that any future fix is a deliberate, breaking change:
 *
 *  - F-41: `cause` is stored on a private field instead of being forwarded
 *          to the native `Error` constructor → `error.cause` is `undefined`.
 *  - F-49: {@link Exception.toJSON} emits the property as `_info` instead
 *          of `info`, so JSON output disagrees with the `info` getter.
 *  - F-50: {@link Exception.toJSON} leaks the full `stack` string.
 *
 * Do NOT change the assertions for those bugs without confirming the fix
 * is intended and approved.
 */
describe('Exception (as-is behaviour)', () => {
	describe('construction', () => {
		it('extends Error', () => {
			const ex = new Exception('boom');

			expect(ex).toBeInstanceOf(Error);
			expect(ex).toBeInstanceOf(Exception);
		});

		it('preserves the message', () => {
			expect(new Exception('boom').message).toBe('boom');
		});

		it('uses an empty message when none is provided', () => {
			expect(new Exception().message).toBe('');
		});

		it('sets the name to "Exception"', () => {
			expect(new Exception().name).toBe('Exception');
		});

		it('defaults info to "UNKNOWN_ERROR"', () => {
			expect(new Exception().info).toBe('UNKNOWN_ERROR');
		});

		it('captures a stack trace', () => {
			expect(new Exception('boom').stack).toMatch(/Exception/);
		});
	});

	describe('cause handling (F-41 — known bug pinned)', () => {
		it('does NOT forward cause to the native Error (F-41)', () => {
			const inner = new Error('inner');
			const ex = new Exception('outer', { cause: inner });

			// Native ES2022 cause is lost because the constructor passes
			// only `message` to `super()`. This is F-41.
			expect((ex as Error & { cause?: unknown }).cause).toBeUndefined();
		});

		it('still surfaces the cause via toJSON()', () => {
			const inner = new Error('inner');
			const ex = new Exception('outer', { cause: inner });

			expect(ex.toJSON().cause).toBe(inner);
		});
	});

	describe('toJSON()', () => {
		it('emits "_info" instead of "info" (F-49 — known bug pinned)', () => {
			const json = new Exception('boom').toJSON();

			expect(json).toHaveProperty('_info', 'UNKNOWN_ERROR');
			expect(json).not.toHaveProperty('info');
		});

		it('includes the stack (F-50 — known leak pinned)', () => {
			const json = new Exception('boom').toJSON();

			expect(typeof json['stack']).toBe('string');
			expect(json['stack']).toMatch(/Exception/);
		});

		it('includes name, message and cause keys', () => {
			const inner = new Error('inner');
			const json = new Exception('boom', { cause: inner }).toJSON();

			expect(json['name']).toBe('Exception');
			expect(json['message']).toBe('boom');
			expect(json['cause']).toBe(inner);
		});

		it('emits cause as undefined when no options are passed', () => {
			const json = new Exception('boom').toJSON();

			expect(json['cause']).toBeUndefined();
		});

		it('serialises through JSON.stringify', () => {
			const ex = new Exception('boom');
			const parsed = JSON.parse(JSON.stringify(ex)) as Record<string, unknown>;

			expect(parsed['_info']).toBe('UNKNOWN_ERROR');
			expect(parsed['name']).toBe('Exception');
			expect(parsed['message']).toBe('boom');
		});
	});

	describe('Exception.fromError()', () => {
		it('produces an Exception with the source message', () => {
			const ex = Exception.fromError(new Error('boom'));

			expect(ex).toBeInstanceOf(Exception);
			expect(ex.message).toBe('boom');
		});

		it('preserves the original stack trace verbatim', () => {
			const source = new Error('boom');
			const ex = Exception.fromError(source);

			expect(ex.stack).toBe(source.stack);
		});

		it('stores the source error as cause (visible via toJSON)', () => {
			const source = new Error('boom');
			const ex = Exception.fromError(source);

			expect(ex.toJSON().cause).toBe(source);
		});

		it('also drops cause off the native Error (F-41)', () => {
			const source = new Error('boom');
			const ex = Exception.fromError(source);

			expect((ex as Error & { cause?: unknown }).cause).toBeUndefined();
		});

		it('does not throw when source has no stack', () => {
			const source = new Error('no-stack');
			delete source.stack;

			expect(() => Exception.fromError(source)).not.toThrow();
		});
	});

	describe('try/catch interop', () => {
		it('is catchable as Error', () => {
			try {
				throw new Exception('boom');
			} catch (caught) {
				expect(caught).toBeInstanceOf(Error);
				expect(caught).toBeInstanceOf(Exception);
			}
		});
	});
});
