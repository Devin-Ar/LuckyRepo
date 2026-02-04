// src/core/templates/BasePresenter.ts
import {IPresenter} from "../interfaces/IPresenter";
import {ViewWorkerManager} from "../managers/ViewWorkerManager";

export abstract class BasePresenter implements IPresenter {
    private listeners: (() => void)[] = [];

    protected _sharedViews: Map<string, Float32Array>;

    constructor() {
        this._sharedViews = ViewWorkerManager.getInstance().sharedViews;
    }

    public get sharedView(): Float32Array {
        const view = this._sharedViews.get('main') || this._sharedViews.values().next().value;
        if (!view) {
            return new Float32Array(0);
        }
        return view;
    }

    public getBuffer(name: string): Float32Array | undefined {
        return this._sharedViews.get(name);
    }

    public setBuffers(views: Map<string, Float32Array>): void {
        this._sharedViews = views;
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