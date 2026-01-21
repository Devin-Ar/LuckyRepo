// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Engine} from './core/Engine';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Failed to find the root element.");
}

Engine.getInstance().start();

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);