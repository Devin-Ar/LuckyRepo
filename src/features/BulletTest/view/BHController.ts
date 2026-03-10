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
import {SharedSession} from "../../../core/session/SharedSession";
import {GLOBAL_SESSION_MAP} from "../../../core/session/GlobalSessionMap";

export class BHController extends BaseController<BHPresenter> {
    private isDead: boolean = false;
    private hasExited: boolean = false;

    constructor(vm: BHPresenter) {
        super(vm, FeatureEnum.BH_GAME);
    }

    public takeDamage() {
        this.send('TAKE_DAMAGE', {amount: 15});
    }

    public useItem() {
        this.send('USE_ITEM', {});
    }

    public pickupItem() {
        this.send('PICKUP_ITEM', {});
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
        // Q key to use held item
        if (e.key.toUpperCase() === 'Q') {
            this.useItem();
        }
        // E key to pick up item from floor
        if (e.key.toUpperCase() === 'E') {
            this.pickupItem();
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
        if (name === 'PLAYER_REVIVED') {
            // Life Totem triggered — play SFX, keep isDead false so game continues
            AudioManager.getInstance().play('sfx_explosion'); // reuse existing SFX for now
        }
        if (name === 'EXIT_DOOR_ENTERED' && !this.hasExited) {
            this.hasExited = true;
            this.handleExitDoor();
        }
        if (name === 'ITEM_PICKED_UP') {
            AudioManager.getInstance().play('sfx_explosion'); // reuse existing SFX for now
        }
        if (name === 'ITEM_USED') {
            AudioManager.getInstance().play('sfx_explosion'); // reuse existing SFX for now
        }
    }

    private handlePlayerDeath(): void {
        // Sync economy to session BEFORE failing so score screen shows correct values
        this.syncSessionBeforeTransition();
        CampaignManager.getInstance().failCurrentStep();
    }

    private handleExitDoor(): void {
        // Sync economy to session BEFORE completing so score screen shows correct values
        this.syncSessionBeforeTransition();
        CampaignManager.getInstance().completeCurrentStep();
    }

    /**
     * Write the presenter's current points/coins/hp/heldItem to SharedSession
     * so they are available to the score screen before BaseGameState.destroy() runs.
     */
    private syncSessionBeforeTransition(): void {
        const session = SharedSession.getInstance();
        const vm = this.vm as BHPresenter;
        session.set(GLOBAL_SESSION_MAP.points, vm.points);
        session.set(GLOBAL_SESSION_MAP.coins, vm.coins);
        session.set(GLOBAL_SESSION_MAP.hp, vm.hp);
        session.set(GLOBAL_SESSION_MAP.heldItem, vm.heldItem);
    }

    private async openPauseMenu() {
        const manager = StateManager.getInstance();
        if (manager.getCurrentStateName() === this.stateName) {
            const target = await StateRegistry.create(FeatureEnum.PAUSE_MENU);
            await manager.push(target);
        }
    }
}