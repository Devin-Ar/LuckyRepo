// src/core/session/SaveDatabase.ts
import Dexie, {Table} from 'dexie';

export interface GameSave {
    id?: number;
    stateName: string;
    timestamp: number;
    preview: string;

    campaignId?: string;
    campaignIndex?: number;

    sessionData: any;
    logicSnapshot: any;
    viewSnapshot: any;
}

export class SaveDatabase extends Dexie {
    saves!: Table<GameSave>;

    constructor() {
        super('GameEngineDB');
        this.version(1).stores({
            saves: '++id, stateName, timestamp'
        });
    }
}

export const db = new SaveDatabase();