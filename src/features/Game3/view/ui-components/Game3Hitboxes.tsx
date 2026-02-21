// src/features/Game3/view/ui-components/Game3Hitboxes.tsx
import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';

export const Game3Hitboxes: React.FC<{
    vm: Game3Presenter;
    levelRef: React.RefObject<PIXI.Graphics>;
    heroRef: React.RefObject<PIXI.Graphics>;
}> = ({ vm, levelRef, heroRef }) => {

    useEffect(() => {
        const g = levelRef.current;
        if (!g) return;

        g.clear();
        for (const p of vm.objects) {
            let color = 0x2c3e50;
            switch(p.type) {
                case 0: color = 0x5967a1; break; // Floor (Blue-Grey)
                case 1: color = 0x800080; break; // Wall (Purple)
                case 2: color = 0x000000; break; // Void (Black)
                case 3: color = 0x0dbfba; break; // Spike (Teal)
                case 4: color = 0x1c00ff; break; // Portal (Blue)
                case 5: color = 0xff0000; break; // Exit (Red)
                case 6: color = 0x7a4b0d; break; // Fallthrough (Brown)
                default: color = 0xff00ff;       // Error/Unknown (Magenta)
            }
            g.beginFill(color, 1.0);
            g.drawRect(p.x, p.y, p.width, p.height);
            g.endFill();
        }
    }, [vm.objects]);

    return (
        <Container name="hitboxes" alpha={0.5}>
            <Graphics ref={levelRef} />
            <Graphics ref={heroRef} />
        </Container>
    );
};