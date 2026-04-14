import React, { FC, useCallback, useState } from "react";
import { Box, Button, CloseButton, Flex, Loader, Text, TextInput, Tooltip } from "@mantine/core";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import { StocktakeItemDto } from "@/PageComponents/Stock Take/StockTake.model";
import { IconExclamationCircle, IconSearch, IconTableExport } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { ResultResponse, Warehouse, WarehouseStock } from "@/interfaces/api/models";
import * as enums from "@/utils/enums";
import Image from "next/image";
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { useDebouncedValue, useDidUpdate, useMediaQuery } from "@mantine/hooks";
import * as Enums from "@/utils/enums";
import SCModal from "@/PageComponents/Modal/SCModal";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import PermissionService from "@/services/permission/permission-service";
import warehouseService from "@/services/warehouse/warehouse-service";

const WarehouseStockItemList: FC<
    { warehouse: Warehouse, onChange: (items: any[]) => void, onUnsentChangesChange: (hasUnsentChanges: boolean) => void, conflictItemInventoryIds?: string[] }
> = ({ warehouse, ...props }
) => {

        // Filter state for API call
        const [filterState, setFilterState] = useState<any>({});
        const [searchQuery, setSearchQuery] = useState('');
        const [debouncedSearch] = useDebouncedValue<string>(searchQuery, 300);

        const [page, setPage] = useState(0);
        const [hasMore, setHasMore] = useState(true);
        const [allItems, setAllItems] = useState<WarehouseStock[]>([]);
        const PAGE_SIZE = 50; // Number of items to load per request

        const [warehouseStockItems, setWarehouseStockItems] = useState<WarehouseStock[] | undefined>();
        // Use useQuery with a query key that includes the stockTake.ID
        // so that the query automatically re-runs when the ID changes
        const { data: warehouseStockItemsResponse, isLoading, isInitialLoading, error, isSuccess, isStale, refetch } = useQuery<ResultResponse<WarehouseStock>, Error>(
            ['warehouseStockItems', warehouse.ID,
                /* if inputs update quickly the stock items do not get updated correctly so need to refetch when status updates to display correctly data when cell types change  */
                // at the same time, we dont want the items to also update with every status switch
                filterState,
                debouncedSearch,
                page
            ],
            async () => {
                const response = await warehouseService.searchWarehouseStocks({
                    warehouseIDs: warehouse?.ID ? [warehouse.ID] : [],
                    extraParams: filterState,
                    searchPhrase: debouncedSearch,
                    sortExpression: "InventoryCode",
                    sortDirection: "ascending",
                    pageSize: PAGE_SIZE,
                    pageIndex: page,
                    includeDisabled: false
                });
                if (!response || !response.Results) {
                    throw new Error((response as any)?.serverMessage || (response as any)?.message || 'Failed to fetch inventory data');
                }
                return response;
            },
            {
                enabled: !!warehouse.ID,
                staleTime: 0,
                onSuccess: (data) => {
                    if (page === 0) {
                        // Reset items for new filters or search
                        setWarehouseStockItems(data.Results.filter(x => x.IsActive));
                        setAllItems(data.Results);
                    } else {
                        // Append items for pagination
                        setWarehouseStockItems(prev => [...(prev || []), ...data.Results]);
                        setAllItems(prev => [...prev, ...data.Results]);
                    }

                    // Check if we've reached the end of the data
                    setHasMore(data.Results.length === PAGE_SIZE);

                    // Check if search and filters are empty before calling onChange
                    const isFiltered = searchQuery !== '' || filterState.OnlyDiscrepancies;

                    // Only pass data to parent when no filters are applied
                    if (!isFiltered) {
                        props.onChange?.(page === 1 ? data.Results : [...allItems, ...data.Results]);
                    } else {
                        console.log('Data is filtered, not updating parent component');
                    }

                },
                onError: (err) => {
                    console.error('Stock item fetch error:', err);
                }
            }
        )

        // Reset pagination when filters change
        useDidUpdate(() => {
            setPage(0);
            setAllItems([]);
        }, [searchQuery, filterState, warehouse.ID]);

        // Load more function for infinite scroll
        const handleLoadMore = useCallback(() => {
            console.log('Loading more...');
            if (!isLoading && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }, [isLoading, hasMore]);


        const [exportPermission] = useState(PermissionService.hasPermission(Enums.PermissionName.Exports));

        const handleFilteredExport = async () => {
            handleExport()
        }

        const handleExport = async () => {
            alert("Export goes here");
       }



        const buttonIconMode = useMediaQuery('(max-width: 500px)');

        const [previewImageUrl, setPreviewImageUrl] = useState<{
            Url: string;
            UrlThumb: string;
        } | null>(null)

        return <>

            <SCModal
                open={!!previewImageUrl}
                showClose={true}
                withCloseButton={true}
                onClose={() => setPreviewImageUrl(null)}
                size={"auto"}
            >
                {
                    previewImageUrl &&
                    <ImageWithZoom
                        attachment={{ ContentType: "image/jpeg", ...previewImageUrl }}
                    />
                }
            </SCModal>

            <Flex align={'center'} mb={5}>
                <TextInput
                    mt={0}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setPage(0)
                    }}
                    placeholder={'Search'}
                    size={'sm'}
                    leftSection={<IconSearch size={17} />}
                    rightSection={!!searchQuery && <CloseButton size={'xs'} onClick={() => setSearchQuery('')} />}
                    // variant={'outline'}
                    w={'250px'}
                    mr={'sm'}
                />
                <ScDataFilter
                    initialValues={filterState as any}
                    onChange={(newState) => {
                        setFilterState(newState)
                        setPage(0)
                    }}
                    module={enums.Module.Inventory}
                    tableNoun={'Stock Items'}
                    flexProps={{ align: 'start', wrap: { base: 'wrap' }, mt: 0 }}
                    singleSelectMode
                    tableName={'warehouseStockItemfilter'}
                    optionConfig={{
                        options: [
                            {
                                type: 'switch',
                                label: 'Hide items with no stock on hand',
                                filterName: 'HideEmptyQuantityOnHand',
                                inclusion: 'exclusive'
                            },
                            {
                                type: 'switch',
                                label: 'Hide items with stock on hand',
                                filterName: 'HideQuantityOnHand',
                                inclusion: 'exclusive'
                            }
                       ],
                        showIncludeDisabledOptionsToggle: false
                    }}
                />
                {
                    false && exportPermission && !!warehouseStockItems?.length && warehouse.ID &&
                    <Button
                        ml={'auto'}
                        variant={'subtle'}
                        color={'gray.8'}
                        rightSection={!buttonIconMode && <IconTableExport size={15} />}
                        miw={buttonIconMode ? 'auto' : ''}
                        px={buttonIconMode ? 7 : ''}
                        onClick={handleFilteredExport}
                    >
                        {
                            buttonIconMode ? <IconTableExport size={15} /> :
                                'Export'
                        }
                    </Button>
                }


            </Flex>



            {
                (warehouseStockItems || []).length > 0 &&
                <SimpleTable
                    onLoadMore={handleLoadMore}
                    isLoading={isLoading}
                    hasMore={hasMore}

                    height={'calc(100vh - 340px)'}
                    data={warehouseStockItems?.filter(x => x.IsActive) || []}
                    showControlsOnHover={false}
                   stylingProps={{
                        compact: true,
                        darkerText: true,
                        rowBorders: true,
                    }}
                    controls={[]}
                    mapping={
                        [
                            {
                                label: 'Image',
                                key: 'Image',
                                valueFunction: (x) => (
                                    <Box pos={'relative'} w={40} h={40}>
                                        {
                                            (x.InventoryThumbnailUrl) && (
                                                <Image
                                                    onClick={() => setPreviewImageUrl({
                                                        Url: x.InventoryThumbnailUrl,
                                                        UrlThumb: x.InventoryThumbnailUrl,
                                                    })}
                                                    src={x.InventoryThumbnailUrl || ''}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    style={{
                                                        cursor: 'pointer',
                                                        borderRadius: '4px',
                                                        objectFit: 'cover',
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            ) || <Box pos={'absolute'} top={'50%'} left={'50%'}
                                                style={{ transform: 'translate(-50%, -50%)' }}>
                                                <StockItemTypeIcon stockItemType={x.InventoryStockItemType} size={20} />
                                            </Box>
                                        }
                                    </Box>
                                )
                            },
                            {
                                label: 'Item Code',
                                key: 'InventoryCode' as keyof StocktakeItemDto,
                                maxColumnWidth: 250,
                                valueFunction: (x: StocktakeItemDto) => <Flex align={'center'} gap={3} w={'100%'}>
                                    <span>{x.InventoryCode}</span>
                                    {
                                        props.conflictItemInventoryIds && props.conflictItemInventoryIds.includes(x.InventoryID) &&
                                        <Tooltip
                                            multiline
                                            maw={250}
                                            ml={'auto'}
                                            color={'yellow'}
                                            c={'dark'}
                                            label={'This item is being counted in another stocktake.  This could result in duplicate stock level adjustments if unintended.'}
                                        >
                                            <IconExclamationCircle size={18} stroke={1.5} color={'var(--mantine-color-yellow-7)'} />
                                        </Tooltip>
                                    }
                                </Flex>
                            },
                            {
                                label: 'Description',
                                key: 'InventoryDescription' as keyof WarehouseStock,
                                valueFunction: (x: WarehouseStock) => <span>{x.InventoryDescription}</span>,
                                maxColumnWidth: 250
                            },
                            {
                                label: 'On Hand',
                                key: 'QuantityOnHand' as keyof WarehouseStock,
                                alignRight: true,
                            }
                        ]
                    }

                />
            }

            {
                isInitialLoading && !warehouseStockItems ? <Flex align={'center'} justify={'center'} mih={250} mb={'xl'}>
                    <Loader size={40} />
                </Flex> : error && <Text c="yellow.7" size={'sm'}>{error?.message}</Text>
            }

            {
            warehouseStockItems?.filter(x => x.IsActive).length === 0

                && (
                    <Box p="xl" my={'xl'} style={{ textAlign: 'center' }}>
                        {
                       <>
                                <Text c="dimmed" size="sm">
                                    No items found. &nbsp;Try changing the search query.
                                </Text>
                            </>
                        }
                    </Box>
                )
            }
        </>;
    }


export default WarehouseStockItemList
