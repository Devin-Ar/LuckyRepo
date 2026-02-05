// src/features/Game3/view/Game3Controller.ts
import { BaseController } from "../../../core/templates/BaseController";
import { Game3Presenter } from "./Game3Presenter";
import { StateManager } from "../../../core/managers/StateManager";
import { Game3Level } from "../model/Game3Config";
import { SaveManager } from "../../../core/managers/SaveManager";
import { MapParser } from "../logic/MapParser";
import { MapGenerator } from "../logic/MapGenerator";
import { ParsedMapData } from "../data/Game3MapData";

export class Game3Controller extends BaseController<Game3Presenter> {
    private currentLevel: Game3Level = Game3Level.Level1;

    constructor(vm: Game3Presenter) {
        super(vm, "Game3");
    }

    protected onWorkerEvent(name: string, payload: any): void {
        switch (name) {
            case 'LOGIC_READY':
                console.log("[Game3Controller] Worker logic is synchronized.");
                break;
            case 'LEVEL_COMPLETE':
                this.handleLevelComplete();
                break;
            default:
                console.warn(`[Game3Controller] Unhandled worker event: ${name}`);
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Escape') this.handleEscape();
    }

    config: any, currentLevel: Game3Level
    /**
     * Heavy lifting (Image Parsing) happens here on Main Thread
     * to avoid Worker limitations with DOM/Jimp.
     */
    public async initialize(config: any, level: Game3Level = Game3Level.Level1) {
        this.currentLevel = level;
        try {
            this.send('INITIALIZE', config);

            let parsedData: ParsedMapData;

            if (config.mapPath) {
                try {
                    // Parse map image to pure JSON data
                    parsedData = await MapParser.parseMap(config.mapPath, config.mapScale ?? 1);
                    console.log("[Game3Controller] Map parsed successfully.");
                } catch (e) {
                    console.error("[Game3Controller] Map parsing failed, using generator fallback:", e);
                    parsedData = MapGenerator.generateDefaultMap();
                }
            } else {
                console.log("[Game3Controller] No mapPath provided, generating default world.");
                parsedData = MapGenerator.generateDefaultMap();
            }

            // Send pure data to worker
            this.send('SET_MAP_DATA', parsedData);

            // Update View for debugging/rendering
            this.vm.mapData = parsedData;
            console.log("[Game3Controller] Map data sent to worker.");
        } catch (e) {
            console.error("[Game3Controller] Critical initialization failure:", e);
        }
    }

    // --- Actions ---
    public modifyHP(amount: number) {
        this.send('MOD_HP', { amount });
    }

    public async loadLevel(level: Game3Level) {
        const { Game3State } = await import("../model/Game3State");
        StateManager.getInstance().replace(new Game3State(false, level));
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.RESET_SLOT);
        const { Game3State } = await import("../model/Game3State");
        StateManager.getInstance().replace(new Game3State(false, this.currentLevel));
    }

    private async handleEscape() {
        const { PauseMenuState } = await import("../../shared-menus/states/PauseMenuState");
        StateManager.getInstance().push(new PauseMenuState());
    }

    private handleLevelComplete() {
        const levels = Object.values(Game3Level);
        const currentIndex = levels.indexOf(this.currentLevel);
        if (currentIndex !== -1 && currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            console.log(`[Game3Controller] Level complete! Loading ${nextLevel}`);
            this.loadLevel(nextLevel as Game3Level);
        } else {
            console.log("[Game3Controller] All levels complete!");
            // Optionally wrap around or go to a victory screen. 
            // For now, let's just reload level 1 or do nothing.
            this.loadLevel(Game3Level.Level1);
        }
    }
}
