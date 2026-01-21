// src/core/templates/BasePresenter.ts
import {IPresenter} from "../interfaces/IPresenter";
import {ViewWorkerManager} from "../managers/ViewWorkerManager";

export abstract class BasePresenter implements IPresenter {
    private listeners: (() => void)[] = [];

    constructor() {
        this._sharedView = ViewWorkerManager.getInstance().sharedView;
    }

    protected _sharedView!: Float32Array;

    public get sharedView(): Float32Array {
        return this._sharedView;
    }

    public setBuffer(view: Float32Array): void {
        this._sharedView = view;
    }

    public subscribe(cb: () => void): () => void {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    public update(): void {
        this.notify();
    }

    protected notify(): void {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]();
        }
    }
}