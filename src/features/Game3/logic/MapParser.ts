// src/features/Game3/logic/MapParser.ts
import { Jimp } from 'jimp';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class MapParser {
    /**
     * Parses a PNG map where each pixel represents a tile or an object.
     */
    public static async parseMap(imagePath: string, mapScale: number = 1): Promise<ParsedMapData> {
        console.log(`[MapParser] Parsing: ${imagePath}`);

        try {
            const image = await Jimp.read(imagePath);
            if (!image) throw new Error(`Jimp failed to load image: ${imagePath}`);
            
            const width = image.bitmap.width;
            const height = image.bitmap.height;
            console.log(`[MapParser] Image loaded: ${width}x${height}`);

            const platforms: PlatformData[] = [];
            let playerStart: { x: number; y: number; width?: number; height?: number } | undefined;

            for (let y = 0; y < height; y++) {
                let currentPlat: PlatformData | null = null;
                for (let x = 0; x < width; x++) {
                    const idx = (image.bitmap.width * y + x) * 4;
                    const r = image.bitmap.data[idx];
                    const g = image.bitmap.data[idx + 1];
                    const b = image.bitmap.data[idx + 2];
                    const a = image.bitmap.data[idx + 3];
                    
                    if (a < 128) {
                        currentPlat = null;
                        continue;
                    }

                    const isMatch = (targetColor: {r: number, g: number, b: number}) => {
                        const threshold = 15;
                        return Math.abs(r - targetColor.r) < threshold &&
                               Math.abs(g - targetColor.g) < threshold &&
                               Math.abs(b - targetColor.b) < threshold;
                    };

                    const floorColor = {r: 89, g: 103, b: 161};
                    const platColor = {r: 74, g: 169, b: 8};
                    const wallColor = {r: 128, g: 0, b: 128};
                    const wallAltColor = {r: 71, g: 13, b: 191};
                    const spikeColor = {r: 13, g: 191, b: 184};
                    const portalColor = {r: 28, g: 0, b: 255};
                    const voidColor = {r: 0, g: 0, b: 0};
                    const exitColor = {r: 255, g: 0, b: 0};
                    const fallthroughColor = {r: 122, g: 75, b: 13};
                    const playerColor = {r: 214, g: 159, b: 96};

                    if (isMatch(floorColor) || isMatch(platColor) || isMatch(wallColor) || 
                        isMatch(wallAltColor) || isMatch(spikeColor) || isMatch(portalColor) || 
                        isMatch(voidColor) || isMatch(exitColor) || isMatch(fallthroughColor)) {
                        
                        const isFloor = isMatch(floorColor);
                        const isWall = isMatch(wallColor) || isMatch(wallAltColor);
                        const isSpike = isMatch(spikeColor);
                        const isPortal = isMatch(portalColor);
                        const isVoid = isMatch(voidColor);
                        const isExit = isMatch(exitColor);
                        const isFallthrough = isMatch(fallthroughColor);

                        if (currentPlat &&
                            currentPlat.isFloor === isFloor &&
                            currentPlat.isWall === isWall &&
                            currentPlat.isSpike === isSpike &&
                            currentPlat.isPortal === isPortal &&
                            currentPlat.isVoid === isVoid &&
                            currentPlat.isExit === isExit &&
                            currentPlat.isFallthrough === isFallthrough) {
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
                                isFallthrough: isFallthrough,
                                assetKey: isWall ? 'Platform Length' : (isFloor ? 'Platform Floor' : (isExit ? 'Exit Door' : (isFallthrough ? 'Platform Floor' : 'Platform Length')))
                            };
                            platforms.push(currentPlat);
                        }
                    } else {
                        currentPlat = null;
                        if (isMatch(playerColor)) {
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
                console.warn("[MapParser] No player start found (Color match failed). Using default.");
                playerStart = { x: 5, y: 5, width: 1, height: 1 };
            }

            const mergedPlatforms = this.mergeVertically(platforms);
            console.log(`[MapParser] Parsing complete. Platforms found: ${platforms.length}, after merge: ${mergedPlatforms.length}`);
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
                        p2.isFallthrough === current.isFallthrough &&
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

}