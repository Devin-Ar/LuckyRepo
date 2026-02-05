// src/features/shared-menus/states/SaveMenuState.ts
import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { StateManager } from '../../../core/managers/StateManager';
import { SaveManager, SAVE_EXTENSION } from '../../../core/managers/SaveManager';
import { SaveSlotView } from '../views/SaveSlotView';
import { BHState } from '../../BulletTest/model/BHState';
import { Game1State } from '../../Game1/model/Game1State';
import { Game2State } from '../../Game2/model/Game2State';


export class SaveMenuState extends MenuState {
    public name = "SaveMenu";

    private stateRegistry: Record<string, any> = {
        "Game1": Game1State,
        "Game2": Game2State,
        "BHTest": BHState,
    };

    public getView(): JSX.Element {
        const sm = StateManager.getInstance();
        const activeGame = sm.getUnderlyingStateName() || "Unknown";
        const saveManager = SaveManager.getInstance();

        return React.createElement(SaveSlotView, {
            activeStateName: activeGame,
            onBack: () => sm.pop(),
            onSave: async (name: string) => {
                const targetName = sm.getUnderlyingStateName();
                if (targetName) {
                    await saveManager.performSave(name, targetName);
                }
            },
            onLoad: async (name: string) => {
                const saveData = await saveManager.performLoad(name);
                const StateClass = this.stateRegistry[saveData.stateName];

                if (StateClass) {
                    const target = new StateClass(false);
                    sm.pop();
                    sm.replace(target);
                }
            },
            onDelete: async (name: string) => {
                await saveManager.deleteSave(name);
            },
            onExport: async (name: string) => {
                const json = await saveManager.exportSave(name);

                const blob = new Blob([json], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}${SAVE_EXTENSION}`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },
            onImport: async (file: File) => {
                const text = await file.text();
                await saveManager.importSave(text);
            }
        });
    }
}