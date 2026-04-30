export interface IOption<T> {
	readonly isSome: boolean;
	readonly isNone: boolean;

	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: () => T): T;
	unwrapOrUndefined(): T | undefined;
	unwrapOrNull(): T | null;

	expect(message: string): T;

	map<U>(fn: (value: T) => U): IOption<U>;
	mapOr<U>(defaultValue: U, fn: (value: T) => U): U;
	mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

	and<U>(other: IOption<U>): IOption<U>;
	andThen<U>(fn: (value: T) => IOption<U>): IOption<U>;
	onSome(fn: (value: T) => void): void;
	onNone(fn: () => void): void;

	or(other: IOption<T>): IOption<T>;
	orElse(fn: () => IOption<T>): IOption<T>;

	filter(predicate: (value: T) => boolean): IOption<T>;

	match<U>(onSome: (value: T) => U, onNone: () => U): U;

	toArray(): T[];
	toString(): string;
}
