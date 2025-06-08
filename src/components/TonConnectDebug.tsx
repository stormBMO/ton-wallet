import React from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { APP_CONFIG } from '@/config/constants';

export const TonConnectDebug: React.FC = () => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const { jwt, status, address: authAddress } = useSelector((state: RootState) => state.auth);
    const { address: walletAddress, network } = useSelector((state: RootState) => state.wallet);

    const isAuthenticated = !!jwt;

    const handleTestConnection = async () => {
        try {
            console.log('=== TON Connect Debug Info ===');
            console.log('Wallet connected:', !!wallet);
            console.log('Wallet data:', wallet);
            console.log('Auth status:', status);
            console.log('Is authenticated:', isAuthenticated);
            console.log('Auth address:', authAddress);
            console.log('Wallet address:', walletAddress);
            console.log('Network:', network);
            
            if (wallet) {
                console.log('Account:', wallet.account);
                console.log('Connect items:', wallet.connectItems);
                console.log('TonProof:', wallet.connectItems?.tonProof);
                
                // Детальная проверка TonProof
                const tonProof = wallet.connectItems?.tonProof;
                if (tonProof && typeof tonProof === 'object' && 'proof' in tonProof) {
                    console.log('✅ TonProof structure is valid');
                    console.log('Proof payload (nonce):', tonProof.proof.payload);
                    console.log('Proof signature:', tonProof.proof.signature);
                    console.log('Proof timestamp:', tonProof.proof.timestamp);
                    console.log('Proof domain:', tonProof.proof.domain);
                } else {
                    console.log('❌ TonProof structure is invalid:', tonProof);
                }
            }

            // Тестируем запрос nonce
            try {
                const nonceResponse = await fetch(`${APP_CONFIG.BACKEND_URL}/api/auth/request_nonce`);
                const nonceData = await nonceResponse.json();
                console.log('Nonce response:', nonceData);
                
                // Проверяем что nonce в правильном формате (hex)
                if (nonceData.nonce && typeof nonceData.nonce === 'string') {
                    console.log('✅ Nonce format looks good');
                    console.log('Nonce length:', nonceData.nonce.length);
                } else {
                    console.log('❌ Nonce format issue:', nonceData);
                }
            } catch (error) {
                console.error('Nonce request failed:', error);
            }

            // Проверяем манифест
            try {
                const manifestResponse = await fetch(APP_CONFIG.MANIFEST_URL);
                const manifestData = await manifestResponse.json();
                console.log('Manifest:', manifestData);
            } catch (error) {
                console.error('Manifest check failed:', error);
            }
            
            // Проверяем бэкенд доступность
            try {
                const backendResponse = await fetch(`${APP_CONFIG.BACKEND_URL}/docs`);
                console.log('Backend status:', backendResponse.status);
            } catch (error) {
                console.error('Backend check failed:', error);
            }
        } catch (error) {
            console.error('Debug error:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await tonConnectUI.disconnect();
            console.log('Disconnected from TON Connect');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    const handleReset = async () => {
        try {
            // Отключаем кошелек
            if (tonConnectUI.account) {
                await tonConnectUI.disconnect();
            }
            
            // Сбрасываем параметры соединения
            tonConnectUI.setConnectRequestParameters(null);
            
            // Очищаем localStorage
            localStorage.removeItem('ton-connect-storage_bridge-connection');
            localStorage.removeItem('ton-connect-ui_preferred-wallet');
            localStorage.removeItem('ton-connect-ui_last-selected-wallet-info');
            
            console.log('TON Connect полностью сброшен. Перезагрузите страницу.');
            
            // Перезагружаем страницу для полного сброса
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Reset error:', error);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 100, 
            right: 10, 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: 16, 
            borderRadius: 8,
            fontSize: 12,
            maxWidth: 300,
            zIndex: 9999
        }}>
            <h4>TON Connect Debug</h4>
            <div>Wallet: {wallet ? '✅' : '❌'}</div>
            <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
            <div>Status: {status}</div>
            <div>Auth Addr: {authAddress?.slice(0, 8)}...</div>
            <div>Wallet Addr: {walletAddress?.slice(0, 8)}...</div>
            <div>Network: {network}</div>
            
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button 
                    onClick={handleTestConnection}
                    style={{ 
                        padding: '4px 8px', 
                        fontSize: 10, 
                        background: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Debug
                </button>
                <button 
                    onClick={handleDisconnect}
                    style={{ 
                        padding: '4px 8px', 
                        fontSize: 10, 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Disconnect
                </button>
                <button 
                    onClick={handleReset}
                    style={{ 
                        padding: '4px 8px', 
                        fontSize: 10, 
                        background: '#6f42c1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Full Reset
                </button>
            </div>
        </div>
    );
}; 