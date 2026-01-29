// src/features/Game3/utils/Map_Generation.ts
import { MapParser } from '../logic/MapParser';
import { ParsedMapData } from '../data/Game3MapData';

export class Map_Generation {
    /**
     * Entry point for level creation.
     * Runs on Main Thread to avoid Jimp/DOM issues in Worker.
     */
    public static async generateLevel(mapPath: string): Promise<ParsedMapData> {
        console.log(`[Map_Generation] Processing: ${mapPath}`);

        // 1. Raw parsing of the pixel data
        const parsedMap = await MapParser.parseMap(mapPath);

        // 2. Visual refinement (e.g., choosing specific textures for edges)
        this.refinePlatformAssets(parsedMap);

        return parsedMap;
    }

    private static refinePlatformAssets(map: ParsedMapData): void {
        map.platforms.forEach(platform => {
            // Logic: If a platform is thin, use a specific texture
            if (!platform.isFloor && platform.height < 10) {
                platform.assetKey = 'Platform Thin';
            }

            // Further refinement (e.g., checking neighbors) could be added here
            // to support 'Edge' vs 'Center' tiling sprites.
        });
    }
}