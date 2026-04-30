import { OptionBase } from './optionBase';

export class SomeOption<T> extends OptionBase<T> {
	readonly isSome = true;
	readonly isNone = false;

	constructor(public readonly value: T) {
		super();
	}

	protected getValue(): T {
		return this.value;
	}
}
