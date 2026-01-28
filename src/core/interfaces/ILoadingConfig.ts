import React from 'react';

export interface ILoadingProps {
    isFinished: boolean;
    onTransitionComplete: () => void;
    progress?: number;
}

export interface ILoadingConfig {
    view?: React.ComponentType<ILoadingProps & any>;
    manifestPath?: string;
    props?: Record<string, any>;
}