// src/features/Game3/logic/MapParser.ts
import {Jimp} from 'jimp';
import {ParsedMapData, PlatformData} from './Game3MapData';

export class MapParser {

    public static async parseMap(imagePath: string, mapScale: number = 1): Promise<ParsedMapData> {
        console.log(`[MapParser] Parsing: ${imagePath}`);

        try {
            const { width, height, data } = await this.readImageData(imagePath);
            console.log(`[MapParser] Image loaded: ${width}x${height}`);

            const platforms: PlatformData[] = [];
            const fallthroughMask = new Uint8Array(width * height);
            let playerStart: { x: number; y: number; width?: number; height?: number } | undefined;
            let unknownOpaque = 0;
            let coinCount = 0;
            let playerCount = 0;

            const floorColor = {r: 89, g: 103, b: 161}; //floor not platform
            const platColor = {r: 74, g: 169, b: 8}; //non-fallthrough platform
            const wallColor = {r: 128, g: 0, b: 128}; //walljump wall
            const wallAltColor = {r: 71, g: 13, b: 191}; //walljump wall alt
            const spikeColor = {r: 13, g: 191, b: 184}; //spikes
            const portalColor = {r: 28, g: 0, b: 255}; //portal
            const voidColor = {r: 0, g: 0, b: 0}; //death barrier
            const exitColor = {r: 255, g: 0, b: 0}; //level changer
            const fallthroughColor = {r: 122, g: 75, b: 13}; //fallthrough platforms
            const playerColor = {r: 214, g: 159, b: 96}; //player spawn point
            const non_Wallcolor = {r: 255, g: 0, b: 213} //non-walljump wall
            const display_Wallcolor = {r: 255, g: 240, b: 0} //display wall/ vanity wall
            const grass_Foregroundcolor = {r: 0, g: 255, b: 134} //Grass sprite notations
            const grass_Backgroundcolor = {r: 45, g: 99, b: 73} // Alternate Grass sprite notations
            const non_organicForegroundObject_color = {r: 67, g: 73, b: 24} //non-organic material, like barrels, others
            const non_organicBackgroundObject_color = {r: 152, g: 153, b: 141} //non-organic material, like barrels, others
            const coinCollectable = {r: 172, g: 0, b: 85} //coin collectable

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (width * y + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const a = data[idx + 3];

                    if (a < 128) continue;

                    const isMatch = (targetColor: { r: number, g: number, b: number }) => {
                        const threshold = 15;
                        return Math.abs(r - targetColor.r) < threshold &&
                            Math.abs(g - targetColor.g) < threshold &&
                            Math.abs(b - targetColor.b) < threshold;
                    };

                    if (isMatch(playerColor)) {
                        playerCount++;
                        playerStart = {
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale
                        };
                        continue;
                    }

                    const isFloor = isMatch(floorColor);
                    const isWall = isMatch(wallColor) || isMatch(wallAltColor);
                    const isSpike = isMatch(spikeColor);
                    const isPortal = isMatch(portalColor);
                    const isVoid = isMatch(voidColor);
                    const isExit = isMatch(exitColor);
                    const isFallthrough = isMatch(fallthroughColor);
                    const isPlat = isMatch(platColor);
                    const isNonWallJumpableWall = isMatch(non_Wallcolor);
                    const isDisplayWall = isMatch(display_Wallcolor);
                    const isGrassForeground = isMatch(grass_Foregroundcolor);
                    const isGrassBackground = isMatch(grass_Backgroundcolor);
                    const isNonOrganicForeground = isMatch(non_organicForegroundObject_color);
                    const isNonOrganicBackground = isMatch(non_organicBackgroundObject_color);
                    const isCoinCollectable = isMatch(coinCollectable);

                    const isKnown = isFloor || isWall || isSpike || isPortal || isVoid || isExit || isFallthrough ||
                        isPlat || isNonWallJumpableWall || isDisplayWall || isGrassForeground || isGrassBackground ||
                        isNonOrganicForeground || isNonOrganicBackground || isCoinCollectable;

                    if (!isKnown) {
                        unknownOpaque++;
                        continue;
                    }

                    if (isKnown) {
                        if (isCoinCollectable) coinCount++;
                        if (isFallthrough) {
                            fallthroughMask[y * width + x] = 1;
                            continue;
                        }
                        const tile: PlatformData = {
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale,
                            isFloor,
                            isWall,
                            isSpike,
                            isPortal,
                            isVoid,
                            isExit,
                            isFallthrough,
                            isPlat,
                            isNonWallJumpableWall,
                            isDisplayWall,
                            isGrassForeground,
                            isGrassBackground,
                            isNonOrganicForeground,
                            isNonOrganicBackground,
                            isCoinCollectable,
                            assetKey: isWall || isNonWallJumpableWall ? 'Platform Length' :
                                (isExit ? 'Exit Door' : (isCoinCollectable ? 'Coin' : 'Platform Floor'))
                        };
                        platforms.push(tile);
                    }
                }
            }

            // Greedy merge fallthrough platforms horizontally per row
            for (let y = 0; y < height; y++) {
                let x = 0;
                while (x < width) {
                    const idx = y * width + x;
                    if (fallthroughMask[idx] === 0) {
                        x++;
                        continue;
                    }

                    const startX = x;
                    while (x < width && fallthroughMask[y * width + x] === 1) {
                        x++;
                    }
                    const run = x - startX;

                    platforms.push({
                        x: startX * mapScale,
                        y: y * mapScale,
                        width: run * mapScale,
                        height: 1 * mapScale,
                        isFallthrough: true,
                        assetKey: 'Platform Floor'
                    });
                }
            }

            if (!playerStart) {
                console.warn("[MapParser] No player start found. Using default.");
                playerStart = {x: 5, y: 5, width: 1, height: 1};
            }

            console.log(`[MapParser] Parsed ${platforms.length} tiles ` +
                `(coins: ${coinCount}, unknownOpaque: ${unknownOpaque}, playerSpawns: ${playerCount}).`);
            return {platforms, playerStart};

        } catch (error) {
            console.error(`[MapParser] Failed to parse map ${imagePath}:`, error);
            throw error;
        }
    }

    private static async readImageData(imagePath: string): Promise<{ width: number; height: number; data: Uint8ClampedArray }> {
        try {
            const image = await Jimp.read(imagePath);
            if (!image) throw new Error(`Jimp failed to load image: ${imagePath}`);
            return {
                width: image.bitmap.width,
                height: image.bitmap.height,
                data: new Uint8ClampedArray(image.bitmap.data)            };
        } catch (e) {
            console.warn(`[MapParser] Jimp decode failed, falling back to Canvas for ${imagePath}.`, e);
        }

        if (typeof document === 'undefined') {
            throw new Error(`[MapParser] Canvas fallback unavailable (no document) for ${imagePath}`);
        }

        const img = await this.loadImage(imagePath);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error(`[MapParser] Failed to get 2D context for ${imagePath}`);

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        return { width, height, data: imageData.data };
    }

    private static loadImage(imagePath: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`[MapParser] Failed to load image: ${imagePath}`));
            img.src = imagePath;
        });
    }
}
