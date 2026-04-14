import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import {IconNewsOff, IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";
import * as Enums from '@/utils/enums';
import { ResultResponse, SignatureTemplate } from "@/interfaces/api/models";


const SettingsWebFormList: FC = () => {

    const formTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: 'WebFormList',
            columMappingOverrideValues: {
                Name: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/settings/webform/',
                        slug: 'ID'
                    })
                },
                CreatedDate: {
                    CellType: "date",
                },
                ModifiedDate: {
                    CellType: "date",
                },
            },
            tableDataEndpoint: '/WebForm/SearchWebForms',
            tableName: 'forms',
            tableNoun: 'Form',
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
                        filterName: 'QueryTypeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        dataOptionColorKey: 'DisplayColor',
                        queryPath: '/QueryType',
                        label: 'Type',
                        queryParams: {
                            includeDisabled: 'true'
                        },
                        /*unassignedOption: 'showUnassignedQueryTypes',
                        unassignedOptionMeta: {
                            label: 'Draft',
                            icon: <IconNewsOff size={14} />
                        }*/
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
            router.push('/settings/webform/' + item.ID)
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

                <Link href={'/settings/webform/create'} onClick={() => Helper.nextLinkClicked('/settings/webform/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Web Form
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SettingsWebFormList