import { useState, useEffect, useContext } from 'react';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import constants from '../../utils/constants';
import { colors, layout, shadows } from '../../theme';
import Checkbox from '../checkbox';
import HelpDialog from '../help-dialog';
import helper from '../../utils/helper';

const AvailableTriggers = ({ moduleStatus, moduleType, module, triggerListChanged }) => {

    const [triggers, setTriggers] = useState([]);
    const [filteredTriggers, setFilteredTriggers] = useState([]);
    const [usedTriggers, setUsedTriggers] = useState([]);

    useEffect(() => {
        if (triggers.length === 0) return;

        getFilteredTriggers();
    }, [moduleStatus, moduleType]);

    const getTriggers = async () => {

        const triggersRequest = await Fetch.get({
            url: '/Trigger/GetTriggerByModule',
            params: {
                module: module
            },
        });

        setTriggers(triggersRequest.Results);
    };

    const getFilteredTriggers = () => {
        let _filteredTriggers = [...triggers];

        if (module === Enums.Module.JobCard) {
            _filteredTriggers = _filteredTriggers.filter(trigger => {
                if (trigger.TriggerConditions.length > 0) {
                    let condition = trigger.TriggerConditions[0];
                    let rule = trigger.TriggerConditions[0].TriggerRule;
                    if (!rule) return false;
                    let meta = JSON.parse(condition.MetaData);
                    let actions = trigger.TriggerActions;
                    let hasComms = actions && actions.filter(action => action.TriggerActionType === Enums.TriggerActionType.Communication).length > 0;

                    if (meta) {
                        if (!Array.isArray(meta.JobStatusIDs)) {
                            meta.JobStatusIDs = [];
                        }
                        if (meta.JobStatusIDs.length === 0 && !!meta.JobStatusID) {
                            meta.JobStatusIDs.push(meta.JobStatusID);
                        }

                        if (!Array.isArray(meta.JobTypeIDs)) {
                            meta.JobTypeIDs = [];
                        }
                        if (meta.JobTypeIDs.length === 0 && !!meta.JobTypeID && meta.JobTypeID !== helper.emptyGuid()) {
                            meta.JobTypeIDs.push(meta.JobTypeID);
                        }
                    }

                    let canShowJobStatus =
                        rule.Name === constants.appStrings.TriggerRuleJobStatusChange &&
                        meta.JobStatusIDs.includes(moduleStatus.ID) &&
                        (meta.JobTypeIDs.length === 0 || (moduleType && meta.JobTypeIDs.includes(moduleType.ID)));

                    return canShowJobStatus && hasComms;
                } else {
                    return false;
                }
            });
        }

        setFilteredTriggers(_filteredTriggers);
    };

    useEffect(() => {

        let currentUsedTriggers = [...usedTriggers];

        // add to used list if new
        filteredTriggers.map(trigger => {
            let usedTrigger = currentUsedTriggers.find(used => used.triggerID === trigger.ID);
            if (!usedTrigger) {
                currentUsedTriggers.push({ triggerID: trigger.ID, isUsed: true });
            }
        });

        // check if filteredTriggers doesn't have some used triggers any more
        let currentUsedIDs = currentUsedTriggers.map(used => used.triggerID);
        let unusedFilterTriggers = filteredTriggers.filter(trigger => currentUsedIDs.indexOf(trigger.ID) === -1);
        unusedFilterTriggers.map(trigger => {
            let idx = currentUsedTriggers.indexOf(currentUsedTriggers.find(used => used.triggerID == trigger.ID));
            currentUsedTriggers.splice(idx, 1);
        });

        setUsedTriggers(currentUsedTriggers);

    }, [filteredTriggers]);



    useEffect(() => {

        getFilteredTriggers();

    }, [triggers]);

    useEffect(() => {
        getTriggers();
    }, []);

    useEffect(() => {
        if (triggerListChanged) {
            triggerListChanged(usedTriggers);
        }
    }, [usedTriggers]);

    const toggleUsedTrigger = (trigger) => {

        let currentUsedTriggers = [...usedTriggers];
        let usedTrigger = currentUsedTriggers.find(x => x.triggerID === trigger.ID);
        usedTrigger.isUsed = !usedTrigger.isUsed;

        setUsedTriggers(currentUsedTriggers);

    };


    return (<>

        {filteredTriggers && filteredTriggers.length > 0 ?
            <div className="card">
                <h3>{Enums.getEnumStringValue(Enums.Module, module, true)} communication</h3>

                {filteredTriggers.map((trigger, index) => {
                    let usedTrigger = usedTriggers.find(x => x.triggerID === trigger.ID);
                    let isUsed = usedTrigger && usedTrigger.isUsed;

                    return (<div className="trigger-item" key={index}>
                        <Checkbox label={trigger.Name} checked={isUsed} changeHandler={() => { toggleUsedTrigger(trigger) }} />
                        <HelpDialog position="top" message={`Optionally skip automated communication for this status change.`} width={175} extraClasses="custom-margin" />
                    </div>);
                })}
            </div>
            : ""}
        <style jsx>{`

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 1rem;
            position: relative;
            width: 100%;
        }

        .card h3 {
            margin-top: 0px;
        }

        .card .trigger-item {
            display: flex;
            margin-bottom: 8px;
        }
    
    `}</style>
    </>);


};

export default AvailableTriggers;