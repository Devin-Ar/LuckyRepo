import React, { useState, useEffect } from "react";
import { State } from "../../../core/templates/State";
import { CampaignManager } from "../../../core/managers/CampaignManager";
import { StateId } from "../../../core/registry/StateId";

export class ContinueState extends State {
    public name = StateId.CONTINUE;

    public async init(): Promise<void> {
        this.isInitialized = true;
        this.isRendering = true;
        this.isUpdating = true;
    }

    public update(dt: number, frameCount: number): void {}
    public destroy(): void {}

    public getView(): React.JSX.Element {
        return <ContinueView key="continue-view" />;
    }
}

const ContinueView: React.FC = () => {
    const [countdown, setCountdown] = useState(9);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleGiveUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const handleInput = (e: KeyboardEvent) => {
            if (e.key === "Enter") handleContinue();
            if (e.key === "Escape") handleGiveUp();
        };

        window.addEventListener("keydown", handleInput);
        return () => {
            clearInterval(timer);
            window.removeEventListener("keydown", handleInput);
        };
    }, []);

    const handleContinue = () => CampaignManager.getInstance().retryCurrentStep();
    const handleGiveUp = () => CampaignManager.getInstance().quitCampaign();

    return (
        <div style={{
            width: '100%', height: '100%', background: '#000', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Impact, sans-serif', textTransform: 'uppercase'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', letterSpacing: '2px' }}>CONTINUE?</h1>
            <div style={{ fontSize: '6rem', color: countdown < 4 ? '#e74c3c' : '#f1c40f', marginBottom: '40px' }}>
                {countdown}
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
                <button onClick={handleContinue} style={{ padding: '15px 30px', fontSize: '1.5rem', background: 'transparent', border: '3px solid white', color: 'white', cursor: 'pointer' }}>
                    YES (ENTER)
                </button>
                <button onClick={handleGiveUp} style={{ padding: '15px 30px', fontSize: '1.5rem', background: 'transparent', border: '3px solid #666', color: '#666', cursor: 'pointer' }}>
                    NO (ESC)
                </button>
            </div>
        </div>
    );
};