import TonWeb from 'tonweb';

export interface TransferTXParams {
  toAddress: string;
  amount: string; // в TON или jetton, зависит от isJetton
  comment?: string;
  isJetton?: boolean;
  jettonAddress?: string;
  secretKey: Uint8Array;
  walletAddress: string;
  providerUrl?: string;
}

/**
 * Отправка TON или TIP-3 (jetton) токенов с подписью локальным ключом
 */
export async function transferTX({
  toAddress,
  amount,
  comment,
  isJetton = false,
  jettonAddress,
  secretKey,
  walletAddress,
  providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC',
}: TransferTXParams): Promise<string> {
  const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl));
  const WalletClass = TonWeb.Wallets.all.v3R2;
  const wallet = new WalletClass(tonweb.provider, { publicKey: secretKey.subarray(32, 64), wc: 0, address: walletAddress });
  const seqno = await wallet.methods.seqno().call();

  if (!isJetton) {
    // Отправка TON
    const tx = wallet.methods.transfer({
      secretKey,
      toAddress: new TonWeb.utils.Address(toAddress),
      amount: TonWeb.utils.toNano(amount),
      seqno: Number(seqno),
      payload: comment ? TonWeb.utils.stringToBytes(comment) : undefined,
      sendMode: 3,
    });
    const result = await tx.send();
    return result;
  } else {
    // Отправка TIP-3 (jetton)
    if (!jettonAddress) throw new Error('jettonAddress required for jetton transfer');
    const JettonWallet = TonWeb.token.jetton.JettonWallet;
    const jettonWallet = new JettonWallet(tonweb.provider, { address: jettonAddress });
    // @ts-ignore
    const payload = await jettonWallet.createTransferBody({
      amount: TonWeb.utils.toNano(amount),
      toAddress: new TonWeb.utils.Address(toAddress),
      responseAddress: new TonWeb.utils.Address(walletAddress),
      forwardAmount: TonWeb.utils.toNano('0.000000001'), // 1 нанотон для уведомления
      forwardPayload: comment
        ? new Uint8Array([
            0, 0, 0, 0, // 4 байта tag для text comment
            ...new TextEncoder().encode(comment)
          ])
        : undefined,
    });
    const tx = wallet.methods.transfer({
      secretKey,
      toAddress: new TonWeb.utils.Address(jettonAddress),
      amount: TonWeb.utils.toNano('0.05'), // комиссия для jetton transfer
      seqno: Number(seqno),
      payload,
      sendMode: 3,
    });
    const result = await tx.send();
    return result;
  }
} 