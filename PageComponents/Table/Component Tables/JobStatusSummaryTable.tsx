import React, {FC, useMemo} from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps} from "@/PageComponents/Table/table-model";
import {Text} from "@mantine/core";

const JobStatusSummary: FC<{jobId: string}> = ({jobId}) => {

    const jobStatusTable = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    Sortable: false,
                    ColumnName: 'JobCardStatusDescription',
                    CellType: 'status',
                    Label: 'Description',
                    ID: 'jobCardStatusDescription',
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'JobCardStatusDisplayColor'
                    } as ColumnMappingMetaData)
                },
                {
                    Sortable: false,
                    ColumnName: 'DaysInStatus',
                    Label: 'In Status',
                    ID: 'daysInStatus',
                },
                {
                    Sortable: false,
                    ColumnName: 'CreatedDate',
                    Label: 'Created',
                    ID: 'createdDate',
                    CellType: 'date',
                },
                {
                    Sortable: false,
                    ColumnName: 'CreatedBy',
                    Label: 'Created By',
                    ID: 'createdBy',
                },
                {
                    Sortable: false,
                    ColumnName: 'ModifiedDate',
                    Label: 'Modified',
                    ID: 'modifiedDate',
                    CellType: 'date',
                },
                {
                    Sortable: false,
                    ColumnName: 'ModifiedBy',
                    Label: 'Modified By',
                    ID: 'modifiedBy',
                }
            ],
            tableDataEndpoint: '/Job/GetJobStatusChanges',
            tableName: 'jobStatusSummary',
            tableNoun: 'Status',
            tableAltMultipleNoun: 'Statuses',
            /*tableFilterMetaData: {
                options: [
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: 'hidden',
                        filterName: 'QueryID',
                        label: "Job Id",
                        defaultValue: jobId
                    },
                ]
            },*/
            tableDataPayloadSingleQueryItemValue: jobId,
            bottomRightSpace: true,
            selectMode: 'none',
            removeFilter: true,
            removePagination: true,
            bypassGlobalState: true
        }
    ), [jobId])


    return (
        <>
            <Text size={'md'} fw={600} my={'md'}>
                {/*<IconHistory size={18} />*/} Job Status Summary
            </Text>
            <ScTable

                {...jobStatusTable}
            />
        </>
    )
}

export default JobStatusSummary
