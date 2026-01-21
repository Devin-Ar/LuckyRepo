// src/core/templates/BaseViewLogic.ts
export abstract class BaseViewLogic {
    protected logicView!: Float32Array;
    protected logicIntView!: Int32Array;
    protected outputView!: Float32Array;

    public setBuffers(logic: Float32Array, logicInt: Int32Array, output: Float32Array) {
        this.logicView = logic;
        this.logicIntView = logicInt;
        this.outputView = output;
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
        return !!(this.logicView && this.outputView);
    }
}