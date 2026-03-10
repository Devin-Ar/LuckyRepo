// src/features/shared-menus/states/ScoreScreenState.tsx
import React, { useState, useEffect, useMemo } from "react";
import { State } from "../../../core/templates/State";
import { CampaignManager } from "../../../core/managers/CampaignManager";
import { FeatureEnum } from "../../FeatureEnum";

export interface ScoreScreenParams {
    points?: number;
    coins?: number;
    /** 'death' → quit to menu after dismiss, 'victory' → advance campaign to next step (FIN screen) */
    reason?: 'death' | 'victory';
}

export class ScoreScreenState extends State {
    public name = FeatureEnum.SCORE_SCREEN;
    private params: ScoreScreenParams;

    constructor(params?: ScoreScreenParams) {
        super();
        this.params = params || {};
    }

    public async init(): Promise<void> {
        this.isInitialized = true;
        this.isRendering = true;
        this.isUpdating = true;
    }

    public update(dt: number, frameCount: number): void {}
    public destroy(): void {}

    public getView(): React.JSX.Element {
        return (
            <ScoreScreenView
                key="score-screen-view"
                points={this.params.points ?? 0}
                coins={this.params.coins ?? 0}
                reason={this.params.reason ?? 'death'}
            />
        );
    }
}

// Animated sprite icon (reused pattern from HUDs)

const POINT_SPRITE_PATH = 'res/sprite/sheets/Point.png';
const COIN_SPRITE_PATH = 'res/sprite/sheets/Coin.png';

