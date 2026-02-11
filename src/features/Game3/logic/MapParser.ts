// src/features/Game3/logic/MapParser.ts
import { Jimp, rgbaToInt } from 'jimp';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class MapParser {
    // Verified colors from "MapTest.png"
    private static readonly COLOR_FLOOR = rgbaToInt(89, 103, 161, 255);
    private static readonly COLOR_PLATFORM = rgbaToInt(74, 169, 8, 255);
    private static readonly COLOR_PLAYER = rgbaToInt(214, 159, 96, 255);
    private static readonly COLOR_EXIT = rgbaToInt(255, 0, 0, 255);
    private static readonly COLOR_WALL = rgbaToInt(128, 0, 128, 255);
    private static readonly COLOR_WALL_ALT = rgbaToInt(71, 13, 191, 255);
    private static readonly COLOR_SPIKE = rgbaToInt(13, 191, 184, 255);
    private static readonly COLOR_PORTAL = rgbaToInt(28, 0, 255, 255);
    private static readonly COLOR_VOID = rgbaToInt(0, 0, 0, 255);

    /**
     * Parses a PNG map where each pixel represents a tile or an object.
     */
    public static async parseMap(imagePath: string, mapScale: number = 1): Promise<ParsedMapData> {
        console.log(`[MapParser] Parsing: ${imagePath}`);

        try {
            let image: any;
            try {
                image = await Jimp.read(imagePath);
            } catch (err: any) {
                if (err.message?.includes('unrecognised content at end of stream')) {
                    console.warn(`[MapParser] ${imagePath} has trailing bytes. Attempting to sanitize...`);
                    const fs = require('fs');
                    const buf = fs.readFileSync(imagePath);
                    const iendPos = buf.lastIndexOf(Buffer.from('IEND', 'ascii'));
                    if (iendPos !== -1) {
                        const cleanBuf = buf.slice(0, iendPos + 8);
                        image = await Jimp.read(cleanBuf);
                    } else {
                        throw err;
                    }
                } else {
                    throw err;
                }
            }
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            const platforms: PlatformData[] = [];
            let playerStart: { x: number; y: number; width?: number; height?: number } | undefined;

            for (let y = 0; y < height; y++) {
                let currentPlat: PlatformData | null = null;
                for (let x = 0; x < width; x++) {
                    const color = image.getPixelColor(x, y);
                    if ((color & 0xFF) < 128) {
                        currentPlat = null;
                        continue;
                    }

                    if (this.isColorMatch(color, this.COLOR_FLOOR) ||
                        this.isColorMatch(color, this.COLOR_PLATFORM) ||
                        this.isColorMatch(color, this.COLOR_WALL) ||
                        this.isColorMatch(color, this.COLOR_WALL_ALT) ||
                        this.isColorMatch(color, this.COLOR_SPIKE) ||
                        this.isColorMatch(color, this.COLOR_PORTAL) ||
                        this.isColorMatch(color, this.COLOR_VOID) ||
                        this.isColorMatch(color, this.COLOR_EXIT)) {
                        const isFloor = this.isColorMatch(color, this.COLOR_FLOOR);
                        const isWall = this.isColorMatch(color, this.COLOR_WALL) || this.isColorMatch(color, this.COLOR_WALL_ALT);
                        const isSpike = this.isColorMatch(color, this.COLOR_SPIKE);
                        const isPortal = this.isColorMatch(color, this.COLOR_PORTAL);
                        const isVoid = this.isColorMatch(color, this.COLOR_VOID);
                        const isExit = this.isColorMatch(color, this.COLOR_EXIT);

                        if (currentPlat &&
                            currentPlat.isFloor === isFloor &&
                            currentPlat.isWall === isWall &&
                            currentPlat.isSpike === isSpike &&
                            currentPlat.isPortal === isPortal &&
                            currentPlat.isVoid === isVoid &&
                            currentPlat.isExit === isExit) {
                            currentPlat.width += 1 * mapScale;
                        } else {
                            currentPlat = {
                                x: x * mapScale,
                                y: y * mapScale,
                                width: 1 * mapScale,
                                height: 1 * mapScale,
                                isFloor: isFloor,
                                isWall: isWall,
                                isSpike: isSpike,
                                isPortal: isPortal,
                                isVoid: isVoid,
                                isExit: isExit,
                                assetKey: isWall ? 'Platform Length' : (isFloor ? 'Platform Floor' : (isExit ? 'Exit Door' : 'Platform Length'))
                            };
                            platforms.push(currentPlat);
                        }
                    } else {
                        currentPlat = null;
                        if (this.isColorMatch(color, this.COLOR_PLAYER)) {
                            playerStart = {
                                x: x * mapScale,
                                y: y * mapScale,
                                width: 1 * mapScale,
                                height: 1 * mapScale
                            };
                        }
                    }
                }
            }

            if (!playerStart) {
                console.warn("[MapParser] No player start found. Using default.");
                playerStart = { x: 5, y: 5, width: 1, height: 1 };
            }

            const mergedPlatforms = this.mergeVertically(platforms);
            return { platforms: mergedPlatforms, playerStart };
        } catch (error) {
            console.error(`[MapParser] Failed to parse map ${imagePath}:`, error);
            throw error;
        }
    }

    /**
     * Merges adjacent platforms vertically if they have the same X, width, and properties.
     */
    public static mergeVertically(platforms: PlatformData[]): PlatformData[] {
        const result: PlatformData[] = [];
        const used = new Set<PlatformData>();

        for (let i = 0; i < platforms.length; i++) {
            const p1 = platforms[i];
            if (used.has(p1)) continue;

            used.add(p1);
            let current = p1;
            let foundNext = true;

            while (foundNext) {
                foundNext = false;
                for (let j = 0; j < platforms.length; j++) {
                    const p2 = platforms[j];
                    if (used.has(p2)) continue;

                    if (p2.x === current.x &&
                        p2.width === current.width &&
                        p2.y === current.y + current.height &&
                        p2.isFloor === current.isFloor &&
                        p2.isWall === current.isWall &&
                        p2.isSpike === current.isSpike &&
                        p2.isPortal === current.isPortal &&
                        p2.isVoid === current.isVoid &&
                        p2.isExit === current.isExit &&
                        p2.assetKey === current.assetKey) {

                        current.height += p2.height;
                        used.add(p2);
                        foundNext = true;
                        break;
                    }
                }
            }
            result.push(current);
        }
        return result;
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