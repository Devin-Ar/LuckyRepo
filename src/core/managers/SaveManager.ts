// src/core/managers/SaveManager.ts
import {db, GameSave} from '../session/SaveDatabase';
import {WorkerManager} from './WorkerManager';
import {SharedSession} from '../session/SharedSession';

import {ViewWorkerManager} from "./ViewWorkerManager";

export class SaveManager {
    private static instance: SaveManager;

    public static getInstance() {
        if (!SaveManager.instance) SaveManager.instance = new SaveManager();
        return SaveManager.instance;
    }

    public async performSave(slotId: number, stateName: string): Promise<void> {
        const logicWorker = WorkerManager.getInstance();
        const viewWorker = ViewWorkerManager.getInstance();
        const session = SharedSession.getInstance();

        const logicSnapshot = await this.requestSnapshot(logicWorker.logic, stateName);

        const viewSnapshot = await this.requestSnapshot(viewWorker.worker, stateName);

        const saveData: GameSave = {
            id: slotId,
            stateName,
            timestamp: Date.now(),
            preview: `Save ${new Date().toLocaleTimeString()}`,
            sessionData: session.exportSaveData(),
            logicSnapshot: logicSnapshot,
            viewSnapshot: viewSnapshot
        };

        await db.saves.put(saveData);
    }

    public async performLoad(slotId: number): Promise<GameSave> {
        const save = await db.saves.get(slotId);
        if (!save) throw new Error("Save not found");

        const session = SharedSession.getInstance();
        const logicWorker = WorkerManager.getInstance();
        const viewWorker = ViewWorkerManager.getInstance();

        session.lockForLoad();

        session.clearSavableKeys();
        session.importSaveData(save.sessionData);

        logicWorker.prepareForState(save.stateName);
        logicWorker.createState(save.stateName);
        logicWorker.sendInput(save.stateName, 'LOAD_SNAPSHOT', {data: save.logicSnapshot});

        viewWorker.prepareForState(save.stateName);
        viewWorker.createState(save.stateName);
        viewWorker.loadSnapshot(save.stateName, (save as any).viewSnapshot);

        logicWorker.isInitialized = true;
        viewWorker.isInitialized = true;

        return save;
    }

    private requestSnapshot(worker: Worker, stateName: string): Promise<any> {
        return new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => {
                channel.port1.close();
                resolve(e.data);
            };
            worker.postMessage({
                type: 'INPUT',
                stateName,
                payload: {action: 'GET_SNAPSHOT'}
            }, [channel.port2]);
        });
    }
}