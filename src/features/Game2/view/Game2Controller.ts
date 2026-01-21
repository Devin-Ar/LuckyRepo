// src/states/Game2/view/Game2Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {Game2Presenter} from "./Game2Presenter";
import {StateManager} from "../../../core/managers/StateManager";
import {Game2Level} from "../model/Game2Config";
import {SaveManager} from "../../../core/managers/SaveManager";

export class Game2Controller extends BaseController<Game2Presenter> {
    constructor(vm: Game2Presenter) {
        super(vm, "Game2");
    }

    public modifyStat(action: 'MOD_HP' | 'MOD_ENERGY' | 'ADD_SCRAP', amount?: number) {
        this.send(action, {amount});
    }

    public async jumpToGame1() {
        const {Game1State} = await import("../../Game1/model/Game1State");
        StateManager.getInstance().replace(new Game1State(false));
    }

    public async loadLevel(level: Game2Level) {
        const {Game2State} = await import("../model/Game2State");
        StateManager.getInstance().replace(new Game2State(false, level));
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.RESET_SLOT);
        const {Game2State} = await import("../model/Game2State");
        const currentLevel = (this.vm as any).currentLevel || Game2Level.Level1;
        StateManager.getInstance().replace(new Game2State(false, currentLevel));
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
            this.handleEscape();
        }
    }

    protected onWorkerEvent(name: string): void {
    }

    private async handleEscape() {
        const {PauseMenuState} = await import("../../shared-menus/states/PauseMenuState");
        StateManager.getInstance().push(new PauseMenuState());
    }
}