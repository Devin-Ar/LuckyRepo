// src/features/BulletTest/view/BHView.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { BHPresenter } from './BHPresenter';
import { BHController } from './BHController';
import { StateManager } from '../../../core/managers/StateManager';
import { IGameViewProps } from '../../../core/interfaces/IViewProps';
import { BHLevel } from "../model/BHConfig";

import { BHSimulation } from './ui-components/BHSimulation';
import { BH_HUD } from './ui-components/BH_HUD';

export const BHView: React.FC<IGameViewProps<BHPresenter, BHController>> = ({
                                                                                vm, controller, width = 960, height = 540
                                                                            }) => {
    const [hpState, setHpState] = useState(vm.hp);
    const [rockCount, setRockCount] = useState(vm.entityCount);
    const [isPaused, setIsPaused] = useState(false);

    // Wave state
    const [currentWave, setCurrentWave] = useState(vm.currentWave);
    const [totalWaves, setTotalWaves] = useState(vm.totalWaves);
    const [waveState, setWaveState] = useState(vm.waveState);
    const [waveDelayTimer, setWaveDelayTimer] = useState(vm.waveDelayTimer);
    const [isRoomCleared, setIsRoomCleared] = useState(vm.isRoomCleared);

    const shieldBarRef = useRef<HTMLDivElement>(null);
    const shieldTextRef = useRef<HTMLSpanElement>(null);
    const damageBtnRef = useRef<HTMLButtonElement>(null);
    const heroPosRef = useRef({ x: vm.pos.x, y: vm.pos.y });

    useEffect(() => {
        const unsubscribe = vm.subscribe(() => {
            const stateManager = StateManager.getInstance();
            const activeState = stateManager.getActiveState();
            const pausedStatus = activeState?.name !== "BHGame";
            if (isPaused !== pausedStatus) setIsPaused(pausedStatus);

            const currentHp = vm.hp;
            heroPosRef.current.x = vm.pos.x;
            heroPosRef.current.y = vm.pos.y;

            if (shieldBarRef.current) shieldBarRef.current.style.width = `${Math.max(0, currentHp)}%`;
            if (shieldTextRef.current) shieldTextRef.current.innerText = `${Math.round(currentHp)}%`;

            if (Math.abs(hpState - currentHp) > 1) setHpState(currentHp);
            if (rockCount !== vm.entityCount) setRockCount(vm.entityCount);

            // Update wave state
            setCurrentWave(vm.currentWave);
            setTotalWaves(vm.totalWaves);
            setWaveState(vm.waveState);
            setWaveDelayTimer(vm.waveDelayTimer);
            setIsRoomCleared(vm.isRoomCleared);
        });
        return () => unsubscribe();
    }, [vm, hpState, rockCount, isPaused]);

    const scaleFactor = useMemo(() => width / 960, [width]);

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            overflow: 'hidden', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                position: 'relative', width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Stage
                    key={`stage-${width}-${height}`}
                    width={width} height={height}
                    options={{ backgroundColor: 0x000, antialias: true, resolution: 1, autoDensity: false }}
                    style={{
                        display: 'block', width: '100%', height: '100%',
                        objectFit: 'contain', imageRendering: 'pixelated'
                    }}
                >
                    <BHSimulation
                        vm={vm} paused={isPaused}
                        width={width} height={height}
                        scale={scaleFactor} heroPos={heroPosRef} hp={hpState}
                    />
                </Stage>
            </div>

            <BH_HUD
                hp={hpState}
                rockCount={rockCount}
                currentWave={currentWave}
                totalWaves={totalWaves}
                waveState={waveState}
                waveDelayTimer={waveDelayTimer}
                isRoomCleared={isRoomCleared}
                shieldBarRef={shieldBarRef}
                shieldTextRef={shieldTextRef}
                damageBtnRef={damageBtnRef}
                onDamage={() => controller.takeDamage()}
                onJumpToG2={() => controller.jumpToGame2()}
                onLevel1={() => controller.loadLevel(BHLevel.Level1)}
                onLevel2={() => controller.loadLevel(BHLevel.Level2)}
                onLevel3={() => controller.loadLevel(BHLevel.Level3)}
                onResetG1={() => controller.resetLevel()}
            />
        </div>
    );
};