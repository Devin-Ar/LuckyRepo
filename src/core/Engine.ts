//src/core/Engine.ts
import { WorkerManager } from './managers/WorkerManager';
import { ViewWorkerManager } from './managers/ViewWorkerManager';
import { StateManager } from './managers/StateManager';
import { InputManager } from './managers/InputManager';
import { IState } from "./interfaces/IState";

export class Engine {
    private static instance: Engine;
    private readonly TARGET_FPS = 60;
    private readonly MS_PER_FRAME = 1000 / this.TARGET_FPS;

    private lastFrameTime: number = 0;
    private isRunning: boolean = false;
    private requestRef: number = 0;

    public frameCount: number = 0;
    public fps: number = 0;
    private lastFpsUpdate: number = 0;
    private framesSinceLastUpdate: number = 0;

    private constructor() {}

    public static getInstance(): Engine {
        if (!Engine.instance) Engine.instance = new Engine();
        return Engine.instance;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = performance.now();
        InputManager.getInstance();
        this.requestRef = requestAnimationFrame(this.loop);
        console.log("[Engine] Core Loop Started");
    }

    public stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.requestRef);
        console.log("[Engine] Core Loop Stopped");
    }

    private loop = (now: number) => {
        if (!this.isRunning) return;

        const deltaTime = now - this.lastFrameTime;

        if (deltaTime < this.MS_PER_FRAME) {
            this.requestRef = requestAnimationFrame(this.loop);
            return;
        }

        this.lastFrameTime = now - (deltaTime % this.MS_PER_FRAME);

        const stateManager = StateManager.getInstance();
        const stateStack = (stateManager as any).stack as IState[];

        if (stateStack.length === 0) {
            this.requestRef = requestAnimationFrame(this.loop);
            return;
        }

        this.framesSinceLastUpdate++;
        if (now > this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.framesSinceLastUpdate * 1000) / (now - this.lastFpsUpdate));
            this.lastFpsUpdate = now;
            this.framesSinceLastUpdate = 0;
        }

        this.dispatchLogicTick(stateManager);
        this.dispatchViewTick(stateManager, this.MS_PER_FRAME);
        stateManager.updateAll(this.MS_PER_FRAME, this.frameCount);

        this.frameCount++;
        this.requestRef = requestAnimationFrame(this.loop);
    };

    private dispatchLogicTick(stateManager: StateManager) {
        const workerManager = WorkerManager.getInstance();
        const targetName = (workerManager as any).activeStateName;
        if (!targetName) return;

        const stateStack = (stateManager as any).stack as IState[];
        const targetState = stateStack.find(s => s.name === targetName);

        if (!targetState || !targetState.isUpdating) return;

        const inputManager = InputManager.getInstance();
        const snap = inputManager.getSnapshot();

        workerManager.sendInput(targetName, 'SYNC_INPUT', {
            actions: snap.actions,
            mouseX: snap.mouseX,
            mouseY: snap.mouseY,
            isMouseDown: snap.isMouseDown,
            isHovering: snap.isHoveringButton
        });

        workerManager.tick(targetName, this.frameCount, this.fps || 60);
    }

    private dispatchViewTick(stateManager: StateManager, dt: number) {
        const viewWorker = ViewWorkerManager.getInstance();
        const targetName = (viewWorker as any).activeStateName;
        if (!targetName) return;

        const stateStack = (stateManager as any).stack as IState[];
        const targetState = stateStack.find(s => s.name === targetName);

        if (!targetState || !targetState.isRendering) return;

        const effectiveDt = targetState.isUpdating ? dt : 0;

        viewWorker.tick(targetName, effectiveDt, this.frameCount);
    }
}