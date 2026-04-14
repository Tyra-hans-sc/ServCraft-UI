import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Title,
  Tooltip,
  Slider,
  CloseButton,
} from "@mantine/core";
import { IconBuildingStore, IconInfoCircle, IconUsers } from "@tabler/icons-react";
import UsageProgressBar from "./UsageProgressBar";
import styles from "./UsageSummary.module.css";
import type { UseQueryResult } from "@tanstack/react-query";

export interface RateCard {
  ItemCode: string;
  CurrentRate: number;
  CurrentUsage: number;
  EstimatedCurrentBillingAmount: number;
  NextRate: number;
  CurrentIncludedAmount: number;
  NextIncludedAmount: number;
  UsageType: number;
}

export interface UsageStats {
  CustomerID: string;
  RateCards: {
    SCUserStandard?: RateCard;
    SCStoreStandard?: RateCard;
    SCDataStandard?: RateCard;
    SCEmailStandard?: RateCard;
    [key: string]: RateCard | undefined;
  };
  CurrentPeriodStart: string;
  NextPeriodStart: string;
  EstimatedCurrentBillingAmountIncl: number;
  EstimatedCurrentBillingAmountExcl: number;
}

export interface SubscriptionInfoLike {
  UserCount?: number;
  UserRate?: number; // per user, currency value
}

export interface UsageSummaryProps {
  subscriptionInfo: SubscriptionInfoLike;
  usageStatsQuery: UseQueryResult<UsageStats>;
}

// helpers - storage formatting
const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = 1024 * 1024 * 1024;

function formatStorage(bytes: number): string {
  if (bytes < BYTES_IN_GB) {
    const mb = bytes / BYTES_IN_MB;
    return `${Math.round(mb)}MB Used`;
  }
  const gb = bytes / BYTES_IN_GB;
  return `${gb.toFixed(2)}GB Used`;
}

function formatFreeStorageLabel(bytes: number): string {
  if (bytes < BYTES_IN_GB) {
    const mb = bytes / BYTES_IN_MB;
    return `${Math.round(mb)}MB Free`;
  }
  const gb = bytes / BYTES_IN_GB;
  return `${gb.toFixed(2)}GB Free`;
}

