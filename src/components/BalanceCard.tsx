import React from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const BalanceValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }: any) => theme?.colors?.textSecondary || '#888'};
  margin-bottom: 16px;
`;

export interface BalanceCardProps {
  balance: string;
  currency?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, currency = 'TON', onDeposit, onWithdraw }) => (
  <div className="rounded-2xl shadow-md bg-white dark:bg-neutral-900 p-6 flex flex-col items-center gap-4">
    <div className="text-gray-500 text-sm">Баланс</div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">{balance} {currency}</div>
    <div className="flex gap-2">
      <button
        onClick={onDeposit}
        className="flex items-center gap-2 bg-ton-blue text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-ton-blue/90 transition"
      >
        <FaArrowDown /> Пополнить
      </button>
      <button
        onClick={onWithdraw}
        className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
      >
        <FaArrowUp /> Вывести
      </button>
    </div>
  </div>
); 