import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAddress } from '@/store/slices/wallet/walletSlice';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const TonConnectGate = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const dispatch = useDispatch();
  const { tonConnectLogin } = useWalletAuth();

  useEffect(() => {
    let cancelled = false;
    const fetchNonceAndSetProof = async () => {
      tonConnectUI.setConnectRequestParameters({ state: 'loading' });
      try {
        const { nonce } = await fetch('/api/auth/request_nonce').then(r => r.json());
        if (!cancelled) {
          tonConnectUI.setConnectRequestParameters({
            state: 'ready',
            value: { tonProof: nonce }
          });
        }
      } catch (e) {
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
      dispatch(setAddress(wallet.account.address));
      tonConnectLogin(wallet);
      // После успешного логина сбрасываем параметры
      tonConnectUI.setConnectRequestParameters(null);
    }
  }, [wallet, dispatch, tonConnectLogin, tonConnectUI]);

  return null;
};

export default TonConnectGate;