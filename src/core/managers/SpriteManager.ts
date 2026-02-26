// src/core/managers/SpriteManager.ts
import * as PIXI from 'pixi.js';

export class SpriteManager {
    private static instance: SpriteManager;
    private textures: Map<string, PIXI.Texture> = new Map();
    private animations: Map<string, PIXI.Texture[]> = new Map();

    private stateAssets: Map<string, Set<string>> = new Map();

    public static getInstance() {
        if (!this.instance) this.instance = new SpriteManager();
        return this.instance;
    }

    public async loadManifest(url: string, stateName: string, onProgress?: (percent: number) => void) {
        if (this.stateAssets.has(stateName) && this.stateAssets.get(stateName)!.size > 0) {
            if (onProgress) onProgress(1);
            return;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`[SpriteManager] Failed to fetch manifest: ${url} (Status: ${response.status})`);
        }

        const data = await response.json();

        if (!this.stateAssets.has(stateName)) {
            this.stateAssets.set(stateName, new Set());
        }
        const currentStateKeys = this.stateAssets.get(stateName)!;

        const totalItems = Object.keys(data.spritesheets || {}).length + Object.keys(data.images || {}).length;
        let loadedItems = 0;

        const updateProgress = () => {
            loadedItems++;
            if (onProgress) onProgress(loadedItems / totalItems);
        };

        for (const [sheetName, config] of Object.entries(data.spritesheets || {}) as any) {
            const baseTexture = await PIXI.Assets.load(config.url);

            currentStateKeys.add(config.url);

            for (const [frameName, rect] of Object.entries(config.frames || {}) as any) {
                const frame = new PIXI.Texture(
                    baseTexture,
                    new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h)
                );
                this.textures.set(frameName, frame);
                currentStateKeys.add(frameName);
            }

            for (const [animName, frameList] of Object.entries(config.animations || {}) as any) {
                const animKey = `${sheetName}_${animName}`;
                const frames = (frameList as string[])
                    .map(f => this.textures.get(f))
                    .filter((t): t is PIXI.Texture => !!t);

                this.animations.set(animKey, frames);
                currentStateKeys.add(animKey);
            }
            updateProgress();
        }

        if (data.images) {
            for (const [name, path] of Object.entries(data.images) as any) {
                const texture = await PIXI.Assets.load(path);
                this.textures.set(name, texture);
                currentStateKeys.add(name);
                currentStateKeys.add(path);
                updateProgress();
            }
        }
    }

    public uncacheByState(stateName: string) {
        const keys = this.stateAssets.get(stateName);
        if (!keys) return;

        keys.forEach(key => {
            if (key.includes('.') || key.includes('/')) {
                PIXI.Assets.unload(key);
            }

            this.textures.delete(key);
            this.animations.delete(key);
        });

        this.stateAssets.delete(stateName);
    }

    public getTexture(name: string): PIXI.Texture {
        return this.textures.get(name) || PIXI.Texture.WHITE;
    }

    public getAnimation(name: string): PIXI.Texture[] {
        return this.animations.get(name) || [];
    }
}