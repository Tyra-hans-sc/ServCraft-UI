import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group} from "@mantine/core";
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
import {StocktakeDto} from "@/PageComponents/Stock Take/StockTake.model";
import warehouseService from "@/services/warehouse/warehouse-service";

const StockTakeTemplateList: FC = () => {

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

    const [stockAdmin] = useState(PermissionService.hasPermission(Enums.PermissionName.StockTakeManager));

    const [refresToggle, setRefreshToggle] = useState(false)

    const stockitemTemplateTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.StocktakeTemplate, undefined),
            // module: Enums.Module.St,
            columnMappingModelName: 'StockTakeTemplateList',
            columMappingOverrideValues: {
                Name: {
                    CellType: 'link',
                    Sortable: true,
                    MetaData: JSON.stringify({
                        href: '/stock-take/template/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                }
            },
            tableDataEndpoint: '/StocktakeTemplate/list',
            tableName: 'stocktakeTemplate',
            tableNoun: 'Stock Take Template',
            tableAltMultipleNoun: 'Templates',
            tableFilterMetaData: {
                options: [
                    /*{
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },*/
                    /*{
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true,
                        showForSingleItem: false
                    },*/
                    /*{
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
                    {
                        filterName: 'StocktakeStatusList',
                        hardcodedOptions: Object.entries(Enums.StocktakeStatusText).map(
                            ([value, {label, color}]) => ({value, label, color})
                        ),
                        label: 'Status'
                    },
                    ...(stockAdmin && [{
                        filterName: 'EmployeeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                    }] || [])*/
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                ...(stockAdmin && [
                    {
                        type: 'default' as 'default',
                        name: 'edit',
                        icon: <IconEdit />,
                        label: 'Edit Template',
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
            router.replace('/stock-take/template/' + item.ID)
        } else if (name === 'edit') {
            router.replace('/stock-take/template/' + item.ID)
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
                tableNoun={stockitemTemplateTableProps.tableNoun || ''}
                tableAltMultipleNoun={stockitemTemplateTableProps.tableAltMultipleNoun}
                importType={Enums.ImportType.Inventory}
            />

            <ScTable
                {...stockitemTemplateTableProps}
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
                }
            </ScTable>
        </>
    )
}


export default StockTakeTemplateList