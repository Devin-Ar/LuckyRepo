// src/workers/view.worker.ts
import { ViewRegistry } from '../core/registry/WorkerRegistry';
import { initializeWorkerRegistries } from '../config/WorkerManifest';

initializeWorkerRegistries();

const logicViews: Map<string, Float32Array> = new Map();
const logicIntViews: Map<string, Int32Array> = new Map();
const outputViews: Map<string, Float32Array> = new Map();
const states: Map<string, any> = new Map();
const pendingStates: Map<string, Promise<any>> = new Map();

self.onmessage = async (e: MessageEvent) => {
    const {type, stateName, payload, dt, frameCount} = e.data;

    switch (type) {
        case 'INIT_SABS':
            console.log(`[ViewWorker] Initializing Buffers`);
            logicViews.clear();
            logicIntViews.clear();
            outputViews.clear();

            if (payload.inputBuffers) {
                Object.entries(payload.inputBuffers).forEach(([key, buffer]) => {
                    logicViews.set(key, new Float32Array(buffer as SharedArrayBuffer));
                    logicIntViews.set(key, new Int32Array(buffer as SharedArrayBuffer));
                });
            }
            if (payload.outputBuffers) {
                Object.entries(payload.outputBuffers).forEach(([key, buffer]) => {
                    outputViews.set(key, new Float32Array(buffer as SharedArrayBuffer));
                });
            }

            states.forEach(s => s.setBuffers?.(logicViews, logicIntViews, outputViews));
            break;

        case 'UPDATE_BUFFER': {
            const { name, buffer, isInput } = payload;
            if (isInput) {
                logicViews.set(name, new Float32Array(buffer));
                logicIntViews.set(name, new Int32Array(buffer));
            } else {
                outputViews.set(name, new Float32Array(buffer));
            }
            states.forEach(s => s.setBuffers?.(logicViews, logicIntViews, outputViews));
            break;
        }

        case 'CREATE_STATE':
            if (!states.has(stateName)) {
                if (pendingStates.has(stateName)) {
                    await pendingStates.get(stateName);
                } else {
                    const loadPromise = (async () => {
                        const instance = await ViewRegistry.create(stateName);
                        instance.setBuffers(logicViews, logicIntViews, outputViews);
                        return instance;
                    })();

                    pendingStates.set(stateName, loadPromise);

                    try {
                        const instance = await loadPromise;
                        states.set(stateName, instance);
                        console.log(`[ViewWorker] Loaded View: ${stateName}`);
                    } catch (e) {
                        console.error(`[ViewWorker] Failed to create view state: ${stateName}`, e);
                    } finally {
                        pendingStates.delete(stateName);
                    }
                }
            }
            break;

        case 'TICK':
            const logic = states.get(stateName);
            if (logic && logicViews.size > 0 && outputViews.size > 0) {
                logic.update(dt, frameCount);
            }
            break;

        case 'TERMINATE_STATE':
            if (states.has(stateName)) {
                states.get(stateName).destroy?.();
                states.delete(stateName);
            }
            break;

        case 'TERMINATE_ALL':
            states.forEach(s => s.destroy?.());
            states.clear();
            break;

        case 'INPUT':
            let target = states.get(stateName);

            if (!target && pendingStates.has(stateName)) {
                try {
                    target = await pendingStates.get(stateName);
                } catch(e) {
                }
            }

            if (!target) return;

            if (payload.action === 'GET_SNAPSHOT') {
                const replyPort = e.ports[0];
                if (replyPort) replyPort.postMessage(target.getSnapshot());
            } else if (payload.action === 'LOAD_SNAPSHOT') {
                target.loadSnapshot(payload.data);
            }
            break;
    }
};