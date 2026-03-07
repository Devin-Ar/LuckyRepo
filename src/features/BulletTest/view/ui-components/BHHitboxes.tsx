import React, {useContext, useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';
import {GameSprite} from '../../../../components/GameSprite';
import {DebugContext} from "../../../../App";

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
            if (!data || paused || data.primedMode !== 1 || data2.type === 3) {
                if (graphic) graphic.visible = false;
                continue;
            }
            graphic.visible = true;
            graphic.clear().lineStyle(10, 0xff0000, 0.2).moveTo(data2.x, data2.y).lineTo(data.endX, data.endY);
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
    const debugMode = useContext(DebugContext);
    const debugModeRef = useRef(debugMode);

    useEffect(() => {
        debugModeRef.current = debugMode;
    }, [debugMode]);

    useTick(() => {
        if (!graphicsRef.current || paused) return;
        const g = graphicsRef.current;
        g.clear();
        console.log(debugModeRef.current);
        if (!debugModeRef.current) return;
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

    const sheetName = bossData.phase >= 3 ? 'boss_p3' : 'boss_p12';
    const spriteScale = bossData.width / 32;
    const centerX = bossData.x + bossData.width / 2;
    const centerY = bossData.y + bossData.height / 2;
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

/**
 * Draws health bars above the player, all enemies, and the boss.
 * Each bar is a small rectangle centered above the entity.
 */
const HealthBarLayer: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const graphicsRef = useRef<PIXI.Graphics>(null);

    useTick(() => {
        if (!graphicsRef.current || paused) return;
        const g = graphicsRef.current;
        g.clear();

        const BAR_HEIGHT = 4;
        const BAR_OFFSET = 10; // pixels above entity top edge

        // --- Player health bar ---
        const hero = vm.heroVisuals;
        const playerHp = vm.hp;
        if (hero.width > 0 && playerHp > 0) {
            const barWidth = hero.width * 1.2;
            const barX = hero.x - barWidth / 2;
            const barY = hero.y - hero.height / 2 - BAR_OFFSET - BAR_HEIGHT;
            const hpRatio = Math.max(0, Math.min(1, playerHp / 100));

            // Background
            g.beginFill(0x000000, 0.6);
            g.drawRect(barX - 1, barY - 1, barWidth + 2, BAR_HEIGHT + 2);
            g.endFill();

            // Fill
            const playerColor = playerHp < 30 ? 0xc0392b : 0x27ae60;
            g.beginFill(playerColor, 0.9);
            g.drawRect(barX, barY, barWidth * hpRatio, BAR_HEIGHT);
            g.endFill();
        }

        // --- Enemy health bars ---
        const rockCount = vm.entityCount;
        for (let i = 0; i < rockCount; i++) {
            const rock = vm.getRockViewData(i);
            if (rock.width <= 0 || rock.maxHp <= 0) continue;

            const hpRatio = Math.max(0, Math.min(1, rock.hp / rock.maxHp));
            // Don't draw if full HP
            if (hpRatio >= 1.0) continue;

            const barWidth = rock.width * 1.0;
            const barX = rock.x - barWidth / 2;
            const barY = rock.y - rock.height / 2 - BAR_OFFSET - BAR_HEIGHT;

            // Background
            g.beginFill(0x000000, 0.6);
            g.drawRect(barX - 1, barY - 1, barWidth + 2, BAR_HEIGHT + 2);
            g.endFill();

            // Fill — yellow for enemies
            g.beginFill(0xe67e22, 0.9);
            g.drawRect(barX, barY, barWidth * hpRatio, BAR_HEIGHT);
            g.endFill();
        }

        // --- Boss health bar ---
        if (vm.bossActive && vm.bossHp > 0) {
            const bossX = vm.bossPos.x;
            const bossY = vm.bossPos.y;
            const bossW = vm.bossWidth || 200;
            const bossH = vm.bossHeight || 200;

            const bossBarWidth = bossW * 1.2;
            const bossBarHeight = 8;
            const bossBarX = bossX + bossW / 2 - bossBarWidth / 2;
            const bossBarY = bossY - BAR_OFFSET - bossBarHeight;
            const bossHpRatio = Math.max(0, Math.min(1, vm.bossHp / 300));

            // Background
            g.beginFill(0x000000, 0.7);
            g.drawRect(bossBarX - 1, bossBarY - 1, bossBarWidth + 2, bossBarHeight + 2);
            g.endFill();

            // Fill — red when vulnerable, grey when protected
            const bossColor = vm.bossVulnerable ? 0xe74c3c : 0x666666;
            g.beginFill(bossColor, 0.9);
            g.drawRect(bossBarX, bossBarY, bossBarWidth * bossHpRatio, bossBarHeight);
            g.endFill();

            // Border glow when vulnerable
            if (vm.bossVulnerable) {
                g.lineStyle(1, 0xe74c3c, 0.6);
                g.drawRect(bossBarX - 2, bossBarY - 2, bossBarWidth + 4, bossBarHeight + 4);
            }
        }
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
            <HealthBarLayer vm={vm} paused={paused}/>
        </Container>
    );
};