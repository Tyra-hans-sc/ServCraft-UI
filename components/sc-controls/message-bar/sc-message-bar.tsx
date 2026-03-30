import React, { useContext, useEffect, useState, useRef } from 'react';
import Router from 'next/router';
import { colors, layout, shadows } from '../../../theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Button from '../../button';
import SCModal from '../layout/sc-modal';

function SCMessageBar({ messageBarType, message, isActive = false, maintenanceSchedule, dismissMaintenanceSchedule }) {

    const [text, setText] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');

    const [showAllMessages, setShowAllMessages] = useState(false);

    const decodeMessage = (message) => {
        if (message) {
            let startIndex = message.indexOf("[");
            if (startIndex >= 0) {
                let endIndex = message.indexOf("]");
                if (endIndex >= 0) {
                    let buttonContents = message.substring(startIndex + 1, endIndex);

                    let separatorIndex = buttonContents.indexOf(":");
                    if (separatorIndex >= 0) {
                        let link = buttonContents.substring(0, separatorIndex);
                        let buttonText = buttonContents.substring(separatorIndex + 1, buttonContents.length);

                        if (link && buttonText) {
                            if (link.toLowerCase() == "subscription") {
                                setButtonUrl('/settings/subscription/manage');
                            }
                            else if (link.toLowerCase() == "document") {
                                setButtonUrl('/settings/document/manage');
                            }
                            setButtonText(buttonText);
                            setShowButton(true);
                        }
                    }

                    setText(message.substring(0, startIndex));
                }
            } else {
                setText(message);
            }
        }
    };

    useEffect(() => {
        decodeMessage(message);
    }, [message]);

    // useEffect(() => {
    //     if (maintenanceSchedule && maintenanceSchedule.showMaintenanceWarning && maintenanceSchedule.maintenanceWarning) {

    //     } else {
    //         decodeMessage(message);
    //     }
    // }, [maintenanceSchedule]);

    const buttonClick = () => {
        Helper.nextRouter(Router.push, buttonUrl);
    };

    const onLoginPage = () => {
        return typeof window !== "undefined" && window.location.pathname === "/login";
    }

    const onWebform = () => {
        return typeof window !== "undefined" && window.location.pathname.indexOf("/webform") === 0;
    }

    if (typeof window === "undefined") return <></>

    return (
        <>
            {!onWebform() && maintenanceSchedule && maintenanceSchedule.showMaintenanceWarning && maintenanceSchedule.maintenanceWarning ? <div className="message-bar-container">
                <div className="content">
                    <div className="text-content">
                        {isActive ? <span className="one-of-two" onClick={() => setShowAllMessages(true)}>1 / 2</span> : ""}
                        <span>{maintenanceSchedule.maintenanceWarning}</span>
                        <div className="button-content">
                            <Button text={"Dismiss"} extraClasses={`warning-action no-margin fit-content`}
                                onClick={dismissMaintenanceSchedule} />
                        </div>
                    </div>

                </div>
            </div> : !onWebform() && isActive ?
                <div className="message-bar-container">
                    <div className="content">
                        <div className="text-content">
                            <span>{text}</span>
                            {showButton ?
                                <div className="button-content">
                                    <Button text={buttonText} extraClasses={`${messageBarType == Enums.MessageBarType.Warning ? `warning-action` : `error-action`} no-margin fit-content`}
                                        onClick={() => buttonClick()} />
                                </div> : ''
                            }
                        </div>

                    </div>
                </div> : ''}

            {showAllMessages ? <SCModal title={"Your Messages"} onDismiss={() => setShowAllMessages(false)}>

                <table>
                    <tbody>
                        {!onWebform() && maintenanceSchedule && maintenanceSchedule.showMaintenanceWarning && maintenanceSchedule.maintenanceWarning ? <tr >
                            <td className="w-100-percent">{maintenanceSchedule.maintenanceWarning}</td>
                            <td>
                                <Button text={"Dismiss"} extraClasses={`warning-action no-margin fit-content`}
                                    onClick={() => {
                                        setShowAllMessages(false);
                                        dismissMaintenanceSchedule();
                                    }} />
                            </td>
                        </tr> : ""}
                        {!onWebform() && isActive ? <tr>
                            <td className="w-100-percent">{text}</td>
                            {showButton ?
                                <td>
                                    <Button text={buttonText} extraClasses={`${messageBarType == Enums.MessageBarType.Warning ? `warning-action` : `error-action`} no-margin fit-content`}
                                        onClick={() => {
                                            setShowAllMessages(false);
                                            buttonClick();
                                        }} />
                                </td> : ''
                            }
                        </tr> : ''}
                    </tbody>
                </table>



            </SCModal> : ""}

            <style jsx>{`

                .one-of-two {
                    position: absolute;
                    left: 1rem;
                    cursor: pointer;
                    background: #ffffff88;
                    border-radius: ${layout.buttonRadius};
                    padding: 0.25rem;
                    box-shadow: ${shadows.cardSmall};
                    font-weight: bold;
                }

                .w-100-percent {
                    width: 100%;
                    padding: 0.5rem 0.5rem 0.5rem 0;
                }

                .message-bar-container {
                    position: fixed;
                    height: 48px;
                    width: 100%;
                    background-color: ${messageBarType == Enums.MessageBarType.Warning || maintenanceSchedule && maintenanceSchedule.showMaintenanceWarning && maintenanceSchedule.maintenanceWarning
                    ? `${colors.alertOrangeLightOpaque}`
                    : `${Helper.hexToRgba(colors.warningRedLight, 0.4)}`};
                    z-index: ${onLoginPage() ? 100000 : 103};
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: row;
                }
                .content {
                    display: flex;
                    position: relative;
                    flex-direction: column;
                    justify-content: center;
                    vertical-align: middle;
                    text-align: center;
                    width: 100%;
                    color: ${messageBarType == Enums.MessageBarType.Warning || maintenanceSchedule && maintenanceSchedule.showMaintenanceWarning && maintenanceSchedule.maintenanceWarning ? `${colors.alertOrange}` : `${colors.warningRed}`};
                }
                .text-content {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .button-content {
                    display: flex;
                    margin-left: 1rem;
                }
                a {
                    text-decoration: underline;
                }

                
            `}</style>
        </>
    )
}

export default SCMessageBar;
