import {FC, useMemo, useState} from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import {useQueryClient} from "@tanstack/react-query";

const QueryStatusSummary: FC<{queryId}> = ({queryId}) => {

    const queryTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    Sortable: false,
                    ColumnName: 'QueryStatusDescription',
                    CellType: 'status',
                    Label: 'Description',
                    ID: 'queryStatusDescription',
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'QueryStatusDisplayColor'
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
            tableDataEndpoint: '/Query/GetQueryStatusChanges',
            tableName: 'queryStatusSummary',
            tableNoun: 'Status',
            tableAltMultipleNoun: 'Statuses',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: 'hidden',
                        filterName: 'QueryID',
                        label: "Query Id",
                        defaultValue: queryId
                    },
                ]
            },
            bottomRightSpace: true,
            selectMode: 'none',
            removeFilter: true,
            removePagination: true,
            bypassGlobalState: true
        }
    ), [queryId])

    const queryClient = useQueryClient()

    const [actionStates, setActionStates] = useState<TableActionStates>({})

    const [refreshToggle, setRefreshToggle] = useState(false)

    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [queryTableProps.tableName, 'tableData'] })
    }


    return (
        <>
            <ScTable
                {...queryTableProps}
                actionStates={actionStates}
                forceDataRefreshFlipFlop={refreshToggle}
            />
        </>
    )
}


export default QueryStatusSummary