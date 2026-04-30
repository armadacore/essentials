import { describe, expect, it } from 'vitest';
import { Exception } from './exception';

/**
 * Tests document the behaviour of {@link Exception}.
 *
 * History note: prior to Sprint 1 these assertions pinned three known
 * P0 bugs (F-41 cause not forwarded to native Error, F-49 toJSON
 * emitted `_info` instead of `info`, F-50 toJSON leaked `stack`).
 * All three have been fixed and the assertions now describe the
 * corrected behaviour.
 */
describe('Exception', () => {
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

	describe('cause handling', () => {
		it('forwards cause to the native Error.cause property', () => {
			const inner = new Error('inner');
			const ex = new Exception('outer', { cause: inner });

			expect((ex as Error & { cause?: unknown }).cause).toBe(inner);
		});

		it('also surfaces the cause via toJSON()', () => {
			const inner = new Error('inner');
			const ex = new Exception('outer', { cause: inner });

			expect(ex.toJSON().cause).toBe(inner);
		});

		it('leaves cause undefined when no options are passed', () => {
			const ex = new Exception('boom');

			expect((ex as Error & { cause?: unknown }).cause).toBeUndefined();
		});
	});

	describe('toJSON()', () => {
		it('emits "info" (matching the getter)', () => {
			const json = new Exception('boom').toJSON();

			expect(json).toHaveProperty('info', 'UNKNOWN_ERROR');
			expect(json).not.toHaveProperty('_info');
		});

		it('does NOT include the stack (no internal-path leakage)', () => {
			const json = new Exception('boom').toJSON();

			expect(json).not.toHaveProperty('stack');
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

			expect(parsed['info']).toBe('UNKNOWN_ERROR');
			expect(parsed['name']).toBe('Exception');
			expect(parsed['message']).toBe('boom');
			expect(parsed).not.toHaveProperty('stack');
			expect(parsed).not.toHaveProperty('_info');
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

		it('forwards the source error onto Error.cause and toJSON()', () => {
			const source = new Error('boom');
			const ex = Exception.fromError(source);

			expect((ex as Error & { cause?: unknown }).cause).toBe(source);
			expect(ex.toJSON().cause).toBe(source);
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
