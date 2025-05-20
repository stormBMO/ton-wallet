import styled from '@emotion/styled';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const StyledButton = styled.button<ButtonProps>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${({ variant }) =>
        variant === 'primary' ? '#007bff' : '#f3f3f3'};
  color: ${({ variant }) =>
        variant === 'primary' ? '#fff' : '#222'};
  transition: background 0.2s;
  &:hover {
    background: ${({ variant }) =>
        variant === 'primary' ? '#0056b3' : '#e2e2e2'};
  }
`;

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => (
    <StyledButton variant={variant} {...props} />
); 