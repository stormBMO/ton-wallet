import React from 'react';
import styled from '@emotion/styled';
import { Card } from './Card';
import { Button } from './Button';

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
  <Card>
    <BalanceLabel>Баланс</BalanceLabel>
    <BalanceValue>{balance} {currency}</BalanceValue>
    <div style={{ display: 'flex', gap: 12 }}>
      <Button onClick={onDeposit} variant="primary">Пополнить</Button>
      <Button onClick={onWithdraw} variant="secondary">Вывести</Button>
    </div>
  </Card>
); 