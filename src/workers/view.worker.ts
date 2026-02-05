// src/workers/view.worker.ts
//import {Game1ViewLogic} from '../features/Game1/view/Game1ViewLogic';
//import {Game2ViewLogic} from '../features/Game2/view/Game2ViewLogic';
import {Game3ViewLogic} from '../features/Game3/view/Game3ViewLogic';

let logicView: Float32Array;
let logicIntView: Int32Array;

let outputView: Float32Array;

const states: Map<string, any> = new Map();

self.onmessage = (e: MessageEvent) => {
    const {type, stateName, payload, dt, frameCount} = e.data;

    switch (type) {
        case 'INIT_SABS':
            console.log(`[ViewWorker] Initializing Buffers`);

            const inputBuffer = payload.inputBuffer;
            logicView = new Float32Array(inputBuffer);
            logicIntView = new Int32Array(inputBuffer);

            const outputBuffer = payload.outputBuffer;
            outputView = new Float32Array(outputBuffer);

            states.forEach((state) => {
                if (typeof state.setBuffers === 'function') {
                    state.setBuffers(logicView, logicIntView, outputView);
                }
            });
            break;

        case 'CREATE_STATE':
            if (!states.has(stateName)) {
                console.log(`[ViewWorker] Created ViewLogic for: ${stateName}`);
                let instance;

                //if (stateName === 'Game1') instance = new Game1ViewLogic();
                //if (stateName === 'Game2') instance = new Game2ViewLogic();
                if (stateName === 'Game3') instance = new Game3ViewLogic();

                if (instance) {
                    states.set(stateName, instance);
                    if (logicView && outputView) {
                        instance.setBuffers(logicView, logicIntView, outputView);
                    }
                }
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

        case 'TICK':
            const logic = states.get(stateName);
            if (logic && logicView && outputView) {
                logic.update(dt, frameCount);
            }
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