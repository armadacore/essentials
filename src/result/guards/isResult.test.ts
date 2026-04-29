/* eslint-disable no-undefined */
/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { Exception } from 'essentials:exceptions';
import { Err, Ok } from 'essentials:result';
import { isResult } from './isResult';

/**
 * Tests document the CURRENT (as-is) duck-typed behaviour of
 * {@link isResult}. The guard accepts ANY object that has both
 * `isOk` and `isErr` keys (and either a `value` key or
 * `isOk === false`).
 */
describe('isResult (as-is behaviour)', () => {
	it('accepts a real Ok', () => {
		expect(isResult(Ok(1))).toBe(true);
	});

	it('accepts a real Err', () => {
		expect(isResult(Err(new Exception('boom')))).toBe(true);
	});

	it('accepts a duck-typed Ok-shaped object', () => {
		expect(isResult({ isOk: true, isErr: false, value: 1 })).toBe(true);
	});

	it('accepts a duck-typed Err-shaped object without value', () => {
		expect(isResult({ isOk: false, isErr: true })).toBe(true);
	});

	it('rejects an object missing isErr', () => {
		expect(isResult({ isOk: true, value: 1 })).toBe(false);
	});

	it('rejects an object with isOk=true but no value', () => {
		expect(isResult({ isOk: true, isErr: false })).toBe(false);
	});

	it('rejects null and undefined', () => {
		expect(isResult(null)).toBe(false);
		expect(isResult(undefined)).toBe(false);
	});

	it('rejects primitives', () => {
		expect(isResult(0)).toBe(false);
		expect(isResult('Ok')).toBe(false);
		expect(isResult(true)).toBe(false);
	});
});
