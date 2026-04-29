/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ICallback<T extends (...args: any[]) => any> {
	exists(): boolean;
	execute(...args: Parameters<T>): ReturnType<T>;
	executeOr(orExecute: T, ...args: Parameters<T>): ReturnType<T>;
	handover(): T;
}
