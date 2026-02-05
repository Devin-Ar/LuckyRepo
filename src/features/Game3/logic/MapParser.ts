// src/features/Game3/logic/MapParser.ts
import { Jimp, rgbaToInt } from 'jimp';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class MapParser {
    // Verified colors from "MapTest.png"
    private static readonly COLOR_FLOOR = rgbaToInt(89, 103, 161, 255);
    private static readonly COLOR_PLATFORM = rgbaToInt(74, 169, 8, 255);
    private static readonly COLOR_PLAYER = rgbaToInt(214, 159, 96, 255);
    private static readonly COLOR_EXIT = rgbaToInt(255, 0, 0, 255);

    /**
     * Parses a PNG map where each pixel represents a tile or an object.
     */
    public static async parseMap(imagePath: string, mapScale: number = 1): Promise<ParsedMapData> {
        console.log(`[MapParser] Parsing: ${imagePath}`);
        
        try {
            const image = await Jimp.read(imagePath) as any;
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            const platforms: PlatformData[] = [];
            let playerStart: { x: number; y: number; width?: number; height?: number } | undefined;
            let exit: { x: number; y: number; width: number; height: number } | undefined;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const color = image.getPixelColor(x, y);
                    if ((color & 0xFF) < 128) continue; // Skip semi-transparent/transparent

                    if (this.isColorMatch(color, this.COLOR_FLOOR) || this.isColorMatch(color, this.COLOR_PLATFORM)) {
                        const isFloor = this.isColorMatch(color, this.COLOR_FLOOR);
                        
                        platforms.push({
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale,
                            isFloor: isFloor,
                            assetKey: isFloor ? 'Platform Floor' : 'Platform Length'
                        });
                    } else if (this.isColorMatch(color, this.COLOR_PLAYER)) {
                        playerStart = {
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale
                        };
                    } else if (this.isColorMatch(color, this.COLOR_EXIT)) {
                        exit = {
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale
                        };
                    }
                }
            }

            if (!playerStart) {
                console.warn("[MapParser] No player start found. Using default.");
                playerStart = { x: 5, y: 5, width: 1, height: 1 };
            }

            return { platforms, playerStart, exit };
        } catch (error) {
            console.error(`[MapParser] Failed to parse map ${imagePath}:`, error);
            throw error;
        }
    }

    private static isColorMatch(c1: number, c2: number): boolean {
        // Extract RGB
        const r1 = (c1 >> 24) & 0xFF, g1 = (c1 >> 16) & 0xFF, b1 = (c1 >> 8) & 0xFF;
        const r2 = (c2 >> 24) & 0xFF, g2 = (c2 >> 16) & 0xFF, b2 = (c2 >> 8) & 0xFF;
        
        // Use a small tolerance for compressed images or anti-aliasing
        const threshold = 15;
        return Math.abs(r1 - r2) < threshold && 
               Math.abs(g1 - g2) < threshold && 
               Math.abs(b1 - b2) < threshold;
    }

}
