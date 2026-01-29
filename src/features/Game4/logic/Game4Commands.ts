// src/features/Game4/logic/Game4Commands.ts
import {ICommand} from '../../../core/interfaces/ICommand';
import {Game4Config} from '../model/Game4Config';

export const Game4Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game4Config) {
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
