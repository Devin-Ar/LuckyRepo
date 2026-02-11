// src/features/Game3/logic/MapGenerator.ts
import { ParsedMapData, PlatformData } from '../data/Game3MapData';
import { MapParser } from './MapParser';

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

        // Some walls for wall-jumping
        const addWall = (x: number, startY: number, height: number) => {
            for (let y = startY; y < startY + height; y++) {
                platforms.push({ x, y, width: 1, height: 1, isFloor: false, isWall: true, assetKey: 'Platform Length' });
            }
        };

        // Some spikes
        const addSpikes = (startX: number, y: number, length: number) => {
            for (let x = startX; x < startX + length; x++) {
                platforms.push({ x, y, width: 1, height: 1, isFloor: false, isSpike: true, assetKey: 'Platform Length' });
            }
        };

        // Some portals
        const addPortal = (x: number, y: number) => {
            // @ts-ignore
            platforms.push({ x, y, width: 1, height: 1, isFloor: false, isPortal: true, assetKey: 'Platform Length' });
        };

        // Some void
        const addVoid = (startX: number, y: number, length: number) => {
            for (let x = startX; x < startX + length; x++) {
                // @ts-ignore
                platforms.push({ x, y, width: 1, height: 1, isFloor: false, isVoid: true, assetKey: 'Platform Length' });
            }
        };

        // Some exit
        const addExit = (x: number, y: number, width: number, height: number) => {
            for (let iy = 0; iy < height; iy++) {
                for (let ix = 0; ix < width; ix++) {
                    // @ts-ignore
                    platforms.push({ x: x + ix, y: y + iy, width: 1, height: 1, isFloor: false, isExit: true, assetKey: 'Exit Door' });
                }
            }
        };

        addPlat(10, 15, 5);
        addPlat(20, 10, 5);
        addPlat(5, 5, 3);

        addWall(15, 10, 10);
        addWall(25, 5, 15);

        addSpikes(30, 19, 5); // Add some spikes on the floor

        addPortal(5, 19);
        addPortal(45, 19);

        addVoid(-10, 25, 80); // Large void below the level

        addExit(55, 18, 2, 2); // 2x2 exit at the end of the level

        const mergedPlatforms = MapParser.mergeVertically(platforms);

        return {
            platforms: mergedPlatforms,
            playerStart: { x: 0, y: 19, width: 1, height: 1 } // Place player on floor
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