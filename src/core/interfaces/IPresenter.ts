// src/core/interfaces/IPresenter.ts
export interface IPresenter {
    subscribe(callback: () => void): () => void;

    update(): void;
}