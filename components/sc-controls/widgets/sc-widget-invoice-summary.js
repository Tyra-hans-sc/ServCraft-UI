import { useEffect, useState } from "react";
import { colors } from "../../../theme";
import Fetch from "../../../utils/Fetch";
import SCWidgetCard from "../layout/sc-widget-card";
import SCIcon from "../misc/sc-icon";
import Router from 'next/router';
import Helper from "../../../utils/helper";
import * as Enums from '../../../utils/enums';
import Button from "../../button";
import constants from "../../../utils/constants";

export default function SCWidgetInvoiceSummary({ widget, accessStatus }) {

    const [invoiceSummary, setInvoiceSummary] = useState({ Created: 0, Unpaid: 0, Paid: 0 });
    const [showEmptyCard, setShowEmptyCard] = useState(false);

    const getInvoiceSummary = async () => {
        let summary = await Fetch.get({
            url: "/Dashboard/GetInvoiceSummaryForWidget"
        });

        setInvoiceSummary(summary);

        if (summary && summary.Draft == 0 && summary.Unpaid == 0 && summary.Paid == 0) {
            setShowEmptyCard(true);
        }
    };

    useEffect(() => {
        getInvoiceSummary();
    }, []);

    const handleContainerClick = () => {
        if (showEmptyCard || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push,"/invoice/list", "/invoice/list");
    };

    const handleItemClick = (url) => {
        if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push, url, url)
    };

    return (<>
        <SCWidgetCard>
            <div className="summary-widget-container">
                <div className="flex pointer" onClick={handleContainerClick}>
                    <SCIcon folder={"sc-icons"} name={"invoices-dark"} />
                    <h2>Invoices</h2>
                </div>
                {!showEmptyCard ?
                    <ul>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`}
                            onClick={() => handleItemClick('/invoice/list?tab=drafts')}>{invoiceSummary.Draft} draft</li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`}
                            onClick={() => handleItemClick('/invoice/list?tab=approved')}>{invoiceSummary.Unpaid} unpaid</li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`}
                            onClick={() => handleItemClick('/invoice/list?tab=paid')}>{invoiceSummary.Paid} marked as paid</li>
                    </ul> : ''
                }
            </div>
            <div className={`create-container ${showEmptyCard ? 'create-container-empty' : 'create-container-content'}`}>
                <Button text="New Invoice" extraClasses="w7 margin-auto" onClick={() => {
                    Helper.mixpanelTrack(constants.mixPanelEvents.widgetInvoiceSummaryCreateClicked);
                    Helper.nextRouter(Router.push, "/invoice/create", "/invoice/create");
                }} disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess} />
            </div>
        </SCWidgetCard>

        <style jsx>{`
            .summary-widget-container {
                min-width: 250px;
            }
            .flex {
                display: flex;
            }

            .flex h2 {
                margin-top: 0;
                margin-bottom: 1rem;
                margin-left: 1rem;
            }

            .summary-widget-container {
                padding: 1rem;
                position: relative;
            }

            .pointer {
                cursor: pointer;
            }

            ul {
                margin-top: 0;
                padding-left: 1rem;
                color: ${colors.greenWidget};
            }

            ul li {
                line-height: 2rem;
            }

            .create-container {
                position: absolute;
                font-size: 0.8rem;
            }

            .create-container-empty {
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                text-align: center;
                top: 45%;
            }

            .create-container-content {
                top: 1rem;
                right: 1rem;
            }

        `}</style>
    </>);
}