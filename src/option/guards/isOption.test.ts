/* eslint-disable no-undefined */
/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { None, Some } from '../core/option';
import { isOption } from './isOption';

/**
 * Tests document the CURRENT (as-is) duck-typed behaviour of
 * {@link isOption}. The guard accepts ANY object that has both
 * `isSome` and `isNone` keys (and either a `value` key or
 * `isSome === false`), not just instances of `OptionBase`.
 *
 * That permissiveness is documented in ANALYSIS.md (F-17) \u2014 do
 * not change the assertions without explicit approval.
 */
describe('isOption (as-is behaviour)', () => {
	it('accepts a real Some', () => {
		expect(isOption(Some(1))).toBe(true);
	});

	it('accepts a real None', () => {
		expect(isOption(None())).toBe(true);
	});

	it('accepts a duck-typed Some-shaped object (F-17 pinned)', () => {
		expect(isOption({ isSome: true, isNone: false, value: 42 })).toBe(true);
	});

	it('accepts a duck-typed None-shaped object without value', () => {
		expect(isOption({ isSome: false, isNone: true })).toBe(true);
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
