import React, { useState, useEffect, useContext } from 'react';
import { colors, layout } from '../../theme';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';
import JobStatusService from '../../services/job/job-status-service';
import JobPropertiesColumn from './job-properties-column';
import JobInventory from './job-inventory';
import AvailableTriggers from '../trigger/available-triggers';
import SCModal from "../../PageComponents/Modal/SCModal";
import { Button, Flex } from "@mantine/core";
import TimerContext from "../../utils/timer-context";
import ManageJobInventoryComponent, { useJobInventoryState } from '../../PageComponents/JobInventory/ManageJobInventoryComponent';
import useRefState from '../../hooks/useRefState';
import featureService from '../../services/feature/feature-service';
import constants from '../../utils/constants';

function StatusChange(props) {

  const timerContext = useContext(TimerContext);

  const toast = React.useContext(ToastContext);
  const isNew = props.isNew;
  const [statusFields, setStatusFields] = useState([]);
  const [inputErrors, setInputErrors] = useState({});
  const [jobProperties, setJobProperties] = useState([]);
  const [job, setJob, getJobValue] = useRefState({});
  const [jobInventoryUsed, jobInventoryWorkedOn, updateJobInventory] = useJobInventoryState(job, setJob, getJobValue);
  const [usedTriggers, setUsedTriggers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [hasStockControl, setHasStockControl] = useState();

  const fetchStatusFields = async () => {
    const fieldsRequest = await Fetch.get({
      url: '/JobStatus/JobStatusOption',
      params: {
        jobStatusID: props.newStatus.ID
      }
    });
    setStatusFields(fieldsRequest.Results.filter(x => x.IsActive));
  };

  useEffect(() => {
    fetchStatusFields();
    let temp = Helper.mapObject(props.job);
    temp.JobInventory = props.job.JobInventory ? [...props.job.JobInventory].map(ji => ({ ...ji })) : [];
    setJob(temp);
    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    });
  }, []);

  async function updateStatus(stopTimer) {
    let newJob = { ...job };

    const [statusValid, newInputErrors] = JobStatusService.validateJob(newJob, jobProperties);

    setInputErrors(newInputErrors);

    newJob.JobCardStatusID = props.newStatus.ID;

    let params = {
      Job: newJob,
      UsedTriggers: usedTriggers,
    };

    if (stopTimer) {
      params.StopCurrentTimers = true
    }

    let activeJobInventoryWorkedOn = job.JobInventory.filter(x => x.IsActive === true && x.StockItemStatus === Enums.StockItemStatus.WorkedOn);
    let activeJobInventoryUsed = job.JobInventory.filter(x => x.IsActive === true && x.StockItemStatus === Enums.StockItemStatus.ItemUsed);

    if (jobInventoryRequired && activeJobInventoryWorkedOn.length === 0) {
      toast.setToast({
        message: 'Customer assets are required',
        show: true,
        type: Enums.ToastType.error
      });
    }
    else if (materialsRequired && activeJobInventoryUsed.length === 0) {
      toast.setToast({
        message: 'Materials are required',
        show: true,
        type: Enums.ToastType.error
      });
    }
    else if (statusValid) {

      if (isNew) {
        props.submit(params);
        props.setNewStatus(undefined);
      } else {
        setSaving(true);
        const jobPut = await Fetch.put({
          url: '/Job',
          params: params,
          toastCtx: toast
        });

        if (jobPut.ID) {
          toast.setToast({
            message: 'Status updated successfully',
            show: true,
            type: 'success'
          });
          props.setJob(jobPut);
          props.setFormIsDirty(false);
          if (stopTimer) {
            // await TimerService.stopTimer(latestTimers, employeeID);
            timerContext.updateRunningTimers(true);
          }
        }
        props.setNewStatus(undefined);
        setSaving(false);
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  }

  // WORKFLOW

  const [jobItemSelection, setJobItemSelection] = useState();
  const [jobItemOrder, setJobItemOrder] = useState();
  const [jobSingleItem, setJobSingleItem] = useState();

  const getWorkflow = async () => {
    const workflow = await Fetch.get({
      url: `/Workflow/${job.WorkflowID}`
    });
    setJobItemSelection(workflow.JobItemSelection);
    setJobItemOrder(workflow.JobItemOrder);
    setJobSingleItem(workflow.SingleItem);
  };

  const [showJobInventory, setShowJobInventory] = useState(false);
  const [jobInventoryRequired, setJobInventoryRequired] = useState(false);

  const [showMaterials, setShowMaterials] = useState(false);
  const [materialsRequired, setMaterialsRequired] = useState(false);

  useEffect(() => {
    if ((showJobInventory || showMaterials) && job) {
      getWorkflow();
    }
  }, [showJobInventory, showMaterials, job]);


  useEffect(() => {

    let jobProps = statusFields ? statusFields.map(field => {
      return {
        Name: Enums.getEnumStringValue(Enums.JobStatusOptionName, field.JobStatusOptionName),
        Description: field.JobStatusOptionDescription,
        JobStatusOptionName: field.JobStatusOptionName,
        OptionConfiguration: field.OptionConfiguration
      };
    }) : [];

    setJobProperties(jobProps);

    let jobItemProp = jobProps.find(x => x.JobStatusOptionName == Enums.JobStatusOptionName.JobItem);

    setShowJobInventory(jobItemProp);
    setJobInventoryRequired(jobItemProp && jobItemProp.OptionConfiguration == Enums.OptionConfiguration.Required);

    jobItemProp = jobProps.find(x => x.JobStatusOptionName == Enums.JobStatusOptionName.Materials);

    setShowMaterials(jobItemProp);
    setMaterialsRequired(jobItemProp && jobItemProp.OptionConfiguration == Enums.OptionConfiguration.Required);

  }, [statusFields]);

  const updateJob = (key, value, orKeyValues) => {
    let newJob = { ...job };

    if (orKeyValues && orKeyValues.length > 0) {
      orKeyValues.map((item) => {
        newJob[item.key] = item.value;
      });
    }
    if (key) {
      newJob[key] = value;
    }
    setJob(newJob);

    props.setFormIsDirty(true);
  };

  const usedTriggersChanged = (_usedTriggers) => {
    setUsedTriggers(_usedTriggers);
  };

  return (
    <SCModal
      open
    >
      <div className="title">
        {isNew ? 'Job Properties' : props.jobNumber}
      </div>

      {isNew ?
        '' :
        <>
          <div className="row align-end">
            <div>
              <div className="label">
                Current status
              </div>
              <div className={`status ${props.job.JobStatus.DisplayColor}`}>
                {props.job.JobStatus.Description}
              </div>
            </div>
            <img className="arrow" src="/icons/chevron-right.svg" alt="next" />
            <div>
              <div className="label">
                New status
              </div>
              <div className={`status ${props.newStatus.DisplayColor}`}>
                {props.newStatus.Description}
              </div>
            </div>
          </div>
          {hasStockControl && !props.newStatus.CloseStatus && props.newStatus.WorkCompleted && <p className="light-text">
            This will mark materials as used
          </p>}
        </>
      }

      <JobPropertiesColumn job={job} showAll={false} jobProperties={jobProperties} updateJobProperty={updateJob}
        inputErrors={inputErrors} key={1}
        groupSize={1} customFields={props.customFields} selectedStore={job.Store}
        allowNonEmployee={true} accessStatus={props.accessStatus} />




      {showJobInventory && job ?
        <>
          <ManageJobInventoryComponent
            accessStatus={props.accessStatus}
            allowNonEmployee={true}
            inputErrors={inputErrors}
            fromStatusChange={true}
            job={job}
            jobInventoryUsed={jobInventoryUsed}
            jobInventoryWorkedOn={jobInventoryWorkedOn}
            stockItemStatus={Enums.StockItemStatus.WorkedOn}
            key={15}
            onUpdate={(rowVersion, jobInventory, stockItemStatus) => {
              updateJobInventory(rowVersion, jobInventory, stockItemStatus);
              props.setFormIsDirty(true);
            }}
          />
        </> : ''
      }

      {showMaterials && job ?
        <>
          <ManageJobInventoryComponent
            accessStatus={props.accessStatus}
            allowNonEmployee={true}
            inputErrors={{ JobInventory: inputErrors?.Materials }}
            fromStatusChange={true}
            job={job}
            jobInventoryUsed={jobInventoryUsed}
            jobInventoryWorkedOn={jobInventoryWorkedOn}
            stockItemStatus={Enums.StockItemStatus.ItemUsed}
            key={15}
            onUpdate={(rowVersion, jobInventory, stockItemStatus) => {
              updateJobInventory(rowVersion, jobInventory, stockItemStatus);
              props.setFormIsDirty(true);
            }}
          />
        </> : ''
      }

      <br />
      <AvailableTriggers module={Enums.Module.JobCard} moduleStatus={props.newStatus} moduleType={props.job.JobType}
        triggerListChanged={usedTriggersChanged} />

      {props.newStatus.CloseStatus === true ? <><p className="light-text">This status will automatically close the job {hasStockControl && props.newStatus.WorkCompleted && "and mark the remaining materials as used"}</p></> : ""}

      <Flex gap={'sm'} justify={'flex-end'} mt={'xl'}>
        <Button type={'button'} variant={'subtle'} color={'gray.9'}
          onClick={() => {
            props.setNewStatus(undefined);
            props.setFormIsDirty(false);
          }}
        >
          Cancel
        </Button>
        <Button  // ml={'auto'}
          color={'scBlue'}
          variant={props.showStopTimerOption ? 'outline' : 'filled'}
          onClick={() => updateStatus()}
          disabled={saving}
        >
          {saving ? "Saving..." : isNew ? 'Create Job' : 'Update status'}
        </Button>
        {
          !saving && props.showStopTimerOption &&
          <Button color={'scBlue'}
            onClick={() => updateStatus(true)}
            disabled={saving}
          >
            {saving ? "Saving..." : 'Update Status and Stop Timer'}
          </Button>
        }
      </Flex>

      {/*<div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => {
              props.setNewStatus(undefined);
              props.setFormIsDirty(false);
            }}/>
          </div>
          <div className="update">
            <Button disabled={saving} text={`${saving ? "Saving..." : isNew ? 'Create Job' : 'Update status'}`}
                    onClick={updateStatus}/>
          </div>
        </div>*/}

      <style jsx>{`
          .overlay {
            align-items: center;
            background-color: rgba(19, 106, 205, 0.9);
            bottom: 0;
            display: flex;
            justify-content: center;
            left: 0;
            overflow: scroll;
            padding: 2rem 0;
            position: fixed;
            right: 0;
            top: 0;
            z-index: 110;
          }

          .container {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            margin: auto;
            padding: 2rem 3rem;
            width: 44rem;
          }

          .row {
            display: flex;
          }

          .space-between {
            justify-content: space-between;
          }

          .align-end {
            align-items: flex-end;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .label {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }

          .status {
            align-items: center;
            background-color: rgba(28, 37, 44, 0.2);
            border-radius: ${layout.buttonRadius};
            box-sizing: border-box;
            color: ${colors.darkPrimary};
            display: flex;
            font-size: 0.75rem;
            font-weight: bold;
            height: 2rem;
            justify-content: center;
            padding: 0 1rem;
            text-align: center;
          }

          .arrow {
            padding: 0.25rem 1rem;
          }

          .cancel {
            width: 6rem;
          }

          .update {
            width: 14rem;
          }

          .attach {
            margin-top: 1rem;
          }

          .Red {
            background-color: rgba(252, 46, 80, 0.2);
            //#FC2E50;
            color: #FC2E50 !important;
          }

          .Orange {
            background-color: rgba(242, 97, 1, 0.2);
            color: #F26101 !important;
          }

          .Yellow {
            background-color: rgba(255, 201, 64, 0.2);
            color: #FFC940 !important;
          }

          .Green {
            background-color: rgba(81, 203, 104, 0.2);
            color: #51CB68 !important;
          }

          .Blue {
            background-color: rgba(90, 133, 225, 0.2);
            color: #5A85E1 !important;
          }

          .Purple {
            background-color: rgba(128, 100, 250, 0.2);
            color: #735AE1 !important;
          }

          .Black {
            background-color: rgba(79, 79, 79, 0.2);
            color: #4F4F4F !important;
          }

          .Grey {
            background-color: rgba(130, 130, 130, 0.2);
            color: #828282 !important;
          }

          .LightGrey {
            background-color: rgba(189, 189, 189, 0.2);
            color: #BDBDBD !important;
          }

          .light-text {
            color: ${colors.bluePrimary} !important;
            font-weight: bold;
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

    </SCModal>
  )
}

export default StatusChange;
