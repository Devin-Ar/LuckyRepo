import { Jimp, rgbaToInt } from 'jimp';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class MapParser {
    // Colors: Floor (89,103,161), Platform (74,169,8), Hero (214,159,96), Exit (255,0,0)
    private static readonly COLOR_FLOOR = rgbaToInt(89, 103, 161, 255);
    private static readonly COLOR_PLATFORM = rgbaToInt(74, 169, 8, 255);
    private static readonly COLOR_PLAYER = rgbaToInt(214, 159, 96, 255);
    private static readonly COLOR_EXIT = rgbaToInt(255, 0, 0, 255);

    public static async parseMap(imagePath: string): Promise<ParsedMapData> {
        console.log(`[MapParser] Parsing map: ${imagePath}`);
        try {
            const image = await Jimp.read(imagePath) as any;
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            const platforms: PlatformData[] = [];
            let playerStart = { x: 100, y: 100 };
            let exit: { x: number; y: number; width: number; height: number } | undefined;

            const visited = new Set<string>();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (visited.has(`${x},${y}`)) continue;

                    const color = image.getPixelColor(x, y);
                    if ((color & 0xFF) < 10) continue; // Skip transparent

                    if (this.isColorMatch(color, this.COLOR_FLOOR) || this.isColorMatch(color, this.COLOR_PLATFORM)) {
                        const isFloor = this.isColorMatch(color, this.COLOR_FLOOR);
                        const rect = this.findRectangle(image, x, y, color, visited);

                        // Refinement Logic (Texture selection)
                        let asset = isFloor ? 'Platform Floor' : 'Platform Length';
                        if (!isFloor && rect.height < 10) asset = 'Platform Thin';

                        platforms.push({
                            x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                            isFloor: isFloor,
                            assetKey: asset
                        });
                    } else if (this.isColorMatch(color, this.COLOR_PLAYER)) {
                        const rect = this.findRectangle(image, x, y, color, visited);
                        playerStart = { x: rect.x, y: rect.y };
                    } else if (this.isColorMatch(color, this.COLOR_EXIT)) {
                        const rect = this.findRectangle(image, x, y, color, visited);
                        exit = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
                    }
                }
            }
            return { platforms, playerStart, exit };
        } catch (e) {
            console.error(`[MapParser] Error reading image:`, e);
            throw e;
        }
    }

    private static isColorMatch(c1: number, c2: number): boolean {
        const r1 = (c1 >> 24) & 0xFF, g1 = (c1 >> 16) & 0xFF, b1 = (c1 >> 8) & 0xFF;
        const r2 = (c2 >> 24) & 0xFF, g2 = (c2 >> 16) & 0xFF, b2 = (c2 >> 8) & 0xFF;
        return Math.abs(r1 - r2) < 30 && Math.abs(g1 - g2) < 30 && Math.abs(b1 - b2) < 30;
    }

    private static findRectangle(image: any, startX: number, startY: number, color: number, visited: Set<string>) {
        let width = 0, height = 0;
        // Scan width
        while (startX + width < image.bitmap.width && this.isColorMatch(image.getPixelColor(startX + width, startY), color)) {
            width++;
        }
        // Scan height
        while (startY + height < image.bitmap.height) {
            let rowMatch = true;
            for (let x = startX; x < startX + width; x++) {
                if (!this.isColorMatch(image.getPixelColor(x, startY + height), color)) {
                    rowMatch = false; break;
                }
            }
            if (!rowMatch) break;
            height++;
        }
        // Mark visited
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                visited.add(`${x},${y}`);
            }
        }
        return { x: startX, y: startY, width, height };
    }
}