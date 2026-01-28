import React, {useEffect} from 'react';
import {ILoadingProps} from '../../core/interfaces/ILoadingConfig';

export const DefaultLoadingView: React.FC<ILoadingProps> = ({isFinished, onTransitionComplete}) => {
    useEffect(() => {
        if (isFinished) onTransitionComplete();
    }, [isFinished, onTransitionComplete]);

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))', maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9', backgroundColor: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{color: '#000', fontFamily: 'monospace', fontWeight: 'bold'}}>LOADING...</div>
            </div>
        </div>
    );
};