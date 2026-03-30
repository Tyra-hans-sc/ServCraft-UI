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
import { useQuery } from "@tanstack/react-query";
import featureService from "../../../services/feature/feature-service";

export default function SCWidgetJobSummary({ widget, accessStatus }) {

    const [jobSummary, setJobSummary] = useState({ Open: 0, ScheduledToday: 0 });
    const [showEmptyCard, setShowEmptyCard] = useState(false);

    const getJobSummary = async () => {
        let summary = await Fetch.get({
            url: "/Dashboard/GetJobSummaryForWidget"
        });
        setJobSummary(summary);

        if (summary && summary.Open == 0 && summary.ScheduledToday == 0) {
            setShowEmptyCard(true);
        }
    };

    useEffect(() => {
        getJobSummary();
    }, []);

    const handleContainerClick = () => {
        if (showEmptyCard || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push, "/job/list", "/job/list");
    };

    const handleItemClick = (url) => {
        if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) return;
        Helper.nextRouter(Router.push, url, url)
    };

    // const { data: kendoSchedulerFeature } = useQuery(['feature', 'SCHEDULER_KENDO'], () => featureService.getFeature(constants.features.SCHEDULER_KENDO));
    // const appointmentRoute = !kendoSchedulerFeature ? '/appointment/scheduler' : '/appointment';
    const appointmentRoute = '/appointment';

    return (<>
        <SCWidgetCard>
            <div className="summary-widget-container">
                <div className="flex pointer" onClick={handleContainerClick}>
                    <SCIcon folder={"sc-icons"} name={"jobs-dark"} />
                    <h2>Jobs</h2>
                </div>
                {!showEmptyCard ? 
                    <ul>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick('/job/list')}>{jobSummary.Open} open
                        </li>
                        <li className={`${accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess ? '' : 'pointer'}`} 
                            onClick={() => handleItemClick(appointmentRoute)}>{jobSummary.ScheduledToday} scheduled today
                        </li>
                    </ul> : ''
                }
            </div>
            <div className={`create-container ${showEmptyCard ? 'create-container-empty' : 'create-container-content'}`}>
                <Button text="New Job" extraClasses="margin-auto orange w7" onClick={() => {
                    Helper.mixpanelTrack(constants.mixPanelEvents.widgetJobSummaryCreateClicked, {
                        openJobs: jobSummary.Open,
                        closedJobs: jobSummary.Closed
                    });
                    Helper.nextRouter(Router.push, "/job/create", "/job/create");
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
                color: ${colors.blueWidget};
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