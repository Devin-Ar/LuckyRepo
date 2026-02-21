// src/features/Game3/logic/MapParser.ts
import {Jimp} from 'jimp';
import {ParsedMapData, PlatformData} from './Game3MapData';

export class MapParser {

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

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (width * y + x) * 4;
                    const r = image.bitmap.data[idx];
                    const g = image.bitmap.data[idx + 1];
                    const b = image.bitmap.data[idx + 2];
                    const a = image.bitmap.data[idx + 3];

                    if (a < 128) continue;

                    const isMatch = (targetColor: { r: number, g: number, b: number }) => {
                        const threshold = 15;
                        return Math.abs(r - targetColor.r) < threshold &&
                            Math.abs(g - targetColor.g) < threshold &&
                            Math.abs(b - targetColor.b) < threshold;
                    };

                    if (isMatch(playerColor)) {
                        playerStart = {
                            x: x * mapScale,
                            y: y * mapScale,
                            width: 1 * mapScale,
                            height: 1 * mapScale
                        };
                        continue;
                    }

                    const isFloor = isMatch(floorColor) || isMatch(platColor);
                    const isWall = isMatch(wallColor) || isMatch(wallAltColor);
                    const isSpike = isMatch(spikeColor);
                    const isPortal = isMatch(portalColor);
                    const isVoid = isMatch(voidColor);
                    const isExit = isMatch(exitColor);
                    const isFallthrough = isMatch(fallthroughColor);

                    if (isFloor || isWall || isSpike || isPortal || isVoid || isExit || isFallthrough) {
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
                            assetKey: isWall ? 'Platform Length' :
                                (isExit ? 'Exit Door' : 'Platform Floor')
                        };
                        platforms.push(tile);
                    }
                }
            }

            if (!playerStart) {
                console.warn("[MapParser] No player start found. Using default.");
                playerStart = {x: 5, y: 5, width: 1, height: 1};
            }
            return {platforms, playerStart};

        } catch (error) {
            console.error(`[MapParser] Failed to parse map ${imagePath}:`, error);
            throw error;
        }
    }
}