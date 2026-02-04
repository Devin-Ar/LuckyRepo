// src/core/templates/BaseLogic.ts
import {IDispatcher} from '../interfaces/IDispatcher';
import {ILogic} from '../interfaces/ILogic';

export abstract class BaseLogic<TConfig = any> implements ILogic {
    protected isInitialized: boolean = false;
    protected abstract dispatcher: IDispatcher;

    protected sharedViews: Map<string, Float32Array> = new Map();
    protected intViews: Map<string, Int32Array> = new Map();

    protected config: TConfig | null = null;

    protected inputState = {
        actions: [] as string[],
        mouseX: 0,
        mouseY: 0,
        isMouseDown: false,
        isHovering: false
    };

    protected constructor(protected revisionIndex: number) {
    }

    public setBuffers(buffers: Record<string, SharedArrayBuffer>): void {
        this.sharedViews.clear();
        this.intViews.clear();

        Object.entries(buffers).forEach(([key, buffer]) => {
            this.sharedViews.set(key, new Float32Array(buffer));
            this.intViews.set(key, new Int32Array(buffer));
        });
    }

    protected get sharedView(): Float32Array {
        const view = this.sharedViews.get('main') || this.sharedViews.values().next().value;
        if (!view) throw new Error(`[BaseLogic] No SharedView available for ${this.constructor.name}`);
        return view as Float32Array;
    }

    protected get intView(): Int32Array {
        const view = this.intViews.get('main') || this.intViews.values().next().value;
        if (!view) throw new Error(`[BaseLogic] No IntView available for ${this.constructor.name}`);
        return view as Int32Array;
    }

    public setInitialized(val: boolean): void {
        this.isInitialized = val;
        if (val) this.onInitialize();
    }

    public abstract applyConfig(config: TConfig): void;

    public update(
        sharedViewsMap: any,
        intViewsMap: any,
        frameCount: number,
        fps: number
    ): void {
        if (!this.isInitialized || this.sharedViews.size === 0) return;

        this.onUpdate(this.sharedView, this.intView, frameCount, fps);

        const mainIntView = this.intView;
        if(mainIntView) {
            Atomics.add(mainIntView, this.revisionIndex, 1);
        }
    }

    public handleInput(payload: any): void {
        if (payload.action === 'SYNC_INPUT') {
            this.inputState.actions = payload.actions || [];
            this.inputState.mouseX = payload.mouseX || 0;
            this.inputState.mouseY = payload.mouseY || 0;
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