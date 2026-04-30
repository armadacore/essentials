import { OptionBase } from './optionBase';

export class NoneOption<T> extends OptionBase<T> {
	readonly isSome = false;
	readonly isNone = true;

	getValue(): undefined {
		return undefined;
	}
}
