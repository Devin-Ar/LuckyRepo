// src/features/shared-menus/states/SaveMenuState.ts
import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { StateManager } from '../../../core/managers/StateManager';
import { SaveManager } from '../../../core/managers/SaveManager';
import { SaveSlotView } from '../views/SaveSlotView';
import { Game1State } from '../../Game1/model/Game1State';
import { Game2State } from '../../Game2/model/Game2State';

export class SaveMenuState extends MenuState {
    public name = "SaveMenu";

    private stateRegistry: Record<string, any> = {
        "BHTest": Game1State,
        "Game2": Game2State
    };

    public getView(): JSX.Element {
        const sm = StateManager.getInstance();
        const activeGame = sm.getUnderlyingStateName() || "Unknown";

        return React.createElement(SaveSlotView, {
            activeStateName: activeGame,
            onBack: () => sm.pop(),
            onSave: async (slot: number) => {
                const targetName = sm.getUnderlyingStateName();
                if (targetName) {
                    await SaveManager.getInstance().performSave(slot, targetName);
                }
            },
            onLoad: async (slot: number) => {
                const saveData = await SaveManager.getInstance().performLoad(slot);
                const StateClass = this.stateRegistry[saveData.stateName];

                if (StateClass) {
                    const target = new StateClass(false); // false = resume, don't reset
                    const config = (StateClass as any).loadingConfig || {};

                    sm.pop(); // Close Save Menu
                    sm.replace(target);
                }
            }
        });
    }
}