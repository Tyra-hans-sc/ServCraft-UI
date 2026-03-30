import React, { useState, useEffect } from 'react';
import Time from '../../../utils/time';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
import KendoDatePicker from '../../kendo/kendo-date-picker';
import TextInput from '../../text-input';
import TextArea from '../../text-area';
import CellStatus from '../../cells/status';
import JobPropertiesColumn from '../../job/job-properties-column';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import JobInventory from '../../job/job-inventory';
import Button from '../../button';

function JobDetail(props) {
  const [job, setJob] = useState(props.job);

  const [jobProperties, setJobProperties] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const getJobProperties = async () => {
    const jobProps = await Fetch.get({
      url: '/CustomerZone/JobProperty',
      params: {
        jobCardID: job.ID
      },
      tenantID: props.tenantID,
      customerID: props.customerID,
      apiUrlOverride: props.tenant.API
    });
    setJobProperties(jobProps.Results);
  }

  const getCustomFields = async () => {
    const customFields = await Fetch.get({
      url: `/CustomerZone/Option?module=${Enums.Module.JobCard}`,
      tenantID: props.tenantID,
      customerID: props.customerID,
      apiUrlOverride: props.tenant.API
    });

    setCustomFields(customFields.Results);
  }

  useEffect(() => {
    getJobProperties();
    getCustomFields();
  }, []);

  return (<>
    <div className="card">
      <div className="row line-height-2rem">
        <div className="heading width-100">Job Details</div>
        <CellStatus value={job.JobCardStatusDisplay} />
      </div>
      <br />
      <div className="row">
        <div className="column">
          <KendoDatePicker
            disabled={true}
            label="Start Date"
            required={false}
            value={job.StartDate}
          />
        </div>
        <div className="column">
          <TextInput
            readOnly={true}
            label="Job Type"
            required={false}
            value={job.JobType ? job.JobType.Name : ""}
          />
        </div>
      </div>
      <div className="row">
        <TextArea
          readOnly={true}
          label="Comments"
          value={job.Description}
        />
      </div>

      <JobInventory key={1} clientID={1} job={job} updateJob={() => { }} accessStatus={Enums.AccessStatus.Live} allowNonEmployee={false} customerZone={true} />

      <JobPropertiesColumn job={job} updateJobProperty={() => { }} jobProperties={jobProperties} inputErrors={{}} showAll={true} customFields={customFields} allowNonEmployee={false} accessStatus={Enums.AccessStatus.Live} groupSize={2} selectedStore={job.Store} customerZone={true} />

    </div>


    <style jsx>{`

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 1rem 2rem;
            position: relative;
            width: 100%;
        }

        .line-height-2rem {
            line-height: 2rem;
        }

        .width-100 {
            width: 100%;
        }

        .card h3 {
            margin-top: 0;
        }

        .container {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1.5rem 3rem;
            overflow-x: hidden;
          }
          .row {
            display: flex;
          }
          .column {
            display: flex;
            flex-basis: 0;
            flex-direction: column;
            flex-grow: 1;
          }
          .column :global(.textarea-container) {
            height: 100%;
          }
          .column + .column {
            margin-left: 1.25rem;
          }
          .contact {
            color: ${colors.blueGrey};
            width: 100%;
            padding-right: 16px;
          }
          .contact h1 {
            color: ${colors.darkPrimary};
            font-size: 2rem;
            margin: 0 0 0.75rem;
          }
          .contact p {
            margin: 3px 0 0;
            opacity: 0.8;
          }
          .heading {
            color: ${colors.blueGrey};
            font-weight: bold;
          }
          .new-comment {
            position: relative;
          }
          .new-comment :global(.textarea-container){
            height: 5rem;
          }
          .new-comment img{
            cursor: pointer;
            position: absolute;
            right: 1rem;
            top: 1rem;
          }
          .loader {
            border-color: rgba(113, 143, 162, 0.2);
            border-left-color: ${colors.blueGrey};
            display: block;
            margin-bottom: 1rem;
            margin-top: 1rem;
          }
  
          .comment {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-sizing: border-box;
            color: ${colors.blueGrey};
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-top: 0.5rem;
            padding: 1.25rem 1rem;
            position: relative;
            width: 100%;
          }
          .comment-info {
            align-items: center;
            display: flex;
            margin-bottom: 4px;
          }
          .job {
            color: ${colors.bluePrimary};
            font-weight: bold;
          }
          .name {
            color: ${colors.darkPrimary};
            font-weight: bold;
          }
          .time {
            color: ${colors.blueGrey};
            font-size: 12px;
            margin-left: 1rem;
          }
          .text {
            white-space: pre-wrap;
          }
          .edit {
            margin-top: 0.2rem;
            margin-left: 1rem;
          }
          .status {
            position: absolute;
            right: 0;
            top: 0;
            width: max-content;
          }
          .status :global(.input-container){
            background-color: ${colors.bluePrimary};
          }
          .status :global(input){
            color: ${colors.white};
          }
          .status :global(label){
            color: ${colors.white};
            opacity: 0.8;
          }
          .actions {
              width: 240px;
          }
       
      `}</style>
  </>);

}

export default JobDetail;