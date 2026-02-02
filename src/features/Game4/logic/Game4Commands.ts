// src/features/Game4/logic/Game4Commands.ts
import { ICommand } from '../../../core/interfaces/ICommand';
import { Game4Config } from '../model/Game4Config';

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
    },

    /**
     * Spawn one or more enemies at runtime.
     *
     * payload.type  — enemy type string (e.g. 'rock', 'bat')
     * payload.count — how many to spawn (default 1)
     */
    SPAWN_ENEMY: {
        execute(logic, payload) {
            const type: string = payload.type ?? 'rock';
            const count: number = payload.count ?? 1;
            for (let i = 0; i < count; i++) {
                logic.spawnEnemy(type);
            }
        }
    }
};