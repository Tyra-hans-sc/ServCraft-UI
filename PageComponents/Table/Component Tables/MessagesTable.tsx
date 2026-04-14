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
import { IconEyeEdit, IconMessage2Dollar } from "@tabler/icons-react";
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
import messageService from "@/services/message/message-service";

const resendMessages = async (messageIDList: string[]) => {
    return await Fetch.post({
        url: `/Message/Retry`,
        params: {
            messageIDList,
        }
    } as any)
}

const previewDataProps: ScDataPreviewProps[] = [
    {
        type: 'html',
        label: 'Message',
        key: 'MessageBody'

    }
]

const MessagesTable: FC = () => {
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
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Message, undefined),
            columnMappingModelName: 'MessageList',
            columMappingOverrideValues: {
                ItemDisplay: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        triggerAction: 'open'
                    } as ColumnMappingMetaData)
                },
                Module: {
                    Sortable: false,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                        // colourMappingValues: Enums.Status
                    })
                },
                MessageStatus: {
                    Sortable: false,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.MessageStatus,
                        colourMappingValues: Enums.MessageStatusColor
                    })
                },
                MessageType: {
                    Sortable: false,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.MessageType,
                        // colourMappingValues: Enums.Status
                    })
                },
                UserType: {
                    Sortable: false,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.UserType,
                        // colourMappingValues: Enums.Status
                    })
                }
            },
            tableDataEndpoint: '/Message/GetMessages',
            tableName: 'messages',
            tableNoun: 'Message',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'MessageStatusList',
                        hardcodedOptions: Object.entries(Enums.MessageStatus).filter(([l, v]) => [
                            Enums.MessageStatus.Queued,
                            Enums.MessageStatus.Delivered,
                            Enums.MessageStatus.Error,
                            Enums.MessageStatus.InProgress,
                            Enums.MessageStatus.Completed,
                            Enums.MessageStatus.OutOfCredits,
                        ].includes(v)).map(
                            ([l, v]) => ({
                                label: getEnumStringValue(Enums.MessageStatus, v, true) || '',
                                value: l,
                                color: getEnumStringValue(Enums.MessageStatusColor, v) || 'Grey'
                            })
                        ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Message Status',
                    },
                    {
                        filterName: 'MessageTypeList',
                        hardcodedOptions: Object.entries(Enums.MessageType).filter(([l, v]) => v !== Enums.MessageType.Both).map(
                            ([l, v]) => ({
                                label: getEnumStringValue(Enums.MessageType, v, true) || '',
                                value: l,
                            })
                        ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Message Type',
                    },
                    {
                        filterName: 'UserTypeList',
                        hardcodedOptions: Object.entries({
                            // None: Enums.UserType.None,
                            Employee: Enums.UserType.Employee,
                            // Supplier: Enums.UserType.Supplier,
                            Customer: Enums.UserType.Customer,
                            // System: Enums.UserType.System,
                        }).map(
                            ([l, v]) => ({
                                label: getEnumStringValue(Enums.UserType, v, true) || '',
                                value: l
                            })
                        ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'User Type',
                    },
                    {
                        filterName: 'ModuleList',
                        hardcodedOptions: Object.entries(Enums.Module)
                            .filter(([l, v]) => [
                                // Enums.Module.Asset,
                                // Enums.Module.Collection,
                                Enums.Module.Customer,
                                // Enums.Module.CustomerZone,
                                // Enums.Module.Employee,
                                // Enums.Module.FormDefinition,
                                // Enums.Module.FormHeader,
                                // Enums.Module.Integration,
                                Enums.Module.Invoice,
                                Enums.Module.JobCard,
                                // Enums.Module.MessageQueue,
                                // Enums.Module.Project,
                                Enums.Module.Query,
                                Enums.Module.Quote,
                                // Enums.Module.Service,
                                // Enums.Module.Store,
                                // Enums.Module.Supplier,
                                // Enums.Module.TaskItem,
                                // Enums.Module.Tenant,
                                // Enums.Module.WebQuery,
                            ].includes(v))
                            .map(
                                ([l, v]) => ({
                                    label: getEnumStringValue(Enums.Module, v, true) || '',
                                    value: l
                                })
                            ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Module',
                    },
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: "hidden",
                        label: "DisplayMessage",
                        filterName: "DisplayMessage",
                        defaultValue: false
                    }
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
                    type: 'warning',
                    name: 'retry',
                    icon: <IconSend />,
                    label: 'Retry Sending Message',
                    activeLabel: 'Sending Message',
                    conditionalShow: {
                        key: 'MessageStatus',
                        equals: Enums.MessageStatus.OutOfCredits
                    }
                },
                {
                    type: 'default',
                    name: 'preview',
                    icon: <IconEyeEdit />,
                    label: "Preview message"
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    // const [exportBusyState, setExportBusyState] = useState(false)

    const [queryParams, setQueryParams] = useState({})

    // const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const resendMessageMutation = useMutation(
        [messageTableProps.tableName, 'resendMessage'],
        ({ item }) => resendMessages([item.ID]),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'a' + name + item.ItemDisplay,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Resending ' + ` ${messageTableProps.tableNoun} ` + item.ItemDisplay}</Text>
                    </Group>,
                    autoClose: true,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'a' + name + item.ItemDisplay,
                    loading: false,
                    autoClose: true,
                    color: 'yellow.7',
                    message: 'Unable to send ' + item.ItemDisplay
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'a' + name + item.ItemDisplay,
                    loading: true,
                    autoClose: false,
                    color: 'scBlue',
                    message: 'Sending ' + item.ItemDisplay
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === "preview") {
            messageService.getMessage(item.ID).then(message => {
                setShownPreviewItem(message)
            })
        } else if (name === 'open') {
            if(Object.values(ModuleUrl).includes(item.Module)) {
                router.replace(`/${Enums.getEnumStringValue(ModuleUrl, item.Module)}/` + item.ItemID)
            } else {
                messageService.getMessage(item.ID).then(message => {
                    setShownPreviewItem(message)
                })
            }
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
            } else {
                resendMessageMutation.mutate({ item, name })
            }
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

            </ScTable>
        </>
    )
}


export default MessagesTable