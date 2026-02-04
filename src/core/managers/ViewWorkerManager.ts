// src/core/managers/ViewWorkerManager.ts
import ViewWorker from '../../workers/view.worker?worker';
import {IBuffer, BufferMap} from '../interfaces/IBuffer';

export class ViewWorkerManager {
    private static instance: ViewWorkerManager;
    public worker: Worker;

    public sharedBuffers: Map<string, SharedArrayBuffer> = new Map();
    public sharedViews: Map<string, Float32Array> = new Map();

    public isInitialized: boolean = false;
    private activeStateName: string | null = null;
    private activeInstanceId: string | null = null;

    private constructor() {
        this.worker = new ViewWorker();
        this.worker.onerror = (e) => console.error('View Worker Error:', e);

        this.worker.onmessage = (e) => {
            if (e.data.type === 'REQUEST_RESIZE_OUTPUT') {
                this.resizeOutputBuffer(e.data.payload.bufferName, e.data.payload.newSize);
            }
        };
    }

    public static getInstance(): ViewWorkerManager {
        if (!ViewWorkerManager.instance) ViewWorkerManager.instance = new ViewWorkerManager();
        return ViewWorkerManager.instance;
    }

    public updateInputBuffer(bufferName: string, buffer: SharedArrayBuffer) {
        this.worker.postMessage({
            type: 'UPDATE_BUFFER',
            payload: { name: bufferName, buffer, isInput: true }
        });
    }

    public resizeOutputBuffer(bufferName: string, newSize: number) {
        const oldView = this.sharedViews.get(bufferName);
        const bytesNeeded = newSize * 4;
        const sab = new SharedArrayBuffer(bytesNeeded);
        const newView = new Float32Array(sab);

        if (oldView) {
            newView.set(oldView);
        }

        this.sharedBuffers.set(bufferName, sab);
        this.sharedViews.set(bufferName, newView);

        this.worker.postMessage({
            type: 'UPDATE_BUFFER',
            payload: { name: bufferName, buffer: sab, isInput: false }
        });
    }

    public setupBuffers(inputBuffers: Record<string, SharedArrayBuffer>, outputSchema: IBuffer | BufferMap) {
        this.isInitialized = false;
        this.sharedBuffers.clear();
        this.sharedViews.clear();

        const schemas: BufferMap = ('BUFFER_SIZE' in outputSchema)
            ? { main: outputSchema as IBuffer }
            : outputSchema as BufferMap;

        const payloadOutputBuffers: Record<string, SharedArrayBuffer> = {};

        Object.entries(schemas).forEach(([name, config]) => {
            const bytesNeeded = config.BUFFER_SIZE * 4;
            const sab = new SharedArrayBuffer(bytesNeeded);
            this.sharedBuffers.set(name, sab);
            this.sharedViews.set(name, new Float32Array(sab));
            payloadOutputBuffers[name] = sab;
        });

        this.worker.postMessage({
            type: 'INIT_SABS',
            payload: { inputBuffers, outputBuffers: payloadOutputBuffers }
        });

        this.isInitialized = true;
    }

    public prepareForState(newStateName: string): string {
        const instanceId = crypto.randomUUID();
        if (this.activeStateName !== newStateName) this.isInitialized = false;
        this.activeInstanceId = instanceId;
        this.activeStateName = newStateName;
        return instanceId;
    }

    public createState(stateName: string) {
        this.worker.postMessage({ type: 'CREATE_STATE', stateName });
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
        if (!this.isInitialized || this.sharedViews.size === 0 || stateName !== this.activeStateName) return;
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