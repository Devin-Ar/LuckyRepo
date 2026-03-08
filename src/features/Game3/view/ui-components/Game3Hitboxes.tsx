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
                case 7: color = 0x4aa908; break; // Plat (Green)
                case 8: color = 0xff00d5; break; // Non-Wall (Pink)
                case 9: color = 0xfff000; break; // Display Wall (Yellow)
                case 10: color = 0x00ff86; break; // Grass FG (Light Green)
                case 11: color = 0x2d6349; break; // Grass BG (Dark Green)
                case 12: color = 0x434918; break; // Non-Organic FG (Dark Olive)
                case 13: color = 0x98998d; break; // Non-Organic BG (Grey-Olive)
                case 14: color = 0xffd700; break; // Coin (Gold)
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