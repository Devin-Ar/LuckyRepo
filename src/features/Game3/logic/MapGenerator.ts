// src/features/Game3/logic/MapGenerator.ts
import { ParsedMapData } from './Game3MapData';

export class MapGenerator {
    public static generateDefaultMap(): ParsedMapData {
        return {
            platforms: [],
            playerStart: { x: 0, y: 0, width: 1, height: 1 }
        };
    }

    public static generateProcedural(seed: number): ParsedMapData {

        return this.generateDefaultMap();
    }
}