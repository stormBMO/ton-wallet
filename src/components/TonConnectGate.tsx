import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAddress } from '@/store/slices/wallet/walletSlice';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { APP_CONFIG } from '@/config/constants';

const TonConnectGate = () => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const dispatch = useDispatch();
    const { tonConnectLogin } = useWalletAuth();

    useEffect(() => {
        let cancelled = false;
        const fetchNonceAndSetProof = async () => {
            // Сначала сбрасываем параметры для обновления манифеста
            tonConnectUI.setConnectRequestParameters(null);
            
            tonConnectUI.setConnectRequestParameters({ state: 'loading' });
            try {
                // Используем константу для бэкенда
                const { nonce } = await fetch(`${APP_CONFIG.BACKEND_URL}/api/auth/request_nonce`).then(r => r.json());
                if (!cancelled) {
                    tonConnectUI.setConnectRequestParameters({
                        state: 'ready',
                        value: { tonProof: nonce }
                    });
                }
            } catch (error) {
                console.error('Ошибка получения nonce:', error);
                tonConnectUI.setConnectRequestParameters(null);
            }
        };
        fetchNonceAndSetProof();
        // Сбросить параметры при размонтировании
        return () => {
            cancelled = true;
            tonConnectUI.setConnectRequestParameters(null);
        };
    }, [tonConnectUI]);

    useEffect(() => {
        const tonProof = wallet?.connectItems?.tonProof;
        const isProofOk = tonProof && typeof tonProof === 'object' && 'proof' in tonProof;
        
        console.log('=== TonConnectGate useEffect ===');
        console.log('Wallet exists:', !!wallet);
        console.log('Wallet address:', wallet?.account?.address);
        console.log('TonProof exists:', !!tonProof);
        console.log('TonProof structure valid:', isProofOk);
        
        if (wallet && wallet.account?.address && isProofOk) {
            console.log('✅ All conditions met, starting auth process...');
            console.log('Account address:', wallet.account.address);
            console.log('Account publicKey:', wallet.account.publicKey);
            console.log('TonProof payload:', tonProof.proof.payload);
            console.log('TonProof signature:', tonProof.proof.signature);
            
            // Устанавливаем адрес в store сразу
            dispatch(setAddress(wallet.account.address));
            
            // Выполняем авторизацию через TON Connect
            tonConnectLogin(wallet).then(() => {
                console.log('✅ TON Connect авторизация успешна');
                // После успешной авторизации кошелек остается подключенным для транзакций
            }).catch((error) => {
                console.error('❌ Ошибка TON Connect авторизации:', error);
                console.error('Error details:', error.message);
                // При ошибке отключаем кошелек
                tonConnectUI.disconnect();
            });
        } else {
            console.log('⏳ Waiting for wallet connection...');
            if (wallet) {
                console.log('Wallet connected but missing data:');
                console.log('- Address:', wallet.account?.address);
                console.log('- TonProof valid:', isProofOk);
                if (tonProof) {
                    console.log('- TonProof type:', typeof tonProof);
                    console.log('- TonProof data:', tonProof);
                }
            }
        }
    }, [wallet, dispatch, tonConnectLogin, tonConnectUI]);

    return null;
};

export default TonConnectGate;