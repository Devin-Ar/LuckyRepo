// src/core/templates/BaseViewLogic.ts
export abstract class BaseViewLogic {
    protected logicViews: Map<string, Float32Array> = new Map();
    protected logicIntViews: Map<string, Int32Array> = new Map();
    protected outputViews: Map<string, Float32Array> = new Map();

    public setBuffers(
        logic: Map<string, Float32Array>,
        logicInt: Map<string, Int32Array>,
        output: Map<string, Float32Array>
    ) {
        this.logicViews = logic;
        this.logicIntViews = logicInt;
        this.outputViews = output;
    }

    protected get logicView(): Float32Array {
        const view = this.logicViews.get('main') || this.logicViews.values().next().value;
        return view ?? new Float32Array(0);
    }

    protected get logicIntView(): Int32Array {
        const view = this.logicIntViews.get('main') || this.logicIntViews.values().next().value;
        return view ?? new Int32Array(0);
    }

    protected get outputView(): Float32Array {
        const view = this.outputViews.get('main') || this.outputViews.values().next().value;
        return view ?? new Float32Array(0);
    }

    public abstract update(dt: number, frameCount: number): void;

    public getSnapshot(): any {
        return {};
    }

    public loadSnapshot(data: any): void {
    }

    public destroy(): void {
    }

    protected hasBuffers(): boolean {
        return this.logicViews.size > 0 && this.outputViews.size > 0;
    }
}