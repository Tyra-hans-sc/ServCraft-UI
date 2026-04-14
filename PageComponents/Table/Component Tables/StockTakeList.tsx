import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import {Button, Group, Popover, Tooltip, Text} from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import {IconEye, IconPlus, } from "@tabler/icons-react";
import UserConfigService from "@/services/option/user-config-service";
import ScDataImportModal from "@/PageComponents/Table/ScDataImportModal";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import PermissionService from "@/services/permission/permission-service";
import {useQuery} from "@tanstack/react-query";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import {StocktakeDto, StocktakeTemplateDto} from "@/PageComponents/Stock Take/StockTake.model";
import warehouseService from "@/services/warehouse/warehouse-service";
import stockService from "@/services/stock/stock-service";

const StockTakeList: FC = () => {

    const router = useRouter();
    // Fetch the feature flag to check if stock take is enabled.
    // Redirect to home page if the feature is not available.
    useQuery(['hasStockTake'], () => featureService.getFeature(constants.features.STOCK_TAKE), {
        onSuccess: (data) => {
            if (data === null) {
                router.replace('/');
            }
        },
    })

    const {isLoading: templatesLoading, data: templates} = useQuery<StocktakeTemplateDto[]>(['stocktakeTemplate'], async () => {
        const warehouseResults = await stockService.getTemplates('');
        if(!warehouseResults.Results) {
            throw new Error((warehouseResults as any)?.serverMessage || (warehouseResults as any)?.message || 'Something went wrong')
        }
        return warehouseResults.Results;
    })


    const [stockAdmin] = useState(PermissionService.hasPermission(Enums.PermissionName.StockTakeManager));

    const [refresToggle, setRefreshToggle] = useState(false)

    const stockTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Stocktake, undefined),
            // module: Enums.Module.Inventory,
            columnMappingModelName: 'StockTakeList',
            columMappingOverrideValues: {
                Name: {
                    CellType: 'link',
                    Sortable: true,
                    MetaData: JSON.stringify({
                        href: '/stock-take/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                Description: {
                    CellType: 'Description',
                },
                StocktakeStatusString: {
                    ColumnName: 'Status',
                    Label: 'Status',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Object.entries(Enums.StocktakeStatusText).reduce(
                            (acc, [enumVal, {color, label}]) => ({...acc,
                                [label]: +enumVal,
                            }), {}
                        ),
                        colourMappingValues: Object.entries(Enums.StocktakeStatusText).reduce(
                            (acc, [enumVal, {color}]) => ({...acc,
                                [color]: +enumVal,
                            }), {}
                        ),
                    } as ColumnMappingMetaData),
                    Width: 200
                },
                EmployeeFullName: {
                    ColumnName: 'AssignedEmployeeFullName' as keyof StocktakeDto,
                    /*MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })*/
                },
                StartDate: {
                    ColumnName: 'StartedDate'
                }
            },
            tableDataEndpoint: '/Stocktake/list',
            tableName: 'stocktake001',
            tableNoun: 'Stock Take',
            tableAltMultipleNoun: 'Stock Takes',
            tableFilterMetaData: {
                options: [
                    /*{
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true,
                        showForSingleItem: false
                    },*/
                    {
                        filterName: 'WarehouseIDList',
                        dataOptionValueKey: 'ID',
                        orderByKey: 'IsDefault',
                        queryFunction: ({showAll, search}) => warehouseService.getWarehouses(100, undefined, search),
                        label: 'Warehouse',
                        hiddenWhileLoading: true,
                        showForSingleItem: false,
                        // dataOptionSiblingFilterName: 'StoreIDList',
                        // dataOptionSiblingKey: 'StoreID',
                        dataOptionGroupingKey: 'EmployeeFullName',
                    },
                    ...(stockAdmin && [{
                        filterName: 'EmployeeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                    }] || []),
                    {
                        filterName: 'StocktakeStatusList',
                        hardcodedOptions: Object.entries(Enums.StocktakeStatusText).filter(([x]) => x !== Enums.StocktakeStatus.Draft + '').map(
                            ([value, {label, color}]) => ({value, label, color})
                        ),
                        label: 'Status'
                    },
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEye />,
                    label: 'Open Stock Take',
                    default: true
                },
                ...(stockAdmin && [
                    {
                        type: 'default' as 'default',
                        name: 'edit',
                        icon: <IconEdit />,
                        label: 'Edit Stock Take',
                        default: true
                    }
                ] || []),/*
                {
                    type: 'default',
                    name: 'openDrawer',
                    icon: <IconLayoutSidebarRightExpand />,
                    label: 'View Inventory',
                    default: true
                }*/
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [stockAdmin])

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [showImportModal, setShowImportModal] = useState(false)

    const [queryParams, setQueryParams] = useState({})

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/stock-take/' + item.ID)
        } else if (name === 'edit') {
            router.replace('/stock-take/' + item.ID + '/edit')
            // setSelectedStock(item)
        } else if (name === 'openDrawer') {
            // setSelectedStock(item)
        }
    }, [])

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const buttonIconMode = useMediaQuery('(max-width: 500px)');

    /** recently added items */
    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    return (
        <>
            {/*<InventoryItemDrawer
                inventory={selectedStock}
                show={!!selectedStock || createNew}
                isNew={createNew}
                onClose={() => {
                    setSelectedStock(null)
                    setCreateNew(false)
                    setRefreshToggle(p => !p)
                }}
                onInventorySave={(item) => {
                    if(createNew) {
                        setRecentlyAdded(p => ([item, ...p]))
                    }
                    setSelectedStock(null)
                    setCreateNew(false)
                    setRefreshToggle(p => !p)
                }}
                onInventorySavedRefreshOnly={(item) => {
                    setRefreshToggle(p => !p)
                    if(recentlyAdded.some(x => x.ID === item.ID)) {
                        setRecentlyAdded(recentlyAdded.map(x => x.ID === item.ID ? {...item} : x))
                    }
                }}
                onSetInventory={setSelectedStock}
            />*/}

            <ScDataImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                tableNoun={stockTableProps.tableNoun || ''}
                tableAltMultipleNoun={stockTableProps.tableAltMultipleNoun}
                importType={Enums.ImportType.Inventory}
            />

            <ScTable
                {...stockTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refresToggle}
                recentlyAdded={recentlyAdded}
            >

                {/*<Button
                    color={'gray'}
                    variant={'outline'}
                    rightSection={<IconCalendarRepeat size={14} />}
                    // onClick={() => setCreateNew(true)}
                >
                    Schedules
                </Button>*/}


                <Group gap={5}>
                    {/*{isMasterOfficeAdminPermission && (
                        <Button
                            variant={'subtle'}
                            color={'gray.8'}
                            rightSection={!buttonIconMode && <IconTableImport size={15} />}
                            miw={buttonIconMode ? 'auto' : ''}
                            px={buttonIconMode ? 7 : ''}
                            onClick={() => setShowImportModal(true)}
                        >
                            {
                                buttonIconMode ? <IconTableImport size={15} /> :
                                    'Import'
                            }
                        </Button>
                    )}*/}
                </Group>

                {
                    stockAdmin &&
                    <Popover width={200} position="left-start" withArrow shadow="md"
                             disabled={templatesLoading || templates?.length !== 0}
                             defaultOpened
                    >
                        <Popover.Target>
                            <Link
                                href={'/stock-take/template/create'}
                            >
                                <Button
                                    color={'scBlue'}
                                    rightSection={<IconPlus size={14} />}
                                >
                                    Add Item Template
                                </Button>
                            </Link>
                        </Popover.Target>
                        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                            <Text size="sm">Start by creating your first stock take item template.</Text>
                        </Popover.Dropdown>
                    </Popover>
                }

                {
                    stockAdmin &&
                    <Tooltip
                        disabled={templatesLoading || templates?.length !== 0}
                        // disabled={templatesLoading || false}
                        label={'Please add a template first'}
                        color={'scBlue'}
                        openDelay={200}
                    >
                        <Link
                            href={'/stock-take/create'}
                        >
                            <Button
                                // disabled={templatesLoading || true}
                                disabled={templatesLoading || templates?.length === 0}
                                color={'scBlue'}
                                rightSection={<IconPlus size={14} />}
                            >
                                Add {stockTableProps.tableNoun}
                            </Button>
                        </Link>

                    </Tooltip>
                }
            </ScTable>
        </>
    )
}


export default StockTakeList