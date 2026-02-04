// src/features/Game1/view/Game1Controller.ts
import {BaseController} from "../../../core/templates/BaseController";
import {Game1Presenter} from "./Game1Presenter";
import {StateManager} from "../../../core/managers/StateManager";
import {AudioManager} from "../../../core/managers/AudioManager";
import {Game1Level} from "../model/Game1Config";
import {SaveManager} from "../../../core/managers/SaveManager";
import {CampaignManager} from "../../../core/managers/CampaignManager";
import {InputManager} from "../../../core/managers/InputManager";

export class Game1Controller extends BaseController<Game1Presenter> {
    constructor(vm: Game1Presenter) {
        super(vm, "Game1");
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public async jumpToGame2() {
        const {Game2State} = await import("../../Game2/model/Game2State");
        await StateManager.getInstance().replace(new Game2State(false));
    }

    public async loadLevel(level: Game1Level) {
        const {Game1State} = await import("../model/Game1State");
        await StateManager.getInstance().replace(new Game1State(false, level));
    }

    public nextLevel() {
        CampaignManager.getInstance().completeCurrentStep();
    }

    public failLevel() {
        CampaignManager.getInstance().failCurrentStep();
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.RESET_SLOT);
        const {Game1State} = await import("../model/Game1State");
        const currentLevel = (this.vm as any).currentLevel || Game1Level.Level1;
        await StateManager.getInstance().replace(new Game1State(false, currentLevel));
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