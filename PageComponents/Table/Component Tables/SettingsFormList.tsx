import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";
import * as Enums from '@/utils/enums';
import { ResultResponse, SignatureTemplate } from "@/interfaces/api/models";


const SettingsFormList: FC = () => {

    const formTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'name',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/settings/form/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                /*{
                    ColumnName: 'Module',
                    Label: 'Module',
                    CellType: 'status',
                    ID: 'module',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                    })
                },*/
                {
                    ColumnName: 'FormRule',
                    Label: "Form Rule",
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.FormRule,
                    }),
                    ID: 'rule'
                },
                {
                    ColumnName: 'FormDefinitionStatus',
                    Label: "Status",
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.FormDefinitionStatus,
                        colourMappingValues: Enums.FormDefinitionStatusColor
                    }),
                    ID: 'rule'
                },
                {
                    ColumnName: 'MultiUse',
                    Label: "Reusable",
                    CellType: "icon",
                    ID: 'multiUse',
                    InverseLogic: false,
                },
                {
                    ColumnName: 'Version',
                    Label: 'Version',
                    CellType: 'none',
                    ID: 'version',
                    // DisplayValueFunction: (x) => 'v ' + x.Version + '.00' as any
                },
                {
                    ColumnName: 'CreatedDate',
                    Label: "Created",
                    CellType: "date",
                    ID: 'createdDate',
                },
                {
                    ColumnName: 'CreatedBy',
                    Label: "Created By",
                    CellType: "none",
                    ID: 'createdBy',
                },
                {
                    ColumnName: 'ModifiedDate',
                    Label: "Modified",
                    CellType: "date",
                    ID: 'ModifiedDate',
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: "Modified By",
                    CellType: "none",
                    ID: 'ModifiedBy',
                },
            ],
            tableDataEndpoint: '/FormDefinition/GetFormDefinitions',
            tableName: 'forms',
            tableNoun: 'Form',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Show disabled items',
                        filterName: 'IsClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        filterName: 'ShowDraftVersion',
                        label: "Show Draft Version",
                        defaultValue: true
                    },
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
        }
    ), [])

    const router = useRouter()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/settings/form/' + item.ID)
        }
    }, [])

    // const [refreshToggle, setRefreshToggle] = useState(false)

    return (
        <>
            <ScTable
                {...formTableProps}
                actionStates={actionStates}
                onAction={onAction}
                // forceDataRefreshFlipFlop={refreshToggle}
            >

                <Link href={'/settings/form/create'} onClick={() => Helper.nextLinkClicked('/settings/form/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Form
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SettingsFormList