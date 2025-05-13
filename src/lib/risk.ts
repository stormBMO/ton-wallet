interface Price {
  price: number;
  timestamp: number;
}

export const calculateVolatility = (prices: Price[]): number => {
  if (prices.length < 2) return 0;

  const returns = prices.slice(1).map((price, i) => {
    const prevPrice = prices[i].price;
    return Math.log(price.price / prevPrice);
  });

  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  // Годовая волатильность (предполагая ежедневные данные)
  return Math.sqrt(variance * 252) * 100;
};

export const calculateRiskScore = (volatility: number): number => {
  // Нормализуем волатильность в диапазон 0-100
  const maxVolatility = 100; // Предполагаем максимальную волатильность 100%
  return Math.min(Math.max((volatility / maxVolatility) * 100, 0), 100);
}; 