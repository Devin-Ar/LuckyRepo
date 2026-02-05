import React, {useEffect, useRef} from 'react';
import {AnimatedSprite, Sprite} from '@pixi/react';
import {SpriteManager} from '../core/managers/SpriteManager';
import * as PIXI from 'pixi.js';

interface Props {
    sheetName?: string;
    animationName?: string;
    imageName?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    scale?: number;
    rotation?: number;
    anchor?: number | [number, number];
    isPlaying?: boolean;
    currentFrame?: number;
    roundPixels?: boolean;
    flipX?: boolean;
}

export const GameSprite = ({
                               sheetName, animationName, imageName,
                               x, y, width, height, scale, rotation = 0, anchor = 0.5,
                               isPlaying = true,
                               currentFrame = 0,
                               roundPixels = false,
                               flipX = false
                           }: Props) => {
    const manager = SpriteManager.getInstance();
    const spriteRef = useRef<PIXI.AnimatedSprite>(null);

    const staticTexture = React.useMemo(() => {
        if (!imageName) return null;
        return manager.getTexture(imageName);
    }, [imageName, manager]);

    const frames = React.useMemo(() => {
        if (imageName) return null;
        const animKey = `${sheetName}_${animationName}`;
        return manager.getAnimation(animKey);
    }, [sheetName, animationName, imageName, manager]);

    useEffect(() => {
        if (spriteRef.current && frames && frames.length > 0) {
            const frameIndex = Math.floor(currentFrame) % frames.length;
            spriteRef.current.gotoAndStop(frameIndex);
        }
    }, [currentFrame, frames]);

    const finalWidth = width !== undefined ? (flipX ? -width : width) : undefined;
    const ax = typeof anchor === 'number' ? anchor : (Array.isArray(anchor) ? anchor[0] : 0.5);
    const finalX = (flipX && width !== undefined) ? x + (1 - 2 * ax) * width : x;

    if (imageName && staticTexture) {
        return <Sprite texture={staticTexture} x={finalX} y={y} width={finalWidth} height={height} scale={scale} rotation={rotation} anchor={anchor} roundPixels={roundPixels}/>;
    }

    if (frames && frames.length > 0) {
        return (
            <AnimatedSprite
                ref={spriteRef}
                textures={frames}
                isPlaying={false}
                x={finalX}
                y={y}
                width={finalWidth}
                height={height}
                scale={scale}
                rotation={rotation}
                anchor={anchor}
                roundPixels={roundPixels}
            />
        );
    }

    return null;
};