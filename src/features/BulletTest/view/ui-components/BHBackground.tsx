import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Sprite, useTick } from '@pixi/react';
import { SpriteManager } from '../../../../core/managers/SpriteManager';

const BG_KEYS = ['bg_lvl1', 'bg_lvl2', 'bg_lvl3', 'bg_lvl4'];

export const BHBackground: React.FC<{
    paused: boolean;
    w: number;
    h: number;
    levelIndex?: number;
}> = ({ paused, w, h, levelIndex = 0 }) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritesRef = useRef<PIXI.Sprite[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clean up old sprites
        for (const s of spritesRef.current) {
            container.removeChild(s);
            s.destroy();
        }
        spritesRef.current = [];

        const manager = SpriteManager.getInstance();
        const frameKey = BG_KEYS[Math.min(levelIndex, BG_KEYS.length - 1)];
        const texture = manager.getTexture(frameKey);

        if (!texture || texture === PIXI.Texture.WHITE) {
            // Fallback: solid dark fill if texture not loaded yet
            const g = new PIXI.Graphics();
            g.beginFill(0x1a1a2e);
            g.drawRect(0, 0, w, h);
            g.endFill();
            container.addChild(g as any);
            spritesRef.current.push(g as any);
            return;
        }

        // Single sprite stretched to fill the entire area
        const sprite = new PIXI.Sprite(texture);
        sprite.width = w;
        sprite.height = h;
        container.addChild(sprite);
        spritesRef.current.push(sprite);
    }, [w, h, levelIndex]);

    return <Container ref={containerRef} />;
};