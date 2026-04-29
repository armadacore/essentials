 
/* eslint-disable no-undefined */
 
/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { Exception } from 'essentials:exceptions';
import { None, Option, Some, toJsonObject, toJsonString, toOption } from 'essentials:option';
import { NoneOption } from './noneOption';
import { OptionBase } from './optionBase';
import { SomeOption } from './someOption';

/**
 * Tests document the CURRENT (as-is) behaviour of the Option module.
 *
 * Several assertions intentionally pin known bugs / API quirks from
 * `ANALYSIS.md`. Do NOT change them without explicit approval:
 *
 *  - F-12: `value !== undefined` is used as the Some/None discriminator
 *          everywhere. A `Some<undefined>` (e.g. produced via `.map()`)
 *          would behave like None.
 *  - F-15: {@link toOption} treats every falsy primitive (0, '', false)
 *          as None.
 *  - F-14: {@link toJsonObject} represents None as `{ isSome: false,
 *          isNone: true, value: undefined }` \u2014 the `value` key
 *          disappears when run through `JSON.stringify`, which is part
 *          of why round-tripping is lossy for `Some<falsy>`.
 *  - {@link Some} throws an {@link Exception} when called with `null`
 *          or `undefined`.
 */
describe('Option (as-is behaviour)', () => {
	describe('Some / None constructors', () => {
		it('Some(value) returns a SomeOption instance', () => {
			const option = Some(1);

			expect(option).toBeInstanceOf(SomeOption);
			expect(option).toBeInstanceOf(OptionBase);
			expect(option.isSome).toBe(true);
			expect(option.isNone).toBe(false);
		});

		it('None() returns a NoneOption instance', () => {
			const option = None<number>();

			expect(option).toBeInstanceOf(NoneOption);
			expect(option).toBeInstanceOf(OptionBase);
			expect(option.isSome).toBe(false);
			expect(option.isNone).toBe(true);
		});

		it('Some(null) throws an Exception', () => {
			expect(() => Some<unknown>(null)).toThrow(Exception);
			expect(() => Some<unknown>(null)).toThrow('Cannot create Some with null or undefined');
		});

		it('Some(undefined) throws an Exception', () => {
			expect(() => Some<unknown>(undefined)).toThrow(Exception);
		});

		it('Some accepts falsy non-nullish primitives', () => {
			expect(Some(0).isSome).toBe(true);
			expect(Some('').isSome).toBe(true);
			expect(Some(false).isSome).toBe(true);
			expect(Some(NaN).isSome).toBe(true);
		});
	});

	describe('Option.from', () => {
		it('returns Some for non-nullish values', () => {
			expect(Option.from(1).isSome).toBe(true);
			expect(Option.from(0).isSome).toBe(true);
			expect(Option.from('').isSome).toBe(true);
			expect(Option.from(false).isSome).toBe(true);
			expect(Option.from({}).isSome).toBe(true);
		});

		it('returns None for null', () => {
			expect(Option.from(null).isNone).toBe(true);
		});

		it('returns None for undefined', () => {
			expect(Option.from(undefined).isNone).toBe(true);
		});
	});

	describe('Option.fromPredicate', () => {
		it('returns Some when the predicate is true', () => {
			expect(Option.fromPredicate(2, (n) => n > 0).isSome).toBe(true);
		});

		it('returns None when the predicate is false', () => {
			expect(Option.fromPredicate(-1, (n) => n > 0).isNone).toBe(true);
		});

		it('does not protect against null/undefined when the predicate is true', () => {
			// `fromPredicate` calls `Some(value)` directly when truthy, so
			// passing `null` with a truthy predicate hits the Some-throw.
			expect(() =>
				Option.fromPredicate<unknown>(null, () => true),
			).toThrow(Exception);
		});
	});

	describe('Option façade aliases', () => {
		it('Option.some delegates to Some', () => {
			expect(Option.some(1).isSome).toBe(true);
		});

		it('Option.none delegates to None', () => {
			expect(Option.none<number>().isNone).toBe(true);
		});

		it('Option.toJsonString is the same function reference as toJsonString', () => {
			expect(Option.toJsonString).toBe(toJsonString);
		});

		it('Option.toOption is the same function reference as toOption', () => {
			expect(Option.toOption).toBe(toOption);
		});
	});

	describe('toJsonObject', () => {
		it('serialises Some to { isSome, isNone, value }', () => {
			expect(toJsonObject(Some(1))).toEqual({ isSome: true, isNone: false, value: 1 });
		});

		it('nests a None envelope as the inner "value" of None (F-14 pinned)', () => {
			// `toJsonObject(value.getValue())` on a None re-enters the
			// function with `undefined`, which is treated as None and
			// produces a recursive None envelope inside `value`.
			expect(toJsonObject(None<number>())).toEqual({
				isSome: false,
				isNone: true,
				value: { isSome: false, isNone: true, value: undefined },
			});
		});

		it('serialises a plain primitive verbatim', () => {
			expect(toJsonObject(42)).toBe(42);
			expect(toJsonObject('text')).toBe('text');
			expect(toJsonObject(true)).toBe(true);
		});

		it('treats null as None and emits the None envelope (F-15-related)', () => {
			expect(toJsonObject(null)).toEqual({ isSome: false, isNone: true, value: null });
		});

		it('recurses into arrays (None elements get the nested envelope)', () => {
			expect(toJsonObject([Some(1), None<number>()])).toEqual([
				{ isSome: true, isNone: false, value: 1 },
				{ isSome: false, isNone: true, value: { isSome: false, isNone: true, value: undefined } },
			]);
		});

		it('recurses into plain objects (None values get the nested envelope)', () => {
			expect(toJsonObject({ a: Some(1), b: None<number>() })).toEqual({
				a: { isSome: true, isNone: false, value: 1 },
				b: { isSome: false, isNone: true, value: { isSome: false, isNone: true, value: undefined } },
			});
		});
	});

	describe('toJsonString', () => {
		it('JSON.stringifies the toJsonObject result', () => {
			expect(toJsonString(Some(1))).toBe('{"isSome":true,"isNone":false,"value":1}');
		});

		it('emits the recursive None envelope when serialising None (F-14 pinned)', () => {
			// The inner "value: undefined" disappears under JSON.stringify,
			// leaving an empty `value: {...}` object \u2014 lossy round-trip.
			expect(toJsonString(None<number>())).toBe(
				'{"isSome":false,"isNone":true,"value":{"isSome":false,"isNone":true}}',
			);
		});
	});

	describe('toOption', () => {
		it('returns the same instance for an existing Option', () => {
			const some = Some(1);
			const none = None<number>();

			expect(toOption(some)).toBe(some);
			expect(toOption(none)).toBe(none);
		});

		it('returns None for falsy primitives (F-15 pinned)', () => {
			// All of these short-circuit through `if (!value) return None()`.
			expect(toOption(0).isNone).toBe(true);
			expect(toOption('').isNone).toBe(true);
			expect(toOption(false).isNone).toBe(true);
			expect(toOption(null).isNone).toBe(true);
			expect(toOption(undefined).isNone).toBe(true);
		});

		it('returns None for non-falsy primitives that are not objects', () => {
			// After the `!value` short-circuit, the function returns None
			// for any non-object primitive (string is handled as JSON only
			// when wrapped in {}/[]).
			expect(toOption(42).isNone).toBe(true);
			expect(toOption(true).isNone).toBe(true);
			expect(toOption('plain text').isNone).toBe(true);
		});

		it('parses JSON objects of the Option envelope shape', () => {
			const restored = toOption<number>('{"isSome":true,"isNone":false,"value":1}');

			expect((restored as OptionBase<number>).isSome).toBe(true);
			expect((restored as OptionBase<number>).unwrap()).toBe(1);
		});

		it('parses a JSON-encoded None envelope', () => {
			const restored = toOption<number>('{"isSome":false,"isNone":true}');

			expect((restored as OptionBase<number>).isNone).toBe(true);
		});

		it('reconstructs Option from a parsed envelope object', () => {
			const restored = toOption<number>({ isSome: true, isNone: false, value: 7 });

			expect((restored as OptionBase<number>).unwrap()).toBe(7);
		});

		it('recurses into arrays returning an array of Options (untyped)', () => {
			const restored = toOption([{ isSome: true, isNone: false, value: 1 }, { isSome: false, isNone: true }]);

			expect(Array.isArray(restored)).toBe(true);
		});

		it('recurses into plain objects', () => {
			const restored = toOption({ a: { isSome: true, isNone: false, value: 1 } }) as Record<
				string,
				OptionBase<number>
			>;

			expect(restored['a']?.unwrap()).toBe(1);
		});
	});
});
