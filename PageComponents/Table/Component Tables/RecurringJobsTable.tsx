import { FC, useCallback, useState, useMemo } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import * as Enums from '@/utils/enums';
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit,
    IconTableExport
} from "@tabler/icons";
import { IconEyeEdit, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import DownloadService from "@/utils/download-service";
import ScDataPreview, { ScDataPreviewProps } from "@/PageComponents/Table/ScDataPreview";
import Link from "next/link";
import Helper from "@/utils/helper";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";


const previewDataProps: ScDataPreviewProps[] = [
    {
        type: 'text',
        label: 'Customer',
        key: 'CustomerName'

    },
    {
        type: 'text',
        label: 'Contact',
        key: 'CustomerContactFullName'

    },
    {
        type: 'text',
        label: 'Description of the job',
        key: 'Description'

    },
    {
        type: 'text',
        label: 'Items',
        key: 'InventoryDescription'

    },
    {
        type: 'text',
        label: 'Job Type',
        key: 'JobTypeName'

    },
    {
        type: 'date',
        label: 'Start Date',
        key: 'StartDate'

    },
    {
        type: 'employee',
        label: 'Assigned Employees',
        key: 'Employees'

    }
]

const RecurringJobsTable: FC = () => {

    const recurringJobsTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: Enums.ColumnMapping.JobSchedule,
            columMappingOverrideValues: {
                JobScheduleNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/job-schedule/',
                        slug: 'ID'
                    })
                },
                Employees: {
                    MetaData: JSON.stringify({
                        multipleItems: {
                            keyName: 'Employees',
                            itemLabelKey: 'FullName',
                            colorName: 'DisplayColor'
                        }
                    })
                },
            },
            tableDataEndpoint: '/JobSchedule/GetJobSchedules',
            tableName: 'jobs2',
            tableNoun: 'Job',
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Job',
                    default: true
                },
                {
                    type: 'default',
                    name: 'preview',
                    icon: <IconEyeEdit />,
                    label: 'Preview Job'
                }
            ],
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Inactive Jobs',
                        filterName: 'IncludeClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    }
                ]
            },
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [])


    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const [queryParams, setQueryParams] = useState({})

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/job-schedule/' + item.ID)
        } else if (name === 'preview') {
            setShownPreviewItem(item)
        }
    }, [])


    // const [filterCount, setFilterCount] = useState<number>(1)
    const handleFullExport = async () => {
        handleExport(true)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    /*const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [recurringJobsTableProps.tableName, 'tableData'] })
    }*/

    const [exportBusy, setExportBusy] = useState(false)

    const handleExport = async (exportAll: boolean) => {
        try {
            setExportBusy(true)
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            await DownloadService.downloadFile('POST', '/JobSchedule/GetExportedJobs', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
                updateNotification({
                    id: 'downloading-export',
                    loading: false,
                    message: 'Downloading Exported File',
                    autoClose: 2000,
                    color: 'scBlue'
                })
                setExportBusy(false)
            }) as any)
        } catch (e) {
            setExportBusy(false)
        }
    }

    const buttonIconMode = useMediaQuery('(max-width: 400px)');

    return (
        <>
            <ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={() => onAction('open', shownPreviewItem)}
            />

            <ScTable
                {...recurringJobsTableProps}
                actionStates={actionStates}
                onAction={onAction}
                forceDataRefreshFlipFlop={refreshToggle}
            >
                {exportPermission && (
                    <Button
                        variant={'subtle'}
                        color={'gray.8'}
                        rightSection={!buttonIconMode && <IconTableExport size={15} />}
                        miw={buttonIconMode ? 'auto' : ''}
                        px={buttonIconMode ? 7 : ''}
                        onClick={handleFullExport}
                    >
                        {
                            buttonIconMode ? <IconTableExport size={15} /> :
                                'Export'
                        }
                    </Button>
                )}

                <Link href={'/job-schedule/create'} onClick={() => Helper.nextLinkClicked('/job-schedule/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Recurring Job
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default RecurringJobsTable