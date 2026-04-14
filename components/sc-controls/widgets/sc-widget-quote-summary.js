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

export default function SCWidgetQuoteSummary({ widget, accessStatus }) {

    const [quoteSummary, setQuoteSummary] = useState({ Created: 0, Accepted: 0, Invoiced: 0 });
    const [showEmptyCard, setShowEmptyCard] = useState(false);

    const getQuoteSummary = async () => {
        let summary = await Fetch.get({
            url: "/Dashboard/GetQuoteSummaryForWidget"
        });
        
        setQuoteSummary(summary);

        if (summary && summary.Draft == 0 && summary.Awaiting == 0 && summary.Accepted == 0 && summary.Invoiced == 0) {
            setShowEmptyCard(true);
        }
    };

    useEffect(() => {
        getQuoteSummary();
    }, []);

    const handleContainerClick = () => {
        if (showEmptyCard || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push, "/quote/list", "/quote/list");
    };

    const handleItemClick = (url) => {
        if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push, url, url)
    };

    return (<>
        <SCWidgetCard>
            <div className="summary-widget-container">
                <div className="flex pointer" onClick={handleContainerClick}>
                    <SCIcon folder={"sc-icons"} name={"quotes-dark"} />
                    <h2>Quotes</h2>
                </div>
                {!showEmptyCard ?
                    <ul>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick('/quote/list?tab=drafts')}>{quoteSummary.Draft} draft</li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick('/quote/list?tab=awaiting')}>{quoteSummary.Awaiting} awaiting</li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick('/quote/list?tab=accepted')}>{quoteSummary.Accepted} accepted</li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick('/quote/list?tab=invoiced')}>{quoteSummary.Invoiced} invoiced</li>
                    </ul> : ''
                }                            
            </div>
            <div className={`create-container ${showEmptyCard ? 'create-container-empty' : 'create-container-content'}`}>
                <Button text="New Quote" extraClasses="w7 margin-auto" onClick={() => {
                    Helper.mixpanelTrack(constants.mixPanelEvents.widgetQuoteSummaryCreateClicked);
                    Helper.nextRouter(Router.push, "/quote/create", "/quote/create");
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
                color: ${colors.orangeWidget};
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