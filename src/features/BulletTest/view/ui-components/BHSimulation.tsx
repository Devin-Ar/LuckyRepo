// src/features/Game1/view/ui-components/Game1Simulation.tsx
import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useApp, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';
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

const RockPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
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

const RockAttackPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const graphicsPool = useRef<PIXI.Graphics[]>([]);

    useEffect(() => {
        return () => {
            graphicsPool.current.forEach(s => {
                if (s && !s.destroyed) {
                    s.destroy();
                }
            });
            graphicsPool.current = [];
        };
    }, []);

    useTick(() => {
        if (!containerRef.current) return;

        const currentCount = vm.entityCount;
        const pool = graphicsPool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const newGraphic = new PIXI.Graphics();
                newGraphic.visible = false;
                containerRef.current.addChild(newGraphic);
                pool.push(newGraphic);
            }
        } else if (currentCount < pool.length) {
            for (let i = pool.length - 1; i >= currentCount; i--) {
                const oldGraphic = pool.pop();
                if (oldGraphic) {
                    containerRef.current.removeChild(oldGraphic);
                    oldGraphic.destroy();
                }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const graphic = pool[i];
            const data = vm.getRockAttackData(i);
            const data2 = vm.getRockViewData(i);

            if (!data || paused) {
                if (graphic) graphic.visible = false;
                continue;
            }

            if (data.primedMode === 1) {
                graphic.visible = true;
                graphic.clear();
                graphic.lineStyle(30, 0xff0000);
                graphic.moveTo(data2.x, data2.y);
                graphic.lineTo(data.endX, data.endY);
            } else {
                graphic.visible = false;
            }
        }
    });

    return <Container ref={containerRef}/>;
};

const PlayerProjPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const graphicsPool = useRef<PIXI.Graphics[]>([]);

    useEffect(() => {
        return () => {
            graphicsPool.current.forEach(s => {
                if (s && !s.destroyed) {
                    s.destroy();
                }
            });
            graphicsPool.current = [];
        };
    }, []);

    useTick(() => {
        if (!containerRef.current) return;
        const currentCount = vm.projCount;

        const pool = graphicsPool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const newGraphic = new PIXI.Graphics();
                newGraphic.visible = false;
                containerRef.current.addChild(newGraphic);
                pool.push(newGraphic);
            }
        } else if (currentCount < pool.length) {
            for (let i = pool.length - 1; i >= currentCount; i--) {
                const oldGraphic = pool.pop();
                if (oldGraphic) {
                    containerRef.current.removeChild(oldGraphic);
                    oldGraphic.destroy();
                }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const graphic = pool[i];
            const data = vm.getPlayerProjData(i);
            if (!data || paused) {
                if (graphic) graphic.visible = false;
                continue;
            }

            graphic.visible = true;
            graphic.clear();
            graphic.lineStyle(10, 0x00ff00);
            graphic.drawRect(data.x, data.y, 20, 20);
        }
    });

    return <Container ref={containerRef}/>;
};

const EnemyProjPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const graphicsPool = useRef<PIXI.Graphics[]>([]);

    useEffect(() => {
        return () => {
            graphicsPool.current.forEach(s => {
                if (s && !s.destroyed) {
                    s.destroy();
                }
            });
            graphicsPool.current = [];
        };
    }, []);

    useTick(() => {
        if (!containerRef.current) return;
        const currentCount = vm.projEnemyCount;

        const pool = graphicsPool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const newGraphic = new PIXI.Graphics();
                newGraphic.visible = false;
                containerRef.current.addChild(newGraphic);
                pool.push(newGraphic);
            }
        } else if (currentCount < pool.length) {
            for (let i = pool.length - 1; i >= currentCount; i--) {
                const oldGraphic = pool.pop();
                if (oldGraphic) {
                    containerRef.current.removeChild(oldGraphic);
                    oldGraphic.destroy();
                }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const graphic = pool[i];
            const data = vm.getEnemyProjData(i);
            if (!data || paused) {
                if (graphic) graphic.visible = false;
                continue;
            }
            graphic.visible = true;
            graphic.clear();
            graphic.lineStyle(10, 0xff0000);
            graphic.drawRect(data.x, data.y, 20, 20);
        }
    });

    return <Container ref={containerRef}/>;
};

export const BHSimulation: React.FC<{
    vm: BHPresenter,
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
                <PlayerProjPool vm={vm} paused={paused}/>
                <EnemyProjPool vm={vm} paused={paused}/>
                <RockAttackPool vm={vm} paused={paused}/>
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