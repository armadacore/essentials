import { InvalidStateException } from 'essentials:exceptions';
import { type IResult } from 'essentials:result';
import { type IOption } from '../models/IOption';
import { type SerializedOption } from '../models/SerializedOption';
import { NoneOption } from './noneOption';
import { optionFactories } from './optionBase';
import { SomeOption } from './someOption';

/**
 * Constructs a {@link Some} variant of {@link IOption} carrying
 * `value`.
 *
 * Rejects `null` and `undefined` outright — `Some` always carries a
 * present value. To lift a possibly-nullish value safely use
 * {@link Option.from} instead. Falsy non-nullish values (`0`, `''`,
 * `false`, `NaN`) are accepted; they are values, not absence.
 *
 * @throws {InvalidStateException} if `value` is `null` or `undefined`.
 */
export const Some = <T>(value: T): IOption<T> => {
	if (value === null || value === undefined) {
		throw new InvalidStateException('Cannot create Some with null or undefined');
	}

	return new SomeOption(value);
};

/**
 * Constructs a {@link None} variant of {@link IOption}. Carries no
 * value; the type parameter `T` only flows through for downstream
 * `map` / `andThen` chains.
 */
export const None = <T>(): IOption<T> => {
	return new NoneOption<never>();
};

// Wire the late-binding bridge so OptionBase methods (`map`, `andThen`,
// `filter`, …) can construct fresh Option values without a top-level
// import on this module. See the docstring of `optionFactories` in
// optionBase.ts.
optionFactories.some = Some;
optionFactories.none = None;

/**
 * Lossless wire-format conversion: turn an {@link IOption} into its
 * {@link SerializedOption} envelope. The result is plain data and
 * survives `JSON.stringify` / `JSON.parse` round-trips intact.
 *
 * Only operates on a single Option — does not walk into nested objects
 * / arrays. Callers that need deep serialisation are expected to map
 * over their data structure themselves and call `serialize` per leaf.
 * That separation keeps the contract honest: the function does what
 * its name says and nothing more.
 */
const serialize = <T>(option: IOption<T>): SerializedOption<T> => {
	return option.match<SerializedOption<T>>(
		(value) => ({ isSome: true, value }),
		() => ({ isSome: false }),
	);
};

/**
 * Inverse of {@link serialize}. Reconstructs an {@link IOption} from
 * its {@link SerializedOption} envelope. Round-trip property:
 *
 *     deserialize(serialize(opt))  ≡  opt    (structurally)
 *
 * Only handles the documented envelope shape; throws an
 * {@link InvalidStateException} on anything else. JSON parsing,
 * walking arrays / objects, or guessing about foreign data is
 * deliberately out of scope.
 */
const deserialize = <T>(envelope: SerializedOption<T>): IOption<T> => {
	if (envelope.isSome) return Some(envelope.value);
	if (envelope.isSome === false) return None();

	throw new InvalidStateException('deserialize received a value that is not a SerializedOption envelope');
};

/**
 * Namespace bundling all {@link IOption}-related factories,
 * conversions and predicates. Prefer this over the top-level
 * {@link Some} / {@link None} factories when you want a single import
 * surface (`import { Option } from 'essentials:option'`).
 */
export const Option = {
	/** Alias for the top-level {@link Some} factory. */
	some: Some,

	/** Alias for the top-level {@link None} factory. */
	none: None,

	serialize,
	deserialize,

	/**
	 * Lifts a possibly-nullish value into an {@link IOption}: returns
	 * {@link Some} for any non-`null`, non-`undefined` value (falsy
	 * primitives like `0` / `''` / `false` included), {@link None}
	 * otherwise.
	 */
	from: <T>(value: T | null | undefined): IOption<T> => {
		return value !== null && value !== undefined ? Some(value) : None();
	},

	/**
	 * Returns {@link Some} carrying `value` if `predicate(value)` is
	 * truthy, otherwise {@link None}. Note: `predicate` is always
	 * called — pass an already-truthy value if you want a guaranteed
	 * {@link Some}.
	 */
	fromPredicate: <T>(value: T, predicate: (value: T) => boolean): IOption<T> => {
		return predicate(value) ? Some(value) : None();
	},

	/**
	 * Lifts an {@link IResult} into an {@link IOption} by discarding the
	 * error branch. `Ok(v)` becomes `Some(v)`, `Err(_)` becomes `None`.
	 *
	 * The error is intentionally dropped — this conversion is
	 * lossy. Use {@link Result.fromOption} for the inverse direction
	 * (which requires an explicit error to inject).
	 */
	fromResult: <T>(result: IResult<T>): IOption<T> => {
		return result.isOk ? Some(result.unwrap()) : None();
	},
};
