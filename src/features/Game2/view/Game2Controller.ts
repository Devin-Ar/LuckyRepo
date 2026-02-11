// src/states/Game2/view/Game2Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {Game2Presenter} from "./Game2Presenter";
import {StateManager} from "../../../core/managers/StateManager";
import {Game2Level} from "../model/Game2Config";
import {SaveManager} from "../../../core/managers/SaveManager";
import {CampaignManager} from "../../../core/managers/CampaignManager";
import {InputManager} from "../../../core/managers/InputManager";
import {StateRegistry} from "../../../core/registry/StateRegistry";
import {StateId} from "../../../core/registry/StateId";

export class Game2Controller extends BaseController<Game2Presenter> {
    constructor(vm: Game2Presenter) {
        super(vm, StateId.GAME_2);
    }

    public modifyStat(action: 'MOD_HP' | 'MOD_ENERGY' | 'ADD_SCRAP', amount?: number) {
        this.send(action, {amount});
    }

    public async jumpToGame1() {
        const target = StateRegistry.create(StateId.GAME_1, { reset: false });
        StateManager.getInstance().replace(target);
    }

    public async loadLevel(level: Game2Level) {
        const target = StateRegistry.create(StateId.GAME_2, { reset: false, level });
        StateManager.getInstance().replace(target);
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);
        const currentLevel = (this.vm as any).currentLevel || Game2Level.Level1;
        const target = StateRegistry.create(StateId.GAME_2, { reset: false, level: currentLevel });
        StateManager.getInstance().replace(target);
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (InputManager.getInstance().isKeyAction(e.key, 'PAUSE')) {
            this.handleEscape();
        }
    }

    protected onWorkerEvent(name: string): void {}

    private async handleEscape() {
        StateManager.getInstance().push(StateRegistry.create(StateId.PAUSE_MENU));
    }

    public nextLevel() {
        CampaignManager.getInstance().completeCurrentStep();
    }

    public failLevel() {
        CampaignManager.getInstance().failCurrentStep();
    }
}