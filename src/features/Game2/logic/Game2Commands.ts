// src/features/Game2/logic/Game2Commands.ts
import {ICommand} from '../../../core/interfaces/ICommand';
import {Game2Config} from '../model/Game2Config';

export const Game2Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game2Config) {
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
    }
};