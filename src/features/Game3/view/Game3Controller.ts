// src/features/Game3/view/Game3Controller.ts
import { BaseController } from "../../../core/templates/BaseController";
import { Game3Presenter } from "./Game3Presenter";
import { StateManager } from "../../../core/managers/StateManager";
import { CampaignManager } from "../../../core/managers/CampaignManager";
import { SharedSession } from "../../../core/session/SharedSession";
import { Game3Level } from "../model/Game3Config";
import { SaveManager } from "../../../core/managers/SaveManager";
import { MapParser } from "../logic/MapParser";
import { MapGenerator } from "../logic/MapGenerator";
import { ParsedMapData } from "../data/Game3MapData";
import { InputManager } from "../../../core/managers/InputManager";
import { StateRegistry } from "../../../core/registry/StateRegistry";
import { StateId } from "../../../core/registry/StateId";

export class Game3Controller extends BaseController<Game3Presenter> {
    private currentLevel: Game3Level = Game3Level.Level1;
    private hasCompleted: boolean = false;

    constructor(vm: Game3Presenter) {
        super(vm, StateId.GAME_3);
    }

    protected onWorkerEvent(name: string, payload?: any): void {
        if (name === 'LEVEL_COMPLETE' && !this.hasCompleted) {
            this.hasCompleted = true;
            this.handleLevelComplete();
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const input = InputManager.getInstance();
        if (input.isKeyAction(e.key, "PAUSE")) {
            this.openPauseMenu();
        }
    }

    /**
     * Heavy lifting (Image Parsing) happens here on Main Thread
     * to avoid Worker limitations with DOM/Canvas.
     */
    public async initialize(config: any, level: Game3Level = Game3Level.Level1) {
        this.currentLevel = level;

        // Ensure the input manager is switched to this game's context
        InputManager.getInstance().refreshBindings("Game3");

        try {
            this.send('INITIALIZE', config);

            let parsedData: ParsedMapData;

            if (config.mapPath) {
                try {
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
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);

        const currentLevel = (this.vm as any).currentLevel || Game3Level.Level1;
        const target = StateRegistry.create(StateId.GAME_1, { reset: false, level: currentLevel });
        await StateManager.getInstance().replace(target);
    }

    private handleLevelComplete(): void {
        console.log(`[Game3Controller] Level complete (${this.currentLevel}).`);

        if (this.isInCampaign()) {
            CampaignManager.getInstance().completeCurrentStep();
        } else {
            // Standalone / dev menu play: advance to next G3 level
            const levelOrder: (Game3Level | null)[] = [
                Game3Level.Level2,  // after Level1
                Game3Level.Level3,  // after Level2
                Game3Level.Level4,  // after Level3
                null,               // after Level4 → menu
            ];

            const currentIndex = [
                Game3Level.Level1, Game3Level.Level2,
                Game3Level.Level3, Game3Level.Level4
            ].indexOf(this.currentLevel);

            const next = levelOrder[currentIndex] ?? null;

            if (next) {
                this.loadLevel(next);
            } else {
                StateManager.getInstance().replace(StateRegistry.create(StateId.DEV_MENU));
            }
        }
    }

    /** Check if we're currently inside a campaign run */
    private isInCampaign(): boolean {
        const campaignId = SharedSession.getInstance().get<string>('campaign_id');
        return !!campaignId;
    }

    private async openPauseMenu() {
        const manager = StateManager.getInstance();
        if (manager.getCurrentStateName() === this.stateName) {
            await manager.push(StateRegistry.create(StateId.PAUSE_MENU));
        }
    }
}