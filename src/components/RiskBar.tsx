import styled from '@emotion/styled';

interface RiskBarProps {
  riskScore: number;
}

const RiskBarContainer = styled.div`
  @apply mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow;
`;

const RiskBar = styled.div<{ score: number }>`
  @apply h-4 rounded-full bg-gradient-to-r from-green-500 to-red-500;
  width: ${props => props.score}%;
  transition: width 0.3s ease;
`;

const RiskLabel = styled.div`
  @apply flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2;
`;

export const RiskBarComponent = ({ riskScore }: RiskBarProps) => {
  return (
    <RiskBarContainer>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Оценка риска
      </h3>
      <RiskBar score={riskScore} />
      <RiskLabel>
        <span>Низкий риск</span>
        <span>Высокий риск</span>
      </RiskLabel>
      <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
        Текущий показатель: {riskScore}
      </div>
    </RiskBarContainer>
  );
};