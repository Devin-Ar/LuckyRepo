import React from 'react';
import {Container, Graphics, TilingSprite} from '@pixi/react';
import {Game3Presenter} from '../Game3Presenter';
import * as PIXI from 'pixi.js';
import {GameSprite} from '../../../../components/GameSprite';
import {SpriteManager} from '../../../../core/managers/SpriteManager';

interface Props {
    vm: Game3Presenter;
    width: number;
    height: number;
}

export const Game3Simulation = ({vm, width, height}: Props) => {
    const mapData = vm.mapData;
    const hero = vm.heroVisuals;
    const manager = SpriteManager.getInstance();

    const worldScale = 8;

    // Camera follow logic: center the hero
    const cameraX = (width / 2) - (hero.x + hero.width / 2) * worldScale;
    const cameraY = (height / 2) - (hero.y + hero.height / 2) * worldScale;

    // Determine which animation to show
    const animName = hero.assetKey === 'hero_walk' ? 'walk' : 'idle';

    return (
        <Container x={cameraX} y={cameraY} scale={worldScale}>
            {/* Platforms and Floor */}
            {mapData?.platforms.map((p, i) => {
                const texture = p.assetKey ? manager.getTexture(p.assetKey) : null;
                // If it's a TilingSprite, we keep scale 1 for it as p.width/height are in world units
                if (texture && texture !== PIXI.Texture.WHITE) {
                    return (
                        <TilingSprite
                            key={`plat-${i}`}
                            texture={texture}
                            x={p.x}
                            y={p.y}
                            width={p.width}
                            height={p.height}
                            tilePosition={{x: 0, y: 0}}
                        />
                    );
                }
                return (
                    <Graphics
                        key={`plat-g-${i}`}
                        draw={g => {
                            g.clear();
                            g.beginFill(p.isFloor ? 0x5967A1 : 0x4AA908);
                            g.drawRect(p.x, p.y, p.width, p.height);
                            g.endFill();
                        }}
                    />
                );
            })}

            {/* Exit Door */}
            {mapData?.exit && (
                <GameSprite
                    imageName="Exit Door"
                    x={mapData.exit.x}
                    y={mapData.exit.y}
                    anchor={0}
                    scale={1/worldScale} // Keep it small as it's intended to be 1:1 with pixels
                />
            )}

            {/* Hero */}
            <GameSprite
                sheetName={hero.assetKey}
                animationName={animName}
                x={hero.x + hero.width / 2}
                y={hero.y + hero.height / 2}
                scale={(hero.flipX ? -1 : 1) * (1.2 / worldScale)} // Scale to be slightly larger than hitbox
                anchor={0.5}
                currentFrame={hero.frame}
            />
        </Container>
    );
};
