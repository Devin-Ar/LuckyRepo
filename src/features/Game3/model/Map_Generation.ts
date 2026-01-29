import { Jimp } from 'jimp';
import { MapParser, ParsedMap } from '../logic/MapParser';

export class Map_Generation {
    public static async generateLevel(mapPath: string): Promise<ParsedMap> {
        console.log(`[Map_Generation] Generating level from: ${mapPath}`);
        const parsedMap = await MapParser.parseMap(mapPath);
        
        // Here we could add more post-processing if needed
        // For example, refining platform asset keys based on neighbors
        this.refinePlatformAssets(parsedMap);
        
        return parsedMap;
    }

    private static refinePlatformAssets(map: ParsedMap): void {
        for (const platform of map.platforms) {
            if (platform.isFloor) continue;

            // Simple logic: if it's a single pixel wide platform, maybe it's special
            // Or if it's the start/end of a long platform.
            // But MapParser.findRectangle already grouped them.
            
            // If we wanted to use 'Platform Length Left Side End' and 'Platform Length Right Side End'
            // we would need to know if there are other platforms to its left/right.
            // However, findRectangle finds the WHOLE rectangle.
            // So a platform of width > 1 could have a left end, middle parts, and a right end.
            // This suggests our Platform interface might need to be split or handled in view.
        }
    }
}

