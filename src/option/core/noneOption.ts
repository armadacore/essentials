import { OptionBase } from './optionBase';

export class NoneOption<T> extends OptionBase<T> {
	readonly isSome = false;
	readonly isNone = true;

	protected getValue(): undefined {
		return undefined;
	}
}
