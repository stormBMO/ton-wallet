export interface RiskMetrics {
    sigma30d: number;
    liquidity_score: number;
    contract_risk: number;
    sentiment_index: number;
}

export interface RiskV2Metrics {
    id: string;
    token_id: string;
    symbol: string;
    volatility_30d: number | null;
    liquidity_score: number | null;
    sentiment_score: number | null;
    contract_risk_score: number | null;
    overall_risk_score: number | null;
    updated_at: string;
}
