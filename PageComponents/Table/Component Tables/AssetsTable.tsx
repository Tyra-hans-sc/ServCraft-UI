import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit,
    IconFilterOff,
    IconTableExport, IconTableImport, IconTrash, IconTrashOff
} from "@tabler/icons";
import { IconFilterStar, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { getActionId } from "@/PageComponents/Table/table-helper";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import ScDataImportModal from "@/PageComponents/Table/ScDataImportModal";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";

const AssetsTable: FC = () => {

    const assetTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Product, undefined),
            columnMappingModelName: Enums.ColumnMapping.Asset,
            columMappingOverrideValues: {
                ProductNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/asset/',
                        slug: 'ID'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },

                CustomTextField1: {
                    ColumnName: 'CustomField1',
                },
                CustomTextField2: {
                    ColumnName: 'CustomField2',
                },
                CustomTextField3: {
                    ColumnName: 'CustomField3',
                },
                CustomTextField4: {
                    ColumnName: 'CustomField4',
                },
                CustomCheckbox1: {
                    CellType: 'icon',
                    ColumnName: 'CustomFilter1'
                },
                CustomCheckbox2: {
                    CellType: 'icon',
                    ColumnName: 'CustomFilter2'
                }
            },
            tableDataEndpoint: '/Product/GetProducts',
            tableName: 'assets',
            tableNoun: 'Asset',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        // queryPath: '/Store/GetEmployeeStores',
                        /*queryParams: {
                            employeeId: Storage.getCookie(Enums.Cookie.employeeID)
                        },*/
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },
                    {
                        filterName: 'CategoryIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/InventoryCategory/false',
                        label: 'Category'
                    },
                    {
                        filterName: 'SubcategoryIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/InventorySubcategory/GetOnlyActive',
                        showIncludeDisabledToggle: true,
                        label: 'Subcategory',
                        // defaultValue: ["8c2aca98-c499-45f2-8cd6-6d83eee1bb75", "bf92b39a-3d34-4b1e-b63e-fb95a5b686f1"],
                        queryParams: {
                            onlyActive: 'false'
                        },
                        type: 'multiselect'
                    },
                    {
                        type: 'switch',
                        label: 'Include Scrapped',
                        filterName: 'IncludeScrapped',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Assets",
                        defaultValue: false
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Asset',
                    default: true
                },
                {
                    type: 'warning',
                    name: 'scrap',
                    icon: <IconTrash />,
                    label: 'Scrap Asset',
                    activeLabel: 'Scrapping Asset',
                    conditionalShow: {
                        key: 'IsScrapped',
                        equals: false
                    }
                },
                {
                    type: 'default',
                    name: 'scrap',
                    icon: <IconTrashOff />,
                    label: 'Restore Asset',
                    activeLabel: 'Restoring Asset',
                    conditionalShow: {
                        key: 'IsScrapped',
                        equals: true
                    }
                }
            ],
            bottomRightSpace: true,
            selectMode: 'bulk'
        }
    ), [])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [showImportModal, setShowImportModal] = useState(false)

    const [exportBusyState, setExportBusyState] = useState(false)

    const [isMasterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})

    const undoScrap = useCallback((item: any) => {
        onAction('scrap', item)
        updateNotification({
            id: 'scrap-' + item.ProductNumber,
            loading: true,
            autoClose: false,
            color: 'scBlue',
            message: item.IsScrapped ? 'Restoring' : 'Scrapping' + ` ${assetTableProps.tableNoun} ` + item.ProductNumber
        })
    }, [])

    const scrapItemMutation = useMutation(
        [assetTableProps.tableName, 'scrapassetitem'],
        ({ item }) => Fetch.get({
            url: '/Product/ProductScrapToggle?id=' + item.ID + '&isScrapped=' + !item.IsScrapped
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'scrap-' + item.ProductNumber,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsScrapped ? 'Unscrapped' : 'Scrapped') + ` ${assetTableProps.tableNoun} ` + item.ProductNumber}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoScrap(data)}>Undo</Button>
                    </Group>,
                    autoClose: 8000,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'scrap-' + item.ProductNumber,
                    loading: false,
                    message: 'Unable to ' + (item.IsArchived ? 'Unscrap' : 'Scrap') + ` ${assetTableProps.tableNoun}`,
                    autoClose: true,
                    color: 'yellow.7'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'scrap-' + item.ProductNumber,
                    loading: true,
                    message: item.IsArchived ? 'Unscrapping' : 'Scrapping' + ` ${assetTableProps.tableNoun} ` + item.ProductNumber,
                    autoClose: false,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const [selectedItems, setSelectedItems] = useState<any[]>([])


    const scrapSelectedItemsMutation = useMutation(
        [assetTableProps.tableName, 'scrapSelected'],
        ({ items }) => Fetch.post({
            url: '/Product/ProductListScrapToggle',
            params: items
        } as any),
        {
            onSuccess: (data, { items }) => {
                updateNotification({
                    id: 'scrapItems',
                    loading: false,
                    message: `Successfully ${selectedItemsAllScrapped ? 'Unscrapped' : 'Scrapped'} ${assetTableProps.tableNoun}s`,
                    autoClose: 8000,
                    color: 'scBlue'
                })
            },
            onError: (error, { items }: any) => {
                updateNotification({
                    id: 'scrapItems',
                    loading: false,
                    message: `Unable to ${selectedItemsAllScrapped ? 'Unscrap' : 'Scrap'} ${assetTableProps.tableNoun}s`,
                    autoClose: true,
                    color: 'yellow.7'
                })
            },
            onMutate: ({ items }: any) => {
                showNotification({
                    id: 'scrapItems',
                    loading: true,
                    message: `${selectedItemsAllScrapped ? 'Unscrapping' : 'Scrapping'} ${assetTableProps.tableNoun}s`,
                    autoClose: false,
                    color: 'scBlue'
                })
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const selectedItemsAllScrapped = useMemo(() => selectedItems.filter(x => x.IsScrapped).length === selectedItems.length, [selectedItems])

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/asset/' + item.ID)
        } else if (name === 'scrap') {
            scrapItemMutation.mutate({ item, name })
        }
    }, [])


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [assetTableProps.tableName, 'tableData'] })
    }

    const handleExport = async (exportAll: boolean) => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Product/GetExportedProducts', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
                updateNotification({
                    id: 'downloading-export',
                    loading: false,
                    message: 'Downloading Exported File',
                    autoClose: 2000,
                    color: 'scBlue'
                })
                setExportBusyState(false)
            }) as any)
        } catch (e) {
            setExportBusyState(false)
        }
    }

    const handleScrapSelected = () => {
        scrapSelectedItemsMutation.mutate(
            { items: [...selectedItems.filter(x => selectedItemsAllScrapped ? x.IsScrapped : !x.IsScrapped).map(x => x.ID)] }
        )
    }

    const buttonIconMode = useMediaQuery('(max-width: 500px)');

    return (
        <>

            <ScDataImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                tableNoun={assetTableProps.tableNoun || ''}
                importType={Enums.ImportType.Asset}
            />

            <ScTable
                {...assetTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                onSelected={setSelectedItems}
            >
                {
                    selectedItems.length !== 0 &&
                    <Group gap={'xs'}>
                        <Button
                            variant={'outline'}
                            color={'yellow.7'}
                            leftSection={scrapSelectedItemsMutation.isLoading ? <Loader color={'scBlue'} size={15} /> : selectedItemsAllScrapped ? <IconTrashOff /> : <IconTrash />}
                            disabled={scrapSelectedItemsMutation.isLoading}
                            onClick={handleScrapSelected}
                        >
                            {selectedItemsAllScrapped ? 'Unscrap Selected' : 'Scrap Selected'}
                        </Button>
                    </Group>
                }

                <Group gap={5}>
                    {isMasterOfficeAdminPermission && (

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
                        /*<Button
                            variant={'subtle'}
                            color={'gray.8'}
                            rightSection={<IconTableImport size={15} />}
                            onClick={() => setShowImportModal(true)}
                        >
                            Import
                        </Button>*/

                    )}
                    {exportPermission && (
                        <Menu
                            shadow="md"
                            position={'bottom-end'}
                        // width={200}
                        >
                            <Menu.Target>
                                <Button
                                    variant={'subtle'}
                                    color={'gray.8'}
                                    rightSection={!buttonIconMode && <IconTableExport size={15} />}
                                    miw={buttonIconMode ? 'auto' : ''}
                                    px={buttonIconMode ? 7 : ''}
                                >
                                    {
                                        buttonIconMode ? <IconTableExport size={15} /> :
                                            'Export'
                                    }
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Export to Excel</Menu.Label>
                                <Tooltip events={{ hover: true, focus: true, touch: true }} label={'Only export items that appear in your current filter'} color={'scBlue'}>
                                    <Menu.Item
                                        onClick={handleFilteredExport}
                                        leftSection={<IconFilterStar size={14} />}
                                        disabled={exportBusyState}
                                    >
                                        Filtered Export
                                    </Menu.Item>
                                </Tooltip>
                                <Menu.Item
                                    onClick={handleFullExport}
                                    leftSection={<IconFilterOff size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Full Export
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>

                <Link href={'/asset/create'} onClick={() => Helper.nextLinkClicked('/asset/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {assetTableProps.tableNoun}
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default AssetsTable
