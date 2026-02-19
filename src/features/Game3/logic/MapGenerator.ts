// src/features/Game3/logic/MapGenerator.ts
import { ParsedMapData, PlatformData } from '../data/Game3MapData';
import { MapParser } from './MapParser';

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