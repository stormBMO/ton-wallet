import { useState } from 'react';

// Определение типа Token должно быть согласовано с остальным проектом
interface Token {
  symbol: string;
  address?: string;
}

interface ReceiveModalData {
  token: Token;
  userAddress: string;
}

interface UseReceiveModalReturn {
  openReceiveModal: (token: Token, userAddress: string) => void;
  closeReceiveModal: () => void;
  isReceiveModalOpen: boolean;
  receiveModalData: ReceiveModalData | null;
}

export const useReceiveModal = (): UseReceiveModalReturn => {
    const [modalData, setModalData] = useState<ReceiveModalData | null>(null);

    const openReceiveModal = (token: Token, userAddress: string) => {
        setModalData({ token, userAddress });
    };

    const closeReceiveModal = () => {
        setModalData(null);
    };

    return {
        openReceiveModal,
        closeReceiveModal,
        isReceiveModalOpen: modalData !== null,
        receiveModalData: modalData,
    };
}; 