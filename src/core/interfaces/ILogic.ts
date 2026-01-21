export interface ILogic {
    update(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void;

    handleInput(payload: any): void;

    destroy?(): void;

    getSnapshot(): any;

    loadSnapshot(data: any): void;
}