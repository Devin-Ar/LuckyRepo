// src/features/Game3/view/ui-components/Game3Minimap.tsx
import React, { useRef, useEffect } from 'react';
import { Game3Presenter, ViewObject } from '../Game3Presenter';

interface MinimapProps {
    vm: Game3Presenter;
    /** Minimap display width in CSS pixels */
    size?: number;
}

/**
 * Renders a small minimap in the bottom-right corner showing all platforms
 * color-coded by type, with a red square for the hero's current position.
 */
export const Game3Minimap: React.FC<MinimapProps> = ({ vm, size = 160 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const objects = vm.objects;
        const hero = vm.heroVisuals;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (objects.length === 0) return;

        // Compute world bounds from all platforms + hero
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const p of objects) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x + p.width > maxX) maxX = p.x + p.width;
            if (p.y + p.height > maxY) maxY = p.y + p.height;
        }

        if (hero) {
            if (hero.x < minX) minX = hero.x;
            if (hero.y < minY) minY = hero.y;
            if (hero.x + hero.width > maxX) maxX = hero.x + hero.width;
            if (hero.y + hero.height > maxY) maxY = hero.y + hero.height;
        }

        const worldW = maxX - minX;
        const worldH = maxY - minY;

        if (worldW <= 0 || worldH <= 0) return;

        // Add a small margin
        const margin = 2;
        const drawW = canvas.width - margin * 2;
        const drawH = canvas.height - margin * 2;

        // Uniform scale to fit the map, preserving aspect ratio
        const scale = Math.min(drawW / worldW, drawH / worldH);

        // Center the map within the canvas
        const offsetX = margin + (drawW - worldW * scale) / 2;
        const offsetY = margin + (drawH - worldH * scale) / 2;

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw platforms
        for (const p of objects) {
            ctx.fillStyle = getColorForType(p.type);
            const px = offsetX + (p.x - minX) * scale;
            const py = offsetY + (p.y - minY) * scale;
            const pw = Math.max(p.width * scale, 1);
            const ph = Math.max(p.height * scale, 1);
            ctx.fillRect(px, py, pw, ph);
        }

        // Draw hero as a red square
        if (hero) {
            const hx = offsetX + (hero.x - minX) * scale;
            const hy = offsetY + (hero.y - minY) * scale;
            // Make the hero dot visible even on small maps
            const dotSize = Math.max(hero.width * scale, 3);
            const dotSizeY = Math.max(hero.height * scale, 3);

            ctx.fillStyle = '#ff2222';
            ctx.fillRect(hx, hy, dotSize, dotSizeY);

            // Bright border so it pops against dark platforms
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(hx, hy, dotSize, dotSizeY);
        }
    }); // Runs every render (driven by vm tick)

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{
                position: 'absolute',
                bottom: '1cqw',
                right: '1cqw',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                pointerEvents: 'none',
                imageRendering: 'pixelated',
                zIndex: 10,
            }}
        />
    );
};

/** Maps platform type number to a minimap color */
function getColorForType(type: number): string {
    switch (type) {
        case 0: return '#5967a1'; // Floor (Blue-Grey)
        case 1: return '#800080'; // Wall (Purple)
        case 2: return '#111111'; // Void (near-Black)
        case 3: return '#0dbfba'; // Spike (Teal)
        case 4: return '#1c00ff'; // Portal (Blue)
        case 5: return '#ff4444'; // Exit (Red)
        case 6: return '#7a4b0d'; // Fallthrough (Brown)
        default: return '#333333';
    }
}