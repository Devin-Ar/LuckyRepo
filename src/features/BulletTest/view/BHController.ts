// src/features/BulletTest/view/BHController.ts
import {BaseController} from "../../../core/templates/BaseController";
import {BHPresenter} from "./BHPresenter";
import {StateManager} from "../../../core/managers/StateManager";
import {AudioManager} from "../../../core/managers/AudioManager";
import {CampaignManager} from "../../../core/managers/CampaignManager";
import {BHLevel} from "../model/BHConfig";
import {SaveManager} from "../../../core/managers/SaveManager";
import {InputManager} from "../../../core/managers/InputManager";
import {StateRegistry} from "../../../core/registry/StateRegistry";
import {FeatureEnum} from "../../FeatureEnum";

export class BHController extends BaseController<BHPresenter> {
    private isDead: boolean = false;
    private hasExited: boolean = false;

    constructor(vm: BHPresenter) {
        super(vm, FeatureEnum.BH_GAME);
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public async jumpToGame2() {
        const target = await StateRegistry.create(FeatureEnum.GAME_2, { reset: false });
        await StateManager.getInstance().replace(target);
    }

    public async loadLevel(level: BHLevel) {
        const target = await StateRegistry.create(FeatureEnum.BH_GAME, { reset: false, level });
        await StateManager.getInstance().replace(target);
    }

    public async resetLevel() {
        await SaveManager.getInstance().performLoad(this.QUICK_SAVE_KEY);
        const currentLevel = (this.vm as any).currentLevel || BHLevel.Level1;
        const target = await StateRegistry.create(FeatureEnum.BH_GAME, { reset: false, level: currentLevel });
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
        if (name === 'PLAYER_DEAD' && !this.isDead) {
            this.isDead = true;
            this.handlePlayerDeath();
        }
        if (name === 'EXIT_DOOR_ENTERED' && !this.hasExited) {
            this.hasExited = true;
            this.handleExitDoor();
        }
    }

    private handlePlayerDeath(): void {
        CampaignManager.getInstance().failCurrentStep();
    }

    private handleExitDoor(): void {
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