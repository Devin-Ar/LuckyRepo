// src/features/Game1/view/Game1Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {BHPresenter} from "./BHPresenter";
import {StateManager} from "../../../core/managers/StateManager";
import {AudioManager} from "../../../core/managers/AudioManager";
import {BHLevel} from "../model/BHConfig";
import {SaveManager} from "../../../core/managers/SaveManager";
import {InputManager} from "../../../core/managers/InputManager";
import {StateRegistry} from "../../../core/registry/StateRegistry";
import {StateId} from "../../../core/registry/StateId";

export class BHController extends BaseController<BHPresenter> {
    constructor(vm: BHPresenter) {
        super(vm, StateId.BH_GAME);
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public async jumpToGame2() {
        const target = StateRegistry.create(StateId.GAME_2, { reset: false });
        await StateManager.getInstance().replace(target);
    }

    public async loadLevel(level: BHLevel) {
        const target = StateRegistry.create(StateId.BH_GAME, { reset: false, level });
        await StateManager.getInstance().replace(target);
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);
        const currentLevel = (this.vm as any).currentLevel || BHLevel.Level1;
        const target = StateRegistry.create(StateId.GAME_1, { reset: false, level: currentLevel });
        await StateManager.getInstance().replace(target);
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
        const manager = StateManager.getInstance();
        if (manager.getCurrentStateName() === this.stateName) {
            await manager.push(StateRegistry.create(StateId.PAUSE_MENU));
        }
    }
}