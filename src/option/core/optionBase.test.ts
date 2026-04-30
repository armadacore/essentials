/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it, vi } from 'vitest';
import { InvalidStateException } from 'essentials:exceptions';
import { None, Some } from './option';

/**
 * Tests for the OptionBase API surface (consumed via Some/None
 * factories). Documents CURRENT (as-is) behaviour. See `option.test.ts`
 * for module-level helpers and pinned quirks.
 */
describe('OptionBase API (as-is behaviour)', () => {
	describe('unwrap', () => {
		it('returns the inner value for Some', () => {
			expect(Some(1).unwrap()).toBe(1);
		});

		it('throws an InvalidStateException for None', () => {
			expect(() => None<number>().unwrap()).toThrow(InvalidStateException);
			expect(() => None<number>().unwrap()).toThrow('Called unwrap on a None value');
		});
	});

	describe('unwrapOr', () => {
		it('returns the inner value for Some, ignoring the default', () => {
			expect(Some(1).unwrapOr(99)).toBe(1);
		});

		it('returns the default for None', () => {
			expect(None<number>().unwrapOr(99)).toBe(99);
		});
	});

	describe('unwrapOrElse', () => {
		it('returns the inner value for Some without invoking the fallback', () => {
			const fallback = vi.fn(() => 99);
			expect(Some(1).unwrapOrElse(fallback)).toBe(1);
			expect(fallback).not.toHaveBeenCalled();
		});

		it('invokes the fallback for None', () => {
			const fallback = vi.fn(() => 99);
			expect(None<number>().unwrapOrElse(fallback)).toBe(99);
			expect(fallback).toHaveBeenCalledOnce();
		});
	});

	describe('unwrapOrUndefined / unwrapOrNull', () => {
		it('Some returns its value from both', () => {
			expect(Some(1).unwrapOrUndefined()).toBe(1);
			expect(Some(1).unwrapOrNull()).toBe(1);
		});

		it('None returns undefined / null respectively', () => {
			expect(None<number>().unwrapOrUndefined()).toBeUndefined();
			// eslint-disable-next-line no-null/no-null
			expect(None<number>().unwrapOrNull()).toBeNull();
		});
	});

	describe('expect', () => {
		it('returns the inner value for Some', () => {
			expect(Some(1).expect('msg')).toBe(1);
		});

		it('throws InvalidStateException with the supplied message for None', () => {
			expect(() => None<number>().expect('boom')).toThrow(InvalidStateException);
			expect(() => None<number>().expect('boom')).toThrow('boom');
		});
	});

	describe('map / mapOr / mapOrElse', () => {
		it('map applies fn to Some and produces Some<U>', () => {
			expect(Some(2).map((n) => n * 3).unwrap()).toBe(6);
		});

		it('map on None propagates None without invoking fn', () => {
			const fn = vi.fn((n: number) => n * 3);
			expect(None<number>().map(fn).isNone).toBe(true);
			expect(fn).not.toHaveBeenCalled();
		});

		it('mapOr returns the mapped value for Some', () => {
			expect(Some(2).mapOr(0, (n) => n * 3)).toBe(6);
		});

		it('mapOr returns the default for None', () => {
			expect(None<number>().mapOr(99, (n) => n * 3)).toBe(99);
		});

		it('mapOrElse returns the mapped value for Some', () => {
			expect(Some(2).mapOrElse(() => 0, (n) => n * 3)).toBe(6);
		});

		it('mapOrElse invokes the default fn for None', () => {
			const dflt = vi.fn(() => 99);
			expect(None<number>().mapOrElse(dflt, (n: number) => n * 3)).toBe(99);
			expect(dflt).toHaveBeenCalledOnce();
		});
	});

	describe('and / andThen', () => {
		it('and returns the second option when self is Some', () => {
			const other = Some('x');
			expect(Some(1).and(other)).toBe(other);
		});

		it('and returns None when self is None', () => {
			expect(None<number>().and(Some('x')).isNone).toBe(true);
		});

		it('andThen chains for Some', () => {
			expect(
				Some(2).andThen((n) => Some(n * 5)).unwrap(),
			).toBe(10);
		});

		it('andThen returns None for None without invoking fn', () => {
			const fn = vi.fn(() => Some(1));
			expect(None<number>().andThen(fn).isNone).toBe(true);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('or / orElse', () => {
		it('or returns self when self is Some', () => {
			const self = Some(1);
			expect(self.or(Some(99))).toBe(self);
		});

		it('or returns the alternative when self is None', () => {
			const alt = Some(99);
			expect(None<number>().or(alt)).toBe(alt);
		});

		it('orElse returns self when self is Some without invoking fn', () => {
			const fn = vi.fn(() => Some(99));
			const self = Some(1);
			expect(self.orElse(fn)).toBe(self);
			expect(fn).not.toHaveBeenCalled();
		});

		it('orElse invokes fn for None', () => {
			const fn = vi.fn(() => Some(99));
			expect(None<number>().orElse(fn).unwrap()).toBe(99);
			expect(fn).toHaveBeenCalledOnce();
		});
	});

	describe('onSome / onNone', () => {
		it('onSome runs fn for Some', () => {
			const fn = vi.fn();
			Some(1).onSome(fn);
			expect(fn).toHaveBeenCalledWith(1);
		});

		it('onSome is a no-op for None', () => {
			const fn = vi.fn();
			None<number>().onSome(fn);
			expect(fn).not.toHaveBeenCalled();
		});

		it('onNone runs fn for None', () => {
			const fn = vi.fn();
			None<number>().onNone(fn);
			expect(fn).toHaveBeenCalledOnce();
		});

		it('onNone is a no-op for Some', () => {
			const fn = vi.fn();
			Some(1).onNone(fn);
			expect(fn).not.toHaveBeenCalled();
		});
	});

	describe('filter', () => {
		it('keeps Some when predicate is true', () => {
			expect(Some(2).filter((n) => n > 0).isSome).toBe(true);
		});

		it('returns None when predicate is false', () => {
			expect(Some(2).filter((n) => n < 0).isNone).toBe(true);
		});

		it('returns None on None without invoking the predicate', () => {
			const pred = vi.fn(() => true);
			expect(None<number>().filter(pred).isNone).toBe(true);
			expect(pred).not.toHaveBeenCalled();
		});
	});

	describe('match', () => {
		it('runs the Some branch for Some', () => {
			expect(Some(2).match((n) => n + 1, () => 0)).toBe(3);
		});

		it('runs the None branch for None', () => {
			expect(None<number>().match((n) => n + 1, () => 99)).toBe(99);
		});
	});

	describe('toArray', () => {
		it('returns [value] for Some', () => {
			expect(Some(1).toArray()).toEqual([1]);
		});

		it('returns [] for None', () => {
			expect(None<number>().toArray()).toEqual([]);
		});
	});

	describe('toString', () => {
		it('returns "Some(value)" for Some', () => {
			expect(Some(1).toString()).toBe('Some(1)');
		});

		it('returns "None" for None', () => {
			expect(None<number>().toString()).toBe('None');
		});
	});
});
