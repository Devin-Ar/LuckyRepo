// src/core/managers/ViewWorkerManager.ts
import ViewWorker from '../../workers/view.worker?worker';
import {IBuffer} from '../interfaces/IBuffer';

export class ViewWorkerManager {
    private static instance: ViewWorkerManager;
    public worker: Worker;

    public sharedBuffer!: SharedArrayBuffer;
    public sharedView!: Float32Array;

    public isInitialized: boolean = false;
    private activeStateName: string | null = null;
    private activeInstanceId: string | null = null;

    private constructor() {
        this.worker = new ViewWorker();
        this.worker.onerror = (e) => console.error('View Worker Error:', e);
    }

    public static getInstance(): ViewWorkerManager {
        if (!ViewWorkerManager.instance) ViewWorkerManager.instance = new ViewWorkerManager();
        return ViewWorkerManager.instance;
    }

    public setupBuffers(inputBuffer: SharedArrayBuffer, outputSchema: IBuffer) {
        this.isInitialized = false;

        const bytesNeeded = outputSchema.BUFFER_SIZE * 4;
        this.sharedBuffer = new SharedArrayBuffer(bytesNeeded);
        this.sharedView = new Float32Array(this.sharedBuffer);

        this.sharedView.fill(0);

        this.worker.postMessage({
            type: 'INIT_SABS',
            payload: {
                inputBuffer: inputBuffer,
                outputBuffer: this.sharedBuffer
            }
        });

        this.isInitialized = true;
    }

    public prepareForState(newStateName: string): string {
        const instanceId = crypto.randomUUID();
        if (this.activeStateName !== newStateName) {
            this.isInitialized = false;
        }
        this.activeInstanceId = instanceId;
        this.activeStateName = newStateName;
        return instanceId;
    }

    public createState(stateName: string) {
        this.worker.postMessage({
            type: 'CREATE_STATE',
            stateName
        });
    }

    public terminateState(stateName: string, instanceId?: string) {
        if (instanceId && instanceId !== this.activeInstanceId) return;

        if (this.activeStateName === stateName) {
            this.activeStateName = null;
            this.activeInstanceId = null;
            this.isInitialized = false;
        }
        this.worker.postMessage({type: 'TERMINATE_STATE', stateName});
    }

    public tick(stateName: string, dt: number, frameCount: number) {
        if (!this.isInitialized || !this.sharedView || stateName !== this.activeStateName) {
            return;
        }
        this.worker.postMessage({type: 'TICK', stateName, dt, frameCount});
    }

    public forceClearWorker() {
        this.isInitialized = false;
        this.activeStateName = null;
        this.activeInstanceId = null;
        this.worker.postMessage({type: 'TERMINATE_ALL'});
    }

    public sendInput(stateName: string, action: string, payload: any = {}) {
        this.worker.postMessage({type: 'INPUT', stateName, payload: {action, ...payload}});
    }

    public loadSnapshot(stateName: string, snapshot: any) {
        this.worker.postMessage({
            type: 'INPUT',
            stateName,
            payload: {action: 'LOAD_SNAPSHOT', data: snapshot}
        });
    }
}