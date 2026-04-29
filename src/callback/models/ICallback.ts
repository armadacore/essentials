/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ICallback<T extends (...args: any[]) => void | Promise<void>> {
	exists(): boolean;
	execute(...args: Parameters<T>): void | Promise<void>;
	executeOr(orExecute: T, ...args: Parameters<T>): void | Promise<void>;
	handover(): T;
}
