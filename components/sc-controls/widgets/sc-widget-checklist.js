import { colors } from "../../../theme";
import SCWidgetCard from "../layout/sc-widget-card";
import Router from 'next/router';
import Helper from '../../../utils/helper';
import { useEffect, useState } from "react";
import SCIcon from "../misc/sc-icon";
import Fetch from "../../../utils/Fetch";
import constants from "../../../utils/constants";

export default function SCWidgetChecklist({ widget }) {

    const [checklist, setChecklist] = useState([]);
    const [percentComplete, setPercentComplete] = useState(0);

    const getChecklist = async () => {
        const checklistItemsResponse = await Fetch.get({
            url: '/Dashboard/GetChecklistForWidget'
        });

        setChecklist(checklistItemsResponse.Results);
    };

    useEffect(() => {

        getChecklist();

    }, []);

    const getVisibleChecklist = () => {
        return checklist ? checklist.filter(x => x.Show).sort((a, b) => a.DisplayOrder - b.DisplayOrder) : [];
    }

    useEffect(() => {

        if (checklist && checklist.length > 0) {
            setPercentComplete(Math.round((getVisibleChecklist().filter(x => x.Complete).length / checklist.length) * 100));
        }

    }, [checklist]);

    const progressIcon = (complete, first, last) => {

        var color = complete ? colors.bluePrimaryLight : colors.borderGrey;

        return (<>
            <div className="icon">

                <svg height="16px" width="16px">
                    <circle cx="8px" cy="8px" r="8px" stroke={color} stroke-width="0" fill={color} />
                    {complete ? <path d="M4.57422 8.59195L6.74922 10.92086L11.09922 4.71045" stroke="white"
                        fill="transparent" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> : ""}
                </svg>

                {!last ? <div className="line-link">
                </div> : ""}

            </div>

            <style jsx>{`
        
            .icon {
                width: 16px;
                position: relative;
                height: 100%;
            }

            .line-link {
                position: absolute;
                top: 16px ;
                left: 7px;
                background-color: ${color};
                height: 100%;
                width: 2px;
            }
            
        `}</style>
        </>);
    };

    const checklistItem = (item, index, first, last) => (

        <>
            <tr key={index} onClick={() => actionChecklistItem(item)} className="item">
                <td className="item-icon">
                    {progressIcon(item.Complete, first, last)}
                </td>
                <td className="item-text">
                    <div className="item-label">
                        {item.Label}
                    </div>
                    <div className="item-desc">
                        {item.Description}
                    </div>
                </td>
                <td className="item-chevron">
                    <SCIcon name={"chevron-right"} height={"1rem"} />
                </td>
            </tr>

            <style jsx>{`  
                td {
                    padding: 0; 
                }

                .item {
                    cursor: pointer;
                }

                .item-chevron {
                    vertical-align: center;
                    width: 2rem;
                }

                .item-text {
                    padding-left: 0.5rem;
                    padding-right: 0.5rem;
                    width: 100%;
                    vertical-align: top;
                }
                .item-icon {
                    width: 2rem;
                    vertical-align: top;
                    padding: 0;
                    height: 2.875rem;
                }
       
                .completed-item-tickbox {
                    height: 25px;
                    width: 25px;
                    background-color: ${colors.green};
                    border-radius: 50%;
                    display: inline-block;
                }
                .checkmark {
                    display: inline-block;
                    transform: rotate(45deg);
                    height: 10px;
                    width: 4px;
                    margin-left: 35%;
                    margin-top: 20%;
                    border-bottom: 2px solid ${colors.white};
                    border-right: 2px solid ${colors.white};
                }
                .item-icon-circle {
                    height: 25px;
                    width: 25px;
                    background-color: ${colors.formGrey};
                    border-radius: 50%;
                    display: inline-block;
                }
                .item-label {
                    font-weight: bold;
                }
                .item-desc {
                    color: ${colors.labelGrey};
                    font-size: 0.7rem;
                }
            `}</style>
        </>
    );

    const mixpanelChecklist = (item) => {
        Helper.mixpanelTrack(constants.mixPanelEvents.checklist, {
            name: item.Name,
            label: item.Label,
            alreadyComplete: item.Complete
        })
    };

    const actionChecklistItem = (item) => {
        mixpanelChecklist(item);
        switch (item.Link) {
            case 'GetApp':
                window.open(`${item.Link}`, '_blank');
                break;
            default:
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
        }
    };

    return (<>

        <SCWidgetCard>
            <div className="container">

                <div className="header-container">
                    <div className="header">
                        Let's start with the basics
                    </div>
                    <div className="progress-percent">
                        {percentComplete}% progress
                    </div>
                </div>
                <p className="sub-header-message">
                    Use this step by step guide to set your company up so that you can create your first job with ease.
                </p>


                <div className="body-container">
                    <table cellSpacing={0}>
                        <tbody>
                            {checklist && getVisibleChecklist().map(function (item, index) {
                                return checklistItem(item, index, index === 0, index === checklist.length - 1)
                            })}
                        </tbody>
                    </table>
                </div>


            </div>
        </SCWidgetCard>

        <style jsx>{`
    .container {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        font-size: 0.8rem;
    }
    .header-container {

    }
    .seperator {
        border-bottom: 1px solid #E8EDF2;
        margin-bottom: 0.5rem;
    }
    .header-container {
        margin-bottom: 0.5rem;
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
    }
    .header {
        font-size: 1.2rem;
        color: ${colors.darkPrimary};
        font-weight: bold;
        display: flex;
        flex-direction: column;
    }
    .header-details {
        color: ${colors.blueGrey};
        margin-top: 0.5rem;
    }
    .sub-header-message {
        color: ${colors.labelGrey};
        margin-top: 0px;
    }
    .progress-line {
        margin-bottom: 0.5rem;
    }
    .progress-percent {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-end;
        font-size: 0.7rem;
    }
    .splitter {
        display: flex;
    }

    table, th, td {
      border: none;
    }
    table {
      border-collapse: collapse;
    }

`}</style>
    </>);
}