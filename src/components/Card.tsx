import styled from '@emotion/styled';

export const Card = styled.div`
  background: ${({ theme }: any) => theme?.colors?.background || '#fff'};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px 16px;
`; 