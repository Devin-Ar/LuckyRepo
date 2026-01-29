import { ICommand } from '../../../core/interfaces/ICommand';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData } from '../data/Game3MapData';

export const Game3Commands: Record<string, ICommand> = {
    INITIALIZE: {
        execute(logic, payload: Game3Config) {
            logic.applyConfig(payload);
            logic.setInitialized(true);
        }
    },
    SET_MAP_DATA: {
        execute(logic, payload: ParsedMapData) {
            // Logic now receives pure data, no parsing needed here
            logic.setMapData(payload);
        }
    },
    MOD_HP: {
        execute(logic, payload) { logic.modifyHp(payload.amount); }
    },
    MOD_ENERGY: {
        execute(logic, payload) { logic.modifyEnergy(payload.amount); }
    },
    ADD_SCRAP: {
        execute(logic) { logic.addScrap(1); }
    }
};