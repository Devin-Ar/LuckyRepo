import { ICommand } from '../../../core/interfaces/ICommand';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData } from '../data/Game3MapData';

export const Game3Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game3Config) {
            logic.applyConfig(payload);
            // Don't set initialized here if we expect map data
            if (!payload.mapPath) {
                logic.setInitialized(true);
            }
        }
    },
    SET_MAP_DATA: {
        execute(logic, payload: ParsedMapData) {
            // Logic now receives pure data, no parsing needed here
            logic.setMapData(payload);
            logic.setInitialized(true);
        }
    },
    MOD_HP: {
        execute(logic, payload: { amount: number }) {
            logic.modifyHP(payload.amount);
        }
    }
};