// src/workers/logic.worker.ts
import {Game1Logic} from '../features/Game1/logic/Game1Logic';
import {Game2Logic} from '../features/Game2/logic/Game2Logic';

let sharedBuffer: SharedArrayBuffer;
let sharedView: Float32Array;
let intView: Int32Array;
const states: Map<string, any> = new Map();

self.onmessage = (e: MessageEvent) => {
    const {type, stateName, payload, frameCount, fps} = e.data;

    switch (type) {
        case 'INIT_SAB':
            console.log(`[Worker] Initializing SharedArrayBuffer for ${stateName || 'global'}`);
            sharedBuffer = payload.buffer;
            sharedView = new Float32Array(sharedBuffer);
            intView = new Int32Array(sharedBuffer);

            states.forEach((state, name) => {
                if (typeof state.setBuffer === 'function') {
                    console.log(`[Worker] Updating buffer views for existing state: ${name}`);
                    state.setBuffer(sharedBuffer);
                }
            });
            break;

        case 'CREATE_STATE':
            if (payload?.force && states.has(stateName)) {
                console.warn(`[Worker] Force-recreating state: ${stateName}`);
                states.get(stateName).destroy();
                states.delete(stateName);
            }

            if (!states.has(stateName)) {
                console.log(`[Worker] Created Logic for: ${stateName}`);
                let instance;
                if (stateName === 'Game1') instance = new Game1Logic();
                if (stateName === 'Game2') instance = new Game2Logic();

                if (instance) {
                    states.set(stateName, instance);
                    if (sharedBuffer) instance.setBuffer(sharedBuffer);
                } else {
                    console.error(`[Worker] Failed to create logic instance for: ${stateName}`);
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
            const target = states.get(stateName);
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
            if (logic && sharedView && intView) {
                logic.update(sharedView, intView, frameCount, fps);
            }
            break;

        default:
            console.warn(`[Worker] Unhandled message type: ${type}`);
            break;
    }
};