import styled from '@emotion/styled';
import { formatBalance } from '../lib/ton';

interface JettonBalance {
  symbol: string;
  balance: string;
  address: string;
}

interface AssetTableProps {
  tonBalance: string;
  jettonBalances: JettonBalance[];
}

const Table = styled.table`
  @apply w-full mt-4 bg-white dark:bg-gray-800 rounded-lg shadow;
`;

const TableHeader = styled.th`
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider;
`;

const TableCell = styled.td`
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100;
`;

export const AssetTable = ({ tonBalance, jettonBalances }: AssetTableProps) => {
  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>Актив</TableHeader>
          <TableHeader>Баланс</TableHeader>
        </tr>
      </thead>
      <tbody>
        <tr>
          <TableCell>TON</TableCell>
          <TableCell>{formatBalance(tonBalance)}</TableCell>
        </tr>
        {jettonBalances.map((jetton) => (
          <tr key={jetton.address}>
            <TableCell>{jetton.symbol}</TableCell>
            <TableCell>{formatBalance(jetton.balance)}</TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};