// src/core/templates/BaseLogic.ts
import {IDispatcher} from '../interfaces/IDispatcher';
import {ILogic} from '../interfaces/ILogic';

export abstract class BaseLogic<TConfig = any> implements ILogic {
    protected isInitialized: boolean = false;
    protected abstract dispatcher: IDispatcher;
    protected sharedView!: Float32Array;
    protected intView!: Int32Array;

    protected config: TConfig | null = null;

    protected inputState = {
        keys: [] as string[],
        isMouseDown: false,
        isHovering: false
    };

    protected constructor(protected revisionIndex: number) {
    }

    public setBuffer(buffer: SharedArrayBuffer): void {
        this.sharedView = new Float32Array(buffer);
        this.intView = new Int32Array(buffer);
    }

    public setInitialized(val: boolean): void {
        this.isInitialized = val;
        if (val) this.onInitialize();
    }

    public abstract applyConfig(config: TConfig): void;

    public update(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.isInitialized || !this.sharedView || !this.intView) return;

        this.onUpdate(this.sharedView, this.intView, frameCount, fps);
        Atomics.add(this.intView, this.revisionIndex, 1);
    }

    public handleInput(payload: any): void {
        if (payload.action === 'SYNC_INPUT' || payload.action === 'KEY_STATE') {
            this.inputState.keys = payload.keys || [];
            this.inputState.isMouseDown = !!payload.isMouseDown;
            this.inputState.isHovering = !!payload.isHovering;
            return;
        }
        this.dispatcher.dispatch(payload.action, payload);
    }

    public destroy(): void {
        this.isInitialized = false;
        this.config = null;
    }

    public getSnapshot(): any {
        return {};
    }

    public loadSnapshot(data: any): void {
    }

    protected abstract onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void;

    protected onInitialize(): void {
    }
}