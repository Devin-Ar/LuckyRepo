// src/features/Game3/view/ui-components/Game3Simulation.tsx
import React, { useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, TilingSprite, useTick } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';
import { GameSprite } from '../../../../components/GameSprite';
import { SpriteManager } from '../../../../core/managers/SpriteManager';
import { PlatformData } from '../../data/Game3MapData';

export const Game3Simulation: React.FC<{
    vm: Game3Presenter;
    width: number;
    height: number;
}> = ({ vm, width, height }) => {
    const worldContainerRef = useRef<PIXI.Container>(null);
    const [heroVisuals, setHeroVisuals] = useState(vm.heroVisuals);
    const manager = SpriteManager.getInstance();

    const worldScale = 5;

    useTick((delta) => {
        const hero = vm.heroVisuals;
        if (!worldContainerRef.current || !hero) return;

        const heroCenterX = hero.x + (hero.width / 2);
        const heroCenterY = hero.y + (hero.height / 2);

        const targetX = (width / 2) - (heroCenterX * worldScale);
        const targetY = (height / 2) - (heroCenterY * worldScale);

        worldContainerRef.current.x += (targetX - worldContainerRef.current.x) * 0.1 * delta;
        worldContainerRef.current.y += (targetY - worldContainerRef.current.y) * 0.1 * delta;

        setHeroVisuals({ ...hero });
    });

    const animName = heroVisuals.assetKey === 'hero_walk' ? 'walk' : 'idle';

    return (
        <Container ref={worldContainerRef} scale={worldScale}>
            {/* Environment */}
            {vm.mapData?.platforms.map((p: PlatformData, i: number) => {
                const texture = p.assetKey ? manager.getTexture(p.assetKey) : null;

                if (texture && texture !== PIXI.Texture.WHITE) {
                    return (
                        <TilingSprite
                            key={`plat-${i}`}
                            texture={texture}
                            x={p.x}
                            y={p.y}
                            width={p.width}
                            height={p.height}
                            // FIXED: Added required tilePosition and optional tileScale
                            tilePosition={{ x: 0, y: 0 }}
                            tileScale={{ x: 1, y: 1 }}
                        />
                    );
                }

                return (
                    <Graphics
                        key={`plat-g-${i}`}
                        draw={(g) => {
                            g.clear();
                            g.beginFill(p.isFloor ? 0x1e272e : 0x341f97);
                            g.drawRect(p.x, p.y, p.width, p.height);
                            g.endFill();
                        }}
                    />
                );
            })}

            {/* Hero */}
            <GameSprite
                sheetName={heroVisuals.assetKey}
                animationName={animName}
                x={heroVisuals.x + (heroVisuals.width / 2)}
                y={heroVisuals.y + (heroVisuals.height / 2)}
                scale={0.25}
                anchor={0.5}
                currentFrame={heroVisuals.frame}
            />
        </Container>
    );
};