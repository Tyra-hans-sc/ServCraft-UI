import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button} from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import {
    IconEdit
} from "@tabler/icons";
import { IconEyeEdit, IconPlus } from "@tabler/icons-react";
import ScDataPreview, { ScDataPreviewProps } from "@/PageComponents/Table/ScDataPreview";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import {getEnumStringValue} from "@/utils/enums";


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
        key: 'EmployeeList'

    }
]

const JobsTable: FC<{projectId: string, module: number, customerID: string}> = ({projectId, module, customerID}) => {

    const jobTableProps = useMemo<ScTableProps>(() => (
        {
            bypassGlobalState: true,
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Job, undefined),
            columnMappingModelName: Enums.ColumnMapping.Job,
            columMappingOverrideValues: {
                EmployeeList: {
                    CellType: 'employee',
                    ColumnName: 'Employees',
                    MetaData: JSON.stringify({
                        multipleItems: {
                            keyName: 'Employees',
                            itemLabelKey: 'FullName',
                            colorName: 'DisplayColor'
                        }
                    })
                },
                LocationDisplay: {
                  ColumnName: 'LocationDescription'
                },
                JobCardNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/job/',
                        slug: 'ID'
                    })
                },
                JobInvoices: {
                    CellType: 'statusList',
                    MetaData: JSON.stringify({
                        colourMappingValues: Enums.InvoiceStatusColor,
                        mappingValues: Enums.InvoiceStatus,
                        valueKey: 'InvoiceStatus',
                        display: 'InvoiceNumber',
                        link: {
                            href: '/invoice/',
                            slug: 'ID',
                        },
                        docNumName: "Invoice Number",
                        totalColumn: "InvoiceAmount"
                    } as ColumnMappingMetaData)
                },
                JobQueries: {
                    CellType: 'statusList',
                    MetaData: JSON.stringify({
                        colourMappingValues: undefined,
                        mappingValues: undefined,
                        valueKey: 'QueryStatus',
                        display: 'QueryCode',
                        link: {
                            href: '/query/',
                            slug: 'ID',
                        },
                        docNumName: "Query Code",
                        displayColorKeyName: "StatusColour"
                    } as ColumnMappingMetaData)
                },
                /*CustomerContactFullName: {
                    CellType: 'initials'
                },*/
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                CustomFilter1: {
                    CellType: 'icon'
                },
                CustomFilter2: {
                    CellType: 'icon'
                }
            },
            tableDataEndpoint: '/Job/GetJobsForProject',
            tableName: 'projectJobs',
            tableNoun: 'Job',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Closed Jobs',
                        filterName: 'IncludeClosed',
                        // default = inclusive for switch
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'switch',
                        label: 'Archived Jobs',
                        // defaultValue: true,
                        filterName: 'ShowArchived',
                        dataValueKey: 'IsArchived'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateJobs",
                        defaultValue: false
                    },
                    {
                        type: 'hidden',
                        filterName: 'projectId',
                        label: "Project ID",
                        defaultValue: projectId
                    },
                    {
                        type: 'hidden',
                        filterName: 'ModuleIDList',
                        label: "Populate Invoices",
                        defaultValue: ['Project']
                    },

                ],
                showIncludeDisabledOptionsToggle: false
            },
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
                },
            ],
            // bottomRightSpace: true,
            queryParamNames: {
                statusID: {
                    type: 'option',
                    filterName: 'JobStatusIDList'
                },
                employeeUnassigned: {
                    type: 'unassignedOption',
                    filterName: 'showUnassignedQueryTypes'
                }
            },
            selectMode: 'none'
        }
    ), [])

    const router = useRouter()

    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/job/' + item.ID)
        } else if (name === 'preview') {
            setShownPreviewItem(item)
        } else if (name === "openitem") {
            router.replace(item)
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


    return (
        <>
            <ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={() => onAction('open', shownPreviewItem)}
            />

            <ScTable
                {...jobTableProps}
                onAction={onAction}
            >
                <Link href={`/job/create?module=${module}&moduleID=${projectId}&customerID=${customerID}`} onClick={() => Helper.nextLinkClicked('/job/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Job
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default JobsTable