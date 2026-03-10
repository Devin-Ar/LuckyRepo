// src/features/Game3/view/ui-components/Game3Background.tsx
import React, {useRef} from 'react';
import * as PIXI from 'pixi.js';
import {Container, useTick} from '@pixi/react';
import { SpriteManager } from '../../../../core/managers/SpriteManager';

export const Game3Background: React.FC<{
    imageName?: string;
    w: number;
    h: number;
}> = ({ imageName, w, h }) => {
    const containerRef = useRef<PIXI.Container>(null);
    const built = useRef(false);
    const MAX_RERENDER_TRIES = useRef(20);
    useTick(() => {
        if (!containerRef.current || built.current || MAX_RERENDER_TRIES.current <= 0) return;
        MAX_RERENDER_TRIES.current -= 1;

        const manager = SpriteManager.getInstance();
        const texture = imageName ? manager.getTexture(imageName) : null;

        if (!texture || texture === PIXI.Texture.WHITE) {
            const g = new PIXI.Graphics();
            g.beginFill(0x050508);
            g.drawRect(0, 0, w, h);
            g.endFill();
            containerRef.current.addChild(g);
        } else {
            const scale = Math.max(w / texture.width, h / texture.height);
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.x = w / 2;
            sprite.y = h / 2;
            sprite.scale.set(scale);
            containerRef.current.addChild(sprite);
            built.current = true;
        }
    });

    return <Container ref={containerRef} name="background" />;
};

