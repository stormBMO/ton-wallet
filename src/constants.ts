import { Network } from "./store/slices/wallet/types";

export const TON_API_BASE_URL: Record<Network, string> = {
    mainnet: 'https://tonapi.io',
    testnet: 'https://testnet.tonapi.io'
  };
  