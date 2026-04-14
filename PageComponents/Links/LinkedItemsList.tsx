import React, { FC, useMemo, useEffect, useState } from 'react';
import { Anchor, Box, Flex, Text, Tooltip, ActionIcon, Button } from '@mantine/core';
import {
    IconLinkMinus,
    IconLink,
    IconFileDescription,
    IconBookmark,
    IconFileDollar,
    IconReceipt,
    IconLinkPlus
} from '@tabler/icons-react';
import * as Enums from '@/utils/enums';
import { getEnumStringValue } from '@/utils/enums';
import Link from 'next/link';
import LinkItem from '@/PageComponents/Links/LinkItem';
import LinkPickerModal from '@/PageComponents/Links/LinkPickerModal';
import SCModal from '@/PageComponents/Modal/SCModal';
import ProjectService from '@/services/project/project-service';
import LinkedModuleList from '@/PageComponents/Links/LinkedModuleList';
import { useMutation, useQuery } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import invoiceService from '@/services/invoice/invoice-service';
import QuoteService from '@/services/quote/quote-service';
import purchaseOrderService from '@/services/purchase/purchase-order-service';
import { showNotification } from '@mantine/notifications';
import companyService from '@/services/company-service';

// Request method declared outside components per guidelines
const fetchCurrencySymbol = async () => {
  try {
    return await companyService.getCurrencySymbol();
  } catch {
    return 'R';
  }
};

