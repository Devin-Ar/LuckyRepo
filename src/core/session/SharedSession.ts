// src/core/session/SharedSession.ts

export class SharedSession {
    private static instance: SharedSession;
    private data: Map<string, any> = new Map();
    private isWriteLocked: boolean = false;

    private readonly STORAGE_KEY = 'engine_settings_global';

    private readonly PERSISTENT_KEYS = [
        'resolution',
        'master_volume',
        'ost_volume',
        'sfx_volume'
    ];

    private readonly SAVABLE_KEYS = [
        'global_hp',
        'global_energy',
        'campaign_id',
        'campaign_step_index'
    ];

    private constructor() {
        this.data.set('master_volume', 0.5);
        this.data.set('ost_volume', 0.5);
        this.data.set('sfx_volume', 0.5);
        this.data.set('resolution', '1080p');

        this.loadFromLocalStorage();
    }

    public static getInstance(): SharedSession {
        if (!SharedSession.instance) {
            SharedSession.instance = new SharedSession();
        }
        return SharedSession.instance;
    }

    public exportSaveData(): Record<string, any> {
        const toSave: Record<string, any> = {};
        this.SAVABLE_KEYS.forEach(key => {
            if (this.data.has(key)) {
                toSave[key] = this.data.get(key);
            }
        });
        return toSave;
    }

    public importSaveData(saveData: Record<string, any>): void {
        this.SAVABLE_KEYS.forEach(key => {
            if (saveData[key] !== undefined) {
                this.forceSet(key, saveData[key]);
            }
        });
    }

    public set<T>(key: string, value: T): void {
        if (this.isWriteLocked && this.SAVABLE_KEYS.includes(key)) {
            console.warn(`[SharedSession] Blocked stale write to ${key} during lock.`);
            return;
        }

        this.data.set(key, value);

        if (this.PERSISTENT_KEYS.includes(key) || key.startsWith('bind_')) {
            this.saveToLocalStorage();
        }
    }

    public get<T>(key: string, defaultValue?: T): T | undefined {
        return this.data.has(key) ? (this.data.get(key) as T) : defaultValue;
    }

    public clearSavableKeys(): void {
        this.SAVABLE_KEYS.forEach(key => {
            this.data.delete(key);
        });
    }

    public forceSet(key: string, value: any): void {
        this.data.set(key, value);
    }

    public lockForLoad(): void {
        this.isWriteLocked = true;
    }

    public unlock(): void {
        this.isWriteLocked = false;
    }

    private loadFromLocalStorage(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.entries(parsed).forEach(([k, v]) => {
                    if (this.PERSISTENT_KEYS.includes(k) || k.startsWith('bind_')) {
                        this.data.set(k, v);
                    }
                });
            }
        } catch (e) {
            console.warn("[SharedSession] Persistence load failed", e);
        }
    }

    private saveToLocalStorage(): void {
        const toSave: Record<string, any> = {};
        this.data.forEach((val, key) => {
            if (this.PERSISTENT_KEYS.includes(key) || key.startsWith('bind_')) {
                toSave[key] = val;
            }
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave));
    }
}