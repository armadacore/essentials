import { OptionBase } from '../core/optionBase';

/**
 * Strict structural type guard for {@link IOption}: returns `true`
 * only for instances actually produced by {@link Some} / {@link None}
 * (i.e. living on the {@link OptionBase} prototype chain).
 *
 * Duck-typed inputs — plain objects with `isSome` / `isNone` booleans,
 * foreign monad-likes, JSON round-trip results — are deliberately
 * rejected. Use {@link Option.deserialize} to lift a
 * {@link SerializedOption} envelope back into a real Option.
 */
export const isOption = <T>(value: unknown): value is OptionBase<T> => {
	return value instanceof OptionBase;
};