const LinkedItemsList: FC<{
  jobId: string;
  project?: any | null;
  projectId?: string | null;
  customerId?: string;
  onChangeProject?: (project: any | null) => void;
  // legacy specific handlers (backwards compatible)
  onOpenQuote?: (quote: any) => void;
  onOpenInvoice?: (invoice: any) => void;
  // new generic handlers
  onOpenItem?: (module: number, item: any) => void;
  onUnlinkItem?: (module: number, item: any) => void;
  refreshDeps?: { quotes?: any; invoices?: any; purchaseOrders?: any; queries?: any };
  // optional currency symbol provided by a higher-level stable component
  currencySymbol?: string;
  // collapsing controls
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  // maximum height to use when collapsed (px or CSS value)
  maxHeight?: number | string;
}> = ({ jobId, project, projectId, customerId, onChangeProject, onOpenQuote, onOpenInvoice, onOpenItem, onUnlinkItem, refreshDeps, currencySymbol, collapsed, onCollapsedChange, maxHeight }) => {
  // Project link (moved from JobDetails)
  const [showProjectLink, setShowProjectLink] = useState(false);
  const [projectLinkLockdown, setProjectLinkLockdown] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(project ?? null);

  useEffect(() => {
    setSelectedProject(project ?? null);
  }, [project?.ID]);

  const getLinkedProject = async (id: string) => {
    const proj = await ProjectService.getProject(id);
    setSelectedProject(proj);
  };

  const linkJobToProject = (proj: any) => {
    setSelectedProject(proj);
    onChangeProject && onChangeProject(proj);
  };

  useEffect(() => {
    const setup = async () => {
      let show = false;
      const pid = projectId;
      if (pid) {
        show = true;
      } else if (customerId) {
        /*const hasProjects = await ProjectService.customerHasProjects(customerId);
        if (hasProjects) show = true;*/
          /** Only show project when it is linked: */
      }
      if (show) {
        setShowProjectLink(true);
        if (pid) {
          await getLinkedProject(pid);
        }
        setProjectLinkLockdown(false);
      } else {
        setShowProjectLink(false);
      }
    };
    setup();
  }, [projectId, customerId]);
  // Prepare invoice statuses for filtering
  const invoiceStatuses = useMemo(() => ([
    getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Draft),
    getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Unpaid),
    getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Paid),
  ]), []);

  // Module refresh toggles keyed by module enum; flip specific module key to trigger refetch
  const [moduleRefreshQueriesToggle, setModuleRefreshQueriesToggle] = useState<Record<number, boolean>>({});
  const [moduleRefreshToggle, setModuleRefreshToggle] = useState<Record<number, boolean>>({});

  // Busy states for external unlink actions
  const [busyQuoteId, setBusyQuoteId] = useState<string | null>(null);
  const [busyInvoiceId, setBusyInvoiceId] = useState<string | null>(null);
  const [busyPOId, setBusyPOId] = useState<string | null>(null);

  // Unlink mutations for Quote, Invoice, Purchase Order
  const unlinkQuoteMutation = useMutation({
    mutationFn: async (item: any) => {
      const full = await QuoteService.getQuote(item.ID);
      const newModule = item.CustomerID ? Enums.Module.Customer : null;
      const newItemId = item.CustomerID ?? null;
      const updated = { ...full, Module: newModule, ItemID: newItemId } as any;
      return await Fetch.put({
        url: '/Quote',
        params: {
          Quote: updated,
          QuoteItems: (full as any).QuoteItems || [],
          InventorySections: (full as any).InventorySections || [],
        },
      } as any);
    },
    onMutate: (item: any) => {
      setBusyQuoteId(item?.ID ?? null);
    },
    onError: (error: any, item: any) => {
      setBusyQuoteId(null);
      showNotification({ title: 'Warning', message: error?.message || 'Failed to unlink quote', color: 'yellow.7', autoClose: 4000 });
    },
    onSuccess: (_data, _item: any) => {
      setBusyQuoteId(null);
      setModuleRefreshToggle(prev => ({ ...prev, [Enums.Module.Quote]: !prev[Enums.Module.Quote] }));
    },
  });

  const unlinkInvoiceMutation = useMutation({
    mutationFn: async (item: any) => {
      const full = await invoiceService.getInvoice(item.ID);
      const newModule = item.CustomerID ? Enums.Module.Customer : null;
      const newItemId = item.CustomerID ?? null;
      const updated = { ...full, Module: newModule, ItemID: newItemId } as any;
      return await Fetch.put({
        url: '/Invoice',
        params: {
          Invoice: updated,
          InvoiceItems: (full as any).InvoiceItems || [],
          InventorySections: (full as any).InventorySections || [],
        },
      } as any);
    },
    onMutate: (item: any) => {
      setBusyInvoiceId(item?.ID ?? null);
    },
    onError: (error: any, _item: any) => {
      setBusyInvoiceId(null);
      showNotification({ title: 'Warning', message: error?.message || 'Failed to unlink invoice', color: 'yellow.7', autoClose: 4000 });
    },
    onSuccess: (_data, _item: any) => {
      setBusyInvoiceId(null);
      setModuleRefreshToggle(prev => ({ ...prev, [Enums.Module.Invoice]: !prev[Enums.Module.Invoice] }));
    },
  });

  const unlinkPOMutation = useMutation({
    mutationFn: async (item: any) => {
      const full = await purchaseOrderService.getPurchaseOrder(item.ID);
      const newModule = item.SupplierID ? Enums.Module.Supplier : null;
      const newItemId = item.SupplierID ?? null;
      const updated = { ...full, Module: newModule, ItemID: newItemId } as any;
      return await Fetch.put({
        url: '/PurchaseOrder',
        params: {
          PurchaseOrder: updated,
          PurchaseOrderItems: (full as any).PurchaseOrderItems || [],
        },
      } as any);
    },
    onMutate: (item: any) => {
      setBusyPOId(item?.ID ?? null);
    },
    onError: (error: any, _item: any) => {
      setBusyPOId(null);
      showNotification({ title: 'Warning', message: error?.message || 'Failed to unlink purchase order', color: 'yellow.7', autoClose: 4000 });
    },
    onSuccess: (_data, _item: any) => {
      setBusyPOId(null);
      setModuleRefreshToggle(prev => ({ ...prev, [Enums.Module.PurchaseOrder]: !prev[Enums.Module.PurchaseOrder] }));
    },
  });

  // Dynamic linked item modules
  const modules = useMemo(() => ([
    {
      module: Enums.Module.Query,
      heading: 'Linked Queries',
      // queries must come from Link service so that we respect link relationships
      queryMode: 'linkService' as const,
      linkType: Enums.LinkType.JobsToQueries,
      itemModuleWhenLinkedFrom: Enums.Module.JobCard,
      labelFor: (x: any) => `${x.QueryCode}${x.CustomerName ? ' - ' + x.CustomerName : ''}`,
      hrefFor: (x: any) => `/query/${x.ID}`,
      refreshDep: [refreshDeps?.queries, moduleRefreshQueriesToggle[Enums.Module.Query]],
    },
    {
      module: Enums.Module.Quote,
      heading: 'Linked Quotes',
      endpoint: '/Quote/GetQuotes',
      extraParams: { PopulatedList: false, QuoteStatusIDList: [] },
      labelFor: (x: any) => `${x.QuoteNumber}${x.CustomerName ? ' - ' + x.CustomerName : ''}`,
      refreshDep: [refreshDeps?.quotes, moduleRefreshToggle[Enums.Module.Quote]],
    },
    {
      module: Enums.Module.Invoice,
      heading: 'Linked Invoices',
      endpoint: '/Invoice/GetInvoices',
      extraParams: { InvoiceStatusIDList: invoiceStatuses },
      labelFor: (x: any) => `${x.InvoiceNumber}${x.CustomerName ? ' - ' + x.CustomerName : ''}`,
      refreshDep: [refreshDeps?.invoices, moduleRefreshToggle[Enums.Module.Invoice]],
    },
    {
      module: Enums.Module.PurchaseOrder,
      heading: 'Linked Purchase Orders',
      endpoint: '/PurchaseOrder/GetPurchaseOrders',
      extraParams: { },
      labelFor: (x: any) => `${x.PurchaseOrderNumber}${x.SupplierDescription ? ' - ' + x.SupplierDescription : ''}`,
      hrefFor: (x: any) => `/purchase/${x.ID}`,
      refreshDep: [refreshDeps?.purchaseOrders, moduleRefreshToggle[Enums.Module.PurchaseOrder]],
    },
  ]), [invoiceStatuses, refreshDeps?.queries, refreshDeps?.quotes, refreshDeps?.invoices, refreshDeps?.purchaseOrders, moduleRefreshQueriesToggle[Enums.Module.Query], moduleRefreshToggle[Enums.Module.Quote], moduleRefreshToggle[Enums.Module.Invoice], moduleRefreshToggle[Enums.Module.PurchaseOrder]]);

  // Collapsing state and calculations
  const [collapsedInternal, setCollapsedInternal] = useState<boolean>(!!collapsed);
  useEffect(() => {
    if (typeof collapsed === 'boolean') setCollapsedInternal(collapsed);
  }, [collapsed]);

  const [moduleItemCounts, setModuleItemCounts] = useState<Record<number, number>>({});
  const [moduleVisibleLimits, setModuleVisibleLimits] = useState<Record<number, number>>({});
  // Track IDs of currently linked items per module so we can pass them to AddLinkOptions as exclusions
  const [moduleItemIds, setModuleItemIds] = useState<Record<number, string[]>>({});

  const totalItems = useMemo(() => Object.values(moduleItemCounts).reduce((a, b) => a + (b || 0), 0), [moduleItemCounts]);
  const shownItems = useMemo(() => modules.reduce((sum, m) => sum + (collapsedInternal ? (moduleVisibleLimits[m.module] ?? 0) : (moduleItemCounts[m.module] || 0)), 0), [modules, collapsedInternal, moduleVisibleLimits, moduleItemCounts]);
  const hiddenItems = Math.max(0, totalItems - shownItems);

  useEffect(() => {
    if (!collapsedInternal) { setModuleVisibleLimits({}); return; }

    let rem: number;
    if (typeof maxHeight === 'number') rem = maxHeight;
    else if (typeof maxHeight === 'string') {
      const parsed = parseInt(maxHeight as string, 10);
      rem = isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
    } else rem = Number.POSITIVE_INFINITY;

    if (!isFinite(rem)) { setModuleVisibleLimits({}); return; }

    // Static UI metrics (header/item heights and spacings)
    const HEADER_H = 26;  // header text area height
    const HEADER_MB = 4;  // margin below header
    const MODULE_MB = 12; // margin between modules (mb={'sm'})
    const ITEM_H = 32;    // single linked item row height
    const ITEM_GAP = 6;   // gap between items inside a module

    const newLimits: Record<number, number> = {};
    let anyIncluded = false;

    for (const m of modules) {
      const count = moduleItemCounts[m.module] || 0;
      if (count <= 0) continue;

      const spaceBefore = anyIncluded ? MODULE_MB : 0;
      const headerCost = HEADER_H + HEADER_MB;
      const minCost = spaceBefore + headerCost + ITEM_H; // header + at least one item
      if (rem < minCost) {
        continue; // can't fit this module at all
      }

      const available = rem - spaceBefore - headerCost;
      const remainingAfterFirst = available - ITEM_H;
      const extra = Math.max(0, Math.floor((remainingAfterFirst + ITEM_GAP) / (ITEM_H + ITEM_GAP)));
      const canItems = Math.min(count, 1 + extra);

      newLimits[m.module] = canItems;
      // consume space for this module
      rem -= spaceBefore + headerCost + ITEM_H + (canItems - 1) * (ITEM_H + ITEM_GAP);
      anyIncluded = true;
    }

    setModuleVisibleLimits(newLimits);
  }, [collapsedInternal, maxHeight, modules, moduleItemCounts]);

  const renderItem = (label: string, onOpen?: () => void, onUnlink?: () => void, href?: string, isBusy?: boolean) => (
    <Flex align={'center'} gap={25} miw={0} justify={'stretch'}>
      {href ? (
        <Anchor href={href} component={Link as any} c={'scBlue'} fw={600}
                underline={'always'}
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', flex: 1, minWidth: 0 }}
                onClick={(e) => { e.stopPropagation(); }}>
          {label}
        </Anchor>
      ) : (
        <Anchor c={'scBlue'} fw={600}
                underline={'always'}
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', flex: 1, minWidth: 0 }}
                onClick={(e) => { e.preventDefault(); onOpen && onOpen(); }}>
          {label}
        </Anchor>
      )}
      {onUnlink && (
        <Tooltip label={'Remove Link'} color={'yellow'} events={{ hover: true, focus: true, touch: true }}>
          <ActionIcon size={'xs'} color={'red'} variant={'outline'} loading={!!isBusy} disabled={!!isBusy}
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnlink(); }}>
            <IconLinkMinus />
          </ActionIcon>
        </Tooltip>
      )}
    </Flex>
  );

  return (
    <Box mt={'sm'} style={{ minWidth: 0 }}>
        <Flex gap={'xl'} style={{ minWidth: 0 }}>
            <Flex direction={'column'} flex={1} gap={'sm'} style={{ minWidth: 0 }}>
                {showProjectLink && (
                    <Box mb={'sm'}>
                        <Text size={'sm'} fw={600} c={'dark.6'} mb={4}>Linked to Project</Text>
                        <LinkItem
                            setSelected={linkJobToProject}
                            selectedItem={selectedProject}
                            module={Enums.Module.Project}
                            customerID={customerId as any}
                            lockdown={projectLinkLockdown}
                            size={{ label: 'md' } as any}
                        />
                    </Box>
                )}

                <Box style={{ overflow: collapsedInternal ? 'hidden' : undefined, maxHeight: collapsedInternal ? (maxHeight as any) : undefined }}>
                  {modules.map((m) => (
                    <LinkedModuleList
                      key={m.module}
                      jobId={jobId}
                      module={m.module}
                      heading={m.heading}
                      endpoint={m.endpoint}
                      extraParams={m.extraParams}
                      labelFor={m.labelFor}
                      renderItem={renderItem}
                      refreshDep={m.refreshDep}
                      queryMode={m.queryMode}
                      linkType={m.linkType}
                      itemModuleWhenLinkedFrom={m.itemModuleWhenLinkedFrom}
                      hrefFor={m.hrefFor}
                      // Provide busy predicate for external unlink modules so ActionIcon can show a loader
                      getItemIsBusy={m.queryMode === 'linkService' ? undefined : ((item: any) => {
                        switch (m.module) {
                          case Enums.Module.Quote:
                            return item.ID === busyQuoteId;
                          case Enums.Module.Invoice:
                            return item.ID === busyInvoiceId;
                          case Enums.Module.PurchaseOrder:
                            return item.ID === busyPOId;
                          default:
                            return false;
                        }
                      })}
                      onAfterUnlink={m.module === Enums.Module.Query ? (() => setModuleRefreshQueriesToggle(prev => ({ ...prev, [m.module]: !prev[m.module] }))) : undefined}
                      onOpen={(item) => {
                        if (onOpenItem) return onOpenItem(m.module, item);
                        if (m.module === Enums.Module.Quote && onOpenQuote) return onOpenQuote(item);
                        if (m.module === Enums.Module.Invoice && onOpenInvoice) return onOpenInvoice(item);
                      }}
                      onUnlink={m.queryMode === 'linkService' ? undefined : ((item) => {
                        switch (m.module) {
                          case Enums.Module.Quote:
                            unlinkQuoteMutation.mutate(item);
                            break;
                          case Enums.Module.Invoice:
                            unlinkInvoiceMutation.mutate(item);
                            break;
                          case Enums.Module.PurchaseOrder:
                            unlinkPOMutation.mutate(item);
                            break;
                          default:
                            if (onUnlinkItem) onUnlinkItem(m.module, item);
                        }
                      })}
                      limit={collapsedInternal ? (moduleVisibleLimits[m.module] ?? 0) : undefined}
                      onCountChange={(count) => setModuleItemCounts(prev => (prev[m.module] === count ? prev : { ...prev, [m.module]: count }))}
                      onIdsChange={(ids) => setModuleItemIds(prev => {
                        const prevIds = prev[m.module] || [];
                        const same = prevIds.length === ids.length && prevIds.every((v, i) => v === ids[i]);
                        return same ? prev : { ...prev, [m.module]: ids };
                      })}
                    />
                  ))}
                  {totalItems === 0 && !showProjectLink && (
                    <Text c={'dark.6'} size={'md'} mt={'sm'}>
                      No linked items
                    </Text>
                  )}
                </Box>
                {collapsedInternal && hiddenItems > 0 && (
                  <Anchor c={'scBlue'} fw={600} underline={'always'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); const next = !collapsedInternal; setCollapsedInternal(next); onCollapsedChange && onCollapsedChange(next); }}>
                    +{hiddenItems} Items
                  </Anchor>
                )}
            </Flex>

            {/* Linking options modal launcher */}
            <Box ml={'auto'}>
              <AddLinkOptions 
                jobId={jobId}
                customerId={customerId}
                projectId={projectId || selectedProject?.ID || null}
                excludedItemIdMap={moduleItemIds}
                onLinked={(module, mode) => {
                  if (mode === 'linkService' && module === Enums.Module.Query) {
                    setModuleRefreshQueriesToggle(prev => ({ ...prev, [module]: !prev[module] }));
                  } else {
                    setModuleRefreshToggle(prev => ({ ...prev, [module]: !prev[module] }));
                  }
                }}
                onPickProject={(proj) => linkJobToProject(proj)}
                currencySymbol={currencySymbol}
              />
            </Box>

        </Flex>
    </Box>
  );
};

