'use client';
import {FC, useMemo, useRef, useState} from 'react';
import { Autocomplete, Box, Button, Flex, Loader, NumberInput, Text } from '@mantine/core';
import { useDebouncedValue, useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';

type InventoryDto = {
  ID: string;
  Description: string;
  Code?: string;
};

export type NewInventoryStub = {
  tempId: string;
  Description: string;
  isNew: true;
};

export type InventoryLike = InventoryDto | NewInventoryStub;

// Declare request outside of the component per guidelines
const DEFAULT_PAGE_SIZE = 10;
const searchInventory = async (
  search: string,
  excludeIds: string[] = [],
  pageIndex = 0,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<InventoryDto[]> => {
  const resp = await Fetch.post({
    url: '/Inventory/GetInventories',
    params: {
      pageSize,
      pageIndex,
      searchPhrase: search,
      SortExpression: '',
      SortDirection: '',
      ExcludeIDList: excludeIds,
      PopulateThumbnails: false,
    },
  });

  if (resp?.error) throw new Error(resp.error);
  return resp?.Results || [];
};

export const getInventoryLabel = (item: InventoryLike) => {
  const desc = item.Description || '';
  if ('ID' in item && item.ID) return desc; // Existing inventory
  return `${desc}`; // New stub
};

export interface MaterialsInventorySelectorProps {
  drafts: NewInventoryStub[];
  excludedIds?: string[]; // IDs or tempIds already selected
  onAdd: (item: InventoryLike, quantity: number) => void;
}

const MaterialsInventorySelector: FC<MaterialsInventorySelectorProps> = ({ drafts, excludedIds = [], onAdd }) => {
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [debounced] = useDebouncedValue(query, 250);

  // Infinite query for server-side searching + paging
  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['inventory-autocomplete', debounced, excludedIds],
    queryFn: ({ pageParam = 0 }) =>
      searchInventory(debounced, excludedIds.filter(Boolean), pageParam, DEFAULT_PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.length === DEFAULT_PAGE_SIZE ? allPages.length : undefined,
    staleTime: 60_000,
  });

  const options: InventoryDto[] = useMemo(() => {
    const flat = pages?.pages?.flat() || [];
    return flat as InventoryDto[];
  }, [pages]);

  // Build label map for selection lookup
  const labelMap = useMemo(() => {
    const map = new Map<string, InventoryLike>();
    options.forEach((o) => map.set(getInventoryLabel(o), o));
    drafts.forEach((d) => map.set(getInventoryLabel(d), d));
    return map;
  }, [options, drafts]);

  const data = useMemo(() => Array.from(labelMap.keys()), [labelMap]);

  const canAdd = query.trim().length > 0 && typeof qty === 'number' && qty > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const trimmedQuery = query.trim();
    let existing = labelMap.get(trimmedQuery);

    if (!existing) {
      const lowerQuery = trimmedQuery.toLowerCase();
      const matchingLabel = data.find((l) => l.toLowerCase() === lowerQuery);
      if (matchingLabel) {
        existing = labelMap.get(matchingLabel);
      }
    }

    let item: InventoryLike = existing || { tempId: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, Description: trimmedQuery, isNew: true };
    onAdd(item, Number(qty));
    // Reset inputs for convenience
    setQuery('');
    setQty('');
  };

  // Intersection observer sentinel for infinite scroll
  const { ref: sentinelRef, entry } = useIntersection({ root: null, threshold: 1 });

  // Trigger next page load when sentinel becomes visible
  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    // Fire and forget; Combobox/Autocomplete will render a loader below
    fetchNextPage();
  }

  // Custom option renderer to append the sentinel at the end of list
  const renderOption = (item: string) => {
    const isLast = data.length > 0 && item === data[data.length - 1];
    return (
      <Flex w={'100%'} direction="column">
        <Text size={'sm'}>{item}</Text>
        {isLast && (
          <Flex ref={sentinelRef as any} align="center" justify="center" w="100%" h={(isFetchingNextPage || isFetching) ? 30 : 1}>
            {(isFetchingNextPage || isFetching) && <Loader size="xs" />}
          </Flex>
        )}
      </Flex>
    );
  };

  const quantityRef = useRef<HTMLInputElement>(null);
  const onOptionSubmit = () => {
    if (quantityRef.current) {
      !qty && setQty(1)
      setTimeout(() => {
        quantityRef.current?.focus()
        quantityRef.current?.select()
      }, 100)
    }
  }

  return (
      <Flex className={''} align={'flex-end'} gap={'md'} wrap={'wrap'}>
        <Box style={{minWidth: 260, flex: 1}}>
          <Text style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} fw={300} size={'md'} mb={4} c={'dark.6'}>
            Material <span style={{ color: 'red' }}>*</span>
          </Text>
          <Autocomplete
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onOptionSubmit()
                }
              }}
              data={data}
              value={query}
              onChange={setQuery}
              placeholder={'Enter material'}
              limit={data.length}
              renderOption={({option}) => renderOption(option.value)}
              onOptionSubmit={onOptionSubmit}

              // filter={() => true}
          />
        </Box>

        <Box style={{width: 160}}>
          <Text style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} fw={300} mb={4} c={'dark.6'}>
            Quantity <span style={{ color: 'red' }}>*</span>
          </Text>
          <NumberInput
              ref={quantityRef}
              value={qty}
              onChange={setQty as any}
              allowDecimal={true}
              min={0}
              decimalScale={3}
              placeholder={'Quantity'}
              onFocus={() => quantityRef.current?.select()}
          />
        </Box>

        <Button disabled={!canAdd} onClick={handleAdd} variant={'outline'} color={'scBlue'}>
          Add
        </Button>
      </Flex>
  );
};

export default MaterialsInventorySelector;
