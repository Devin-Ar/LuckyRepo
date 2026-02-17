// src/workers/logic.worker.ts
import { LogicRegistry } from '../core/registry/WorkerRegistry';
import { initializeWorkerRegistries } from '../config/WorkerManifest';

initializeWorkerRegistries();

const sharedBuffers: Map<string, SharedArrayBuffer> = new Map();
const sharedViews: Map<string, Float32Array> = new Map();
const intViews: Map<string, Int32Array> = new Map();

const states: Map<string, any> = new Map();
const pendingStates: Map<string, Promise<any>> = new Map();

self.onmessage = async (e: MessageEvent) => {
    const {type, stateName, payload, frameCount, fps} = e.data;

    switch (type) {
        case 'INIT_SABS':
            console.log(`[Worker] Initializing Buffer Map`);

            sharedBuffers.clear();
            sharedViews.clear();
            intViews.clear();

            if (payload.buffers) {
                Object.entries(payload.buffers as Record<string, SharedArrayBuffer>).forEach(([name, buffer]) => {
                    sharedBuffers.set(name, buffer);
                    sharedViews.set(name, new Float32Array(buffer));
                    intViews.set(name, new Int32Array(buffer));
                });
            }

            states.forEach((state, name) => {
                if (typeof state.setBuffers === 'function') {
                    const bufferRecord: Record<string, SharedArrayBuffer> = {};
                    sharedBuffers.forEach((buf, key) => bufferRecord[key] = buf);
                    state.setBuffers(bufferRecord);
                }
            });
            break;

        case 'UPDATE_BUFFER':
            const { name, buffer } = payload;
            sharedBuffers.set(name, buffer);
            sharedViews.set(name, new Float32Array(buffer));
            intViews.set(name, new Int32Array(buffer));

            states.forEach((state) => {
                if (typeof state.setBuffers === 'function') {
                    console.log(`[Worker] Updating buffer views for existing state: ${name}`);
                    const bufferRecord: Record<string, SharedArrayBuffer> = {};
                    sharedBuffers.forEach((buf, key) => bufferRecord[key] = buf);
                    state.setBuffers(bufferRecord);
                }
            });
            break;

        case 'CREATE_STATE':
            if (!states.has(stateName)) {
                if (pendingStates.has(stateName)) {
                    await pendingStates.get(stateName);
                } else {
                    const loadPromise = (async () => {
                        const instance = await LogicRegistry.create(stateName);
                        if (sharedBuffers.size > 0) {
                            const bufferRecord: Record<string, SharedArrayBuffer> = {};
                            sharedBuffers.forEach((buf, key) => bufferRecord[key] = buf);
                            instance.setBuffers(bufferRecord);
                        }
                        return instance;
                    })();

                    pendingStates.set(stateName, loadPromise);

                    try {
                        const instance = await loadPromise;
                        states.set(stateName, instance);
                        console.log(`[Worker] Loaded Logic: ${stateName}`);
                    } catch (e) {
                        console.error(`[Worker] Failed to create state: ${stateName}`, e);
                    } finally {
                        pendingStates.delete(stateName);
                    }
                }
            }
            break;

        case 'TERMINATE_STATE':
            if (states.has(stateName)) {
                console.log(`[Worker] Terminated Logic for: ${stateName}`);
                states.get(stateName).destroy();
                states.delete(stateName);
            } else {
                console.warn(`[Worker] Attempted to terminate non-existent state: ${stateName}`);
            }
            break;

        case 'TERMINATE_ALL':
            console.log(`[Worker] Terminating all logic states. Count: ${states.size}`);
            states.forEach(s => s.destroy());
            states.clear();
            break;

        case 'INPUT':
            let target = states.get(stateName);

            if (!target && pendingStates.has(stateName)) {
                try {
                    target = await pendingStates.get(stateName);
                } catch (e) {
                    // Handled in CREATE_STATE
                }
            }

            if (target) {
                if (payload.action === 'GET_SNAPSHOT') {
                    console.info(`[Worker] [${stateName}] Generating Snapshot`);
                    const replyPort = e.ports[0];
                    if (replyPort) {
                        replyPort.postMessage(target.getSnapshot());
                    }
                } else if (payload.action === 'LOAD_SNAPSHOT') {
                    console.info(`[Worker] [${stateName}] Loading Snapshot`);
                    target.loadSnapshot(payload.data);
                } else {
                    console.debug(`[Worker] [${stateName}] Input: ${payload.action || 'Unknown Action'}`);
                    target.handleInput(payload);
                }
            } else {
                console.error(`[Worker] Received INPUT for unknown state: ${stateName}`);
            }
            break;

        case 'TICK':
            const logic = states.get(stateName);
            if (logic && sharedViews.size > 0) {
                logic.update(sharedViews, intViews, frameCount, fps);
            }
            break;

        default:
            console.warn(`[Worker] Unhandled message type: ${type}`);
            break;
    }
};