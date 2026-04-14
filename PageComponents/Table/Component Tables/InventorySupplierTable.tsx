import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group, Menu, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit, IconFilterOff, IconTableExport, IconTableImport
} from "@tabler/icons";
import { IconFilterStar, IconPlus } from "@tabler/icons-react";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import PS from '../../../services/permission/permission-service';
import Link from "next/link";
import Helper from "@/utils/helper";
import ScDataImportModal from "@/PageComponents/Table/ScDataImportModal";
import { useMediaQuery } from "@mantine/hooks";

const InventorySupplierTable: FC = () => {

    const inventorySupplierTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Supplier, undefined),
            columnMappingModelName: Enums.ColumnMapping.Supplier,
            columMappingOverrideValues: {
                Code: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/supplier/',
                        slug: 'ID'
                    })
                }
            },
            tableDataEndpoint: '/Supplier/GetSuppliers',
            tableName: 'suppliers',
            tableNoun: 'Supplier',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Include Disabled',
                        filterName: 'IncludeClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Inventory",
                        defaultValue: false
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Edit Supplier',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [])

    const router = useRouter()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [showImportModal, setShowImportModal] = useState(false)

    const [exportBusyState, setExportBusyState] = useState(false)

    const [isMasterOfficeAdmin] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
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
            await DownloadService.downloadFile('POST', '/Supplier/GetExportedSuppliers', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/supplier/' + item.ID)
        }
    }, [])

    const buttonIconMode = useMediaQuery('(max-width: 500px)');

    return (
        <>

            <ScDataImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                tableNoun={inventorySupplierTableProps.tableNoun || ''}
                tableAltMultipleNoun={inventorySupplierTableProps.tableAltMultipleNoun}
                importType={Enums.ImportType.Supplier}
            />
            <ScTable
                {...inventorySupplierTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
            >
                <Group gap={5}>
                    {isMasterOfficeAdmin && (
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
                    )}
                    {exportPermission && (
                        <Menu
                            shadow="md"
                            position={'bottom-end'}
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
                <Link href={'/supplier/create'} onClick={() => Helper.nextLinkClicked('/supplier/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {inventorySupplierTableProps.tableNoun}
                    </Button>
                </Link>

            </ScTable >
        </>
    )
}

export default InventorySupplierTable
