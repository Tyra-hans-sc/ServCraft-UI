import { useEffect, useState } from "react";
import { colors } from "../../../theme";
import SCWidgetCard from "../layout/sc-widget-card";
import SCIcon from "../misc/sc-icon";
import Router from 'next/router';
import Helper from "../../../utils/helper";
import * as Enums from '../../../utils/enums';
import Button from "../../button";
import constants from "../../../utils/constants";
import PS from "../../../services/permission/permission-service";
import {Badge, List, Text, Title} from "@mantine/core";
import NewBadge from "../../NewBadge";

export default function SCWidgetWhatsNew({ widget, accessStatus }) {

    const whatsNew = {
        title: "What's New - Payments",
        lines: [
            'The Jobs List gets a modern makeover for 2024.',
            'Frequently used functions are now grouped together for easy access.',
            'All filters instantly visible on the display, making job searches quick.',
            'Search criteria returns results faster.',
            'Job previews are relocated to maintain better visibility on the main page.',
        ],
        button: {
            text: "Try It",
            location: "/job/list",
            mixpanel: {
                event: constants.mixPanelEvents.widgetWhatsNewClicked,
                parameters: {
                    page: "/job/list",
                    function: "materials"
                }
            }
        },
        permissions: [
            Enums.PermissionName.MasterOfficeAdmin
        ]
    };

    const [quotePermission] = useState(PS.hasPermission(Enums.PermissionName.Quote));
    const [invoicePermission] = useState(PS.hasPermission(Enums.PermissionName.Invoice));


    if (!whatsNew || (Array.isArray(whatsNew.permissions) && whatsNew.permissions.length > 0 && !PS.hasPermission(whatsNew.permissions))) return <></>;

    return (<>
        <SCWidgetCard>
            <div className="summary-widget-container">
                <div style={{display: 'flex'}}>
                    <Title order={3} style={{flexGrow: 1}} mb={'var(--mantine-spacing-md)'}>What&apos;s New</Title>
                    <span style={{float: 'right', marginLeft: '10px'}}>
                        <NewBadge />
                    </span>
                </div>
                <Title order={5} fw={'bolder'} mb={'var(--mantine-spacing-md)'}>
                    🌟 New and Improved!
                </Title>
                <Text size={'sm'}  mb={'var(--mantine-spacing-sm)'}>
                    Exciting news - we&apos;ve given all your lists a fresh makeover!
                </Text>
                <Text size={'sm'}  mb={'var(--mantine-spacing-sm)'}>
                    Faster searches, real-time results, and your favorite functions are now even closer together.
                </Text>
                <Text size={'sm'}  mb={'var(--mantine-spacing-sm)'}>
                    Navigating between screens and tasks just got a whole lot snappier! 🚀
                </Text>
                {/*<List size={'sm'}
                      mb={5}
                      // style={(t) => ({color: t.colors.scBlue[9]})}
                >
                    {whatsNew.lines.map((item, key) => (
                        <List.Item key={key}>{item}</List.Item>
                    ))}
                </List>*/}
                {/*<Text size={'sm'} align={'justify'} mb={'var(--mantine-spacing-sm)'}>If you have any questions or feedback, feel free to reach out!</Text>*/}

            </div>
            {/*<div className={`button-container`}>
                {
                    (invoicePermission || quotePermission) &&
                    <Button text={whatsNew.button.text} extraClasses="margin-auto hollow w7" onClick={() => {
                        Helper.mixpanelTrack(whatsNew.button.mixpanel.event, whatsNew.button.mixpanel.parameters);
                        Helper.nextRouter(Router.push, whatsNew.button.location, whatsNew.button.location);
                    }} disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess} />
                }
            </div>*/}
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

            /*ul {
                margin-top: 0;
                padding-left: 1rem;
                //color: #535bd1;
            }*/

            /*ul li + li {
                !* line-height: 2rem; *!
                margin-top: 0.8rem;
            }*/

            .button-container {
                font-size: 0.8rem;
                margin: -12px 0px 12px 0px;
            }

            .new-icon {
                border: 3px solid black;
                border-radius: 4px;
                padding: 2px;
                height: fit-content;
                font-size: 0.8rem;
                font-weight: bold;
                color: black;
            }

        `}</style>
    </>);
}
