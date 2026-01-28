import React, {useEffect, useState} from 'react';
import {ILoadingProps} from '../../core/interfaces/ILoadingConfig';

export const DemoLoadingView: React.FC<ILoadingProps> = ({isFinished, onTransitionComplete}) => {
    const [opacity, setOpacity] = useState(1);
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (isFinished) return;

        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "" : prev + "."));
        }, 400);

        return () => clearInterval(interval);
    }, [isFinished]);

    useEffect(() => {
        if (isFinished) {
            const fadeTimer = setTimeout(() => {
                setOpacity(0);
            }, 600);

            return () => clearTimeout(fadeTimer);
        }
    }, [isFinished]);

    useEffect(() => {
        if (opacity === 0) {
            const t = setTimeout(onTransitionComplete, 500);
            return () => clearTimeout(t);
        }
    }, [opacity, onTransitionComplete]);

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))', maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9', backgroundColor: '#000',
                opacity: opacity, transition: 'opacity 0.5s ease-in-out',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#00ff00', fontFamily: 'monospace', textTransform: 'uppercase'
            }}>
                <div style={{fontSize: '1.5cqw', letterSpacing: '0.2cqw', textAlign: 'center'}}>
                    {isFinished ? <span style={{color: '#fff'}}>Loaded</span> : <span>Loading{dots}</span>}
                </div>
            </div>
        </div>
    );
};