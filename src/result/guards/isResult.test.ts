/* eslint-disable no-undefined */
/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { Exception } from 'essentials:exceptions';
import { Err, Ok } from 'essentials:result';
import { isResult } from './isResult';

/**
 * Tests document the strict behaviour of {@link isResult}: only true
 * instances of {@link ResultBase} (i.e. objects produced by
 * {@link Ok} or {@link Err}) are accepted. Duck-typed objects with
 * the right property shape are rejected because their methods
 * (`unwrap`, `map`, `match`, …) would not actually be present at
 * runtime — see ANALYSIS.md (F-17, Sprint 4 #28).
 */
describe('isResult', () => {
	it('accepts a real Ok', () => {
		expect(isResult(Ok(1))).toBe(true);
	});

	it('accepts a real Err', () => {
		expect(isResult(Err(new Exception('boom')))).toBe(true);
	});

	it('rejects a duck-typed Ok-shaped object', () => {
		expect(isResult({ isOk: true, isErr: false, value: 1 })).toBe(false);
	});

	it('rejects a duck-typed Err-shaped object', () => {
		expect(isResult({ isOk: false, isErr: true })).toBe(false);
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
