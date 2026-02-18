// src/features/Game3/view/ui-components/Game3Simulation.tsx
import React, { useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, useTick } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';

export const Game3Simulation: React.FC<{
    vm: Game3Presenter;
    width: number;
    height: number;
}> = ({ vm, width, height }) => {
    const worldContainerRef = useRef<PIXI.Container>(null);
    const [heroVisuals, setHeroVisuals] = useState(vm.heroVisuals);
    // State to hold the dynamic object list
    const [objects, setObjects] = useState(vm.objects);

    const worldScale = vm.worldScale;

    useTick((delta) => {
        const hero = vm.heroVisuals;
        if (!worldContainerRef.current || !hero) return;

        // Fetch objects from SAB via Presenter
        setObjects(vm.objects);

        const currentScale = worldScale;
        const heroCenterX = hero.x + (hero.width / 2);
        const heroCenterY = hero.y + (hero.height / 2);

        const targetX = (width / 2) - (heroCenterX * currentScale);
        const targetY = (height / 2) - (heroCenterY * currentScale);

        worldContainerRef.current.x += (targetX - worldContainerRef.current.x) * 0.1 * delta;
        worldContainerRef.current.y += (targetY - worldContainerRef.current.y) * 0.1 * delta;

        setHeroVisuals({ ...hero });
    });

    return (
        <Container ref={worldContainerRef} scale={worldScale}>
            {/* Dynamic Objects Rendering via SAB */}
            <Graphics
                draw={(g) => {
                    g.clear();

                    // Iterate over the objects retrieved from the Buffer
                    for (const p of objects) {
                        g.lineStyle(1 / worldScale, 0xffffff, 0.3);

                        // Decode Color based on Type
                        // 0=Floor, 1=Wall, 2=Void, 3=Spike, 4=Portal, 5=Exit
                        let color = 0x2c3e50; // default floor
                        let alpha = 0.8;

                        switch(p.type) {
                            case 1: color = 0x8e44ad; break; // Wall
                            case 2: color = 0x000000; break; // Void
                            case 3: color = 0x1abc9c; break; // Spike
                            case 4: color = 0x1c00ff; break; // Portal
                            case 5:
                                color = 0xff0000;
                                alpha = 0.0;
                                g.lineStyle(2 / worldScale, 0xff0000, 1.0);
                                break; // Exit
                        }

                        g.beginFill(color, alpha);
                        g.drawRect(p.x, p.y, p.width, p.height);
                        g.endFill();
                    }
                }}
            />

            {/* Hero Visualization */}
            <Graphics
                draw={(g) => {
                    g.clear();

                    let color = 0x27ae60; // Idle
                    if (heroVisuals.animState === 1) color = 0x2980b9; // Walk
                    if (heroVisuals.animState === 2) color = 0xc0392b; // Jump
                    if (heroVisuals.animState === 3) color = 0x8e44ad; // WallSlide

                    g.lineStyle(2 / worldScale, 0xffffff, 0.8);

                    g.beginFill(color, 0.6);
                    g.drawRect(heroVisuals.x, heroVisuals.y, heroVisuals.width, heroVisuals.height);
                    g.endFill();

                    const indicatorW = heroVisuals.width * 0.2;
                    const indicatorX = heroVisuals.flipX ? heroVisuals.x : heroVisuals.x + heroVisuals.width - indicatorW;
                    g.beginFill(0xffffff, 0.5);
                    g.drawRect(indicatorX, heroVisuals.y + heroVisuals.height * 0.1, indicatorW, heroVisuals.height * 0.2);
                    g.endFill();
                }}
            />
        </Container>
    );
};