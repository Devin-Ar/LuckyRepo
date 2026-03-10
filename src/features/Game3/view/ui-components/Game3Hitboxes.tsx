// src/features/Game3/view/ui-components/Game3Hitboxes.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Container, Graphics, useTick} from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';
import {DebugContext} from "../../../../App";

const HitboxStatic: React.FC<{
    vm: Game3Presenter;
}> = ({ vm }) => {
    const containerRef = useRef<PIXI.Container>(null);
    const built = useRef(false);

    useTick(() => {
        if (!containerRef.current || built.current) return;
        const objects = vm.objects;
        if (!objects || objects.length === 0) return;
        //I still don't understand how objects isn't initialized by this point...
        const first = objects[0];
        const last = objects[objects.length - 1];
        if (first.width === 0 || last.width === 0) return;
        built.current = true;

        const g = new PIXI.Graphics();
        containerRef.current.addChild(g);
        //Craziest part is if we put a print statement here, it slows the process enough to load correctly.
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
                default: color = 0xff00ff;        // Error/Unknown (Magenta)
            }
            g.beginFill(color, 1.0);
            g.drawRect(p.x, p.y, p.width, p.height);
            g.endFill();
        }
    });

    return <Container ref={containerRef} />;
};

const HitboxHero: React.FC<{
    vm: Game3Presenter;
}> = ({ vm }) => {
    const boxbox = useRef<PIXI.Graphics>(null);
    useTick(() => {
        if (!boxbox.current) return;
        const g = boxbox.current;
        if (!g) return;
        const hero = vm.heroVisuals;
        g.clear();
        if (!hero || (hero.x === 0 && hero.y === 0 && hero.width === 0 && hero.height === 0)) return;
        g.beginFill(0x00ffff);
        g.drawRect(hero.x, hero.y, hero.width, hero.height);
        g.endFill();
    });
    return <Graphics ref={boxbox} />;
};

export const Game3Hitboxes: React.FC<{
    vm: Game3Presenter;
}> = ({ vm }) => {
    const debugMode = useContext(DebugContext);
    const containerRef = useRef<PIXI.Container>(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        setOpacity(debugMode ? 0.5 : 0);
    }, [debugMode]);

    return (
        <Container ref={containerRef} name="hitboxes" alpha={opacity}>
            <HitboxStatic vm={vm} />
            <HitboxHero vm={vm}/>
        </Container>
    );
};