const SpriteIcon: React.FC<{ src: string; size?: number; intervalMs?: number }> = ({
                                                                                       src, size = 48, intervalMs = 500
                                                                                   }) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame(f => (f + 1) % 2), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return (
        <div style={{
            width: size,
            height: size,
            overflow: 'hidden',
            flexShrink: 0,
            imageRendering: 'pixelated',
            position: 'relative',
            display: 'inline-block'
        }}>
            <img
                src={src}
                alt=""
                draggable={false}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: frame === 0 ? '0%' : '-100%',
                    height: '100%',
                    width: '200%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

// View

interface ScoreScreenViewProps {
    points: number;
    coins: number;
    reason: 'death' | 'victory';
}

const ScoreScreenView: React.FC<ScoreScreenViewProps> = ({ points, coins, reason }) => {
    const [displayPoints, setDisplayPoints] = useState(0);
    const [displayCoins, setDisplayCoins] = useState(0);
    const [showButton, setShowButton] = useState(false);
    const [opacity, setOpacity] = useState(0);

    const isVictory = reason === 'victory';

    // Fade in
    useEffect(() => {
        const fadeTimer = requestAnimationFrame(() => setOpacity(1));
        return () => cancelAnimationFrame(fadeTimer);
    }, []);

    // Animated count-up
    useEffect(() => {
        const duration = 1500; // ms
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            // Ease out quad
            const eased = 1 - (1 - t) * (1 - t);

            setDisplayPoints(Math.floor(eased * points));
            setDisplayCoins(Math.floor(eased * coins));

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayPoints(points);
                setDisplayCoins(coins);
                setTimeout(() => setShowButton(true), 400);
            }
        };

        const timer = setTimeout(() => requestAnimationFrame(animate), 600);
        return () => clearTimeout(timer);
    }, [points, coins]);

    // Keyboard input
    useEffect(() => {
        if (!showButton) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                handleDismiss();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [showButton]);

    const handleDismiss = () => {
        if (isVictory) {
            // Advance to next campaign step (the FIN cinematic)
            CampaignManager.getInstance().completeCurrentStep();
        } else {
            // Death — quit campaign back to main menu
            CampaignManager.getInstance().quitCampaign();
        }
    };

    const titleText = isVictory ? 'CAMPAIGN COMPLETE' : 'CAMPAIGN OVER';
    const titleColor = isVictory ? '#f1c40f' : '#e74c3c';
    const subtitleText = isVictory ? 'You Have Beaten The Tower' : 'Your Journey Ends Here...';
    const buttonText = isVictory ? 'CONTINUE' : 'RETURN TO MENU';
    const buttonColor = isVictory ? '#27ae60' : '#c0392b';

    return (
        <div style={{
            width: '100%', height: '100%',
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace',
            opacity,
            transition: 'opacity 0.8s ease-in-out'
        }}>
            <div style={{
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                backgroundColor: '#0a0a0a',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                containerType: 'size',
                overflow: 'hidden'
            }}>
                {/* Background decorative lines */}
                <div style={{
                    position: 'absolute', inset: 0,
                    borderTop: '0.3cqw solid ' + titleColor,
                    borderBottom: '0.3cqw solid ' + titleColor,
                    opacity: 0.3,
                    pointerEvents: 'none'
                }} />

                {/* Title */}
                <h1 style={{
                    fontSize: '5cqw',
                    color: titleColor,
                    letterSpacing: '0.5cqw',
                    textTransform: 'uppercase',
                    marginBottom: '1cqw',
                    textShadow: `0 0 20px ${titleColor}40`,
                    textAlign: 'center'
                }}>
                    {titleText}
                </h1>

                <p style={{
                    fontSize: '1.5cqw',
                    color: '#888',
                    marginBottom: '4cqw',
                    fontStyle: 'italic'
                }}>
                    {subtitleText}
                </p>

                {/* Score display */}
                <div style={{
                    display: 'flex',
                    gap: '6cqw',
                    marginBottom: '4cqw',
                    alignItems: 'center'
                }}>
                    {/* Points */}
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '1cqw'
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1cqw'
                        }}>
                            <SpriteIcon src={POINT_SPRITE_PATH} size={48} />
                            <span style={{
                                fontSize: '1.2cqw',
                                color: '#f1c40f',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15cqw'
                            }}>
                                POINTS
                            </span>
                        </div>
                        <span style={{
                            fontSize: '4cqw',
                            color: '#f1c40f',
                            fontWeight: 'bold',
                            textShadow: '0 0 15px rgba(241, 196, 15, 0.3)'
                        }}>
                            {displayPoints.toLocaleString()}
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: '0.15cqw',
                        height: '8cqw',
                        backgroundColor: '#333'
                    }} />

                    {/* Coins */}
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '1cqw'
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1cqw'
                        }}>
                            <SpriteIcon src={COIN_SPRITE_PATH} size={48} />
                            <span style={{
                                fontSize: '1.2cqw',
                                color: '#ffd700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15cqw'
                            }}>
                                COINS
                            </span>
                        </div>
                        <span style={{
                            fontSize: '4cqw',
                            color: '#ffd700',
                            fontWeight: 'bold',
                            textShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
                        }}>
                            {displayCoins.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Continue/Return button */}
                {showButton && (
                    <button
                        onClick={handleDismiss}
                        style={{
                            padding: '1.2cqw 4cqw',
                            fontSize: '1.5cqw',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2cqw',
                            background: 'transparent',
                            border: `0.2cqw solid ${buttonColor}`,
                            color: buttonColor,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: 'scoreButtonPulse 2s infinite ease-in-out'
                        }}
                    >
                        {buttonText}
                    </button>
                )}

                {showButton && (
                    <p style={{
                        position: 'absolute',
                        bottom: '3cqw',
                        color: '#444',
                        fontSize: '0.9cqw',
                        animation: 'blink 1.5s infinite'
                    }}>
                        PRESS ENTER TO CONTINUE
                    </p>
                )}

                <style>{`
                    @keyframes scoreButtonPulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.03); }
                        100% { transform: scale(1); }
                    }
                    @keyframes blink {
                        50% { opacity: 0; }
                    }
                `}</style>
            </div>
        </div>
    );
};