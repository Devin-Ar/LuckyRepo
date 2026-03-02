import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';
import {GameSprite} from '../../../../components/GameSprite';

const RockAttackPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const graphicsPool = useRef<PIXI.Graphics[]>([]);

    useEffect(() => {
        return () => {
            graphicsPool.current.forEach(s => s && !s.destroyed && s.destroy());
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
                if (oldGraphic) { containerRef.current.removeChild(oldGraphic); oldGraphic.destroy(); }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const graphic = pool[i];
            const data = vm.getRockAttackData(i);
            const data2 = vm.getRockViewData(i);
            if (!data || paused || data.primedMode !== 1) {
                if (graphic) graphic.visible = false;
                continue;
            }
            graphic.visible = true;
            graphic.clear().lineStyle(30, 0xff0000).moveTo(data2.x, data2.y).lineTo(data.endX, data.endY);
        }
    });
    return <Container ref={containerRef}/>;
};

const ProjPool: React.FC<{ vm: BHPresenter, paused: boolean, type: 'player' | 'enemy' }> = ({vm, paused, type}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const graphicsPool = useRef<PIXI.Graphics[]>([]);

    useTick(() => {
        if (!containerRef.current) return;
        const currentCount = type === 'player' ? vm.projCount : vm.projEnemyCount;
        const pool = graphicsPool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const g = new PIXI.Graphics();
                containerRef.current.addChild(g);
                pool.push(g);
            }
        } else if (currentCount < pool.length) {
            for (let i = pool.length - 1; i >= currentCount; i--) {
                const g = pool.pop();
                if (g) { containerRef.current.removeChild(g); g.destroy(); }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const graphic = pool[i];
            const data = type === 'player' ? vm.getPlayerProjData(i) : vm.getEnemyProjData(i);
            if (!data || paused) { if (graphic) graphic.visible = false; continue; }
            const color = type === 'player' ? 0x00ff00 : 0xff0000;
            graphic.visible = true;
            graphic.clear().lineStyle(2, color).beginFill(color, 0.4)
                .drawRect(data.x - (data.width || 10) / 2, data.y - (data.height || 10) / 2, data.width || 10, data.height || 10)
                .endFill();
        }
    });
    return <Container ref={containerRef}/>;
};

const DebugHitboxRenderer: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const graphicsRef = useRef<PIXI.Graphics>(null);
    useTick(() => {
        if (!graphicsRef.current || paused) return;
        const g = graphicsRef.current;
        g.clear();
        const hero = vm.heroVisuals;
        if (hero.width > 0) {
            g.lineStyle(2, 0x00ffff, 0.8).drawRect(hero.x - hero.width / 2, hero.y - hero.height / 2, hero.width, hero.height);
        }
        const rockCount = vm.entityCount;
        g.lineStyle(2, 0xffff00, 0.8);
        for (let i = 0; i < rockCount; i++) {
            const rock = vm.getRockViewData(i);
            if (rock.width > 0) g.drawRect(rock.x - rock.width / 2, rock.y - rock.height / 2, rock.width, rock.height);
        }
    });
    return <Graphics ref={graphicsRef} />;
};

/**
 * BossRenderer — animated sprite boss using boss_p12 (phases 1-2) and boss_p3 (phase 3).
 * Switches spritesheet based on boss phase, animates using the frame index from the logic worker.
 * The boss sprite is 32x32 native but scaled up to fill the boss hitbox (200x200).
 */
const BossRenderer: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const [bossData, setBossData] = useState({
        active: false, x: 0, y: 0, vulnerable: false,
        animFrame: 0, phase: 1, width: 200, height: 200
    });

    useTick(() => {
        if (paused) return;
        setBossData({
            active: vm.bossActive,
            x: vm.bossPos.x,
            y: vm.bossPos.y,
            vulnerable: vm.bossVulnerable,
            animFrame: vm.bossAnimFrame,
            phase: vm.bossPhase,
            width: vm.bossWidth || 200,
            height: vm.bossHeight || 200
        });
    });

    if (!bossData.active) return null;

    // Choose spritesheet based on phase: phases 1-2 use boss_p12, phase 3 uses boss_p3
    const sheetName = bossData.phase >= 3 ? 'boss_p3' : 'boss_p12';

    // Scale: native sprite is 32x32, boss hitbox is 200x200 → scale = 200/32 ≈ 6.25
    const spriteScale = bossData.width / 32;

    // Center the sprite on the boss hitbox (boss position is top-left of hitbox)
    const centerX = bossData.x + bossData.width / 2;
    const centerY = bossData.y + bossData.height / 2;

    // Pulse alpha when vulnerable for visual feedback
    const alpha = bossData.vulnerable ? 0.7 + Math.sin(Date.now() * 0.01) * 0.3 : 1.0;

    return (
        <Container>
            <GameSprite
                sheetName={sheetName}
                animationName="idle"
                x={centerX}
                y={centerY}
                scale={spriteScale}
                anchor={0.5}
                currentFrame={bossData.animFrame}
                alpha={alpha}
            />
        </Container>
    );
};

export const BHHitboxes: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    return (
        <Container name="hitbox_layer">
            <RockAttackPool vm={vm} paused={paused}/>
            <ProjPool vm={vm} paused={paused} type="player"/>
            <ProjPool vm={vm} paused={paused} type="enemy"/>
            <BossRenderer vm={vm} paused={paused}/>
            <DebugHitboxRenderer vm={vm} paused={paused}/>
        </Container>
    );
};