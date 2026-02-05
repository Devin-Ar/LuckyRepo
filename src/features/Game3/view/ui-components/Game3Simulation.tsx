// src/features/Game3/view/ui-components/Game3Simulation.tsx
import React, { useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, useTick } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';
import { PlatformData } from '../../data/Game3MapData';

export const Game3Simulation: React.FC<{
    vm: Game3Presenter;
    width: number;
    height: number;
}> = ({ vm, width, height }) => {
    const worldContainerRef = useRef<PIXI.Container>(null);
    const [heroVisuals, setHeroVisuals] = useState(vm.heroVisuals);
    const worldScale = vm.worldScale;

    useTick((delta) => {
        const hero = vm.heroVisuals;
        if (!worldContainerRef.current || !hero) return;

        const currentScale = worldScale;
        const heroCenterX = hero.x + (hero.width / 2);
        const heroCenterY = hero.y + (hero.height / 2);

        const targetX = (width / 2) - (heroCenterX * currentScale);
        const targetY = (height / 2) - (heroCenterY * currentScale);

        // Smooth camera follow
        worldContainerRef.current.x += (targetX - worldContainerRef.current.x) * 0.1 * delta;
        worldContainerRef.current.y += (targetY - worldContainerRef.current.y) * 0.1 * delta;

        setHeroVisuals({ ...hero });
    });


    return (
        <Container ref={worldContainerRef} scale={worldScale}>
            {/* Environment Hitboxes */}
            <Graphics
                draw={(g) => {
                    g.clear();
                    if (!vm.mapData) return;

                    for (const p of vm.mapData.platforms) {
                        // Border for the hitbox
                        g.lineStyle(1 / worldScale, 0xffffff, 0.3);

                        // Fill: Floor is darker, platforms are distinct
                        g.beginFill(p.isFloor ? 0x2c3e50 : 0x34495e, 0.8);
                        g.drawRect(p.x, p.y, p.width, p.height);
                        g.endFill();
                    }
                }}
            />

            {/* Hero Hitbox Visualization (Temporary replacement for sprite) */}
            <Graphics
                draw={(g) => {
                    g.clear();

                    // Color based on state: 0:Idle (Green), 1:Walk (Blue), 2:Jump (Red)
                    let color = 0x27ae60; // Idle
                    if (heroVisuals.animState === 1) color = 0x2980b9; // Walk
                    if (heroVisuals.animState === 2) color = 0xc0392b; // Jump

                    // Hitbox border
                    g.lineStyle(2 / worldScale, 0xffffff, 0.8);

                    // Hitbox fill
                    g.beginFill(color, 0.6);
                    g.drawRect(heroVisuals.x, heroVisuals.y, heroVisuals.width, heroVisuals.height);
                    g.endFill();

                    // Direction indicator (where the character is facing)
                    const indicatorW = heroVisuals.width * 0.2;
                    const indicatorX = heroVisuals.flipX ? heroVisuals.x : heroVisuals.x + heroVisuals.width - indicatorW;
                    g.beginFill(0xffffff, 0.5);
                    g.drawRect(indicatorX, heroVisuals.y + heroVisuals.height * 0.1, indicatorW, heroVisuals.height * 0.2);
                    g.endFill();

                    // Feet center (anchor point reference)
                    g.beginFill(0xffff00, 1);
                    g.drawCircle(heroVisuals.x + heroVisuals.width / 2, heroVisuals.y + heroVisuals.height, 0.05);
                    g.endFill();
                }}
            />
        </Container>
    );
};
