// src/features/Game1/view/Game1Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {Game1Presenter} from "./Game1Presenter";
import {StateManager} from "../../../core/managers/StateManager";
import {AudioManager} from "../../../core/managers/AudioManager";
import {Game1Level} from "../model/Game1Config";
import {SaveManager} from "../../../core/managers/SaveManager";
import {CampaignManager} from "../../../core/managers/CampaignManager";
import {InputManager} from "../../../core/managers/InputManager";
import {StateRegistry} from "../../../core/registry/StateRegistry";
import {StateId} from "../../../core/registry/StateId";

export class Game1Controller extends BaseController<Game1Presenter> {
    constructor(vm: Game1Presenter) {
        super(vm, StateId.GAME_1);
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public async jumpToGame2() {
        const target = StateRegistry.create(StateId.GAME_2, { reset: false });
        await StateManager.getInstance().replace(target);
    }

    public async loadLevel(level: Game1Level) {
        const target = StateRegistry.create(StateId.GAME_1, { reset: false, level });
        await StateManager.getInstance().replace(target);
    }

    public nextLevel() {
        CampaignManager.getInstance().completeCurrentStep();
    }

    public failLevel() {
        CampaignManager.getInstance().failCurrentStep();
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);
        const currentLevel = (this.vm as any).currentLevel || Game1Level.Level1;
        const target = StateRegistry.create(StateId.GAME_1, { reset: false, level: currentLevel });
        await StateManager.getInstance().replace(target);
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (InputManager.getInstance().isKeyAction(e.key, 'PAUSE')) {
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