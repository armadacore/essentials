/* eslint-disable no-undefined */

/* eslint-disable no-null/no-null */
import { describe, expect, it } from 'vitest';
import { Exception, InvalidStateException, NotFoundException } from 'essentials:exceptions';
import { None, Option, type SerializedOption, Some } from 'essentials:option';
import { Err, Ok } from 'essentials:result';
import { NoneOption } from './noneOption';
import { OptionBase } from './optionBase';
import { SomeOption } from './someOption';

/**
 * Tests document the current behaviour of the Option module.
 *
 *  - {@link Some} throws an {@link InvalidStateException} when called
 *    with `null` or `undefined`.
 *  - {@link Option.serialize} / {@link Option.deserialize} are a
 *    lossless wire-format round-trip pair (replaces the old
 *    `toJsonObject` / `toJsonString` / `toOption` trio — F-13/F-14/F-15
 *    fixed by removal in #30).
 */
describe('Option', () => {
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

		it('Some(null) throws an InvalidStateException', () => {
			expect(() => Some<unknown>(null)).toThrow(InvalidStateException);
			expect(() => Some<unknown>(null)).toThrow('Cannot create Some with null or undefined');
		});

		it('Some(undefined) throws an InvalidStateException', () => {
			expect(() => Some<unknown>(undefined)).toThrow(InvalidStateException);
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
			expect(() => Option.fromPredicate<unknown>(null, () => true)).toThrow(InvalidStateException);
		});
	});

	describe('Option.fromResult', () => {
		it('lifts an Ok into Some with the same value', () => {
			const opt = Option.fromResult(Ok(42));

			expect(opt.isSome).toBe(true);
			expect(opt.unwrap()).toBe(42);
		});

		it('lifts an Err into None (the error is intentionally dropped)', () => {
			const opt = Option.fromResult(Err(new NotFoundException('lost')));

			expect(opt.isNone).toBe(true);
		});

		it('preserves complex Ok values verbatim', () => {
			const payload = { user: 'alice', roles: ['admin'] };
			const opt = Option.fromResult(Ok(payload));

			expect(opt.unwrap()).toBe(payload);
		});

		it('does not surface the error type — any Exception subclass collapses to None', () => {
			const opt1 = Option.fromResult(Err(new NotFoundException()));
			const opt2 = Option.fromResult(Err(new Exception('generic')));

			expect(opt1.isNone).toBe(true);
			expect(opt2.isNone).toBe(true);
		});
	});

	describe('Option façade aliases', () => {
		it('Option.some delegates to Some', () => {
			expect(Option.some(1).isSome).toBe(true);
		});

		it('Option.none delegates to None', () => {
			expect(Option.none<number>().isNone).toBe(true);
		});
	});

	describe('Option.serialize', () => {
		it('emits { isSome: true, value } for Some', () => {
			expect(Option.serialize(Some(1))).toEqual({ isSome: true, value: 1 });
		});

		it('emits { isSome: false } for None (no value key)', () => {
			expect(Option.serialize(None<number>())).toEqual({ isSome: false });
		});

		it('preserves falsy non-nullish payloads on Some', () => {
			expect(Option.serialize(Some(0))).toEqual({ isSome: true, value: 0 });
			expect(Option.serialize(Some(''))).toEqual({ isSome: true, value: '' });
			expect(Option.serialize(Some(false))).toEqual({ isSome: true, value: false });
		});

		it('does not walk into nested structures — single-Option scope', () => {
			// The envelope's `value` is whatever the Some carried,
			// verbatim. Nested Options inside an array stay as
			// OptionBase instances, not envelopes.
			const inner = Some(2);
			const outer = Some([inner]);
			const envelope = Option.serialize(outer);

			expect(envelope).toEqual({ isSome: true, value: [inner] });
		});
	});

	describe('Option.deserialize', () => {
		it('reconstructs Some from a Some envelope', () => {
			const restored = Option.deserialize<number>({ isSome: true, value: 7 });

			expect(restored.isSome).toBe(true);
			expect(restored.unwrap()).toBe(7);
		});

		it('reconstructs None from a None envelope', () => {
			const restored = Option.deserialize<number>({ isSome: false });

			expect(restored.isNone).toBe(true);
		});

		it('throws InvalidStateException on a non-envelope shape', () => {
			expect(() => Option.deserialize({} as unknown as SerializedOption<number>)).toThrow(InvalidStateException);
		});
	});

	describe('Option.serialize / Option.deserialize round-trip', () => {
		it('is lossless for Some<number>', () => {
			const original = Some(42);
			const restored = Option.deserialize(Option.serialize(original));

			expect(restored.isSome).toBe(true);
			expect(restored.unwrap()).toBe(42);
		});

		it('is lossless for None', () => {
			const original = None<number>();
			const restored = Option.deserialize(Option.serialize(original));

			expect(restored.isNone).toBe(true);
		});

		it('is lossless for Some<falsy> through JSON.stringify / JSON.parse', () => {
			// The envelope shape was chosen so that the `value` key
			// only exists on the Some branch — no `value: undefined`
			// lost under JSON.stringify, no ambiguity on round-trip.
			for (const payload of [0, '', false]) {
				const original = Some(payload);
				const json = JSON.stringify(Option.serialize(original));
				const restored = Option.deserialize<typeof payload>(JSON.parse(json) as SerializedOption<typeof payload>);

				expect(restored.isSome).toBe(true);
				expect(restored.unwrap()).toBe(payload);
			}
		});

		it('is lossless for None through JSON.stringify / JSON.parse', () => {
			const json = JSON.stringify(Option.serialize(None<number>()));

			expect(json).toBe('{"isSome":false}');

			const restored = Option.deserialize<number>(JSON.parse(json) as SerializedOption<number>);

			expect(restored.isNone).toBe(true);
		});
	});
});
