import React, {useEffect, useRef} from 'react';
import * as PIXI from 'pixi.js';
import {Container, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';
import {GameSprite} from '../../../../components/GameSprite';
import {SpriteManager} from "../../../../core/managers/SpriteManager";

const RockPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.Sprite[]>([]);
    const manager = SpriteManager.getInstance();

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
                if (sprite) { containerRef.current.removeChild(sprite); sprite.destroy(); }
            }
        }

        for (let i = 0; i < currentCount; i++) {
            const sprite = pool[i];
            const data = vm.getRockViewData(i);
            if (!data || paused) { if (sprite) sprite.visible = false; continue; }
            sprite.visible = true;
            sprite.x = data.x; sprite.y = data.y; sprite.rotation = data.rotation;
        }
    });
    return <Container ref={containerRef}/>;
};

const GoldShipGunPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.Sprite[]>([]);
    const manager = SpriteManager.getInstance();

    useTick(() => {
        if (!containerRef.current) return;
        const pool = spritePool.current;
        if (1 > pool.length) {
            const texture = manager.getTexture('Gold Ship Gun');
            if (texture) {
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5, 0.7);
                containerRef.current.addChild(sprite);
                pool.push(sprite);
            }
        }
        const heroVisuals = vm.heroVisuals;
        if (pool[0]) {
            const sprite = pool[0];
            if (paused) { sprite.visible = false; }
            else {
                sprite.visible = true;
                sprite.x = heroVisuals.x;
                sprite.y = heroVisuals.y + 12;
                const flipped = heroVisuals.mousePos >= 1.5 || heroVisuals.mousePos <= -1.5;
                sprite.scale.set(flipped ? -1 : 1, 1);
                sprite.rotation = flipped ? heroVisuals.mousePos + Math.PI : heroVisuals.mousePos;
            }
        }
    });
    return <Container ref={containerRef}/>;
};

export const BHForeground: React.FC<{ vm: BHPresenter, paused: boolean, heroRef: React.RefObject<PIXI.Container> }> = ({vm, paused, heroRef}) => {
    return (
        <Container name="foreground">
            <RockPool vm={vm} paused={paused}/>
            <Container ref={heroRef}>
                <GameSprite
                    sheetName="gold_shipBH"
                    animationName="idle"
                    anchor={0.5}
                    currentFrame={vm.heroVisuals.currentFrame}
                />
            </Container>
            <GoldShipGunPool vm={vm} paused={paused}/>
        </Container>
    );
};