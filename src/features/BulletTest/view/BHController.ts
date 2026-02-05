// src/features/Game1/view/Game1Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {BHPresenter} from "./BHPresenter";
import {StateManager} from "../../../core/managers/StateManager";
import {AudioManager} from "../../../core/managers/AudioManager";
import {BHLevel} from "../model/BHConfig";
import {SaveManager} from "../../../core/managers/SaveManager";
import {InputManager} from "../../../core/managers/InputManager";

export class BHController extends BaseController<BHPresenter> {
    constructor(vm: BHPresenter) {
        super(vm, "BHTest");
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public async jumpToGame2() {
        const {Game2State} = await import("../../Game2/model/Game2State");
        await StateManager.getInstance().replace(new Game2State(false));
    }

    public async loadLevel(level: BHLevel) {
        const {BHState} = await import("../model/BHState");
        await StateManager.getInstance().replace(new BHState(false, level));
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);
        const {BHState} = await import("../model/BHState");
        const currentLevel = (this.vm as any).currentLevel || BHLevel.Level1;
        await StateManager.getInstance().replace(new BHState(false, currentLevel));
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const input = InputManager.getInstance();
        if (input.isKeyAction(e.key, 'PAUSE')) {
            this.openPauseMenu();
        }
    }

    protected onWorkerEvent(name: string): void {
        if (name === 'EXPLOSION_REQ') {
            AudioManager.getInstance().play('sfx_explosion');
        }
    }

    private async openPauseMenu() {
        const {PauseMenuState} = await import("../../shared-menus/states/PauseMenuState");
        const manager = StateManager.getInstance();
        if (manager.getCurrentStateName() === this.stateName) {
            await manager.push(new PauseMenuState());
        }
    }
}