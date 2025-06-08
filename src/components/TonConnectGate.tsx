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
        

        
        if (wallet && wallet.account?.address && isProofOk) {

            
            // Устанавливаем адрес в store сразу
            dispatch(setAddress(wallet.account.address));
            
            // Выполняем авторизацию через TON Connect
            tonConnectLogin(wallet).then(() => {

                // После успешной авторизации кошелек остается подключенным для транзакций
            }).catch((error) => {
                console.error('❌ Ошибка TON Connect авторизации:', error);
                console.error('Error details:', error.message);
                // При ошибке отключаем кошелек
                tonConnectUI.disconnect();
            });
        }
    }, [wallet, dispatch, tonConnectLogin, tonConnectUI]);

    return null;
};

export default TonConnectGate;