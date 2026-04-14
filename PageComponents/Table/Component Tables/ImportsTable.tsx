import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
    IconDownload, IconFileAlert,
} from "@tabler/icons";
import {IconEyeExclamation, IconFileImport} from "@tabler/icons-react";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import ConfirmAction from "@/components/modals/confirm-action";
import ImportErrors from "@/components/modals/import/errors";
import {useInterval} from "@mantine/hooks";

const ImportsTable: FC = () => {

    const importTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Import, undefined),
            staticColumnMapping: [
                {
                    Label: 'File Name',
                    ID: 'FileName',
                    ColumnName: 'AttachmentDescription',
                    CellType: 'none',
                },
                {
                    Label: 'Type',
                    ID: 'ImportType',
                    ColumnName: 'ImportType',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.ImportType,
                    } as ColumnMappingMetaData)
                },
                {
                    Label: 'Status',
                    ID: 'ImportStatus',
                    ColumnName: 'ImportStatus',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        colourMappingValues: Enums.ImportStatusColor,
                        mappingValues: Enums.ImportStatus,
                    } as ColumnMappingMetaData)
                },
                {
                    Label: 'Items',
                    ID: 'ItemCount',
                    ColumnName: 'ItemCount',
                    CellType: 'none',
                },
                {
                    Label: 'Errors',
                    ID: 'ErrorCount',
                    ColumnName: 'ErrorCount',
                    CellType: 'none',
                },
                {
                    Label: 'Checks',
                    ID: 'CheckCount',
                    ColumnName: 'CheckCount',
                    CellType: 'none',
                },
                {
                    Label: 'Saves',
                    ID: 'SaveCount',
                    ColumnName: 'SaveCount',
                    CellType: 'none',
                },
                {
                    Label: 'Created',
                    ID: 'CreatedDate',
                    ColumnName: 'CreatedDate',
                    CellType: 'date',
                },
                {
                    Label: 'Created By',
                    ID: 'CreatedBy',
                    ColumnName: 'CreatedBy',
                    CellType: 'none',
                },
                {
                    Label: 'Modified',
                    ID: 'ModifiedDate',
                    ColumnName: 'ModifiedDate',
                    CellType: 'date',
                },
                {
                    Label: 'Modified By',
                    ID: 'ModifiedBy',
                    ColumnName: 'ModifiedBy',
                    CellType: 'none',
                }
            ],
            tableDataEndpoint: '/Import/GetImports',
            tableName: 'importstable',
            tableNoun: 'Import',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ImportTypeList',
                        label: 'Import Type',
                        type: 'multiselect',
                        hardcodedOptions: Enums.getEnumItemsVD(Enums.ImportType, true).map(item => ({
                            label: item.description,
                            value: item.value + ''
                        }))
                    },
                    {
                        filterName: 'ImportStatusList',
                        label: 'Import Status',
                        type: 'multiselect',
                        hardcodedOptions: Enums.getEnumItemsVD(Enums.ImportStatus, true).map(item => ({
                            label: item.description,
                            value: item.value + ''
                        }))
                    },
                ],
                showIncludeDisabledOptionsToggle: false
            },
            showControlsOnHover: false,
            actions: [
                {
                    type: 'default',
                    name: 'download',
                    icon: <IconDownload />,
                    label: 'Download file',
                    default: true
                },
                /*{
                    type: 'default',
                    name: 'downloadReport',
                    icon: <IconFileDownload />,
                    label: 'Download Report'
                },*/
                {
                    type: 'error',
                    name: 'downloadReport',
                    icon: <IconFileAlert />,
                    label: 'Download file with error info',
                    showFunction: (item) => item.HasErrorReport && item.ErrorCount !== 0
                },
                {
                    type: 'error',
                    name: 'viewErrors',
                    icon: <IconEyeExclamation />,
                    label: 'View errors',
                    // activeLabel: 'Archiving Job',
                    showFunction: (item) => !item.HasErrorReport && item.Error !== null
                }
            ],
            bottomRightSpace: true,
            queryParamNames: {
                importType: {
                    type: 'option',
                    filterName: 'ImportTypeList'
                },
                importStatus: {
                    type: 'option',
                    filterName: 'ImportStatusList'
                }
            },
            selectMode: 'none',

        }
    ), [])

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [queryParams, setQueryParams] = useState({});

    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const downloadImportFile = (row) => {
        DownloadService.downloadFile("GET", `/Import/GetImportFile?importID=${row.ID}`, null, false, false, "", "", null, false,
            (() => {
                setActionStates(p => ({
                    ...p,
                    ['download' + row.ID]: 'success'
                }))
            }) as any
            );
    };

    const downloadImportReportFile = (row) => {
        if (row.HasErrorReport) {
            DownloadService.downloadFile("GET", `/Import/GetImportReportFile?importID=${row.ID}`, null, false, false, "", "", null, false,
                (() => {
                    setActionStates(p => ({
                        ...p,
                        ['downloadReport' + row.ID]: 'success'
                    }))
                }) as any
            );
        }
    };

    const [selectedErrorItem, setSelectedErrorItem] = useState<any>(null)

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'download') {
            setActionStates(p => ({
                ...p,
                [name + item.ID]: 'loading'
            }))
            downloadImportFile(item)
        } else if (name === 'downloadReport') {
            setActionStates(p => ({
                ...p,
                [name + item.ID]: 'loading'
            }))
            downloadImportReportFile(item)
            // queryClient.invalidateQueries({queryKey: [jobTableProps.tableName, 'tableData']})
        } else if (name === 'viewErrors') {
            setSelectedErrorItem(item)
            // queryClient.invalidateQueries({queryKey: [jobTableProps.tableName, 'tableData']})
        } else {
            showNotification(
                {
                    id: 'comingSoon',
                    message: 'Coming Soon...',
                    color: 'scBlue'
                }
            )
        }
    }, [])


    // const [filterCount, setFilterCount] = useState<number>(1)

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
        // setFilterCount(getActiveFilterCount(jobTableProps.tableFilterMetaData?.options || [], newParams))
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    const {start: startRefreshInterval, stop: stopRefreshInterval} = useInterval(
        () => {setRefreshToggle(p => !p)},
        1000 * 30,
        {autoInvoke: false}
    )

    const checkRefreshInterval = (newData) => {
        const data: any[] | undefined = newData?.Results
        if ( data?.some(x => x.ImportStatus === Enums.ImportStatus.Inprogress || x.ImportStatus === Enums.ImportStatus.Processing) ) {
            startRefreshInterval()
        } else {
            stopRefreshInterval()
        }
    }


    return (
        <>
            {!!selectedErrorItem ?
                <ImportErrors
                    importRecord={selectedErrorItem}
                    closeErrorModal={() => setSelectedErrorItem(null)}
                />
                : ''
            }

            <ScTable
                {...importTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                tableDataOnLoad={checkRefreshInterval}
            >
                <Link href={'/settings/import/create'} onClick={() => Helper.nextLinkClicked('/settings/import/create')}>
                    <Button color={'scBlue'} rightSection={<IconFileImport size={14} />}>
                        New Import
                    </Button>
                </Link>
            </ScTable>

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
        </>
    )
}


export default ImportsTable