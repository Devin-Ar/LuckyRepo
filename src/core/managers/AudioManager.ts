// src/core/managers/AudioManager.ts
import {Howl} from 'howler';
import {SharedSession} from '../session/SharedSession';

export type AudioType = 'ost' | 'sfx';

export class AudioManager {
    private static instance: AudioManager;
    private sounds: Map<string, { howl: Howl, type: AudioType, baseVol: number }> = new Map();
    private stateAssets: Map<string, Set<string>> = new Map();

    private volumes = {master: 1.0, ost: 0.7, sfx: 1.0};

    private constructor() {
        const session = SharedSession.getInstance();
        this.volumes.master = session.get<number>('master_volume', 1.0) ?? 1.0;
        this.volumes.ost = session.get<number>('ost_volume', 0.7) ?? 0.7;
        this.volumes.sfx = session.get<number>('sfx_volume', 1.0) ?? 1.0;
    }

    public static getInstance() {
        if (!this.instance) this.instance = new AudioManager();
        return this.instance;
    }

    public async loadManifest(url: string, stateName: string) {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.audio) return;

        if (!this.stateAssets.has(stateName)) this.stateAssets.set(stateName, new Set());
        const currentStateKeys = this.stateAssets.get(stateName)!;

        Object.entries(data.audio).forEach(([name, config]: [string, any]) => {
            if (this.sounds.has(name)) return;

            const howl = new Howl({
                src: [config.url],
                loop: config.loop || false,
                volume: config.volume * this.volumes[config.type as AudioType] * this.volumes.master,
                html5: config.type === 'ost'
            });

            this.sounds.set(name, {
                howl,
                type: config.type as AudioType,
                baseVol: config.volume || 1.0
            });
            currentStateKeys.add(name);
        });
    }

    public play(name: string) {
        const s = this.sounds.get(name);
        if (s) s.howl.play();
    }

    public stop(name: string) {
        this.sounds.get(name)?.howl.stop();
    }

    public stopAllByState(stateName: string) {
        const keys = this.stateAssets.get(stateName);
        if (!keys) return;
        keys.forEach(key => this.sounds.get(key)?.howl.stop());
    }

    public uncacheByState(stateName: string) {
        const keys = this.stateAssets.get(stateName);
        if (!keys) return;
        keys.forEach(key => {
            const data = this.sounds.get(key);
            if (data) {
                data.howl.stop();
                data.howl.unload();
                this.sounds.delete(key);
            }
        });
        this.stateAssets.delete(stateName);
    }

    public setVolume(category: 'master' | 'ost' | 'sfx', value: number) {
        this.volumes[category] = value;
        SharedSession.getInstance().set(`settings_${category}_vol`, value);
        this.sounds.forEach((data) => {
            const categoryVol = data.type === 'ost' ? this.volumes.ost : this.volumes.sfx;
            data.howl.volume(data.baseVol * categoryVol * this.volumes.master);
        });
    }

    public getVolumes() {
        return {...this.volumes};
    }
}