import React from 'react';
import { Card } from './Card';
import styled from '@emotion/styled';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  font-weight: 600;
  padding: 8px 0;
  color: ${({ theme }: any) => theme?.colors?.textSecondary || '#888'};
`;

const Td = styled.td`
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }: any) => theme?.colors?.border || '#eee'};
`;

const TokenSymbol = styled.span`
  font-weight: 500;
`;

export interface Token {
  symbol: string;
  name: string;
  balance: string;
}

export interface TokenTableProps {
  tokens: Token[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => (
  <div className="rounded-2xl shadow-md bg-white dark:bg-neutral-900 p-6">
    <div className="flex flex-col gap-2">
      {tokens.map(token => (
        <div key={token.symbol} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{token.symbol}</span>
            <span className="text-gray-400 text-xs">{token.name}</span>
          </div>
          <div className="font-mono">{token.balance}</div>
        </div>
      ))}
    </div>
  </div>
); 