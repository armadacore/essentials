/* eslint-disable no-undefined, no-restricted-syntax, no-null/no-null, @typescript-eslint/no-explicit-any, @typescript-eslint/no-restricted-types */
import { InvalidStateException } from 'essentials:exceptions';
import { type IOption } from '../models/IOption';
import { NoneOption } from './noneOption';
import { OptionBase } from './optionBase';
import { SomeOption } from './someOption';

const isJsonString = (value: unknown): value is string => {
	if (typeof value !== 'string') return false;
	if (value.startsWith('{') && value.endsWith('}')) return true;
	if (value.startsWith('[') && value.endsWith(']')) return true;

	return false;
};

export const Some = <T>(value: T): IOption<T> => {
	if (value === null || value === undefined) {
		throw new InvalidStateException('Cannot create Some with null or undefined');
	}

	return new SomeOption(value);
};

export const None = <T>(): IOption<T> => {
	return new NoneOption<never>();
};

export const toJsonObject = <T>(value: T): unknown => {
	if (Option.from(value).isNone) return { isSome: false, isNone: true, value };
	if (typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(toJsonObject);
	if (value instanceof OptionBase) {
		return {
			isSome: value.isSome,
			isNone: value.isNone,
			value: toJsonObject(value.getValue()),
		};
	}

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, toJsonObject(val)]),
	);
};
export const toJsonString = <T>(value: T): string => JSON.stringify(toJsonObject(value));

export const toOption = <T>(value: unknown): IOption<T> => {
	if (!value) return None();
	if (value instanceof OptionBase) return value;
	if (isJsonString(value)) return toOption(JSON.parse(value));
	if (typeof value !== 'object') return None();
	if (Array.isArray(value)) return value.map(toOption) as any;
	if ('isSome' in value && 'isNone' in value)
		return value.isSome ? Some((value as unknown as { value: T }).value) : None();

	return Object.fromEntries(
		Object.entries(value).map(([key, val]) => {
			return [key, toOption<T>(val)];
		}),
	) as any;
};

export const Option = {
	some: Some,
	none: None,
	toJsonString,
	toOption,

	from: <T>(value: T | null | undefined): IOption<T> => {
		return value !== null && value !== undefined ? Some(value) : None();
	},

	fromPredicate: <T>(value: T, predicate: (value: T) => boolean): IOption<T> => {
		return predicate(value) ? Some(value) : None();
	},
};
