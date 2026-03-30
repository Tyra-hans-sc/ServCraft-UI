import React, { useEffect, useState } from 'react';
import { colors, layout } from '../../../theme';
import Button from '../../button';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import EditTrigger from './edit-trigger';
import ConfirmAction from '../confirm-action';
import Helper from '../../../utils/helper';
import Constants from '../../../utils/constants';
import SCModal from "../../../PageComponents/Modal/SCModal";
import {Box, Flex, Loader} from "@mantine/core";

const TriggerList = ({ setTriggerListVisible, module, conditionSetting1, conditionSetting2, defaultTriggerName, defaultRuleName, readonlyConditions }) => {

  const [triggers, setTriggers] = useState(null);
  const [editTriggerVisible, setEditTriggerVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [fetching, setFetching] = useState(false);

  const getTriggers = async () => {

    setFetching(true);

    let triggerResult = await Fetch.get({
      url: '/Trigger/GetTriggerByModule',
      params: {
        module: module
      }
    });

    let results = triggerResult.Results;
    setEditingTrigger(null);

    setFetching(false);

    if (conditionSetting1) {
      results = results.filter(x => {
        let hasCondition = x.TriggerConditions.filter(y => {
          let meta = JSON.parse(y.MetaData);
          if (meta) {
            if (defaultRuleName === Constants.appStrings.TriggerRuleJobStatusChange) {
              return (Array.isArray(meta.JobStatusIDs) && meta.JobStatusIDs.includes(conditionSetting1)) || meta.JobStatusID === conditionSetting1;
            } else if (defaultRuleName === Constants.appStrings.TriggerRuleQuoteStatusChange) {
              return meta.QuoteStatus === conditionSetting1;
            } else if (defaultRuleName === Constants.appStrings.TriggerRuleJobSLATimeElapsed) {
              return meta.JobTypeID === conditionSetting1;
            }
          }
          return false;
        }).length > 0;
        return hasCondition;
      });
    }

    // if (conditionSetting2) {
    //   results = results.filter(x => {
    //     let hasCondition = x.TriggerConditions.filter(y => y.Setting2 == conditionSetting2).length > 0;
    //     return hasCondition;
    //   });
    // }

    setTriggers(results);
  };

  useEffect(() => {
    getTriggers();
  }, []);

  const addTrigger = async () => {
    setEditTriggerVisible(true);
  };

  const triggerSaved = async (triggerId) => {
    getTriggers();
  };

  const deleteTrigger = async (triggerToDelete) => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      display: true,
      confirmButtonText: "Delete",
      heading: "Confirm delete trigger?",
      text: "This trigger will be deleted.",
      onConfirm: async () => {
        let myTrigger = {...triggerToDelete};
        myTrigger.IsActive = false;

        let triggerResult = await Fetch.put({
          url: "/Trigger",
          params: {
            Trigger: myTrigger
          }
        });

        if (triggerResult.ID) {
          await getTriggers();
        } else {
          toast.setToast({
            message: 'Could not delete the trigger',
            show: true,
            type: Enums.ToastType.error
          });
        }
      }
    });
  };

  const editTrigger = async (triggerToEdit) => {
    setEditingTrigger(triggerToEdit);
    setEditTriggerVisible(true);
  };

  return (
      <Box>

        <SCModal
            open
            onClose={() => setTriggerListVisible(false)}
            size={'auto'}
            withCloseButton={true}
            p={0}
            modalProps={{
              closeOnClickOutside: false,
            }}
        >
          <Box miw={{base: 'auto', md: '38rem'}} px={'lg'} pt={'xs'}>
            <div className="title">
              Triggers
            </div>

            <div className="">
              {
                triggers === null ? (
                        fetching ? <Flex align={'center'} justify={'center'}  h={'120px'}>
                          <Loader size={40} />
                        </Flex> : "Error loading triggers"
                    ) :
                    triggers.length === 0 ? <>
                          You have no triggers!
                        </> :
                        <>
                          <div className="table-container">
                            <table className="table">
                              <thead>
                              <tr>
                                <th>
                                  Name
                                </th>
                                <th>
                                  Rule
                                </th>
                                <th></th>
                              </tr>
                              </thead>
                              <tbody>
                              {triggers.map((trigger, index) => {
                                return (
                                    <tr key={index}>
                                      <td onClick={() => editTrigger(trigger)}>
                                        {trigger.Name}
                                      </td>
                                      <td onClick={() => editTrigger(trigger)}>
                                        {trigger.TriggerConditions[0].TriggerRule?.Name ?? "Rule deleted"}
                                      </td>
                                      <td>
                                        <img src="/icons/trash-bluegrey.svg" onClick={() => deleteTrigger(trigger)}/>
                                      </td>
                                    </tr>
                                );
                              })}
                              </tbody>
                            </table>
                          </div>
                        </>
              }
            </div>
            <div className="row">
              <div className="cancel">
                <Button text="Close" extraClasses="hollow" onClick={() => setTriggerListVisible(false)}/>
              </div>
              <div className="save">
                <Button text="New Trigger" onClick={addTrigger}/>
              </div>
            </div>

          </Box>

        </SCModal>

        {editTriggerVisible ?
            <EditTrigger
                defaultTriggerName={defaultTriggerName}
                triggerToEdit={editingTrigger}
                setEditTriggerVisible={setEditTriggerVisible}
                onSave={triggerSaved}
                module={module}
                defaultSetting1={conditionSetting1}
                defaultSetting2={conditionSetting2}
                defaultRuleName={defaultRuleName}
                readonlyConditions={readonlyConditions}
            /> : ""}

        {confirmOptions.display ?
            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions}/>
            : ""}

        <style jsx>{`
          .row {
            display: flex;
            justify-content: space-between;
          }

          .column {
            display: flex;
            flex-direction: column;
            width: 100%;
            margin-left: 0.5rem;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 0;
          }

          .cancel {
            width: 6rem;
          }

          .update {
            width: 14rem;
          }

          .table-container {
            overflow-x: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
          }

          .table {
            border-collapse: collapse;
            margin-top: 1.5rem;
            width: 100%;
          }

          .table thead tr {
            background-color: ${colors.backgroundGrey};
            height: 3rem;
            border-radius: ${layout.cardRadius};
            width: 100%;
          }

          .table th {
            color: ${colors.darkPrimary};
            font-size: 0.75rem;
            font-weight: normal;
            padding: 4px 1rem 4px 0;
            position: relative;
            text-align: left;
            text-transform: uppercase;
            transform-style: preserve-3d;
            user-select: none;
            white-space: nowrap;
          }

          .table th.number-column {
            padding-right: 0;
            text-align: right;
          }

          .table th:last-child {
            padding-right: 1rem;
            text-align: right;
          }

          .table th:first-child {
            padding-left: 0.5rem;
            text-align: left;
          }

          .table .spacer {
            height: 0.75rem !important;
          }

          .table tr {
            height: 4rem;
            cursor: pointer;
          }

          .table td {
            font-size: 12px;
            padding-right: 1rem;
          }

          .table td.number-column {
            padding-right: 0;
            text-align: right;
          }

          .table tr:nth-child(odd) td {
            background-color: ${colors.background};
          }

          .table td:last-child {
            border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
            text-align: right;
          }

          .table td:last-child :global(div) {
            margin-left: auto;
          }

          .table td:first-child {
            border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
            padding-left: 1rem;
            text-align: left;
          }

          .table td:first-child :global(div) {
            margin-left: 0;
          }
        `}</style>

      </Box>
  );
};

export default TriggerList;