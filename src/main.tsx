import { Buffer } from 'buffer';
import process from 'process';
import { Readable } from 'stream';
import util from 'util';
import './polyfills';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    Readable: typeof Readable;
    util: typeof util;
  }
}

window.Buffer = Buffer;
window.process = process;
window.Readable = Readable;
window.util = util;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider } from './components/ui/ToastProvider';
import App from './App';
import './index.css';
import { TON_CONNECT_CONFIG } from './config/constants';
import { init, isTMA } from '@telegram-apps/sdk';

if (isTMA()) {
    init();
}

const manifestUrl = TON_CONNECT_CONFIG.MANIFEST_URL;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <TonConnectUIProvider manifestUrl={manifestUrl}>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </TonConnectUIProvider>
        </Provider>
    </React.StrictMode>
);