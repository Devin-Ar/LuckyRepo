// src/features/Game1/logic/Game1Commands.ts
import {ICommand} from '../../../core/interfaces/ICommand';
import {BHConfig} from '../model/BHConfig';

export const BHCommands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: BHConfig) {
            logic.applyConfig(payload);
            logic.setInitialized(true);
        }
    },
    MOVEMENT: {
        execute(logic, payload) {
            logic.setMovement(payload.vx, payload.vy);
        }
    },
    TAKE_DAMAGE: {
        execute(logic, payload) {
            const damage = payload.amount ?? 15;
            logic.modifyHp(-damage);
        }
    }
};