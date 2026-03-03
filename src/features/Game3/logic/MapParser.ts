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

                    if (isFloor || isWall || isSpike || isPortal || isVoid || isExit || isFallthrough ||
                        isPlat || isNonWallJumpableWall || isDisplayWall || isGrassForeground || isGrassBackground ||
                        isNonOrganicForeground || isNonOrganicBackground) {
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
                            assetKey: isWall || isNonWallJumpableWall ? 'Platform Length' :
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