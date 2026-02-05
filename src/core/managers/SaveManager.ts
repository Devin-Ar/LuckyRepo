// src/core/managers/SaveManager.ts
import {db, GameSave} from '../session/SaveDatabase';
import {WorkerManager} from './WorkerManager';
import {SharedSession} from '../session/SharedSession';
import {ViewWorkerManager} from "./ViewWorkerManager";

export const SAVE_EXTENSION = '.brsv';

export class SaveManager {
    private static instance: SaveManager;

    public static getInstance() {
        if (!SaveManager.instance) SaveManager.instance = new SaveManager();
        return SaveManager.instance;
    }

    public async performSave(saveName: string, stateName: string): Promise<void> {
        const logicWorker = WorkerManager.getInstance();
        const viewWorker = ViewWorkerManager.getInstance();
        const session = SharedSession.getInstance();

        const logicSnapshot = await this.requestSnapshot(logicWorker.logic, stateName);

        const viewSnapshot = await this.requestSnapshot(viewWorker.worker, stateName);

        const campaignId = session.get<string>('campaign_id');
        const campaignIndex = session.get<number>('campaign_step_index');

        const saveData: GameSave = {
            saveName: saveName,
            stateName,
            timestamp: Date.now(),
            preview: `Save ${new Date().toLocaleTimeString()}`,

            campaignId: campaignId || undefined,
            campaignIndex: campaignIndex !== undefined ? campaignIndex : undefined,

            sessionData: session.exportSaveData(),
            logicSnapshot: logicSnapshot,
            viewSnapshot: viewSnapshot
        };

        await db.saves.put(saveData);
    }

    public async performLoad(saveName: string): Promise<GameSave> {
        const save = await db.saves.get(saveName);
        if (!save) throw new Error(`Save '${saveName}' not found`);

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

    public async deleteSave(saveName: string): Promise<void> {
        await db.saves.delete(saveName);
    }

    public async exportSave(saveName: string): Promise<string> {
        const save = await db.saves.get(saveName);
        if (!save) throw new Error("Save not found");
        return JSON.stringify(save, null, 2);
    }

    public async importSave(jsonContent: string): Promise<void> {
        try {
            const data = JSON.parse(jsonContent) as GameSave;
            if (!data.saveName || !data.stateName) {
                throw new Error("Invalid .brsv file format");
            }
            data.timestamp = Date.now();
            await db.saves.put(data);
        } catch (e) {
            console.error("Failed to import .brsv", e);
            throw e;
        }
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