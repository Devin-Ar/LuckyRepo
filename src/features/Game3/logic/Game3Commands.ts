// src/features/Game3/logic/Game3Commands.ts
import {ICommand} from '../../../core/interfaces/ICommand';
import {Game3Config} from '../model/Game3Config';

export const Game3Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game3Config) {
            logic.applyConfig(payload);
            logic.setInitialized(true);
        }
    },
    MOD_HP: {
        execute(logic, payload) {
            logic.modifyHp(payload.amount);
        }
    },
    MOD_ENERGY: {
        execute(logic, payload) {
            logic.modifyEnergy(payload.amount);
        }
    },
    ADD_SCRAP: {
        execute(logic) {
            logic.addScrap(1);
        }
    },
    LOAD_MAP: {
        async execute(logic, payload: { mapPath: string }) {
            await logic.loadMap(payload.mapPath);
        }
    }
};
