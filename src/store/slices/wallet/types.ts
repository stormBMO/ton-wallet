export type Network = 'testnet' | 'mainnet';

export interface Token {
  address : string;
  symbol  : string;
  name    : string;
  balance : string;   // строка TON-экв (10-й → '0.123')
  priceTon?: string;  // курс 1 токена в TON
}
