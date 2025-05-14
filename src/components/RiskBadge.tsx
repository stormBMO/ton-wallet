import React from 'react';

export interface RiskBadgeProps {
  score: number; // 0-100
}

function getRiskColor(score: number): string {
  if (score < 33) return "bg-green-100 text-green-700";
  if (score < 66) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function getRiskLabel(score: number): string {
  if (score < 33) return "Низкий";
  if (score < 66) return "Средний";
  return "Высокий";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => (
  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getRiskColor(score)}`}>
    Риск: {getRiskLabel(score)}
  </span>
); 