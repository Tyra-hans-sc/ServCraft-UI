import {FC, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import SCWidgetCard from './sc-widget-card';
import {Box, ColorSwatch, Fieldset, ScrollArea} from '@mantine/core';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetTitle from './sc-widget-title';
import Fetch from '@/utils/Fetch';
import { Button, Flex, Text } from '@mantine/core';
import {IconNewsOff, IconPlus, IconUserOff} from '@tabler/icons-react';
import Link from 'next/link';
import helper from '@/utils/helper';
import { StatusWidgetResponse } from './sc-widget-models';
import { useRouter } from 'next/router';
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import SubscriptionContext from '@/utils/subscription-context';
import * as Enums from '@/utils/enums';
import styles from './widgetStyles.module.css';
import {useQuery} from "@tanstack/react-query";

const SCWidgetStatusGroupBase: FC<{
    group: {
        url: string
        groupNameKey: string
        groupIdKey: string
        itemIdKey: string
        itemDisplayColorKey?: string
    }
    widget: WidgetConfig
    onDismiss?: () => void
    url: string
    requestParams: any
    title: string
    addText?: string
    addUrl?: string
    listUrl: string
    statusUrl?: (statusID: any) => string
    onDataRetrieved: (response: StatusWidgetResponse) => void
    emptyState?: ReactNode
    storeID?: string | null
}> = ({
    widget,
    onDismiss = undefined,
    url,
    requestParams,
    title,
    addText,
    addUrl,
    listUrl,
    statusUrl,
    onDataRetrieved,
    emptyState,
    group,
    storeID
}) => {

        const router = useRouter();
        const [data, setData] = useState<StatusWidgetResponse>();
        const subscriptionContext = useContext(SubscriptionContext);

        const groupItemsQuery = useQuery(['queryStatus', storeID], () => Fetch.get({
            url: group.url,
            params: {StoreID: storeID}
        } as any), {
            // onSuccess: console.log,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        })

        const noStatusItem = useMemo(() =>data?.Statuses?.find(x => x.Status === 'NO STATUS') || null, [data])

    // console.log(noStatusItem)

        const groups = useMemo<{ [groupName: string]: any[] }>(() => (
            groupItemsQuery.data?.Results?.reduce((groups, item) => {
                const groupName = item[group.groupNameKey];
                const groupId = item[group.groupIdKey];
                const itemId = item[group.itemIdKey];
                const color = (item['DisplayColor'] ?? '').toLowerCase()
                const enabled = item['IsActive'] ?? true
                const groupItems = data?.Statuses?.filter(d => d.StatusID === itemId).map(x => ({
                    ...x,
                    color,
                    enabled,
                    groupId
                }));
                if (groupItems) {
                    if (!Array.isArray(groups[groupName])) {
                        groups[groupName] = []
                    }
                    groups[groupName].push(...groupItems);
                }
                return groups;
            }, {})
        ), [
            data, groupItemsQuery.data
        ])


        useEffect(() => {
            loadData();
        }, [requestParams])

        const loadData = async () => {
            const response: StatusWidgetResponse = await Fetch.get({
                url: url,
                params: requestParams
            } as any);

            if (response) {
                Array.isArray(response.Statuses) && onDataRetrieved && onDataRetrieved(response);
                setData(response);
            }
        };

        const useEmptyState = () => {
            return data && data.Statuses && data.Statuses.length === 0 && !!emptyState;
        }


        const sendMixPanelEvent = () => {
            // event.preventDefault()
            Helper.mixpanelTrack(constants.mixPanelEvents.widgetCreateItemClicked, {
                module: title,
                label: addText
            } as any)
        }

        const isLockedOut = () => {
            let accessStatus = (subscriptionContext as any)?.subscriptionInfo?.AccessStatus;
            return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
        }

        return (<>
            <SCWidgetCard onDismiss={onDismiss} height={widget.heightPX}
                          cardProps={{
                              px: 0
            }}>
                {!useEmptyState() && <Link legacyBehavior={true} href={listUrl ?? ""}>
                    <a onClick={() => helper.nextLinkClicked(listUrl)} style={{ textDecoration: "none", marginInline: 22 }}>
                        <SCWidgetTitle title={title} marginBottom={7} />
                    </a>
                </Link>
                }
                <div>
                    <ScrollArea.Autosize mah={widget.heightPX - 100} >
                        {
                            !!noStatusItem &&
                            <Link href={'/query/list?queryUnassigned=true&employeeID=none&typeID=none&statusID=none&store=none&archived=false&closed=false&employeeUnassigned=false'}
                                  style={{textDecoration: 'none'}}
                            >
                                <div className={styles.unassignedItem}>
                                    <Flex align={'center'} gap={3} className={styles.content}>
                                        <IconNewsOff size={17}/>
                                        <span>Draft</span>
                                    </Flex>
                                    <span className={styles.count}>{noStatusItem.Count}</span>
                                    {/*<div className={styles.line}/>*/}
                                </div>
                            </Link>
                        }
                        {Object.entries(groups || {}).filter(([groupName, groupItems]) => groupItems.length > 0).map(([groupName, groupItems], key) => {
                            return (
                                <Fieldset
                                    legend={<Link className={styles.legend} href={'/query/list?typeID=' + groupItems[0].groupId + '&employeeID=none&statusID=none&store=none&archived=false&closed=false&queryUnassigned=false&employeeUnassigned=false'} style={{textDecoration: 'none'}}>{groupName}</Link>}
                                    variant={'default'}
                                    key={`group-${key}`}
                                    mb={5} p={'xs'}
                                    pt={5}
                                    mx={10}
                                    styles={{
                                        // legend: {color: 'var(--mantine-colors-gray-1)'}
                                    }}
                                    classNames={{
                                        // legend: styles.statusLink,
                                        root: styles.groupRoot
                                    }}
                                >
                                    {groupItems.map((item: any, index: number) => (
                                        <Link className={styles.statusLink} key={`status-link-${index}`}
                                              href={
                                                    statusUrl ? (statusUrl(item.StatusID) +
                                                        '&typeID=' + item.groupId) +
                                                        '&employeeID=none' +
                                                        '&store=none' +
                                                        '&archived=false' +
                                                        '&closed=false' +
                                                        '&queryUnassigned=false' +
                                                        '&employeeUnassigned=false'
                                                        : ""
                                              }
                                        >
                                            <Flex align="center" gap={5} mb={index !== groupItems.length - 1 ? 5 : 0} >
                                                {
                                                        /*!!item.color &&*/
                                                        <ColorSwatch className={styles.colourItem} color={item.color || 'white'} size={12} mr={3}/>
                                                }
                                                {/*{item.useInitials}*/}
                                                <Text size={'sm'} truncate={'end'} c={!item.enabled ? 'dimmed' : ''}
                                                    // miw={'max-content'}
                                                >
                                                    {item.Status} {!(item.enabled) && '(disabled)'}
                                                </Text>
                                                <Text size={'sm'} ml={'auto'} fw={'bold'}>{item.Count}</Text>
                                            </Flex>
                                            {/*<span className={styles.statusLink} onClick={() => statusUrl && helper.nextLinkClicked(statusUrl(item.StatusID))}>
                                                <Flex direction={"row"} justify={'space-between'} mb={index !== groupItems.length - 1 ? 5 : 0}>
                                                    <div style={{ fontSize: "0.875rem" }}>{item.Status}</div>
                                                    <div style={{ fontSize: "0.875rem", fontWeight: "bold" }}>{item.Count}</div>
                                                </Flex>
                                            </span>*/}
                                        </Link>
                                    ))}
                                </Fieldset>
                            );
                        })}
                    </ScrollArea.Autosize>

                    {useEmptyState() &&
                        <div style={{ textAlign: "left" }}>
                            {emptyState}
                        </div>}
                </div>
                {addText && !isLockedOut() && <Link href={addUrl ?? ""} legacyBehavior={true} >
                    <a style={{ textDecoration: "none" }} onClick={() => {
                        helper.nextLinkClicked(addUrl)
                        sendMixPanelEvent()
                    }}>
                        <Button
                            pos={"absolute"}
                            right={12}
                            bottom={12}
                            rightSection={<IconPlus size={15} />}
                            size={'xs'}
                            variant={'subtle'}
                            color={'scBlue'}
                        >
                            {addText}
                        </Button>
                    </a>
                </Link>}

            </SCWidgetCard>
        </>);
    };

export default SCWidgetStatusGroupBase;