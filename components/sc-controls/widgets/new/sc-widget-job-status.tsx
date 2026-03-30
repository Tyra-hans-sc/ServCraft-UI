
import { FC, useState } from 'react';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetStatusBase from './sc-widget-status-base';
import * as Enums from "@/utils/enums";

const SCWidgetQuoteStatus: FC<{
    widget: WidgetConfig
    onDismiss?: () => void
}> = ({
    widget,
    onDismiss = undefined
}) => {

        const [request, setRequest] = useState<any>({
        });

        return (<>
            <SCWidgetStatusBase
                widget={widget}
                onDismiss={onDismiss}
                url='/Dashboard/JobStatusWidget'
                requestParams={request}
                title="Jobs"
                addText='Add Job'
                addUrl='/job/create'
                listUrl='/job/list'
                statusUrl={(statusID) => {
                    /*let tab = "all";
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
                    }*/
                    return `/job/list`;
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

