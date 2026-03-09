// src/features/Game3/view/ui-components/Game3Background.tsx
import React, { useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, Sprite } from '@pixi/react';
import { SpriteManager } from '../../../../core/managers/SpriteManager';

export const Game3Background: React.FC<{
    imageName?: string;
    w: number;
    h: number;
}> = ({ imageName, w, h }) => {
    const texture = useMemo(() => {
        if (!imageName) return null;
        return SpriteManager.getInstance().getTexture(imageName);
    }, [imageName]);

    if (!texture || texture === PIXI.Texture.WHITE) {
        return (
            <Container name="background">
                <Graphics
                    draw={(g) => {
                        g.clear();
                        g.beginFill(0x050508);
                        g.drawRect(0, 0, w, h);
                        g.endFill();
                    }}
                />
            </Container>
        );
    }

    const scale = Math.max(w / texture.width, h / texture.height);

    return (
        <Container name="background">
            <Sprite
                texture={texture}
                x={w / 2}
                y={h / 2}
                anchor={0.5}
                scale={scale}
            />
        </Container>
    );
};
