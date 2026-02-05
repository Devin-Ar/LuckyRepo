// src/features/Game3/logic/MapGenerator.ts
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class MapGenerator {
    /**
     * Generates a simple flat world with a floor and some platforms.
     * Useful as a fallback if image parsing fails or for testing.
     */
    public static generateDefaultMap(): ParsedMapData {
        const platforms: PlatformData[] = [];

        // Main Floor (as individual 1x1 blocks for consistency)
        for (let x = -20; x < 60; x++) {
            platforms.push({
                x: x,
                y: 20,
                width: 1,
                height: 1,
                isFloor: true,
                assetKey: 'Platform Floor'
            });
        }

        // Some floating platforms (as individual 1x1 blocks)
        const addPlat = (startX: number, y: number, length: number) => {
            for (let x = startX; x < startX + length; x++) {
                platforms.push({ x, y, width: 1, height: 1, isFloor: false, assetKey: 'Platform Length' });
            }
        };

        addPlat(10, 15, 5);
        addPlat(20, 10, 5);
        addPlat(5, 5, 3);

        return {
            platforms,
            playerStart: { x: 0, y: 19, width: 1, height: 1 }, // Place player on floor
            exit: { x: 40, y: 19, width: 1, height: 1 }
        };
    }

    /**
     * Future: Procedural generation logic can be added here
     */
    public static generateProcedural(seed: number): ParsedMapData {
        // Placeholder for real procedural logic
        return this.generateDefaultMap();
    }
}
