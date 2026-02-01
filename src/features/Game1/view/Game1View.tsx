// src/features/Game1/view/Game1View.ts
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Stage} from '@pixi/react';
import {Game1Presenter} from './Game1Presenter';
import {Game1Controller} from './Game1Controller';
import {StateManager} from '../../../core/managers/StateManager';
import {IGameViewProps} from '../../../core/interfaces/IViewProps';
import {Game1Level} from "../model/Game1Config";

import {Game1Simulation} from './ui-components/Game1Simulation';
import {Game1HUD} from './ui-components/Game1HUD';

export const Game1View: React.FC<IGameViewProps<Game1Presenter, Game1Controller>> = ({
                                                                                         vm,
                                                                                         controller,
                                                                                         width = 960,
                                                                                         height = 540
                                                                                     }) => {
    const [hpState, setHpState] = useState(vm.hp);
    const [rockCount, setRockCount] = useState(vm.entityCount);
    const [isPaused, setIsPaused] = useState(false);

    const shieldBarRef = useRef<HTMLDivElement>(null);
    const shieldTextRef = useRef<HTMLSpanElement>(null);
    const damageBtnRef = useRef<HTMLButtonElement>(null);
    const heroPosRef = useRef({x: vm.pos.x, y: vm.pos.y});

    useEffect(() => {
        const unsubscribe = vm.subscribe(() => {
            const stateManager = StateManager.getInstance();
            const activeState = stateManager.getActiveState();
            const pausedStatus = activeState?.name !== "Game1";
            if (isPaused !== pausedStatus) setIsPaused(pausedStatus);

            const currentHp = vm.hp;
            heroPosRef.current.x = vm.pos.x;
            heroPosRef.current.y = vm.pos.y;

            if (shieldBarRef.current) shieldBarRef.current.style.width = `${Math.max(0, currentHp)}%`;
            if (shieldTextRef.current) shieldTextRef.current.innerText = `${Math.round(currentHp)}%`;

            if (Math.abs(hpState - currentHp) > 1) setHpState(currentHp);
            if (rockCount !== vm.entityCount) setRockCount(vm.entityCount);
        });
        return () => unsubscribe();
    }, [vm, hpState, rockCount, isPaused]);

    const scaleFactor = useMemo(() => width / 960, [width]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Stage
                    key={`stage-${width}-${height}`}
                    width={width} height={height}
                    options={{backgroundColor: 0x000, antialias: true, resolution: 1, autoDensity: false}}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated'
                    }}
                >
                    <Game1Simulation
                        vm={vm}
                        paused={isPaused}
                        width={width}
                        height={height}
                        scale={scaleFactor}
                        heroPos={heroPosRef}
                        hp={hpState}
                    />
                </Stage>
            </div>

            <Game1HUD
                hp={hpState}
                rockCount={rockCount}
                shieldBarRef={shieldBarRef}
                shieldTextRef={shieldTextRef}
                damageBtnRef={damageBtnRef}
                onDamage={() => controller.takeDamage()}
                onJumpToG2={() => controller.jumpToGame2()}
                onLevel1={() => controller.loadLevel(Game1Level.Level1)}
                onLevel2={() => controller.loadLevel(Game1Level.Level2)}
                onLevel3={() => controller.loadLevel(Game1Level.Level3)}
                onResetG1={() => controller.resetLevel()}
                onNextLevel={() => controller.nextLevel()}
                onFailLevel={() => controller.failLevel()}
            />
        </div>
    );
};