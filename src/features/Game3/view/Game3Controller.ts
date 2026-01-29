// src/features/Game3/view/Game3Controller.ts
import { BaseController } from "../../../core/templates/BaseController";
import { Game3Presenter } from "./Game3Presenter";
import { StateManager } from "../../../core/managers/StateManager";
import { Game3Level } from "../model/Game3Config";
import { SaveManager } from "../../../core/managers/SaveManager";
import { MapParser } from "../logic/MapParser";
import { ParsedMapData } from "../data/Game3MapData";

export class Game3Controller extends BaseController<Game3Presenter> {
    constructor(vm: Game3Presenter) {
        super(vm, "Game3");
    }

    protected onWorkerEvent(name: string, payload: any): void {
        switch (name) {
            case 'LOGIC_READY':
                console.log("[Game3Controller] Worker logic is synchronized.");
                break;
            default:
                console.warn(`[Game3Controller] Unhandled worker event: ${name}`);
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Escape') this.handleEscape();
    }

    /**
     * Heavy lifting (Image Parsing) happens here on Main Thread
     * to avoid Worker limitations with DOM/Jimp.
     */
    public async initialize(config: any) {
        if (config.mapPath) {
            try {
                this.send('INITIALIZE', config);

                // Parse map image to pure JSON data
                const parsedData: ParsedMapData = await MapParser.parseMap(config.mapPath);

                // Send pure data to worker
                this.send('SET_MAP_DATA', parsedData);

                // Update View for debugging/rendering
                this.vm.mapData = parsedData;
                console.log("[Game3Controller] Map parsed and sent to worker.");
            } catch (e) {
                console.error("[Game3Controller] Initialization failed:", e);
            }
        }
    }

    // --- Actions ---
    public modifyStat(action: 'MOD_HP' | 'MOD_ENERGY' | 'ADD_SCRAP', amount?: number) {
        this.send(action, { amount });
    }

    public async loadLevel(level: Game3Level) {
        const { Game3State } = await import("../model/Game3State");
        StateManager.getInstance().replace(new Game3State(false, level));
    }

    public async jumpToGame1() {
        const { Game1State } = await import("../../Game1/model/Game1State");
        StateManager.getInstance().replace(new Game1State(false));
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.RESET_SLOT);
        const { Game3State } = await import("../model/Game3State");
        StateManager.getInstance().replace(new Game3State(false, Game3Level.Level1));
    }

    private async handleEscape() {
        const { PauseMenuState } = await import("../../shared-menus/states/PauseMenuState");
        StateManager.getInstance().push(new PauseMenuState());
    }
}