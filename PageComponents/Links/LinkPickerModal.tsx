import React, { FC, useMemo } from 'react';
import SCModal from '@/PageComponents/Modal/SCModal';
import DynamicVirtualList from '@/PageComponents/Appointment/DynamicVirtualList';
import * as Enums from '@/utils/enums';
import { useMutation, useQuery } from '@tanstack/react-query';
import linkService from '@/services/link/link-service';
import QuoteService from '@/services/quote/quote-service';
import invoiceService from '@/services/invoice/invoice-service';
import purchaseOrderService from '@/services/purchase/purchase-order-service';
import companyService from '@/services/company-service';
import Fetch from '@/utils/Fetch';
import { Badge, Box, Button, Flex, Text, Anchor } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconArrowLeft, IconFileDescription } from '@tabler/icons-react';
import moment from 'moment';
import Helper from "@/utils/helper";
import Link from 'next/link';

export type LinkQueryMode = 'endpoint' | 'linkService';

interface LinkPickerModalProps {
  open: boolean;
  onClose: () => void;
  onLinked?: () => void;
  title: string;
  jobId: string;
  customerId?: string | null;
  module: number; // target module to link to (Quote, Invoice, Query, etc.)
  // choose how to link
  queryMode?: LinkQueryMode;
  linkType?: number; // required when queryMode === 'linkService'
  onBack?: () => void; // optional back handler to return to options modal
  onPick?: (item: any) => void | Promise<void>; // optional custom pick handler (e.g., Project)
  // optional: exclude already linked item IDs from available list
  excludedItemIdList?: string[];
  // optional: pass currency symbol from parent (preferred). If not provided, component will fetch it.
  currencySymbol?: string;
}

// Prefer company currency symbol next to amount; fallback to 'R' if unavailable
const fetchCurrencySymbol = async () => {
  try {
    return await companyService.getCurrencySymbol();
  } catch {
    return 'R';
  }
};

const formatMoney = (value?: number | string | null, symbol?: string) => {
  if (value === null || value === undefined || value === '') return '';
  // const formatted = new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num as number);
  const formatted = Helper.getCurrencyValue(value);
  const s = symbol || 'R';
  return `${s} ${formatted}`;
};

const getModuleSingular = (module: number) => {
  switch (module) {
    case Enums.Module.Quote: return 'Quote';
    case Enums.Module.Invoice: return 'Invoice';
    case Enums.Module.PurchaseOrder: return 'Purchase Order';
    case Enums.Module.Project: return 'Project';
    case Enums.Module.Query: return 'Query';
    default: return 'Item';
  }
};

