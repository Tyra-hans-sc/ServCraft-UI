import React, { useMemo } from 'react';
import { Box, Flex, Text, Progress } from '@mantine/core';
import styles from './UsageProgressBar.module.css';

export interface UsageProgressBarProps {
  // Current usage value in base units (e.g., emails count, storage in MB)
  currentValue: number;
  // Free tier threshold in same base units
  freeTierValue: number;
  // Optional explicit max in base units; if not provided, a dynamic max is computed
  maxValue?: number;
  // Baseline minimum max to ensure the bar never gets close to 100%
  minMaxFallback: number;
  // Label to display for current value (already formatted for UI)
  currentValueLabel: string;
  // Label for the free tier marker (already formatted)
  freeTierLabel: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  currentValue,
  freeTierValue,
  maxValue,
  minMaxFallback,
  currentValueLabel,
  freeTierLabel,
}) => {
  const computedMax = useMemo(() => {
    const dynamic = Math.max(currentValue * 2, minMaxFallback);
    return Math.max(dynamic, maxValue ?? 0);
  }, [currentValue, maxValue, minMaxFallback]);

  const usedPct = useMemo(() => {
    if (computedMax <= 0) return 0;
    return clamp((currentValue / computedMax) * 100, 0, 100);
  }, [computedMax, currentValue]);

  const freeTierPct = useMemo(() => {
    if (computedMax <= 0) return 0;
    return clamp((freeTierValue / computedMax) * 100, 0, 100);
  }, [computedMax, freeTierValue]);

  // Calculate dynamic translateX to keep labels within bounds
  // At 0%: translateX(0%), at 50%: translateX(-50%), at 100%: translateX(-100%)
  const getTranslateX = (pct: number) => {
      if (pct < 10) return `translateX(-${4 * pct}px)`;
      if (pct > 90) return 'translateX(-100%)';
      return `translateX(-50%)`;
    };

  return (
    <Box className={styles.container}>
      <Box pos={'relative'} h={30}>
        <Flex className={styles.topLabels} left={usedPct + '%'} style={{ transform: getTranslateX(usedPct) }}>
          <Text size="sm" c="dark.9">{currentValueLabel}</Text>
        </Flex>
      </Box>

      {/* Progress track rendered by Mantine */}
      <Box className={styles.track}>
        <Progress
          value={usedPct}
          size={14}
          radius={9999}
          color="scBlue.6"
          styles={{ root: { backgroundColor: 'var(--mantine-color-scBlue-0)' } }}
        />
        {/* Hatched free tier overlay (always up to free tier boundary) */}
        <Box className={styles.freeTierStripe} style={{ width: `${freeTierPct}%` }} />
        {/* Vertical marker at the free tier boundary */}
        <Box className={styles.freeTierMarker} left={`${freeTierPct}%`} />
        {/* Vertical marker at the free tier boundary */}
        <Box className={styles.usedMarker} left={`${usedPct}%`} />
      </Box>

      <Box pos={'relative'}>
        <Flex className={styles.bottomLabels} left={`${freeTierPct}%`} style={{ transform: getTranslateX(freeTierPct) }}>
          <Text size="sm">{freeTierLabel}</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default UsageProgressBar;
