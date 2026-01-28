import {Game2HUD} from "./ui-components/Game2HUD";
import {IGameViewProps} from "../../../core/interfaces/IViewProps";
import {Game2Presenter} from "./Game2Presenter";
import {Game2Controller} from "./Game2Controller";
import {useEffect, useState} from "react";
import {Game2Level} from "../model/Game2Config";

export const Game2View: React.FC<IGameViewProps<Game2Presenter, Game2Controller>> = ({vm, controller}) => {
    const [stats, setStats] = useState({hp: vm.hp, energy: vm.energy, scrap: vm.scrap});
    const [visuals, setVisuals] = useState({uiOffset: 0, glitch: 0, pulse: 0});

    useEffect(() => {
        const unsubscribe = vm.subscribe(() => {
            setStats({hp: vm.hp, energy: vm.energy, scrap: vm.scrap});
            const v = (vm as any).visualEffects;
            setVisuals({
                uiOffset: v.uiOffset,
                glitch: v.glitchIntensity,
                pulse: v.vignettePulse
            });
        });
        return () => unsubscribe();
    }, [vm]);

    const shakeX = (Math.random() - 0.5) * 20 * visuals.glitch;
    const shakeY = (Math.random() - 0.5) * 20 * visuals.glitch;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000', // The "Bars" color
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* The 16:9 Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                background: '#adadad',
                overflow: 'hidden',
                transform: `translate(${shakeX}px, ${shakeY}px)`,
                textShadow: visuals.glitch > 0.1
                    ? `${visuals.glitch * 5}px 0 #f00, -${visuals.glitch * 5}px 0 #0ff`
                    : 'none'
            }}>
                {/* Pulsing Vignette Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${0.8 * visuals.pulse}))`,
                    pointerEvents: 'none', zIndex: 1
                }}/>

                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#050505', fontSize: '10cqw', fontWeight: 'bold',
                    transform: `translateY(${visuals.uiOffset}px)`,
                    opacity: 0.3 + (visuals.glitch * 0.7)
                }}>
                    LAB_02
                </div>

                <Game2HUD
                    stats={stats}
                    onAction={(type, val) => controller.modifyStat(type as any, val)}
                    onJumpG1={controller.jumpToGame1}
                    onLevel1={() => controller.loadLevel(Game2Level.Level1)}
                    onLevel2={() => controller.loadLevel(Game2Level.Level2)}
                    onLevel3={() => controller.loadLevel(Game2Level.Level3)}
                    onQuickLoad={() => controller.resetLevel()}
                />
            </div>
        </div>
    );
};