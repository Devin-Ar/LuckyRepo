// src/workers/view.worker.ts
import {Game1ViewLogic} from '../features/Game1/view/Game1ViewLogic';
import {Game2ViewLogic} from '../features/Game2/view/Game2ViewLogic';
import {BHViewLogic} from '../features/BulletTest/view/BHViewLogic';

const logicViews: Map<string, Float32Array> = new Map();
const logicIntViews: Map<string, Int32Array> = new Map();
const outputViews: Map<string, Float32Array> = new Map();
const states: Map<string, any> = new Map();

self.onmessage = (e: MessageEvent) => {
    const {type, stateName, payload, dt, frameCount} = e.data;

    switch (type) {
        case 'INIT_SABS':
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
                console.log(`[ViewWorker] Created ViewLogic for: ${stateName}`);
                let instance;

                if (stateName === 'Game1') instance = new Game1ViewLogic();
                if (stateName === 'Game2') instance = new Game2ViewLogic();
                if (stateName === 'BHTest') instance = new BHViewLogic();

                if (instance) {
                    states.set(stateName, instance);
                    instance.setBuffers(logicViews, logicIntViews, outputViews);
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
            const target = states.get(stateName);
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