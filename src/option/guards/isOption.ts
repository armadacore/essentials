import { OptionBase } from '../core/optionBase';

export const isOption = <T>(value: unknown): value is OptionBase<T> => {
	return value instanceof OptionBase;
};
