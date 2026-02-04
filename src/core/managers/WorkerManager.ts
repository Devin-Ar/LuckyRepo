// src/core/managers/WorkerManager.ts
import LogicWorker from '../../workers/logic.worker?worker';
import {IBuffer, BufferMap} from '../interfaces/IBuffer';
import {ViewWorkerManager} from './ViewWorkerManager';

export class WorkerManager {
    private static instance: WorkerManager;
    public logic: Worker;

    public buffers: Map<string, SharedArrayBuffer> = new Map();
    public views: Map<string, Float32Array> = new Map();

    public isInitialized: boolean = false;
    private activeStateName: string | null = null;
    private activeInstanceId: string | null = null;

    private constructor() {
        this.logic = new LogicWorker();
        if (typeof SharedArrayBuffer === 'undefined') {
            throw new Error("COOP/COEP headers missing for SharedArrayBuffer.");
        }
        this.logic.onerror = (e) => console.error('Logic Worker Error:', e);

        this.logic.onmessage = (e) => {
            if (e.data.type === 'REQUEST_RESIZE') {
                this.resizeBuffer(e.data.payload.bufferName, e.data.payload.newSize);
            }
        };
    }

    public static getInstance(): WorkerManager {
        if (!WorkerManager.instance) WorkerManager.instance = new WorkerManager();
        return WorkerManager.instance;
    }

    public setupBuffers(schema: IBuffer | BufferMap, forceZero: boolean = false) {
        this.isInitialized = false;
        this.buffers.clear();
        this.views.clear();

        const schemas: BufferMap = ('BUFFER_SIZE' in schema)
            ? { main: schema as IBuffer }
            : schema as BufferMap;

        const payloadBuffers: Record<string, SharedArrayBuffer> = {};

        Object.entries(schemas).forEach(([name, config]) => {
            const bytesNeeded = config.BUFFER_SIZE * 4;
            const sab = new SharedArrayBuffer(bytesNeeded);

            if (forceZero) {
                new Float32Array(sab).fill(0);
            }

            this.buffers.set(name, sab);
            this.views.set(name, new Float32Array(sab));
            payloadBuffers[name] = sab;
        });

        this.logic.postMessage({
            type: 'INIT_SABS',
            payload: { buffers: payloadBuffers }
        });

        this.isInitialized = true;
    }

    public resizeBuffer(bufferName: string, newSize: number) {
        const oldView = this.views.get(bufferName);
        const bytesNeeded = newSize * 4;
        const newSab = new SharedArrayBuffer(bytesNeeded);
        const newView = new Float32Array(newSab);

        // 1. Copy old data to the new buffer so rocks don't teleport to (0,0)
        if (oldView) {
            newView.set(oldView);
        }

        this.buffers.set(bufferName, newSab);
        this.views.set(bufferName, newView);

        this.logic.postMessage({
            type: 'UPDATE_BUFFER',
            payload: { name: bufferName, buffer: newSab }
        });

        // Notify ViewWorker about the new logic-side buffer
        ViewWorkerManager.getInstance().updateInputBuffer(bufferName, newSab);
    }

    public getBuffers(): Record<string, SharedArrayBuffer> {
        const out: Record<string, SharedArrayBuffer> = {};
        this.buffers.forEach((v, k) => out[k] = v);
        return out;
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
        if (!this.isInitialized || this.views.size === 0 || stateName !== this.activeStateName) {
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