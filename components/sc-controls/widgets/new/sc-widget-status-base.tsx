import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import SCWidgetCard from './sc-widget-card';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetTitle from './sc-widget-title';
import Fetch from '@/utils/Fetch';
import { Button, Flex, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import helper from '@/utils/helper';
import { StatusWidgetResponse, StatusWidgetResponseLine } from './sc-widget-models';
import { useRouter } from 'next/router';
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import SubscriptionContext from '@/utils/subscription-context';
import * as Enums from '@/utils/enums';

const SCWidgetStatusBase: FC<{
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
    emptyState
}) => {

        const router = useRouter();
        const [data, setData] = useState<StatusWidgetResponse>();
        const subscriptionContext = useContext(SubscriptionContext);

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

            <SCWidgetCard onDismiss={onDismiss} height={widget.heightPX}>
                {!useEmptyState() && <Link legacyBehavior={true} href={listUrl ?? ""}>
                    <a onClick={() => helper.nextLinkClicked(listUrl)} style={{ textDecoration: "none" }}>
                        <SCWidgetTitle title={title} />
                    </a>
                </Link>
                }
                <div style={{ marginBottom: 24 }}>
                    {data && data.Statuses?.map((x, key) => {
                        return <Link key={key} legacyBehavior={true} href={statusUrl ? (statusUrl(x.StatusID) ?? "") : ""}>
                            <a className="status-link" onClick={() => statusUrl && helper.nextLinkClicked(statusUrl(x.StatusID))}>
                                <Flex direction={"row"} mb={8} justify={'space-between'} >
                                    <div style={{ fontSize: "0.875rem" }}>{x.Status}</div>
                                    <div style={{ fontSize: "0.875rem", fontWeight: "bold" }}>{x.Count}</div>
                                </Flex>
                            </a>
                        </Link>
                    })}
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
                            /*todo styles={t => ({
                                root: {
                                    '&:hover': {
                                        backgroundColor: t.fn.lighten(t.colors.scBlue[5], .8)
                                    }
                                }
                            })}*/
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

            <style jsx>{`
                
                a.status-link {
                    text-decoration: none;
                    color: black;
                }

                a.status-link:hover {
                    color: #868686;
                }

            `}</style>
        </>);
    };

export default SCWidgetStatusBase;