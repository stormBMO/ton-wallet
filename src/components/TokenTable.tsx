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
  <Card>
    <Table>
      <thead>
        <tr>
          <Th>Токен</Th>
          <Th>Баланс</Th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.symbol}>
            <Td><TokenSymbol>{token.symbol}</TokenSymbol> <span style={{ color: '#888', fontSize: '0.95em' }}>{token.name}</span></Td>
            <Td>{token.balance}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
); 