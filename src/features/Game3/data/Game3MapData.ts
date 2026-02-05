export interface PlatformData {
    x: number;
    y: number;
    width: number;
    height: number;
    isFloor?: boolean;
    assetKey?: string;
}

export interface ParsedMapData {
    platforms: PlatformData[];
    playerStart: { x: number; y: number; width?: number; height?: number };
    exit?: { x: number; y: number; width: number; height: number };
}