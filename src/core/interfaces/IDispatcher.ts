// src/core/interfaces/IDispatcher.ts
export interface IDispatcher {
    dispatch(action: string, payload: any): void;
}