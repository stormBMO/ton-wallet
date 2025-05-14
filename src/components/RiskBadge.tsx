import React from 'react';
import { Badge } from './Badge';

export interface RiskBadgeProps {
  score: number; // 0-100
}

function getRiskType(score: number): 'success' | 'warning' | 'danger' {
  if (score < 33) return 'success';
  if (score < 66) return 'warning';
  return 'danger';
}

function getRiskLabel(score: number): string {
  if (score < 33) return 'Низкий риск';
  if (score < 66) return 'Средний риск';
  return 'Высокий риск';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => (
  <Badge type={getRiskType(score)}>
    {getRiskLabel(score)} ({score})
  </Badge>
); 