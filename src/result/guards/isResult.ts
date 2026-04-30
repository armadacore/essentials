import { Exception } from 'essentials:exceptions';
import { ResultBase } from '../core/resultBase';

/**
 * Strict structural type guard for {@link IResult}: returns `true`
 * only for instances actually produced by {@link Ok} / {@link Err}
 * (i.e. living on the {@link ResultBase} prototype chain).
 *
 * Duck-typed inputs — plain objects with `isOk` / `isErr` booleans,
 * foreign monad-likes — are deliberately rejected.
 */
export const isResult = <T>(value: unknown): value is ResultBase<T> & { value: T; error: Exception } => {
	return value instanceof ResultBase;
};
