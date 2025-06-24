export type RiskApiType = 'v1' | 'v2';

export type SendTransactionParams = {
    to: string;
    amount: string;
    comment?: string;
    jettonAddress?: string;
  }
  
export type SendResult = {
    success: boolean;
    txHash?: string;
    error?: string;
  }


export type SwapRoute = {
    pool_data: {
        pay: string;
        receive: string;
        minimumReceive: string;
        status: boolean;
        message?: string;
    };
    selected_pool?: any;
}

export type JettonBalance = {
    jetton: {
        address: string;
        symbol?: string;
        name?: string;
        decimals?: number;
    };
    balance: string;
    metadata?: {
        symbol?: string;
        name?: string;
        image?: string;
    };
}

export type TonConnectProvider = {
    sendTransaction: (args: {
        validUntil: number;
        messages: unknown[];
    }) => Promise<unknown>;
}

export type RawTokenData = {
    address: string;
    symbol: string;
    name: string;
    balance: string;
    decimals?: number;
  }