// Local inline component to show the modal options and the modal picker
const AddLinkOptions: FC<{ jobId: string; customerId?: string; projectId?: string | null; excludedItemIdMap?: Record<number, string[]>; onLinked: (module: number, mode: 'linkService' | 'endpoint') => void; onPickProject: (proj: any) => void; currencySymbol?: string }> = ({ jobId, customerId, projectId, excludedItemIdMap, onLinked, onPickProject, currencySymbol }) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [option, setOption] = useState<any | null>(null);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const effectiveCurrencySymbol = currencySymbol ?? 'R';


  const loadExcludedIds = async (mod: number) => {
    // Exclusions are always provided by parent now
    if (mod === Enums.Module.Project) {
      setExcludedIds(projectId ? [projectId] as string[] : []);
      return;
    }
    const provided = excludedItemIdMap?.[mod];
    setExcludedIds(Array.isArray(provided) ? (provided as string[]) : []);
  };

  const options = useMemo(() => ([
      { key: 'projects', label: 'Project', module: Enums.Module.Project, title: 'Link Projects', mode: 'pickOnly' as const, icon: <IconBookmark size={18} /> },
      { key: 'queries', label: 'Query', module: Enums.Module.Query, title: 'Link Queries', mode: 'linkService' as const, linkType: Enums.LinkType.JobsToQueries, icon: <IconFileDescription size={18} /> },
      { key: 'quotes', label: 'Quote', module: Enums.Module.Quote, title: 'Link Quotes', mode: 'endpoint' as const, icon: <IconFileDescription size={18} /> },
      { key: 'invoices', label: 'Invoice', module: Enums.Module.Invoice, title: 'Link Invoices', mode: 'endpoint' as const, icon: <IconFileDollar size={18} /> },
      { key: 'purchase-orders', label: 'Purchase Order', module: Enums.Module.PurchaseOrder, title: 'Link Purchase Orders', mode: 'endpoint' as const, icon: <IconReceipt size={18} /> },
  ]), []);

  return (
    <>
      <Button rightSection={<IconLinkPlus size={17} />} color={'scBlue'} variant={'outline'} onClick={() => setOptionsOpen(true)}>Add Link</Button>

      <SCModal
          size={'auto'}
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        withCloseButton
        headerSection={
          <Flex align={'center'} gap={'sm'} pt={'md'} px={'md'}>
            <IconLink size={18} />
            <Text fw={700}>Link item to job</Text>
          </Flex>
        }
      >
        <Flex direction={'column'} gap={'sm'} style={{ width: 360, maxWidth: '100%' }}>
          {options
            .filter((o) => !(o.key === 'projects' && !!projectId))
            .map((opt) => (
              <Button styles={{inner: {justifyContent: 'start'}}} key={opt.key} variant={'default'} fullWidth leftSection={opt.icon} onClick={() => {
                setOption(opt);
                setOptionsOpen(false);
                setPickerOpen(true);
                loadExcludedIds(opt.module);
              }}>
                {opt.label}
              </Button>
            ))}
        </Flex>
      </SCModal>

      {option && (
        <LinkPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onBack={() => { setPickerOpen(false); setOptionsOpen(true); }}
          onLinked={() => { onLinked(option.module, (option.mode === 'linkService' ? 'linkService' : 'endpoint') as any); setPickerOpen(false); }}
          onPick={option.mode === 'pickOnly' ? (item) => onPickProject(item) : undefined}
          title={option.title}
          jobId={jobId}
          customerId={customerId || null}
          module={option.module}
          queryMode={(option.mode === 'linkService' ? 'linkService' : 'endpoint') as any}
          linkType={option.linkType}
          excludedItemIdList={excludedIds}
          currencySymbol={effectiveCurrencySymbol}
        />
      )}
    </>
  );
};

export default LinkedItemsList;
