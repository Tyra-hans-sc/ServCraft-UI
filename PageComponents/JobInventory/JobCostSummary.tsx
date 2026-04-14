import React, { FC, useMemo } from 'react';
import { Flex, Text } from '@mantine/core';
import helper from '@/utils/helper';
import companyService from '@/services/company-service';
import { useQuery } from '@tanstack/react-query';

// Small, reusable summary row for total cost of materials/services
// Computes total from a list of job inventory items. For warehoused inventory
// the quantity used is taken; otherwise the requested quantity is used.
const fetchCurrencySymbol = async () => {
  try {
    return await companyService.getCurrencySymbol();
  } catch {
    return 'R';
  }
};

const JobCostSummary: FC<{ items: any[] }> = ({ items }) => {
  const { data: currencySymbol } = useQuery(['company', 'currencySymbol'], fetchCurrencySymbol, { refetchOnWindowFocus: false, staleTime: 12 * 60 * 60 * 1000 });

  const total = useMemo(() => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, it) => {
      if (!it?.IsActive) return sum;
      const unit = Number(it?.UnitCostPrice ?? 0) || 0;
      const qty = helper.isInventoryWarehoused(it?.Inventory) ? Number(it?.QuantityRequested ?? it?.QuantityUsed ?? 0) || 0 : Number(it?.QuantityRequested ?? 0) || 0;
      return sum + unit * qty;
    }, 0);
  }, [items]);

  // Right-aligned simple total similar to the design in the issue screenshot
  return (
    <Flex mt={'xs'} justify={'end'} px={'sm'}>
      <Text size={'md'} c={'dark.6'} fw={600}>
        Total cost : {helper.getCurrencyValue(total, currencySymbol || 'R')}
      </Text>
    </Flex>
  );
};

export default JobCostSummary;
