import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import {Alert, Button, Flex, Group, Menu, Text, Tooltip} from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import {IconCrown, IconFilterOff, IconFilterStar, IconPlus, IconTableExport, IconTableImport} from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";
import bundleService from "@/services/inventory/bundle-service";
import ToastContext from "@/utils/toast-context";
import { showNotification, updateNotification } from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import PS from '../../../services/permission/permission-service';
import * as Enums from '@/utils/enums';
import { useMediaQuery } from "@mantine/hooks";

const BundlesTable: FC = () => {

    const toast = useContext(ToastContext);
    const [canCreate, setCanCreate] = useState(false);
    const [maxCount, setMaxCount] = useState(0);

    useEffect(() => {

        bundleService.GetBundlesCanCreate(toast)
            .then(response => {
                setCanCreate(response.CanCreate);
                setMaxCount(response.MaxCount);
            });

    }, []);

    const bundleTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'bundleName',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/bundle/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                {
                    ColumnName: 'Description',
                    Label: 'Description',
                    ID: 'bundleDescription'
                },
                {
                    ColumnName: 'BundleTotalCalculated',
                    Label: 'Bundle Total',
                    ID: 'bundleTotalCalculated',
                    CellType: 'currency'
                },
                {
                    ColumnName: 'IsActive',
                    Label: 'Active',
                    ID: 'isActive',
                    CellType: 'icon'
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: 'Updated By',
                    ID: 'bundleUpdatedBy'
                },
                {
                    ColumnName: 'ModifiedDate',
                    CellType: 'date',
                    Label: 'Updated Date',
                    ID: 'bundleUpdatedDate',
                }
            ],
            tableDataEndpoint: '/Bundle/GetBundles',
            tableName: 'bundle',
            tableNoun: 'Bundle',
            tableAltMultipleNoun: 'Bundles',
            thumbnailPropertyName: "ThumbnailUrl",
            imagePropertyName: "ImageUrl",
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Include Deactivated',
                        filterName: 'IncludeClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Bundle',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [])

    const router = useRouter()

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
            await DownloadService.downloadFile('POST', '/Bundle/GetExportedBundleDetail', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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
            router.replace('/bundle/' + item.ID)
        }
    }, [])

    const buttonIconMode = useMediaQuery('(max-width: 500px)');

    return (
        <>
            <ScTable
                {...bundleTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
            >
                <Group gap={5}>
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
                <Flex align={'center'} gap={'sm'}>

                    <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Your package allows for a maximum of ${maxCount ?? 0} bundles`} color={'goldenrod'}>
                        <IconCrown size={18} color={'goldenrod'} style={{cursor: 'help'}} />
                    </Tooltip>

                    {/*<Alert color={'goldenrod'} variant={'outline'} p={8} pt={9} px={8} pb={8} mr={'xs'}
                           styles={{
                               message: {
                                   margin: 'auto'
                               }
                           }}
                    >
                        <Flex align={'center'} gap={5}> <Text c={'dimmed'} size={'sm'}>Your package allows for a maximum of {maxCount ?? 0} bundles</Text></Flex>
                    </Alert>*/}

                    <Link href={'/bundle/create'} onClick={() => Helper.nextLinkClicked('/bundle/create')}>
                        <Button color={'scBlue'} rightSection={<IconPlus size={14} />} disabled={!canCreate} title={!canCreate ? `Your package allows for a maximum of ${maxCount ?? 0} bundles` : undefined}>
                            Add {bundleTableProps.tableNoun}
                        </Button>
                    </Link>
                </Flex>
            </ScTable>
        </>
    )
}


export default BundlesTable
