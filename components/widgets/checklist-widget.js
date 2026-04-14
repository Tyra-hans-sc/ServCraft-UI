import React, { useState, useEffect, useRef, useMemo } from 'react';
import Router from 'next/router';
import Fetch from '../../utils/Fetch';
import time from '../../utils/time';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Helper from '../../utils/helper';
import { Line, Circle } from 'rc-progress';
import constants from '../../utils/constants';

function CheckListWidget({checklist, checklistHeader}) {

    const [percentComplete, setPercentComplete] = useState(0);

    const raisedColor = colors.blueGrey;

    const [raisedIndex, setRaisedIndex] = useState(-1);

    useEffect(() => {
        setPercentComplete(Math.round((checklist.filter(x => x.Complete).length / checklist.length) * 100));
        if (checklist.length > 0) {
            setRaisedIndex(checklist.findIndex(x => !x.Complete));
        }
    }, [checklist]);

    const checklistItem = (item, index) => (        
        <div key={index} className="container">
            { item.Complete ? 
                <div className="item completed" onClick={() => actionChecklistItem(item)}>
                    <div className="item-text">
                        <div className="item-label">
                            {item.Label}
                        </div>
                        <div className="item-desc">
                            {item.Description}
                        </div>
                    </div>                    
                    <div className="item-icon">
                        <div className="completed-item-tickbox">
                            <div className="checkmark"></div>
                        </div>
                    </div>                    
                </div>
                :
                <div className={`item`} onClick={() => actionChecklistItem(item)}>
                    <div className="item-text">         
                        <div className="item-label">
                            {item.Label}
                        </div>
                        <div className="item-desc">
                            {item.Description}
                        </div>
                    </div>
                    <div className="item-icon">
                        <div className="item-icon-circle"></div>
                    </div>
                </div>
            }

            <style jsx>{`  
                .container {
                    display: flex;
                    flex-direction: row;
                }                 
                .item {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    margin: 0.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid ${colors.borderGrey};
                    width: 100%;
                    cursor: pointer;
                }

                .raised {
                    padding: 10px;
                    position: relative;
                    box-shadow: 0 2px 4px ${raisedColor};                    
                }
                .raised:hover {
                    
                }

                .item-text {
                    display: flex;
                    flex-direction: column;   
                    margin-right: 0.5rem;                 
                }
                .item-icon {
                    display: flex;
                    flex-direction: column-reverse;
                    float: right;
                }
                .completed {
                    
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
                    
                }
                .item-desc {
                    opacity: 0.75;
                    font-size: 0.875rem;
                }
            `}</style>
        </div>
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
        switch (item.Name) {
            case 'CompanySettings':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;          
            case 'AddYourTeam':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
            case 'Import':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
            case 'GetApp':
                window.open(`${item.Link}`, '_blank');
                break;
            case 'CreateJob':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
            case 'CreateQuote':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
            case 'CreateSchedule':
                Helper.nextRouter(Router.push, `${item.Link}`);
                break;
        }
    };

    return (
        <div className="container">

            <div className="header-container">
                <div className="header">
                    Getting Started
                </div>
                <div className="progress-percent">
                    {percentComplete}% Completed
                </div>
            </div>            

            <div className="header-details">
                {checklistHeader}
            </div>           

            <div className="progress-line">
                <Line percent={percentComplete} strokeWidth="1" strokeColor={`${colors.green}`} trailColor={`${colors.formGrey}`} />
            </div>

            <div className="body-container">
                {checklist && checklist.map(function (item, index) {                    
                    return checklistItem(item, index)
                })}
            </div>

            <style jsx>{`
                .container {
                    background-color: ${colors.white};
                    border-radius: ${layout.cardRadius};
                    box-shadow: ${shadows.card};
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    padding: 1rem;
                    width: 100%;
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
                    font-size: 16px;
                    color: ${colors.darkPrimary};
                    font-weight: bold;
                    display: flex;
                    flex-direction: column;
                }
                .header-details {
                    color: ${colors.blueGrey};
                    margin-top: 0.5rem;
                }
                .progress-line {
                    margin-bottom: 0.5rem;
                }
                .progress-percent {
                    color: ${colors.green};
                    font-weight: bold;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: flex-end;
                    
                }
                .splitter {
                    display: flex;
                }
            `}</style>
        </div>
    )
}

export default CheckListWidget;
