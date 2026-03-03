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
    isFallthrough?: boolean;
    isPlat?: boolean;
    isNonWallJumpableWall?: boolean;
    isDisplayWall?: boolean;
    isGrassForeground?: boolean;
    isGrassBackground?: boolean;
    isNonOrganicForeground?: boolean;
    isNonOrganicBackground?: boolean;
    assetKey?: string;
}

export interface ParsedMapData {
    platforms: PlatformData[];
    playerStart: { x: number; y: number; width?: number; height?: number };
}