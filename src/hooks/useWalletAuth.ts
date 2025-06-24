import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store'; 
import { loginWithWallet, clearToken } from '../store/slices/auth/authSlice';
import { useCallback } from 'react';
import { TonProofItemReplySuccess, useTonConnectUI, Wallet, WalletInfoWithOpenMethod } from '@tonconnect/ui-react';
import { resetWallet } from '@/store/slices/wallet/walletSlice';
import { useNavigate } from 'react-router-dom';

export const useWalletAuth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { jwt, status, error, address } = useSelector((state: RootState) => state.auth);
    const [tonConnectUI] = useTonConnectUI();
    const handleLogin = useCallback(async (payload: { address: string; publicKey: string; privateKey: Buffer }) => {
        return dispatch(loginWithWallet(payload)).unwrap();
    }, [dispatch]);

    const handleTonConnectLogin = useCallback(async (wallet: Wallet | (Wallet & WalletInfoWithOpenMethod)) => {
        const proof = (wallet?.connectItems?.tonProof as TonProofItemReplySuccess)?.proof;
        
        if (!proof) {
            const error = 'TON Proof не получен от кошелька. Попробуйте переподключить кошелек.';
            throw new Error(error);
        }
        
        const loginPayload = {
            address: wallet.account.address,
            publicKey: wallet.account.publicKey || '',
            nonce: proof.payload,
            signature: proof.signature,
            timestamp: proof.timestamp,
            domain: proof.domain.value
        };
        
        return await dispatch(loginWithWallet(loginPayload)).unwrap();
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