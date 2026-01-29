// src/features/Game3/view/Game3Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {Game3Presenter} from "./Game3Presenter";
import {StateManager} from "../../../core/managers/StateManager";
import {Game3Level} from "../model/Game3Config";
import {SaveManager} from "../../../core/managers/SaveManager";

export class Game3Controller extends BaseController<Game3Presenter> {
    constructor(vm: Game3Presenter) {
        super(vm, "Game3");
    }

    public modifyStat(action: 'MOD_HP' | 'MOD_ENERGY' | 'ADD_SCRAP', amount?: number) {
        this.send(action, {amount});
    }

    public async jumpToGame1() {
        const {Game1State} = await import("../../Game1/model/Game1State");
        StateManager.getInstance().replace(new Game1State(false));
    }

    public async loadLevel(level: Game3Level) {
        const {Game3State} = await import("../model/Game3State");
        StateManager.getInstance().replace(new Game3State(false, level));
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.RESET_SLOT);
        const {Game3State} = await import("../model/Game3State");
        // Fallback to Level 1 if we can't determine current level easily
        StateManager.getInstance().replace(new Game3State(false, Game3Level.Level1));
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
            this.handleEscape();
        }
    }

    protected onWorkerEvent(name: string, payload: any): void {
        if (name === 'MAP_LOADED') {
            this.vm.mapData = payload;
        }
    }

    private async handleEscape() {
        const {PauseMenuState} = await import("../../shared-menus/states/PauseMenuState");
        StateManager.getInstance().push(new PauseMenuState());
    }
}
