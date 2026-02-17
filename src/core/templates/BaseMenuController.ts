// src/core/templates/BaseMenuController.ts
import { InputManager } from "../managers/InputManager";
import { StateManager } from "../managers/StateManager";
import { FeatureEnum } from "../../features/FeatureEnum";

export abstract class BaseMenuController {
    protected input: InputManager;
    protected stateManager: StateManager;
    protected stateId?: FeatureEnum;

    constructor() {
        this.input = InputManager.getInstance();
        this.stateManager = StateManager.getInstance();
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    public init(stateId: FeatureEnum): void {
        this.stateId = stateId;
        window.addEventListener('keydown', this.handleKeyDown);
        this.onInitialize();
    }

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.onDestroy();
    }

    private handleKeyDown(e: KeyboardEvent): void {
        const activeState = this.stateManager.getActiveState();
        if (activeState?.name !== this.stateId) {
            return;
        }

        if (this.input.isKeyAction(e.key, 'UI_BACK')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.onBack();
            return;
        }

        this.onKeyDown(e);
    }

    public abstract onBack(): void;
    protected onInitialize(): void {}
    protected onDestroy(): void {}
    protected onKeyDown(e: KeyboardEvent): void {}
}