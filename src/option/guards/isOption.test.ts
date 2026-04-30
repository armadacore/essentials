/* eslint-disable no-undefined */
/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { None, Some } from '../core/option';
import { isOption } from './isOption';

/**
 * Tests document the strict behaviour of {@link isOption}: only true
 * instances of {@link OptionBase} (i.e. objects produced by
 * {@link Some} or {@link None}) are accepted. Duck-typed objects
 * with the right property shape are rejected because their methods
 * (`unwrap`, `map`, `match`, …) would not actually be present at
 * runtime — see ANALYSIS.md (F-17, Sprint 4 #28).
 */
describe('isOption', () => {
	it('accepts a real Some', () => {
		expect(isOption(Some(1))).toBe(true);
	});

	it('accepts a real None', () => {
		expect(isOption(None())).toBe(true);
	});

	it('rejects a duck-typed Some-shaped object', () => {
		expect(isOption({ isSome: true, isNone: false, value: 42 })).toBe(false);
	});

	it('rejects a duck-typed None-shaped object', () => {
		expect(isOption({ isSome: false, isNone: true })).toBe(false);
	});

	it('rejects an object missing isNone', () => {
		expect(isOption({ isSome: true, value: 1 })).toBe(false);
	});

	it('rejects an object with isSome=true but no value', () => {
		expect(isOption({ isSome: true, isNone: false })).toBe(false);
	});

	it('rejects null and undefined', () => {
		expect(isOption(null)).toBe(false);
		expect(isOption(undefined)).toBe(false);
	});

	it('rejects primitives', () => {
		expect(isOption(0)).toBe(false);
		expect(isOption('Some')).toBe(false);
		expect(isOption(true)).toBe(false);
	});
});
