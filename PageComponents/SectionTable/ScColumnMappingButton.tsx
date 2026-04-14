import {Button, ButtonProps, Drawer, Flex, Text, Title} from "@mantine/core";
import {IconColumns2} from "@tabler/icons-react";
import {FC, useCallback, useEffect, useState} from "react";
import {ColumnMappingData} from "@/PageComponents/Table/table-model";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getCombinedLocalColumnMapping} from "@/PageComponents/Table/ScTable";
import {useDebouncedValue} from "@mantine/hooks";
import Fetch from "@/utils/Fetch";
import ScActiveColumns from "../Table/Table Columns/ScActiveColumns";
import {IconLayoutColumns} from "@tabler/icons";
import {SimpleColumnMapping} from "@/PageComponents/SimpleTable/SimpleTable";

const getLsColumnMapping: (tableName: string) => ColumnMappingData[] | undefined = (tableName) => {
    try {
        const ls = localStorage.getItem(tableName + '-columns-')
        return ls && JSON.parse(ls) || undefined
    } catch (e) {
        return undefined
    }
}

const setLsColumnMapping = (tableName: string, columnMapping: ColumnMappingData[]) => {
    localStorage && localStorage.setItem(tableName + '-columns-', JSON.stringify(columnMapping))
}

const fetchColMapping = async (model) => {
    const res = await Fetch.get({url: `/Employee/ColumnMapping?model=${model}`} as any)
    if(res.Results) {
        return res.Results
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}
const putColMapping = async (model, ColumnMappings) => {
    const res = await Fetch.put({url: '/Employee/ColumnMapping', params: {ColumnMappings, model}} as any)
    if(res.Results) {
        return res.Results
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}

const colTitle = (
    <Flex direction={'column'} gap={2}>
        <Title order={4} c={'dimmed'}>
            <Flex align={'center'} gap={5}>
                <IconLayoutColumns size={20}/>
                Columns
            </Flex>
        </Title>
        <Text fz={14} c={'dimmed'}>Drag these items to re-order them in the table.</Text>
    </Flex>
)

const ScColumnMappingButton: FC<{
    columnMappingModelName?: string;
    mapping: SimpleColumnMapping[]
    tableName: string;
    onColumnMappingLoaded: (colMapping: ColumnMappingData[]) => void
} & ButtonProps> = ({
    columnMappingModelName,
    mapping,
    tableName,
    onColumnMappingLoaded,
    ...buttonProps
}) => {
    const [showColumns, setShowColumns] = useState(false)
    const [columnMapping, setColumnMapping] = useState<ColumnMappingData[]>(getLsColumnMapping(tableName) ?? [])

    useEffect(() => {
        if(columnMapping.length) {
            onColumnMappingLoaded(columnMapping)
        }
    }, [columnMapping]);

    const colMappingQuery = useQuery<ColumnMappingData[]>(
        [tableName, 'columnDefinition'],
        () => fetchColMapping(columnMappingModelName),
        {
            onError: console.error,
            enabled: !!columnMappingModelName,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false
            /*initialData: () => {
                const mapping = getLsColumnMapping(tableName)
                console.log('initial column mapping data', mapping)
                mapping && setColumnMapping(mapping)
                return mapping
            }*/
        })

    // Update column mapping when query data changes
    useEffect(() => {
        if (colMappingQuery.data) {
            if(colMappingQuery.data.length === 0) {
                const mapping1 = mapping.map(x => ({
                    Show: true,
                    Sortable: !!x.columConfigOptions?.allowReorder,
                    ID: x.key,
                    Label: typeof x.label === 'string' ? x.label : '!!invalid-label-type!!',
                    ColumnName: x.key,
                    IsRequired: !x.columConfigOptions?.allowShowToggle
                }))
                setColumnMapping(mapping1)
                setLsColumnMapping(tableName, mapping1)
            } else {
                setColumnMapping(colMappingQuery.data)
                setLsColumnMapping(tableName, colMappingQuery.data)
            }
        }
    }, [colMappingQuery.data, tableName])

    const [columnMappingModified, setColumnMappingModified] = useState(false)
    const columnMappingMutation = useMutation(
        [tableName, 'columnDefinition'],
        ({newColMapping}: {
            newColMapping: ColumnMappingData[]
        }) => putColMapping(columnMappingModelName, newColMapping),
    )
    const [debouncedColumnMapping] = useDebouncedValue(columnMapping, 600)
    useEffect(() => {
        if (columnMappingModified) {
            if (columnMappingModelName) {
                columnMappingMutation.mutate({newColMapping: debouncedColumnMapping}, {
                    //onSuccess: console.log,
                    onError: console.error
                })
                setColumnMapping(
                    debouncedColumnMapping
                )
            }
            setLsColumnMapping(tableName, debouncedColumnMapping)
        }
    }, [debouncedColumnMapping])


    const handleColumnMappingChange = useCallback(
        (newColumnMapping: ColumnMappingData[]) => {
            setColumnMapping(newColumnMapping)
            setColumnMappingModified(true)
        }, []
    )


    return <>

        <Drawer
            title={colTitle}
            opened={showColumns}
            onClose={() => setShowColumns(false)}
            size={'md'}
            position={'right'}
        >
            <ScActiveColumns columnMapping={columnMapping} onChange={handleColumnMappingChange}/>
        </Drawer>

        <Button
            variant={'subtle'}
            color={'dark.9'}
            leftSection={<IconColumns2 size={16}/>}
            onClick={() => setShowColumns(p => !p)}
            {...buttonProps}
        >
            Columns
        </Button>
    </>
};

export default ScColumnMappingButton