const LinkPickerModal: FC<LinkPickerModalProps> = ({ open, onClose, onLinked, title, jobId, customerId, module, queryMode = 'endpoint', linkType, onPick, onBack, excludedItemIdList = [], currencySymbol }) => {

  const effectiveCurrencySymbol = currencySymbol ?? 'R';

  const dataSource = useMemo(() => {
    switch (module) {
      case Enums.Module.Quote:
        return {
          queryUrl: '/Quote/GetQuotes',
          queryParams: {
            PopulatedList: false,
            IncludeClosed: true,
            CustomerIDList: customerId ? [customerId] : [],
            ExcludedItemIDList: excludedItemIdList || [],
            ExcludedQuoteIDList: excludedItemIdList || [],
          },
          labelFor: (x: any) => `${x.QuoteNumber || ''}${(x.Reference || x.LocationDescription) ? ' - ' + (x.Reference || x.LocationDescription) : ''}`,
        };
      case Enums.Module.Invoice:
        return {
          queryUrl: '/Invoice/GetInvoices',
          queryParams: {
            IncludeClosed: true,
            CustomerIDList: customerId ? [customerId] : [],
            ExcludedItemIDList: excludedItemIdList || [],
            ExcludedInvoiceIDList: excludedItemIdList || [],
          },
          labelFor: (x: any) => `${x.InvoiceNumber || ''}${(x.Reference || x.LocationDescription) ? ' - ' + (x.Reference || x.LocationDescription) : ''}`,
        };
      case Enums.Module.PurchaseOrder:
        return {
          queryUrl: '/PurchaseOrder/GetPurchaseOrders',
          queryParams: {
            IncludeClosed: true,
            ExcludedItemIDList: excludedItemIdList || [],
            ExcludedPurchaseOrderIDList: excludedItemIdList || [],
            // no direct customer filter; use SupplierIDList if needed – omitted here
          },
          labelFor: (x: any) => `${x.PurchaseOrderNumber || ''}${(x.Reference || x.LocationDescription) ? ' - ' + (x.Reference || x.LocationDescription) : ''}`,
        };
      case Enums.Module.Project:
        return {
          // GET endpoint to filter by customer like LinkItem
          fetchFn: async (params: any) => {
            const response = await Fetch.get({
              url: '/Project',
              params: {
                searchPhrase: params?.searchPhrase || '',
                includeClosed: false,
                pageSize: params?.PageSize || 50,
                pageIndex: params?.PageIndex || 0,
                customerID: customerId || null,
                excludedItemIdList: excludedItemIdList || [],
                excludedProjectIdList: excludedItemIdList || [],
              },
            } as any);
            return response;
          },
          labelFor: (x: any) => `${x.ProjectNumber || x.Code || ''}${(x.Reference || x.LocationDescription) ? ' - ' + (x.Reference || x.LocationDescription) : ''}`,
        };
      case Enums.Module.Query:
        return {
          // GET endpoint, use fetchFn
          fetchFn: async (params: any) => {
            const response = await Fetch.get({
              url: '/Query',
              params: {
                searchPhrase: params?.searchPhrase || '',
                includeClosed: false,
                pageSize: params?.PageSize || 50,
                pageIndex: params?.PageIndex || 0,
                customerID: customerId || null,
                excludedItemIdList: excludedItemIdList || [],
                excludedQueryIdList: excludedItemIdList || [],
              },
            } as any);
            return response;
          },
          labelFor: (x: any) => `${x.QueryCode || x.Code || ''}${(x.Reference || x.LocationDescription) ? ' - ' + (x.Reference || x.LocationDescription) : ''}`,
        };
      default:
        return {
          queryUrl: undefined as any,
          queryParams: {},
          labelFor: (x: any) => x.Description || 'Item',
        };
    }
  }, [module, customerId, excludedItemIdList]);

  // Link mutations for direct modules
  const directLinkMutation = useMutation(async (item: any) => {
    switch (module) {
      case Enums.Module.Quote: {
        const full = await QuoteService.getQuote(item.ID);
        const updated = { ...full, Module: Enums.Module.JobCard, ItemID: jobId } as any;
        return await Fetch.put({
          url: '/Quote',
          params: {
            Quote: updated,
            QuoteItems: (full as any).QuoteItems || [],
            InventorySections: (full as any).InventorySections || [],
          },
        } as any);
      }
      case Enums.Module.Invoice: {
        const full = await invoiceService.getInvoice(item.ID);
        const updated = { ...full, Module: Enums.Module.JobCard, ItemID: jobId } as any;
        return await Fetch.put({
          url: '/Invoice',
          params: {
            Invoice: updated,
            InvoiceItems: (full as any).InvoiceItems || [],
            InventorySections: (full as any).InventorySections || [],
          },
        } as any);
      }
      case Enums.Module.PurchaseOrder: {
        const full = await purchaseOrderService.getPurchaseOrder(item.ID);
        const updated = { ...full, Module: Enums.Module.JobCard, ItemID: jobId } as any;
        return await Fetch.put({
          url: '/PurchaseOrder',
          params: {
            PurchaseOrder: updated,
            PurchaseOrderItems: (full as any).PurchaseOrderItems || [],
          },
        } as any);
      }
      default:
        throw new Error('Unsupported module for direct linking');
    }
  }, {
    onMutate: (item: any) => {
      showNotification({ id: 'link-item-' + item.ID, message: 'Linking item...', color: 'scBlue', loading: true, autoClose: false, withCloseButton: false });
    },
    onError: (error: any, item: any) => {
      updateNotification({ id: 'link-item-' + item.ID, title: 'Item not linked', message: error?.message || 'Item not linked', color: 'yellow.7', loading: false, autoClose: 4000 });
    },
    onSuccess: (_data, item: any) => {
      updateNotification({ id: 'link-item-' + item.ID, message: 'Item Linked', color: 'scBlue', loading: false, autoClose: 2500, withCloseButton: true });
      onLinked && onLinked();
      onClose && onClose();
    },
  });

  const linkServiceMutation = useMutation(async (item: any) => {
    const link = {
      LinkType: linkType ?? Enums.LinkType.Default,
      IsActive: true,
      Item1Module: Enums.Module.JobCard,
      Item1ID: jobId,
      Item2Module: module,
      Item2ID: item.ID,
    } as any;
    return await linkService.saveLink(link);
  }, {
    onMutate: (item: any) => {
      showNotification({ id: 'link-item-' + item.ID, message: 'Linking item...', color: 'scBlue', loading: true, autoClose: false, withCloseButton: false });
    },
    onError: (error: any, item: any) => {
      updateNotification({ id: 'link-item-' + item.ID, title: 'Item not linked', message: error?.message || 'Item not linked', color: 'yellow.7', loading: false, autoClose: 4000 });
    },
    onSuccess: (_data, item: any) => {
      updateNotification({ id: 'link-item-' + item.ID, message: 'Item Linked', color: 'scBlue', loading: false, autoClose: 2500, withCloseButton: true });
      onLinked && onLinked();
      onClose && onClose();
    },
  });

  const handleItemClick = async (item: any) => {
    if (onPick) {
      try {
        await onPick(item);
        onLinked && onLinked();
        onClose && onClose();
      } catch (e: any) {
        showNotification({ title: 'Item not linked', message: e?.message || 'Item not linked', color: 'yellow.7', autoClose: 4000 });
      }
      return;
    }
    if (queryMode === 'linkService') {
      linkServiceMutation.mutate(item);
    } else {
      directLinkMutation.mutate(item);
    }
  };

  const statusForItem = (itm: any): { label?: string; color?: string } => {
    if (module === Enums.Module.Invoice) {
      const label = itm.InvoiceStatusName || itm.StatusName || (itm.InvoiceStatus !== undefined ? Enums.getEnumStringValue(Enums.InvoiceStatus, itm.InvoiceStatus) : undefined) || itm.Status || undefined;
      const map: Record<string, string> = {
        Draft: 'gray',
        Unpaid: 'blue',
        Overdue: 'red',
        Paid: 'green',
        Cancelled: 'gray',
        Approved: 'blue',
      };
      const color = label ? (map[label] || 'blue') : undefined;
      return { label, color };
    }
    if (module === Enums.Module.Quote) {
      const label = itm.QuoteStatusName || itm.StatusName || (itm.QuoteStatus !== undefined ? Enums.getEnumStringValue(Enums.QuoteStatus, itm.QuoteStatus) : undefined) || itm.Status || undefined;
      const map: Record<string, string> = {
        Draft: 'gray',
        Accepted: 'green',
        Declined: 'red',
        Invoiced: 'grape',
        Expired: 'yellow',
        Approved: 'blue',
        Cancelled: 'gray',
      };
      const color = label ? (map[label] || 'blue') : undefined;
      return { label, color };
    }
    // Queries: usually no status
    return {};
  };

  const docNumFor = (itm: any) => {
    switch (module) {
      case Enums.Module.Invoice: return itm.InvoiceNumber || itm.InvoiceNum || itm.InvoiceCode || itm.Number || itm.Code || '';
      case Enums.Module.Quote: return itm.QuoteNumber || itm.QuoteNum || itm.QuoteCode || itm.Number || itm.Code || '';
      case Enums.Module.PurchaseOrder: return itm.PurchaseOrderNumber || itm.PONumber || itm.Number || '';
      case Enums.Module.Project: return itm.ProjectNumber || itm.ProjectNum || itm.Number || '';
      case Enums.Module.Query: return itm.QueryCode || itm.Code || '';
      default: return itm.Description || 'Item';
    }
  };

  const hrefFor = (itm: any): string | undefined => {
    switch (module) {
      case Enums.Module.Query:
        return `/query/${itm.ID}`;
      case Enums.Module.PurchaseOrder:
        return `/purchase/${itm.ID}`;
      default:
        return undefined;
    }
  };

  const nameFor = (itm: any) => {
    if (module === Enums.Module.Project) {
      return itm.Description || itm.LocationDisplay || '';
    }
    if (module === Enums.Module.PurchaseOrder) {
      return itm.LocationDisplay || itm.DeliveryAddress || itm.SupplierName || '';
    }
    if (module === Enums.Module.Invoice || module === Enums.Module.Quote) {
      return itm.LocationDisplay || itm.CustomerName || '';
    }
    return itm.LocationDisplay || itm.Description || itm.Name || '';
  };
  const amountFor = (itm: any) => {
    if (module === Enums.Module.Invoice || module === Enums.Module.Quote || module === Enums.Module.PurchaseOrder) {
      return itm.TotalExclusive ?? itm.TotalExcl ?? itm.SubTotalExclusive ?? itm.GrandTotal ?? itm.Total ?? null;
    }
    return null;
  };
  const dateFor = (itm: any) => {
    const raw = itm.InvoiceDate || itm.QuoteDate || itm.PurchaseOrderDate || itm.Date || itm.Created || itm.CreateDate || itm.CreatedDate;
    return raw ? moment(raw).format('DD MMM YYYY') : '';
  };

  const singular = getModuleSingular(module);
  const pluralFor = (s: string) => (s === 'Query' ? 'Queries' : `${s}s`);
  const searchLabel = `Search ${pluralFor(singular)}`;

  return (
    <SCModal
        size={400}
        open={open} onClose={onClose}
        p={0}
        modalProps={{
            styles: {
                root: {
                    padding: '0 !important',
                    marginBottom: '0 !important',
                },
                body: {
                    marginBottom: '-5px !important',
                },
                inner: {
                    margin: '0 !important',
                }
            }
        }}
    >
      <Box>
        <DynamicVirtualList
            headerRightSection={
                <Flex align={'center'} gap={'sm'} justify={'space-between'}>
                    {onBack && (
                        <Button variant={'subtle'} onClick={onBack} leftSection={<IconArrowLeft size={16} />}>
                            Back
                        </Button>
                    )}
                </Flex>
            }
            emptyMessage={'No linkable ' + pluralFor(singular) + ' found'}
          fetchFn={dataSource.fetchFn as any}
          queryUrl={dataSource.queryUrl as any}
          queryParams={dataSource.queryParams as any}
          excludeIds={excludedItemIdList as any}
          title={title}
          onItemClick={handleItemClick}
          itemHeight={75}
          itemStyle={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 4, padding: '10px var(--mantine-spacing-sm)' }}
          renderItem={(item: any) => {
            const status = statusForItem(item);
            const amt = amountFor(item);
            const dt = dateFor(item);
            const doc = docNumFor(item);
            const name = nameFor(item);
            return (
              <Flex align={'center'} justify={'space-between'} gap={'md'} style={{ width: '100%' }}>
                <Flex align={'center'} gap={5} style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ alignSelf: 'flex-start' }}>
                    <IconFileDescription size={19} color={'var(--mantine-color-gray-6)'} />
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align={'center'} gap={'sm'} wrap={'nowrap'}>
                      {hrefFor(item) ? (
                        <Anchor
                          href={hrefFor(item)}
                          component={Link as any}
                          target="_blank"
                          rel="noopener noreferrer"
                          c={'scBlue'}
                          fw={700}
                          size={'sm'}
                          underline={'always'}
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          {doc}
                        </Anchor>
                      ) : (
                        <Text fw={700} size={'sm'} c={'scBlue'} style={{ whiteSpace: 'nowrap' }}>{doc}</Text>
                      )}
                      {status.label && (
                        <Badge color={status.color} variant={'light'} radius={'xl'} fw={'normal'} size={'xs'}>
                            <span>
                          {status.label}
                            </span>
                        </Badge>
                      )}
                    </Flex>
                    <Text c={'dark.6'} size={'sm'} lineClamp={1} mt={5}>
                      {name}
                    </Text>
                  </Box>
                </Flex>
                <Box style={{ textAlign: 'right' }}>
                  {!!amt && <Text size={'sm'} fw={700}>{formatMoney(amt, effectiveCurrencySymbol)}</Text>}
                  {dt && <Text size={'sm'} c={'dark.6'}>{dt}</Text>}
                </Box>
              </Flex>
            );
          }}
          searchPlaceholder={searchLabel}
        />
      </Box>
    </SCModal>
  );
};

export default LinkPickerModal;
