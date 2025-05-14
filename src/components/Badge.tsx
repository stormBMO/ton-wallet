import styled from '@emotion/styled';
import React from 'react';

export interface BadgeProps {
  type?: 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

const getColor = (type: BadgeProps['type']) => {
  switch (type) {
    case 'success': return '#4caf50';
    case 'warning': return '#ff9800';
    case 'danger': return '#f44336';
    default: return '#e0e0e0';
  }
};

const StyledBadge = styled.span<BadgeProps>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${({ type }) => getColor(type)};
  color: #fff;
  font-size: 0.95em;
  font-weight: 500;
`;

export const Badge: React.FC<BadgeProps> = ({ type, children }) => (
  <StyledBadge type={type}>{children}</StyledBadge>
); 