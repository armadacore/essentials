import { type Exception } from './exception';

/**
 * Constructor signature shared by every {@link Exception} subclass that
 * the deserialiser needs to instantiate. Matches the public ctor of
 * {@link Exception} so subclasses with the standard
 * `(message?, options?)` shape slot in directly.
 */
export type IExceptionConstructor = new (message?: string, options?: { cause?: unknown }) => Exception;

/**
 * Late-binding registry of {@link Exception} subclasses keyed by
 * `name`. Populated at module-init time by
 * {@link registerExceptionRegistry} (called from `exceptionRegistry.ts`).
 *
 * Lives in its own module to break what would otherwise be a circular
 * import: `exception.ts` cannot import the concrete subclasses
 * directly because they extend it. The {@link Exception.deserialize}
 * static reads from this slot at call time, so as long as the
 * registry has been wired by the time `deserialize` runs, the
 * indirection is invisible to callers.
 *
 * Mirrors the {@link optionFactories} / {@link resultFactories}
 * lazy-binding pattern used elsewhere in the codebase.
 */
export const exceptionFactories: {
	registry: ReadonlyMap<string, IExceptionConstructor>;
} = {
	registry: new Map(),
};
