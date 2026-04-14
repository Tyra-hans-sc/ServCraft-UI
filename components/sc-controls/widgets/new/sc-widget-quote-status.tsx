
import { FC, useMemo, useState } from 'react';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetStatusBase from './sc-widget-status-base';
import * as Enums from "@/utils/enums";

const SCWidgetQuoteStatus: FC<{
    widget: WidgetConfig
    onDismiss?: () => void
    storeID?: string
}> = ({
    widget,
    onDismiss = undefined,
    storeID = null
}) => {

        const request = useMemo<any>(() => ({
            storeID
        }), [storeID]);

        return (<>
            <SCWidgetStatusBase
                widget={widget}
                onDismiss={onDismiss}
                url='/Dashboard/QuoteStatusWidget'
                requestParams={request}
                title="Quotes"
                addText='Add Quote'
                addUrl='/quote/create'
                listUrl='/quote/list'
                statusUrl={(statusID) => {
                    let tab = "all";
                    switch (statusID) {
                        case Enums.QuoteStatus.Draft:
                            tab = "drafts";
                            break;
                        case Enums.QuoteStatus.Accepted:
                            tab = "accepted";
                            break;
                        case Enums.QuoteStatus.Approved:
                            tab = "approved";
                            break;
                        case Enums.QuoteStatus.Declined:
                            tab = "declined";
                            break;
                        case Enums.QuoteStatus.Invoiced:
                            tab = "invoiced";
                            break;
                    }

                    return `/quote/list?tab=${tab}`;
                }}
                onDataRetrieved={(response => {
                    let idx = response.Statuses.findIndex(x => x.StatusID === Enums.QuoteStatus.Approved);
                    if (idx > -1) {
                        response.Statuses[idx].Status = "Awaiting Acceptance";
                    }
                })}
            />
        </>);
    };

export default SCWidgetQuoteStatus;

