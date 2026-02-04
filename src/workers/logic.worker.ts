import {Game1Logic} from '../features/Game1/logic/Game1Logic';
import {Game2Logic} from '../features/Game2/logic/Game2Logic';
import {BHTestLogic} from '../features/BulletTest/logic/BHTestLogic';

const sharedBuffers: Map<string, SharedArrayBuffer> = new Map();
const sharedViews: Map<string, Float32Array> = new Map();
const intViews: Map<string, Int32Array> = new Map();

const states: Map<string, any> = new Map();

self.onmessage = (e: MessageEvent) => {
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
                if (stateName === 'BHTest') instance = new BHTestLogic();

                if (instance) {
                    states.set(stateName, instance);
                    if (sharedBuffers.size > 0) {
                        const bufferRecord: Record<string, SharedArrayBuffer> = {};
                        sharedBuffers.forEach((buf, key) => bufferRecord[key] = buf);
                        instance.setBuffers(bufferRecord);
                    }
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
            if (logic && sharedViews.size > 0) {
                logic.update(sharedViews, intViews, frameCount, fps);
            }
            break;

        default:
            console.warn(`[Worker] Unhandled message type: ${type}`);
            break;
    }
};