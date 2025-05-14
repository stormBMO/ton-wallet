import TonWeb from 'tonweb';

export type TransferTXParams = {
  to: string;
  amount: string; // в TON или токенах (строка для точности)
  comment?: string;
  token?: 'TON' | 'TIP3';
  secretKey: Uint8Array;
  jettonAddress?: string; // для TIP-3
  walletAddress: string;
  network?: 'testnet' | 'mainnet';
};

export async function transferTX({
  to,
  amount,
  comment,
  token = 'TON',
  secretKey,
  jettonAddress,
  walletAddress,
  network = 'testnet',
}: TransferTXParams): Promise<{ txHash: string }> {
  if (!to || !amount || !secretKey || !walletAddress) throw new Error('Некорректные параметры');

  const providerUrl = network === 'testnet'
    ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
    : 'https://toncenter.com/api/v2/jsonRPC';
  const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl));
  const WalletClass = TonWeb.Wallets.all.v3R2;
  const wallet = new WalletClass(tonweb.provider, { publicKey: secretKey.subarray(32, 64), wc: 0, address: walletAddress });
  const seqno = await wallet.methods.seqno().call();

  if (token === 'TON') {
    // Отправка TON
    const tx = wallet.methods.transfer({
      secretKey,
      toAddress: new TonWeb.utils.Address(to),
      amount: TonWeb.utils.toNano(amount),
      seqno: Number(seqno),
      payload: comment ? TonWeb.utils.stringToBytes(comment) : undefined,
      sendMode: 3,
    });
    const result = await tx.send();
    return { txHash: result }; // result = hash
  } else {
    // Отправка TIP-3 (jetton)
    if (!jettonAddress) throw new Error('jettonAddress required for jetton transfer');
    const JettonWallet = TonWeb.token.jetton.JettonWallet;
    const jettonWallet = new JettonWallet(tonweb.provider, { address: jettonAddress });
    // @ts-expect-error jettonAmount используется в tonweb, но не описан в типах
    const payload = await jettonWallet.createTransferBody({
      jettonAmount: TonWeb.utils.toNano(amount),
      to: new TonWeb.utils.Address(to),
      from: new TonWeb.utils.Address(walletAddress),
      forwardAmount: TonWeb.utils.toNano('0.01'),
      forwardPayload: comment ? new TextEncoder().encode(comment) : undefined,
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
    return { txHash: result };
  }
} 