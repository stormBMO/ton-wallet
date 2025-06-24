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
            tonConnectUI.setConnectRequestParameters(null);
            
            tonConnectUI.setConnectRequestParameters({ state: 'loading' });
            try {
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
        return () => {
            cancelled = true;
            tonConnectUI.setConnectRequestParameters(null);
        };
    }, [tonConnectUI]);

    useEffect(() => {
        const tonProof = wallet?.connectItems?.tonProof;
        const isProofOk = tonProof && typeof tonProof === 'object' && 'proof' in tonProof;
        
        if (wallet && wallet.account?.address && isProofOk) {
            dispatch(setAddress(wallet.account.address));
            tonConnectLogin(wallet).catch((error) => {
                console.error('Ошибка TON Connect авторизации:', error);
                console.error('Error details:', error.message);
                tonConnectUI.disconnect();
            });
        }
    }, [wallet, dispatch, tonConnectLogin, tonConnectUI]);

    return null;
};

export default TonConnectGate;