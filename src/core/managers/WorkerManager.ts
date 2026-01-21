// src/core/managers/WorkerManager.ts
import LogicWorker from '../../workers/logic.worker?worker';
import {IBuffer} from '../interfaces/IBuffer';

export class WorkerManager {
    private static instance: WorkerManager;
    public logic: Worker;
    public sharedBuffer!: SharedArrayBuffer;
    public sharedView!: Float32Array;
    public isInitialized: boolean = false;
    private activeStateName: string | null = null;
    private activeInstanceId: string | null = null;

    private constructor() {
        this.logic = new LogicWorker();
        if (typeof SharedArrayBuffer === 'undefined') {
            throw new Error("COOP/COEP headers missing for SharedArrayBuffer.");
        }
        this.logic.onerror = (e) => console.error('Logic Worker Error:', e);
    }

    public static getInstance(): WorkerManager {
        if (!WorkerManager.instance) WorkerManager.instance = new WorkerManager();
        return WorkerManager.instance;
    }

    public setupBuffer(schema: IBuffer, forceZero: boolean = false) {
        this.isInitialized = false;
        const bytesNeeded = schema.BUFFER_SIZE * 4;
        this.sharedBuffer = new SharedArrayBuffer(bytesNeeded);
        new Float32Array(this.sharedBuffer).fill(0);

        this.sharedView = new Float32Array(this.sharedBuffer);

        this.logic.postMessage({
            type: 'INIT_SAB',
            payload: {buffer: this.sharedBuffer}
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

    public createState(stateName: string, force: boolean = false) {
        this.logic.postMessage({
            type: 'CREATE_STATE',
            stateName,
            payload: {force}
        });
    }

    public terminateState(stateName: string, instanceId?: string) {
        if (instanceId && instanceId !== this.activeInstanceId) return;

        if (this.activeStateName === stateName) {
            this.activeStateName = null;
            this.activeInstanceId = null;
            this.isInitialized = false;
        }
        this.logic.postMessage({type: 'TERMINATE_STATE', stateName});
    }

    public sendInput(stateName: string, action: string, payload: any = {}) {
        this.logic.postMessage({type: 'INPUT', stateName, payload: {action, ...payload}});
    }

    public tick(stateName: string, frameCount: number, fps: number) {
        if (!this.isInitialized || !this.sharedView || stateName !== this.activeStateName) {
            return;
        }
        this.logic.postMessage({type: 'TICK', stateName, frameCount, fps});
    }

    public forceClearWorker() {
        this.isInitialized = false;
        this.activeStateName = null;
        this.activeInstanceId = null;
        this.logic.postMessage({type: 'TERMINATE_ALL'});
    }
}