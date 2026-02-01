import React, { useEffect } from "react";
import { State } from "../../../core/templates/State";
import { CampaignManager } from "../../../core/managers/CampaignManager";

export class GameOverState extends State {
    public name = "GameOverScreen";

    public async init(): Promise<void> {
        this.isInitialized = true;
        this.isRendering = true;
    }

    public update(dt: number, frameCount: number): void {}

    public destroy(): void {}

    public getView(): React.JSX.Element {
        return <GameOverView key="game-over-view" />;
    }
}

const GameOverView: React.FC = () => {
    useEffect(() => {
        const handleInput = () => {
            CampaignManager.getInstance().quitCampaign();
        };

        const timeout = setTimeout(() => {
            window.addEventListener("keydown", handleInput);
            window.addEventListener("click", handleInput);
        }, 500);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("keydown", handleInput);
            window.removeEventListener("click", handleInput);
        };
    }, []);

    return (
        <div style={{
            width: '100%', height: '100%', background: '#000', color: '#e74c3c',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace'
        }}>
            <h1 style={{ fontSize: '5rem', margin: 0 }}>GAME OVER</h1>
            <p style={{ marginTop: '20px', color: '#666', animation: 'blink 1s infinite' }}>
                PRESS ANY KEY
            </p>
            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};