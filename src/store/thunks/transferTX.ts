import { createAsyncThunk } from '@reduxjs/toolkit';
import TonWeb from 'tonweb';

export type TransferTXParams = {
  to: string;
  amount: string;
  comment?: string;
  token?: 'TON' | 'TIP3';
  secretKey: Uint8Array;
  jettonAddress?: string;
  walletAddress: string;
  network?: 'testnet' | 'mainnet';
};

export const transferTXThunk = createAsyncThunk<
  { txHash: string },
  TransferTXParams,
  { rejectValue: string }
>('wallet/transferTX', async (params, { rejectWithValue }) => {
  try {
    const { to, amount, comment, token = 'TON', secretKey, jettonAddress, walletAddress, network = 'testnet' } = params;
    if (!to || !amount || !secretKey || !walletAddress) throw new Error('Некорректные параметры');
    const providerUrl = network === 'testnet'
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC';
    const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl));
    const WalletClass = TonWeb.Wallets.all.v3R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: secretKey.subarray(32, 64), wc: 0, address: walletAddress });
    const seqno = await wallet.methods.seqno().call();
    if (token === 'TON') {
      const tx = wallet.methods.transfer({
        secretKey,
        toAddress: new TonWeb.utils.Address(to),
        amount: TonWeb.utils.toNano(amount),
        seqno: Number(seqno),
        payload: comment ? TonWeb.utils.stringToBytes(comment) : undefined,
        sendMode: 3,
      });
      const result = await tx.send();
      return { txHash: result };
    } else {
      if (!jettonAddress) throw new Error('jettonAddress required for jetton transfer');
      const JettonWallet = TonWeb.token.jetton.JettonWallet;
      const jettonWallet = new JettonWallet(tonweb.provider, { address: jettonAddress });
      const payload = await jettonWallet.createTransferBody({
        ...( { jettonAmount: TonWeb.utils.toNano(amount) } as any ),
        to: new TonWeb.utils.Address(to),
        from: new TonWeb.utils.Address(walletAddress),
        forwardAmount: TonWeb.utils.toNano('0.01'),
        forwardPayload: comment ? new TextEncoder().encode(comment) : undefined,
      });
      const tx = wallet.methods.transfer({
        secretKey,
        toAddress: new TonWeb.utils.Address(jettonAddress),
        amount: TonWeb.utils.toNano('0.05'),
        seqno: Number(seqno),
        payload,
        sendMode: 3,
      });
      const result = await tx.send();
      return { txHash: result };
    }
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка отправки транзакции');
  }
}); 