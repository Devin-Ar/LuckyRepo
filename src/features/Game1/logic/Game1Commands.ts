// src/features/Game1/logic/Game1Commands.ts
import {ICommand} from '../../../core/interfaces/ICommand';
import {Game1Config} from '../model/Game1Config';

export const Game1Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game1Config) {
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