const UsageSummary: React.FC<UsageSummaryProps> = ({
  subscriptionInfo,
  usageStatsQuery,
}) => {
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [stats, setStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (usageStatsQuery.data) {
      setStats(usageStatsQuery.data);
      setStorageUsedBytes(
        usageStatsQuery.data.RateCards?.SCDataStandard?.CurrentUsage ?? 0,
      );
      setEmailsSent(
        usageStatsQuery.data.RateCards?.SCEmailStandard?.CurrentUsage ?? 0,
      );
    }
  }, [usageStatsQuery.data]);

  const showStore = (stats?.RateCards?.SCStoreStandard?.CurrentUsage ?? 0) > 1; // show store costs when there's usage but free tier is 0
  const userRateCard = stats?.RateCards?.SCUserStandard;
  const storeRateCard = stats?.RateCards?.SCStoreStandard;
  const storageRateCard = stats?.RateCards?.SCDataStandard;
  const emailRateCard = stats?.RateCards?.SCEmailStandard;

  const users = userRateCard?.CurrentUsage ?? 0;
  const usersFreeTier =
    userRateCard?.CurrentIncludedAmount !== userRateCard?.NextIncludedAmount
      ? userRateCard?.NextIncludedAmount || 0
      : userRateCard?.CurrentIncludedAmount || 0;
  const billedUsers = Math.max(0, users - usersFreeTier);
  const ratePerUser =
    userRateCard?.CurrentRate !== userRateCard?.NextRate
      ? (userRateCard?.NextRate ?? 0)
      : (userRateCard?.CurrentRate ?? 0);
  const usersTotal = userRateCard?.EstimatedCurrentBillingAmount ?? 0;

  const stores = storeRateCard?.CurrentUsage ?? 0 + 1; // add 1 to ensure we show store costs when there's usage but free tier is 0
  const ratePerStore = storeRateCard?.CurrentRate ?? 0;
  const storesTotal = storeRateCard?.EstimatedCurrentBillingAmount ?? 0;

  const storageFreeTierBytes =
    storageRateCard?.CurrentIncludedAmount !==
    storageRateCard?.NextIncludedAmount
      ? storageRateCard?.NextIncludedAmount || 0
      : storageRateCard?.CurrentIncludedAmount || 0;
  const billedStorageBytes = Math.max(
    0,
    storageUsedBytes - storageFreeTierBytes,
  );
  const billedStorageGB = billedStorageBytes / BYTES_IN_GB;
  const storageRate =
    storageRateCard?.CurrentRate !== storageRateCard?.NextRate
      ? (storageRateCard?.NextRate ?? 0) * BYTES_IN_GB
      : (storageRateCard?.CurrentRate ?? 0) * BYTES_IN_GB;
  const localEstimatedStorageCost = billedStorageGB * storageRate;
  const storageCost =
    storageRateCard?.EstimatedCurrentBillingAmount === 0
      ? localEstimatedStorageCost
      : (storageRateCard?.EstimatedCurrentBillingAmount ??
        localEstimatedStorageCost);

  const emailsFreeTier =
    emailRateCard?.CurrentIncludedAmount !== emailRateCard?.NextIncludedAmount
      ? emailRateCard?.NextIncludedAmount || 0
      : emailRateCard?.CurrentIncludedAmount || 0;
  const billedEmails = Math.max(0, emailsSent - emailsFreeTier);
  const emailRate =
    emailRateCard?.CurrentRate !== emailRateCard?.NextRate
      ? (emailRateCard?.NextRate ?? 0)
      : (emailRateCard?.CurrentRate ?? 0);
  const localEstimatedEmailCost = billedEmails * emailRate;
  const emailCost =
    emailRateCard?.EstimatedCurrentBillingAmount === 0
      ? localEstimatedEmailCost
      : (emailRateCard?.EstimatedCurrentBillingAmount ??
        localEstimatedEmailCost);

  const usersLabel = useMemo(() => `${users} monthly users`, [users]);
  const storesLabel = useMemo(() => `${stores + 1} monthly stores (default is free)`, [stores]);
  const storesRateLabel = useMemo(
    () => `R${ratePerStore.toFixed(2)} per store`,
    [ratePerStore],
  );
  const rateLabel = useMemo(
    () => `R${ratePerUser.toFixed(2)} per user`,
    [ratePerUser],
  );

  const storageMinMaxBytes = BYTES_IN_GB * 10;
  const emailsMinMax = 10000;

  if (usageStatsQuery.isError) {
    return (
      <Box p="lg" bg="gray.0" style={{ borderRadius: 8 }}>
        <Text size="sm" c="yellow.7">
          Unable to load usage statistics at this time.
        </Text>
      </Box>
    );
  }

  if (usageStatsQuery.isLoading && !stats) {
    return (
      <Box p="lg" bg="gray.0" style={{ borderRadius: 8 }}>
        <Text size="sm" c="gray.6">
          Loading usage statistics...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Title order={5} mt={2} mb={12}>
        Usage for next billing cycle
      </Title>

      {/* User subscription */}
      <Flex align="center" justify="space-between" className={styles.header}>
        <Flex className={styles.infoTitle}>
          <Text size={"sm"} fw={700}>
            User Subscription
          </Text>
          {/*<Tooltip label="The number of active users this month" withArrow>
            <Box>
              <IconInfoCircle size={16} color="var(--mantine-color-dark-6)" />
            </Box>
          </Tooltip>*/}
        </Flex>
      </Flex>

      <Flex align="center" justify="space-between" className={styles.section}>
        <Flex align="center" gap={8}>
          <IconUsers size={22} color="var(--mantine-color-scBlue-6)" />
          <Flex direction="column">
            <Text size="sm" c="dark.9">
              {usersLabel}
            </Text>
            <Text size="12px" c="gray.6">
              {rateLabel}
            </Text>
          </Flex>
        </Flex>
        {/*<Text fw={700}>={" "}R{usersTotal.toFixed(2)}</Text>*/}
      </Flex>

      <Flex justify={"end"} align={"center"} h={30} bg={"gray.0"} mt={"xs"}>
        <Text size={"sm"} fw={400} c="dark.6" mr={"sm"}>
          {`${billedUsers.toLocaleString()} × R${ratePerUser.toFixed(2)} = `}
          <Text span fw={700}>
            R{usersTotal.toFixed(2)}
          </Text>
        </Text>
      </Flex>

      {/* Stores */}
      {showStore ? (
        <>
          <Box className={styles.divider} />
          <Box className={styles.section}>
            <Flex
              align="center"
              justify="space-between"
              className={styles.header}
            >
              <Flex className={styles.infoTitle}>
                <Text size={"sm"} fw={700}>
                  Stores
                </Text>
                {/*<Tooltip label="The number of active users this month" withArrow>
            <Box>
              <IconInfoCircle size={16} color="var(--mantine-color-dark-6)" />
            </Box>
          </Tooltip>*/}
              </Flex>
            </Flex>

            <Flex
              align="center"
              justify="space-between"
              className={styles.section}
            >
              <Flex align="center" gap={8}>
                <IconBuildingStore size={22} color="var(--mantine-color-scBlue-6)" />
                <Flex direction="column">
                  <Text size="sm" c="dark.9">
                    {storesLabel}
                  </Text>
                  <Text size="12px" c="gray.6">
                    {storesRateLabel}
                  </Text>
                </Flex>
              </Flex>
              {/*<Text fw={700}>={" "}R{usersTotal.toFixed(2)}</Text>*/}
            </Flex>

            <Flex
              justify={"end"}
              align={"center"}
              h={30}
              bg={"gray.0"}
              mt={"xs"}
            >
              <Text size={"sm"} fw={400} c="dark.6" mr={"sm"}>
                {`${stores.toLocaleString()} × R${ratePerStore.toFixed(2)} = `}
                <Text span fw={700}>
                  R{storesTotal.toFixed(2)}
                </Text>
              </Text>
            </Flex>
          </Box>{" "}
        </>
      ) : (
        ""
      )}

      <Box className={styles.divider} />

      {/* Storage */}
      <Box className={styles.section}>
        <Flex align="center" justify="space-between" className={styles.header}>
          <Flex className={styles.infoTitle}>
            <Text size={"sm"} fw={700}>
              Storage
            </Text>
            <Tooltip
              color={"scBlue"}
              label="This includes all your uploaded attachments - files, images and documents."
              withArrow
            >
              <Box>
                <IconInfoCircle size={16} color="var(--mantine-color-dark-6)" />
              </Box>
            </Tooltip>
          </Flex>
        </Flex>

        <UsageProgressBar
          currentValue={storageUsedBytes}
          freeTierValue={storageFreeTierBytes}
          minMaxFallback={storageMinMaxBytes}
          currentValueLabel={formatStorage(storageUsedBytes)}
          freeTierLabel={formatFreeStorageLabel(storageFreeTierBytes)}
        />

        <Flex justify={"end"} align={"center"} h={30} bg={"gray.0"} mt={30}>
          <Text size="sm" fw={400} c="dark.6" mr={"sm"}>
            {`${billedStorageGB.toFixed(2)}GB × R${storageRate.toFixed(2)} = `}
            <Text span fw={700}>
              R{storageCost.toFixed(2)}
            </Text>
          </Text>
        </Flex>
      </Box>

      <Box className={styles.divider} />

      {/* Emails */}
      <Box className={styles.section}>
        <Flex align="center" justify="space-between" className={styles.header}>
          <Flex className={styles.infoTitle}>
            <Text size={"sm"} fw={700}>
              Emails
            </Text>
            <Tooltip
              color={"scBlue"}
              label="This includes all outbound emails."
              withArrow
            >
              <Box>
                <IconInfoCircle size={16} color="var(--mantine-color-dark-6)" />
              </Box>
            </Tooltip>
          </Flex>
        </Flex>

        <UsageProgressBar
          currentValue={emailsSent}
          freeTierValue={emailsFreeTier}
          minMaxFallback={emailsMinMax}
          currentValueLabel={`${emailsSent.toLocaleString()} emails sent`}
          freeTierLabel={`${emailsFreeTier.toLocaleString()} emails free`}
        />

        <Flex justify={"end"} align={"center"} h={30} bg={"gray.0"} mt={30}>
          <Text size="sm" fw={400} c="dark.6" mr={"sm"}>
            {`${billedEmails.toLocaleString()} × R${emailRate.toFixed(2)} = `}
            <Text span fw={700}>
              R{emailCost.toFixed(2)}
            </Text>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default UsageSummary;
