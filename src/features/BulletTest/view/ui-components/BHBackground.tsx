import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Graphics, useTick } from '@pixi/react';

export const BHBackground: React.FC<{ paused: boolean, w: number, h: number }> = ({ paused, w, h }) => {
    const graphicsRef = useRef<PIXI.Graphics>(null);
    const time = useRef(0);

    useEffect(() => {
        graphicsRef.current?.clear().beginFill(0xffffff).drawRect(0, 0, w, h).endFill();
    }, [w, h]);

    useTick((delta) => {
        if (!graphicsRef.current || paused) return;
        time.current += (Math.PI / 60) * delta;
        const factor = (Math.sin(time.current) + 1) / 2;
        const r = Math.round(26 + factor * (30 - 26));
        const g = Math.round(26 + factor * (80 - 26));
        const b = Math.round(46 + factor * (150 - 46));
        graphicsRef.current.tint = (r << 16) + (g << 8) + b;
    });

    return <Graphics ref={graphicsRef} />;
};