import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store'; // Предполагается, что у вас есть типизация для RootState и AppDispatch
import { loginWithWallet, clearToken } from '../store/slices/auth/authSlice';
import { useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { resetWallet } from '@/store/slices/wallet/walletSlice';
import { useNavigate } from 'react-router-dom';

export const useWalletAuth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { jwt, status, error, address } = useSelector((state: RootState) => state.auth);
    const [tonConnectUI] = useTonConnectUI();
    const handleLogin = useCallback(async (payload: { address: string; publicKey: string; privateKey: Buffer }) => {
        return dispatch(loginWithWallet(payload)).unwrap(); // теперь возвращает { jwt, address }
    }, [dispatch]);

    const handleTonConnectLogin = useCallback(async (wallet: { account: { address: string; publicKey?: string }; connectItems?: { tonProof?: { proof: { payload: string; signature: string } } } }) => {
    // 3. Получить proof из wallet.connectItems.tonProof.proof
        console.log('=== tonConnectLogin START ===');
        console.log('Wallet data:', wallet);
        
        const proof = wallet?.connectItems?.tonProof?.proof;
        console.log('Extracted proof:', proof);
        
        if (!proof) {
            const error = 'TON Proof не получен от кошелька. Попробуйте переподключить кошелек.';
            console.error('❌', error);
            throw new Error(error);
        }
        
        console.log('✅ Proof found, preparing login payload...');
        console.log('- Address:', wallet.account.address);
        console.log('- PublicKey:', wallet.account.publicKey);
        console.log('- Nonce (payload):', proof.payload);
        console.log('- Signature:', proof.signature);
        
        // 4. Отправить proof на бэкенд
        const loginPayload = {
            address: wallet.account.address,
            publicKey: wallet.account.publicKey || '',
            nonce: proof.payload, // nonce, который был передан в setConnectRequestParameters
            signature: proof.signature // base64
        };
        
        console.log('📤 Sending login payload:', loginPayload);
        
        try {
            const result = await dispatch(loginWithWallet(loginPayload)).unwrap();
            console.log('✅ Login successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }, [dispatch]);

    const handleLogout = useCallback(async () => {
        dispatch(clearToken());
    
        try {
            dispatch(resetWallet());
            if (tonConnectUI.account) {
                await tonConnectUI.disconnect();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
        navigate('/');
    }, [dispatch, tonConnectUI, navigate]);

    return {
        isAuthenticated: !!jwt,
        jwt,
        address,
        authStatus: status,
        authError: error,
        login: handleLogin,
        logout: handleLogout,
        tonConnectLogin: handleTonConnectLogin,
    };
}; 