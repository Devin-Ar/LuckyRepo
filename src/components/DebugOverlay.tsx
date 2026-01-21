import React, {useEffect, useRef} from 'react';
import {Engine} from '../core/Engine';
import {StateManager} from '../core/managers/StateManager';

export const DebugOverlay: React.FC = () => {
    const perfRef = useRef<HTMLDivElement>(null);
    const engine = Engine.getInstance();
    const stateManager = StateManager.getInstance();

    const lastStackSize = useRef(0);
    const transitionLog = useRef<string[]>([]);
    const activeKeys = useRef<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => activeKeys.current.add(e.key.toUpperCase());
        const handleKeyUp = (e: KeyboardEvent) => activeKeys.current.delete(e.key.toUpperCase());

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let rafId: number;

        const updateStats = () => {
            if (perfRef.current) {
                const fps = (engine as any).fps || 0;
                const frame = (engine as any).frameCount || 0;
                const stateStack = (stateManager as any).stack || [];

                if (stateStack.length !== lastStackSize.current) {
                    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
                    const action = stateStack.length > lastStackSize.current ? "PUSH" : "POP";
                    const stateName = stateStack[stateStack.length - 1]?.name || "NULL";

                    transitionLog.current.unshift(`[${timestamp}] ${action}: ${stateName}`);
                    if (transitionLog.current.length > 3) transitionLog.current.pop();

                    lastStackSize.current = stateStack.length;
                }

                const stackTrace = stateStack
                    .map((s: any, i: number) => {
                        const isTop = i === stateStack.length - 1;
                        return `${isTop ? " ACTIVE >" : "        -"} [${i}] ${s.name}`;
                    })
                    .reverse()
                    .join('\n');

                const keysArr = Array.from(activeKeys.current);
                const inputDisplay = keysArr.length > 0 ? keysArr.join(' | ') : "IDLE";

                perfRef.current.innerText =
                    `// ENGINE_STATS\n` +
                    `FPS:    ${fps}\n` +
                    `FRAME:  ${frame}\n\n` +
                    `// STATE_STACK\n` +
                    `${stackTrace || "EMPTY"}\n\n` +
                    `// INPUT_MONITOR\n` +
                    `KEYS:   ${inputDisplay}\n\n` +
                    `// RECENT_TRANSITIONS\n` +
                    `${transitionLog.current.join('\n') || "NONE"}`;
            }
            rafId = requestAnimationFrame(updateStats);
        };

        rafId = requestAnimationFrame(updateStats);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [engine, stateManager]);

    return (
        <div ref={perfRef} style={{
            position: 'absolute',
            top: '1cqw',
            right: '1cqw',
            color: '#0f0',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            textAlign: 'left',
            fontSize: '0.95cqw',
            lineHeight: '1.4',
            textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
            backgroundColor: 'rgba(5, 5, 5, 0.9)',
            padding: '1.2cqw',
            borderRadius: '0.2cqw',
            pointerEvents: 'none',
            zIndex: 9999,
            borderLeft: '3px solid #0f0',
            minWidth: '22cqw',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            letterSpacing: '0.05cqw'
        }}/>
    );
};