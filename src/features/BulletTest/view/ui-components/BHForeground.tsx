import React, {useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, useTick} from '@pixi/react';
import {BHPresenter} from '../BHPresenter';
import {GameSprite} from '../../../../components/GameSprite';
import {SpriteManager} from "../../../../core/managers/SpriteManager";

const HeroSprite: React.FC<{ vm: BHPresenter, paused: boolean, heroRef: React.RefObject<PIXI.Container> }> = ({ vm, paused, heroRef }) => {
    const [visuals, setVisuals] = useState(vm.heroVisuals);
    const [anim, setAnim] = useState("idle");

    useTick(() => {
        if (paused) return;
        const latest = vm.heroVisuals;
        if (latest.vx != 0 || latest.vy != 0) {
            setAnim("walk");
        } else {
            setAnim("idle");
        }

        if (latest.currentFrame !== visuals.currentFrame) {
            setVisuals(latest);
        }
    });

    return (
        <Container ref={heroRef}>
            <GameSprite
                sheetName="hero_body"
                animationName={anim}
                anchor={0.5}
                currentFrame={visuals.currentFrame}
                scale={2.5}
            />
        </Container>
    );
};

const RockPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.AnimatedSprite[]>([]);
    const manager = SpriteManager.getInstance();

    useTick(() => {
        if (!containerRef.current) return;
        const currentCount = vm.entityCount;
        const pool = spritePool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                const data = vm.getRockViewData(i);
                let textures;
                if ( data.type === 1 ) {
                    textures = manager.getAnimation('shot_drone_movement');
                }  else if (data.type === 3) {
                    textures = manager.getAnimation('bash_drone_movement');
                } else {
                    textures = manager.getAnimation('laser_drone_movement');
                }
                if (textures.length > 0) {
                    const sprite = new PIXI.AnimatedSprite(textures);
                    sprite.anchor.set(0.5);
                    sprite.scale.set(1.5);
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
            let textures;
            if ( data.type === 1 ) {
                textures = manager.getAnimation('shot_drone_movement');
                sprite.rotation = data.rotation;
            } else if (data.type === 3) {
                const data2 = vm.getRockAttackData(i);
                if (data2.endX === 0) {
                    textures = manager.getAnimation('bash_drone_idle');
                } else {
                    textures = manager.getAnimation('bash_drone_movement');
                }
                const flipped = data2.endY >= 1.5 || data2.endY <= -1.5;
                sprite.scale.set(flipped ? -1 : 1, 1);
                sprite.rotation = flipped ? data2.endY + Math.PI : data2.endY;
            } else {
                textures = manager.getAnimation('laser_drone_movement');
                sprite.rotation = data.rotation;
            }
            sprite.textures = textures;
            sprite.visible = true;
            sprite.x = data.x;
            sprite.y = data.y;

            if (sprite.textures.length > 0) {
                const frameIndex = Math.floor(data.currentFrame) % sprite.textures.length;
                sprite.gotoAndStop(frameIndex);
            }
        }
    });
    return <Container ref={containerRef}/>;
};

const RockChargePool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.AnimatedSprite[]>([]);
    const manager = SpriteManager.getInstance();

    useTick(() => {
        if (!containerRef.current) return;
        const currentCount = vm.entityCount;
        const pool = spritePool.current;

        if (currentCount > pool.length) {
            for (let i = pool.length; i < currentCount; i++) {
                let textures;
                textures = manager.getAnimation('laser_charge_charge');
                if (textures.length > 0) {
                    const sprite = new PIXI.AnimatedSprite(textures);
                    sprite.anchor.set(0.5);
                    sprite.scale.set(.5);
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
            const data = vm.getRockAttackData(i);
            const data2 = vm.getRockViewData(i);
            if (!data || paused || data.primedMode !== 1 || data2.type === 3) {
                if (sprite) sprite.visible = false;
                continue;
            }
            sprite.visible = true;
            sprite.x = data2.x;
            sprite.y = data2.y;

            if (sprite.textures.length > 0) {
                const frameIndex = Math.floor(data2.currentFrame) % sprite.textures.length;
                sprite.gotoAndStop(frameIndex);
            }
        }
    });
    return <Container ref={containerRef}/>;
};

const HeroArmPool: React.FC<{ vm: BHPresenter, paused: boolean }> = ({vm, paused}) => {
    const containerRef = useRef<PIXI.Container>(null);
    const spritePool = useRef<PIXI.AnimatedSprite[]>([]);
    const manager = SpriteManager.getInstance();

    useTick(() => {
        if (!containerRef.current) return;
        const pool = spritePool.current;
        if (1 > pool.length) {
            const textures = manager.getAnimation('hero_arm_static');
            if (textures && textures.length > 0) {
                const sprite = new PIXI.AnimatedSprite(textures);
                sprite.anchor.set(0.5, 0.5);
                sprite.scale.set(2.5);
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
                sprite.y = heroVisuals.y + 25;
                const flipped = heroVisuals.mousePos >= 1.5 || heroVisuals.mousePos <= -1.5;
                sprite.scale.set(flipped ? -2.5 : 2.5, 2.5);
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
            <HeroSprite vm={vm} paused={paused} heroRef={heroRef} />
            <HeroArmPool vm={vm} paused={paused}/>
        </Container>
    );
};