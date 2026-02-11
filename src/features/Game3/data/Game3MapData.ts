export interface PlatformData {
    x: number;
    y: number;
    width: number;
    height: number;
    isFloor?: boolean;
    isWall?: boolean;
    isSpike?: boolean;
    isPortal?: boolean;
    isVoid?: boolean;
    isExit?: boolean;
    assetKey?: string;
}

export interface ParsedMapData {
    platforms: PlatformData[];
    playerStart: { x: number; y: number; width?: number; height?: number };
}