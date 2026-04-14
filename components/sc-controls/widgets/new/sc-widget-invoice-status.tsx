
import {FC, useMemo, useState} from 'react';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetStatusBase from './sc-widget-status-base';
import * as Enums from "@/utils/enums";

const SCWidgetInvoiceStatus: FC<{
    widget: WidgetConfig
    onDismiss?: () => void
    storeID: string | null
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
                url='/Dashboard/InvoiceStatusWidget'
                requestParams={request}
                title="Invoices"
                addText='Add Invoice'
                addUrl='/invoice/create'
                listUrl='/invoice/list'
                statusUrl={(statusID) => {

                    let tab = "all";
                    switch (statusID) {
                        case Enums.InvoiceStatus.Draft:
                            tab = "drafts";
                            break;
                        case Enums.InvoiceStatus.Unpaid:
                            tab = "approved";
                            break;
                        case Enums.InvoiceStatus.Paid:
                            tab = "accepted";
                            break;
                    }

                    return `/invoice/list?tab=${tab}`;
                }}
                onDataRetrieved={(response => {
                    let idx = response.Statuses.findIndex(x => x.StatusID === Enums.InvoiceStatus.Unpaid);
                    if (idx > -1) {
                        response.Statuses[idx].Status = "Approved";
                    }
                })}
            />
        </>);
    };

export default SCWidgetInvoiceStatus;

