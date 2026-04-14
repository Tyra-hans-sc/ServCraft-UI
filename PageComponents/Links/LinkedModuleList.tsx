import React, { FC, useMemo, useState, useEffect } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import * as Enums from '@/utils/enums';
import { getEnumStringValue } from '@/utils/enums';
import linkService from '@/services/link/link-service';
import { showNotification } from '@mantine/notifications';

export type RenderItemFn = (label: string, onOpen?: () => void, onUnlink?: () => void, href?: string, isBusy?: boolean) => React.ReactNode;

 type QueryMode = 'endpoint' | 'linkService';
 
 const LinkedModuleList: FC<{ 
  jobId: string; 
  module: number; // the linked item's module (e.g., Query, Quote) 
  heading: string; 
  // endpoint is optional if queryMode is 'linkService' 
  endpoint?: string; 
  extraParams?: Record<string, any>; 
  labelFor: (item: any) => string; 
  onOpen?: (item: any) => void; 
  // onUnlink is optional. If omitted and queryMode is 'linkService', component will handle unlink via link-service 
  onUnlink?: (item: any) => void; 
  renderItem: RenderItemFn; 
  refreshDep?: any; 
  // advanced: choose how to query 
  queryMode?: QueryMode; 
  // required when queryMode === 'linkService' 
  linkType?: number; 
  itemModuleWhenLinkedFrom?: number; // e.g., JobCard when we are in a Job context 
  // optional: when provided, items will render as links using this href generator; otherwise onOpen is used
  hrefFor?: (item: any) => string | undefined; 
  // optional: callback to trigger parent-level refresh toggles after internal unlink succeeds
  onAfterUnlink?: () => void;
  // optional: external busy predicate for items when unlink is handled outside
  getItemIsBusy?: (item: any) => boolean;
  // optional: limit how many items to render (when collapsing parent)
  limit?: number | null;
  // optional: notify parent when total count changes
  onCountChange?: (count: number) => void;
  // optional: notify parent with current item IDs (for exclusion maps)
  onIdsChange?: (ids: string[]) => void;
}> = ({ jobId, module, heading, endpoint, extraParams, labelFor, onOpen, onUnlink, renderItem, refreshDep, queryMode = 'endpoint', linkType, itemModuleWhenLinkedFrom, hrefFor, onAfterUnlink, getItemIsBusy, limit, onCountChange, onIdsChange }) => {
  const moduleIdList = useMemo(() => [getEnumStringValue(Enums.Module, Enums.Module.JobCard)], []);

  // For linkService mode we fetch links and map to items
  const { data: linkData } = useQuery([
    'linkedItems-links', module, jobId, refreshDep
  ], () => linkService.getLinksForItem(jobId, linkType), { enabled: !!jobId && queryMode === 'linkService' });

  const { data: endpointData } = useQuery([
    'linkedItems-endpoint', module, jobId, refreshDep
  ], () => Fetch.post({
    url: endpoint as string,
    params: {
      pageSize: 50,
      pageIndex: 0,
      searchPhrase: '',
      IncludeClosed: true,
      ItemID: jobId,
      ModuleIDList: moduleIdList,
      ...(extraParams || {}),
    },
  }), { enabled: !!jobId && queryMode === 'endpoint' && !!endpoint });

  const items = useMemo(() => {
    if (queryMode === 'linkService') {
      const links = (linkData as any[]) || [];
      // Map links to the linked items for the target module
      return links
        .map((link: any) => link.Item1Module === module ? link.Item1 : link.Item2Module === module ? link.Item2 : undefined)
        .filter(Boolean);
    }
    return endpointData?.Results ?? [];
  }, [queryMode, linkData, endpointData, module]);

  // Notify parent about count changes
  useEffect(() => {
    onCountChange && onCountChange(items?.length || 0);
  }, [onCountChange, items?.length]);

  // Notify parent with current item IDs (for exclusion maps)
  useEffect(() => {
    if (!onIdsChange) return;
    const ids = (items || []).map((x: any) => x?.ID).filter(Boolean);
    onIdsChange(ids as string[]);
  }, [onIdsChange, items]);

  // unlink via link-service when in linkService mode and no external onUnlink provided
  const [busyId, setBusyId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const unlinkMutation = useMutation(linkService.saveLink, {
    onMutate: (link: any) => {
      setBusyId(link.Item1Module === module ? link.Item1ID : link.Item2ID);
    },
    onError: (error: any, variables: any) => {
      showNotification({ id: 'unlink-item-' + (variables?.ID || ''), message: error?.message || 'Failed to unlink', color: 'yellow.7', autoClose: 4000 });
      setBusyId(null);
    },
    onSuccess: () => {
      setBusyId(null);
      // notify parent to flip a local refresh toggle if provided
      onAfterUnlink && onAfterUnlink();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedItems-links', module, jobId] });
    }
  });

  const handleInternalUnlink = (item: any) => {
    if (queryMode !== 'linkService') return;
    // find the corresponding link from linkData
    const links = (linkData as any[]) || [];
    const link = links.find((lnk: any) => {
      // Determine which side is the target module
      if (lnk.Item1Module === module) return lnk.Item1ID === item.ID;
      if (lnk.Item2Module === module) return lnk.Item2ID === item.ID;
      return false;
    });
    if (!link) return;
    unlinkMutation.mutate({ ...link, IsActive: false });
  };

  if (!items || items.length === 0) return null;

  const visibleItems = typeof limit === 'number' ? items.slice(0, Math.max(0, limit)) : items;
  if (!visibleItems || visibleItems.length === 0) return null;

  return (
    <Box mb={'sm'}>
      <Text size={'sm'} fw={600} c={'dark.6'} mb={4}>{heading}</Text>
      <Flex direction={'column'} gap={6}>
        {visibleItems.map((item: any) => {
          const unlinkHandler = queryMode === 'linkService' && !onUnlink ? () => handleInternalUnlink(item) : (onUnlink ? () => onUnlink(item) : undefined);
          const href = hrefFor ? hrefFor(item) : undefined;
          const isBusy = (busyId === item.ID) || (getItemIsBusy ? !!getItemIsBusy(item) : false);
          return (
            <Box key={item.ID}>{renderItem(
              labelFor(item),
              onOpen ? () => onOpen(item) : undefined,
              unlinkHandler,
              href,
              isBusy
            )}</Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default LinkedModuleList;
