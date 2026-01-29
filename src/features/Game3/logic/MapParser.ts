import { Jimp, rgbaToInt } from 'jimp';
import { Platform } from '../data/Terrain Data Platformer';

export interface ParsedMap {
    platforms: Platform[];
    playerStart: { x: number; y: number };
    exit?: { x: number; y: number; width: number; height: number };
}

export class MapParser {
    // Colors from description:
    // Floor: (R:89, G:103, B:161)
    // Platform: (R:74, G:169, B:8)
    // Hero: (R:214, G:159, B:96)
    // Exit: (R:255, G:0, B:0)

    private static readonly COLOR_FLOOR = rgbaToInt(89, 103, 161, 255);
    private static readonly COLOR_PLATFORM = rgbaToInt(74, 169, 8, 255);
    private static readonly COLOR_PLAYER = rgbaToInt(214, 159, 96, 255);
    private static readonly COLOR_EXIT = rgbaToInt(255, 0, 0, 255);

    public static async parseMap(imagePath: string): Promise<ParsedMap> {
        console.log(`[MapParser] Parsing map: ${imagePath}`);
        try {
            const image = await Jimp.read(imagePath) as any;
            const width = image.bitmap.width;
            const height = image.bitmap.height;
            console.log(`[MapParser] Image dimensions: ${width}x${height}`);

            const platforms: Platform[] = [];
            let playerStart = { x: 0, y: 0 };
            let exit: { x: number; y: number; width: number; height: number } | undefined;

            const visited = new Set<string>();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (visited.has(`${x},${y}`)) continue;

                    const color = image.getPixelColor(x, y);
                    // Check if pixel is fully transparent or near-transparent
                    if ((color & 0xFF) < 10) continue; 

                    if (this.isColorMatch(color, this.COLOR_FLOOR) || this.isColorMatch(color, this.COLOR_PLATFORM)) {
                        const isFloor = this.isColorMatch(color, this.COLOR_FLOOR);
                        const rect = this.findRectangle(image, x, y, color, visited);
                        
                        let assetKey = isFloor ? 'Platform Floor' : 'Platform Length';

                        platforms.push({
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                            isFloor: isFloor,
                            assetKey: assetKey
                        });
                        console.log(`[MapParser] Found platform: ${isFloor ? 'Floor' : 'Platform'} at (${rect.x}, ${rect.y}) size ${rect.width}x${rect.height}`);
                    } else if (this.isColorMatch(color, this.COLOR_PLAYER)) {
                        const rect = this.findRectangle(image, x, y, color, visited);
                        playerStart = { x: rect.x, y: rect.y };
                        console.log(`[MapParser] Found player start at (${rect.x}, ${rect.y})`);
                    } else if (this.isColorMatch(color, this.COLOR_EXIT)) {
                        const rect = this.findRectangle(image, x, y, color, visited);
                        exit = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
                        console.log(`[MapParser] Found exit at (${rect.x}, ${rect.y}) size ${rect.width}x${rect.height}`);
                    }
                }
            }

            if (platforms.length === 0) {
                console.warn("[MapParser] No platforms found in map image!");
            }

            return { platforms, playerStart, exit };
        } catch (e) {
            console.error(`[MapParser] Error reading image: ${e}`);
            throw e;
        }
    }

    private static isColorMatch(c1: number, c2: number): boolean {
        // Jimp's getPixelColor returns RGBA
        // Colors:
        // Floor: (89, 103, 161)
        // Platform: (74, 169, 8)
        // Hero: (214, 159, 96)
        // Exit: (255, 0, 0)
        
        // Let's log if it's a mystery color to help debug if needed
        const r1 = (c1 >> 24) & 0xFF;
        const g1 = (c1 >> 16) & 0xFF;
        const b1 = (c1 >> 8) & 0xFF;

        const r2 = (c2 >> 24) & 0xFF;
        const g2 = (c2 >> 16) & 0xFF;
        const b2 = (c2 >> 8) & 0xFF;

        const match = Math.abs(r1 - r2) < 30 && Math.abs(g1 - g2) < 30 && Math.abs(b1 - b2) < 30;
        return match;
    }

    private static findRectangle(image: any, startX: number, startY: number, color: number, visited: Set<string>): { x: number, y: number, width: number, height: number } {
        let width = 0;
        let height = 0;

        // Find width
        while (startX + width < image.bitmap.width && this.isColorMatch(image.getPixelColor(startX + width, startY), color)) {
            width++;
        }

        // Find height
        while (startY + height < image.bitmap.height) {
            let rowMatch = true;
            for (let x = startX; x < startX + width; x++) {
                if (!this.isColorMatch(image.getPixelColor(x, startY + height), color)) {
                    rowMatch = false;
                    break;
                }
            }
            if (!rowMatch) break;
            height++;
        }

        // Mark as visited
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                visited.add(`${x},${y}`);
            }
        }

        return { x: startX, y: startY, width, height };
    }
}
