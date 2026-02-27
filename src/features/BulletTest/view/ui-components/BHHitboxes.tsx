import React, {useEffect, useRef} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';

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

const BossRenderer: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const graphicsRef = useRef<PIXI.Graphics>(null);
    useTick(() => {
        if (!graphicsRef.current) return;
        if (!vm.bossActive || paused) { graphicsRef.current.visible = false; return; }
        const pos = vm.bossPos;
        graphicsRef.current.visible = true;
        graphicsRef.current.clear().beginFill(vm.bossVulnerable ? 0xe74c3c : 0x444444)
            .lineStyle(4, 0xffffff).drawCircle(pos.x + 100, pos.y + 100, 100).endFill();
    });
    return <Graphics ref={graphicsRef} />;
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