// src/features/Game1/view/ui-components/Game1Simulation.tsx
import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useApp, useTick} from '@pixi/react';
import {Game1Presenter} from '../Game1Presenter';
import {GameSprite} from '../../../../components/GameSprite';
import {SpriteManager} from "../../../../core/managers/SpriteManager";

const PixiForceResizer: React.FC<{ w: number, h: number }> = ({w, h}) => {
    const app = useApp();
    useEffect(() => {
        if (app?.renderer) {
            app.renderer.resize(w, h);
            if (app.view instanceof HTMLCanvasElement) {
                app.view.width = w;
                app.view.height = h;
            }
        }
    }, [app, w, h]);
    return null;
};

const OscillatingBackground: React.FC<{ paused: boolean, w: number, h: number }> = ({paused, w, h}) => {
    const graphicsRef = useRef<PIXI.Graphics>(null);
    const time = useRef(0);

    useEffect(() => {
        graphicsRef.current?.clear().beginFill(0xffffff).drawRect(0, 0, w, h).endFill();
    }, [w, h]);

    useTick((delta) => {
        if (!graphicsRef.current || paused) return;
        time.current += (Math.PI / 60) * delta;
        const factor = (Math.sin(time.current) + 1) / 2;
        const r = Math.round(26 + factor * (30 - 26));
        const g = Math.round(26 + factor * (80 - 26));
        const b = Math.round(46 + factor * (150 - 46));
        graphicsRef.current.tint = (r << 16) + (g << 8) + b;
    });

    return <Graphics ref={graphicsRef}/>;
};

const RockPool: React.FC<{ vm: Game1Presenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.Sprite[]>([]);
    const manager = SpriteManager.getInstance();

    useEffect(() => {
        return () => {
            spritePool.current.forEach(s => {
                if (s && !s.destroyed) {
                    s.destroy();
                }
            });
            spritePool.current = [];
        };
    }, []);

    useTick(() => {
        if (!containerRef.current) return;

        const currentCount = vm.entityCount;
        const pool = spritePool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const texture = manager.getTexture('static_rock');

                if (texture) {
                    const sprite = new PIXI.Sprite(texture);
                    sprite.anchor.set(0.5);
                    sprite.scale.set(0.8);
                    containerRef.current.addChild(sprite);
                    pool.push(sprite);
                }
            }
        } else if (currentCount < pool.length) {
            for (let i = pool.length - 1; i >= currentCount; i--) {
                const sprite = pool.pop();
                if (sprite) {
                    containerRef.current.removeChild(sprite);
                    sprite.destroy();
                }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const sprite = pool[i];
            const data = vm.getRockViewData(i);

            if (!data || paused) {
                if (sprite) sprite.visible = false;
                continue;
            }

            sprite.visible = true;
            sprite.x = data.x;
            sprite.y = data.y;
            sprite.rotation = data.rotation;
        }
    });

    return <Container ref={containerRef}/>;
};

export const Game1Simulation: React.FC<{
    vm: Game1Presenter,
    paused: boolean,
    width: number,
    height: number,
    scale: number,
    heroPos: React.MutableRefObject<{ x: number, y: number }>,
    hp: number
}> = ({vm, paused, width, height, scale, heroPos, hp}) => {
    const heroRef = useRef<PIXI.Container>(null);
    const [heroVisuals, setHeroVisuals] = useState(vm.heroVisuals);

    useTick(() => {
        const visuals = vm.heroVisuals;
        if (!heroRef.current) return;

        heroRef.current.x = visuals.x;
        heroRef.current.y = visuals.y;
        heroRef.current.rotation = visuals.rotation;
        heroRef.current.scale.set(visuals.scale);

        heroPos.current.x = visuals.x;
        heroPos.current.y = visuals.y;

        // Sync local state for frame rendering
        setHeroVisuals(visuals);
    });

    return (
        <>
            <PixiForceResizer w={width} h={height}/>
            <OscillatingBackground paused={paused} w={width} h={height}/>
            <Container scale={scale}>
                <RockPool vm={vm} paused={paused}/>
                <Container ref={heroRef}>
                    <GameSprite
                        sheetName="hero_sheet"
                        animationName="idle"
                        x={0} y={0}
                        scale={1}
                        anchor={0.5}
                        currentFrame={heroVisuals.currentFrame}
                    />
                </Container>
            </Container>
        </>
    );
};