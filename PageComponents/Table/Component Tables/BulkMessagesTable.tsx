import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Flex, Group, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { hideNotification, showNotification, updateNotification } from "@mantine/notifications";
import {
    IconExternalLink,
    IconSend,
} from "@tabler/icons";
import { IconEyeEdit, IconMessage2Dollar, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { getActionId } from "@/PageComponents/Table/table-helper";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import { getEnumStringValue, ModuleUrl } from "@/utils/enums";
import SubscriptionContext from "@/utils/subscription-context";
import BillingService from "@/services/billing-service";
import ScDataPreview, { ScDataPreviewProps } from "../ScDataPreview";
import PS from '@/services/permission/permission-service'


const previewDataProps: ScDataPreviewProps[] = [
    {
        type: 'html',
        label: 'Message',
        key: 'MessageBody'
    }
]

const BulkMessagesTable: FC = () => {
    const subscriptionContext = useContext(SubscriptionContext);

    const [creditsAvailable, setCreditsAvailable] = useState(0)
    const [canBuyCredits, setCanBuyCredits] = useState(false)

    const creditsQuery = useQuery(['credits'], () => BillingService.getSubcriptionInfo(), {
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on tab focus
        refetchOnMount: false, // Don't refetch on component remount
    })

    // Update credits state when query data changes
    useEffect(() => {
        if (creditsQuery.data) {
            const [subscriptionInfo, message] = creditsQuery.data
            if (subscriptionInfo) {
                let temp = subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed ? subscriptionInfo.SMSCreditsUsed : 0)
                setCreditsAvailable(temp)

                /**set purchase credits access**/
                let canAccess = (subscriptionInfo.AccessStatus === Enums.AccessStatus.Live || subscriptionInfo.AccessStatus === Enums.AccessStatus.Trial);
                // let smsRateInclVAT = subscriptionInfo.SMSRateExVAT * (1 + subscriptionInfo.VATPercentage / 100);
                let billingAccount = subscriptionInfo.BillingAccount;
                if (billingAccount && billingAccount.BillingProvider === Enums.BillingProvider.Custom) {
                    canAccess = true;
                }
                let canBuy = PS.hasPermission(Enums.PermissionName.Subscriptions) && canAccess && subscriptionInfo.SMSRateExVAT > 0
                setCanBuyCredits(canBuy)
            }
        }
    }, [creditsQuery.data])

    const messageTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'name',
                    CellType: 'link',
                    Sortable: true,
                    MetaData: JSON.stringify({
                        href: '/message/bulk/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                // {
                //     ColumnName: 'MessageSubject',
                //     Label: 'Subject',
                //     ID: 'messageSubject',
                //     Sortable: true,
                // },
                {
                    ColumnName: 'SendDateTime',
                    Label: 'Send Date',
                    ID: 'sendDateTime',
                    CellType: 'date',
                    Width: 200
                },
                {
                    ColumnName: 'MessageType',
                    Label: 'Type',
                    ID: 'messageType',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.MessageType,
                        // colourMappingValues: Enums.Status
                    }),
                    Width: 200
                },
                {
                    ColumnName: 'MessageStatus',
                    Label: 'Status',
                    ID: 'messageStatus',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.MessageStatus,
                        colourMappingValues: Enums.MessageStatusColor
                    }),
                    Width: 200
                },
                {
                    ColumnName: 'CreatedDate',
                    Label: 'Created',
                    ID: 'createdDate',
                    CellType: 'date',
                    Width: 200
                },
                {
                    ColumnName: 'CreatedBy',
                    Label: 'Created By',
                    ID: 'createdBy',
                    CellType: 'none',
                },
                {
                    ColumnName: 'ModifiedDate',
                    Label: 'Modified',
                    ID: 'modifiedDate',
                    CellType: 'date',
                    Width: 200
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: 'Modified By',
                    ID: 'modifiedBy',
                    CellType: 'none',
                }
            ],
            tableDataEndpoint: '/MessageQueueBulk/GetMessageQueueBulks',
            tableName: 'bulkmessages',
            tableNoun: 'Bulk Message',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'MessageStatusList',
                        hardcodedOptions: Object.entries(Enums.MessageStatus).filter(([l, v]) => [
                            Enums.MessageStatus.Draft,
                            Enums.MessageStatus.Queued,
                            Enums.MessageStatus.Delivered,
                            Enums.MessageStatus.Error,
                            Enums.MessageStatus.InProgress,
                            Enums.MessageStatus.Completed,
                            Enums.MessageStatus.Aborted
                        ].includes(v)).map(
                            ([l, v]) => ({
                                label: getEnumStringValue(Enums.MessageStatus, v, true) || '',
                                value: l,
                                color: getEnumStringValue(Enums.MessageStatusColor, v) || 'Grey'
                            })
                        ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Message Status',
                    },
                    // Uncomment when applicable
                    // {
                    //     filterName: 'MessageTypeList',
                    //     hardcodedOptions: Object.entries(Enums.MessageType).filter(([l, v]) => v !== Enums.MessageType.Both).map(
                    //         ([l, v]) => ({
                    //             label: getEnumStringValue(Enums.MessageType, v, true) || '',
                    //             value: l,
                    //         })
                    //     ).sort((a, b) => a.label < b.label ? -1 : 1),
                    //     label: 'Message Type',
                    // },
                    // {
                    //     filterName: 'IncludeDeactivated',
                    //     label: "Include Deactivated",
                    //     type: "switch"
                    // },
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    // {
                    //     type: 'hidden',
                    //     filterName: 'MessageTypeList',
                    //     label: "Message Type",
                    //     defaultValue: [Enums.getEnumStringValue(Enums.MessageType, Enums.MessageType.SMS)]
                    // }
                ],
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconExternalLink />,
                    label: 'View Item'
                },
                {
                    type: 'default',
                    name: 'preview',
                    icon: <IconEyeEdit />,
                    label: "Preview message"
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',

        }
    ), [])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    // const [exportBusyState, setExportBusyState] = useState(false)

    const [queryParams, setQueryParams] = useState({})

    // const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()



    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === "preview") {
            setShownPreviewItem(item)
        } else if (name === 'open') {
            router.replace(`/message/bulk/` + item.ID)
        } else if (name === 'retry') {

            if (creditsAvailable === 0) {
                showNotification({
                    id: 'outOfCredits',
                    // loading: false,
                    title: 'Out of Credits',
                    message: <Flex justify={'apart'}>
                        <Text>Please purchase credits to send more messages</Text>
                        <Link href={'/settings/subscription/manage?tab=sms'} onClick={() => Helper.nextLinkClicked('/settings/subscription/manage?tab=sms')}>
                            <Button onClick={() => hideNotification('outOfCredits')} color={'scBlue'} variant={'light'} rightSection={<IconMessage2Dollar size={14} />}>
                                Buy Credits
                            </Button>
                        </Link>
                    </Flex>,
                    autoClose: 3000,
                    color: 'yellow.6'
                })
            }
            // else {
            //     resendMessageMutation.mutate({ item, name })
            // }
        }
    }, [])


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [messageTableProps.tableName, 'tableData'] })
        queryClient.invalidateQueries({ queryKey: ['credits'] })
    }


    return (
        <>
            <ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={undefined}
            />

            <ScTable
                {...messageTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
            >
                <Flex align={'center'} gap={'sm'}>
                    <Text c={'dimmed'}>SMS Credits Available: {creditsAvailable}</Text>
                    <Tooltip events={{ hover: true, focus: true, touch: true }} disabled={canBuyCredits} label={'You do not have access to purchase more credits'} color={'scBlue'}>
                        <Link href={'/settings/subscription/manage?tab=sms'} onClick={() => Helper.nextLinkClicked('/settings/subscription/manage?tab=sms')}>
                            <Button disabled={!canBuyCredits} color={'scBlue'} variant={'light'} rightSection={<IconMessage2Dollar size={14} />}>
                                Buy Credits
                            </Button>
                        </Link>
                    </Tooltip>
                </Flex>

                <Link href={'/message/bulk/create'} onClick={() => Helper.nextLinkClicked('/message/bulk/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Bulk SMS
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default BulkMessagesTable