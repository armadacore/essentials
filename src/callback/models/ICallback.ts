/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ICallback<T extends (...args: any[]) => any> {
	get hasCallback(): boolean;
	execute(...args: Parameters<T>): ReturnType<T>;
	executeOr(or: T, ...args: Parameters<T>): ReturnType<T>;
	handover(): T;
	handoverOr(or: T): T;
}
