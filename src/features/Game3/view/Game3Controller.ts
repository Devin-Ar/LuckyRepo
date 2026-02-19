// src/features/Game3/view/Game3Controller.ts
import { BaseController } from "../../../core/templates/BaseController";
import { Game3Presenter } from "./Game3Presenter";
import { StateManager } from "../../../core/managers/StateManager";
import { CampaignManager } from "../../../core/managers/CampaignManager";
import { Game3Level } from "../model/Game3Config";
import { SaveManager } from "../../../core/managers/SaveManager";
import { MapParser } from "../logic/MapParser";
import { MapGenerator } from "../logic/MapGenerator";
import { ParsedMapData } from "../data/Game3MapData";
import { InputManager } from "../../../core/managers/InputManager";
import { StateRegistry } from "../../../core/registry/StateRegistry";
import { FeatureEnum } from "../../FeatureEnum";

export class Game3Controller extends BaseController<Game3Presenter> {
    private currentLevel: Game3Level = Game3Level.Level1;
    private hasCompleted: boolean = false;

    constructor(vm: Game3Presenter) {
        super(vm, FeatureEnum.GAME_3);
    }

    protected onWorkerEvent(name: string, payload?: any): void {
        switch (name) {
            case 'LEVEL_COMPLETE':
                if (!this.hasCompleted) {
                    this.hasCompleted = true;
                    this.handleLevelComplete();
                }
                break;

            case 'MAP_DATA_PRODUCED':
                console.log("[Game3Controller] Worker confirmed map data ingestion.");
                break;
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const input = InputManager.getInstance();
        if (input.isKeyAction(e.key, "PAUSE")) {
            this.openPauseMenu();
        }
    }

    /**
     * Initializes the game. Map parsing stays on the main thread
     * to utilize Canvas/Image APIs, then pure data is sent to the worker.
     */
    public async initialize(config: any, level: Game3Level = Game3Level.Level1) {
        this.currentLevel = level;
        this.hasCompleted = false;

        InputManager.getInstance().refreshBindings("Game3");

        try {
            this.send('INITIALIZE', config);

            let parsedData: ParsedMapData;
            if (config.mapPath) {
                try {
                    parsedData = await MapParser.parseMap(config.mapPath, config.mapScale ?? 1);
                } catch (e) {
                    console.warn("[Game3Controller] Map parse failed, falling back to generator.", e);
                    parsedData = MapGenerator.generateDefaultMap();
                }
            } else {
                parsedData = MapGenerator.generateDefaultMap();
            }
            this.send('SET_MAP_DATA', parsedData);

        } catch (e) {
            console.error("[Game3Controller] Critical initialization failure:", e);
        }
    }

    public modifyHP(amount: number) {
        this.send('MOD_HP', { amount });
    }

    public async loadLevel(level: Game3Level) {
        const target = await StateRegistry.create(FeatureEnum.GAME_3, { reset: false, level });
        await StateManager.getInstance().replace(target);
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);

        const target = await StateRegistry.create(FeatureEnum.GAME_3, {
            reset: false,
            level: this.currentLevel
        });
        await StateManager.getInstance().replace(target);
    }

    private handleLevelComplete(): void {
            CampaignManager.getInstance().completeCurrentStep();
    }

    private async openPauseMenu() {
        const manager = StateManager.getInstance();
        if (manager.getCurrentStateName() === this.stateName) {
            const target = await StateRegistry.create(FeatureEnum.PAUSE_MENU);
            await manager.push(target);
        }
    }
}