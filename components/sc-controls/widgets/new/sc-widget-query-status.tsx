import { FC, useMemo, useState } from 'react';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import { QueryStatusWidgetRequest } from './sc-widget-models';
import Link from 'next/link';
import helper from '@/utils/helper';
import SCWidgetStatusGroupBase from "@/components/sc-controls/widgets/new/sc-widget-status-base-V2-Group";

const SCWidgetQueryStatus: FC<{
    widget: WidgetConfig
    onDismiss?: () => void,
    storeID?: string | undefined
}> = ({
    widget,
    onDismiss = undefined,
    storeID = null
}) => {

        /*const [request, setRequest] = useState<QueryStatusWidgetRequest>({
            // MaxRows: 5
        });*/

        const request = useMemo(() => ({StoreID: storeID}), [storeID])

        const listUrl = '/query/list';

        return (<>
            <SCWidgetStatusGroupBase
                storeID={storeID}
                group={{
                    url: '/QueryStatus?includeDisabled=true&QueryTypeID=null',
                    groupNameKey: 'QueryTypeDescription',
                    groupIdKey: 'QueryTypeID',
                    itemIdKey: 'ID'
                }}
                widget={widget}
                onDismiss={onDismiss}
                url='/Dashboard/QueryStatusWidget'
                requestParams={request}
                title="Open Queries"
                addText='Add Query'
                addUrl='/query/create'
                listUrl={listUrl}
                statusUrl={(statusID) => {
                    return `/query/list?statusID=${statusID}`;
                }}
                onDataRetrieved={(response => {
                })}
                emptyState={<div style={{ width: "100%", textAlign: "center" }}>
                    <Link legacyBehavior={true} href={listUrl} >
                        <a onClick={() => helper.nextLinkClicked(listUrl)} style={{ textDecoration: "none" }}>
                            <div style={{
                                fontFamily: "'Proxima Nova',sans-serif",
                                color: "black",
                                fontSize: "1.125rem",
                                lineHeight: "1.55",
                                textDecoration: "none",
                                fontWeight: "bolder",
                                marginBottom: "1rem"
                            }}>No Queries Yet</div>
                        </a>
                    </Link>
                    <div style={{ color: "#868686" }}>Never miss a lead by capturing leads straight to ServCraft before they are jobs.</div>
                </div>}
            />
        </>);
    };

export default SCWidgetQueryStatus;
