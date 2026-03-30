import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import Button from '../../button';
import Checkbox from '../../../components/checkbox';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import ReactSwitch from '../../../components/react-switch';
import Router from 'next/router';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function ManageJobCardRepeat({jobCard, setJobCard, saveJobCard, setShowModal, repeatedJob}) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const repeatedAlready = (repeatedJob ? true : false);

  const [inputs, setInputs] = useState({
    RepeatTimePeriodDays: jobCard.RepeatTimePeriodDays ? jobCard.RepeatTimePeriodDays : 0,
    RepeatCreateBeforeDays: jobCard.RepeatCreateBeforeDays ? jobCard.RepeatCreateBeforeDays : 0,
    RepeatIndefinitely: jobCard.RepeatIndefinitely ? jobCard.RepeatIndefinitely : false,
    Repeat: jobCard.Repeat,
  });

  const handleInputChange = (e) => {

    let name = e.target.name;
    let value = e.target.value;
    
    if (name === 'RepeatTimePeriodDays' || name === 'RepeatCreateBeforeDays') {
      if (value < 0 || Helper.isNullOrUndefined(value)) {
        value = 0;
      }
    }

    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const validate = () => {
    const { isValid, errors } = Helper.validateInputs([
      { key: "RepeatTimePeriodDays", value: inputs.RepeatTimePeriodDays, type: Enums.ControlType.Number, required: true, gt: 0 },
      { key: "RepeatCreateBeforeDays", value: inputs.RepeatCreateBeforeDays, type: Enums.ControlType.Number, required: true, gte: 0, lt: parseInt(inputs.RepeatTimePeriodDays)},      
    ]);

    setInputErrors(errors);
    return isValid;
  }

  // const [readyToUpdate, setReadyToUpdate] = useState(false);
  // useEffect(() => {
  //   if (readyToUpdate) {
  //     saveJobCard();
  //     setShowModal(false);
  //     setReadyToUpdate(false);
  //   }    
  // }, [readyToUpdate]);

  const updateJobRepeat = async () => {
    const jobPut = await Fetch.get({
      url: '/Job/UpdateRepeat',
      params: {
        id: jobCard.ID,
        repeat: inputs.Repeat,
        repeatTimePeriodDays: inputs.Repeat ? inputs.RepeatTimePeriodDays : 0,
        repeatCreateBeforeDays: inputs.Repeat ? inputs.RepeatCreateBeforeDays : 0,
        repeatIndefinitely: inputs.Repeat ? inputs.RepeatIndefinitely : false,
      },
      toastCtx: toast
    });
    if (jobPut.ID) {
      setJobCard(jobPut);
      toast.setToast({
        message: 'Job repeat updated successfully',
        show: true,
        type: 'success'
      });
    }
  }

  const saveChanges = async () => {
    let isValid = validate();
    if (isValid) {
      await updateJobRepeat();
      setShowModal(false);
      //setReadyToUpdate(true);
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  }

  const jobNumberClick = () => {
    Helper.nextRouter(Router.push,`/job/${jobCard.RepeatJobCardID}`);
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="row">
          <div className="title">
            Repeat Job
          </div>
          {repeatedAlready ? 
            '':
            <div className="switch">
              <SCSwitch label="Active" checked={inputs.Repeat} onToggle={() => handleInputChange({ target: { name: "Repeat", value: !inputs.Repeat } })} />
              {/*<ReactSwitch label="Active" checked={inputs.Repeat} handleChange={() => handleInputChange({ target: { name: "Repeat", value: !inputs.Repeat } })} />*/}
            </div>
          }
        </div>

        { inputs.Repeat && !repeatedAlready ? 
          <div className="section">
            <div className="row">
              <div className="label">
                Repeat job
              </div>
              <div className="input">
                <TextInput
                  required={true}
                  type="number"
                  name="RepeatTimePeriodDays"
                  changeHandler={handleInputChange}
                  value={inputs.RepeatTimePeriodDays}
                  error={inputErrors.RepeatTimePeriodDays}
                />
              </div>
              <div className="label">
                days after close
              </div>
            </div>
            <div className="row">
              <div className="label">
                Create job
              </div>
              <div className="input" style={{paddingLeft: '0.2rem'}}>
                <TextInput
                  required={true}
                  type="number"
                  name="RepeatCreateBeforeDays"
                  changeHandler={handleInputChange}
                  value={inputs.RepeatCreateBeforeDays}
                  error={inputErrors.RepeatCreateBeforeDays}
                />
              </div>
              <div className="label">
                days before it's due
              </div>
            </div>
            <div className="column">
              <Checkbox changeHandler={() => handleInputChange({ target: { name: "RepeatIndefinitely", value: !inputs.RepeatIndefinitely } })}
                checked={inputs.RepeatIndefinitely}
                extraClasses="form"
                label="Repeat Continuously"
              />
            </div>
          </div> : 
          ''
        }

        {repeatedAlready ? 
          <div className="section">
            <div className="row">
              <div className="label">
                Click <div onClick={() => jobNumberClick()} className="link">{repeatedJob.JobCardNumber}</div> to open the repeated job.
              </div>
            </div>
          </div> : ''}

        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setShowModal(false)} />
          </div>
          { repeatedAlready ? '' : 
            <div className="update">
              <Button text="Update" onClick={saveChanges} />
            </div>
          }
        </div>
      </div>

      <style jsx>{`
        .link {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          padding-left: 0.2rem;
          padding-right: 0.2rem;
          cursor: pointer;
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
        .switch {
          margin-bottom: 1rem;
          display: flex;
        }
        .label {
          display: flex;
          margin-top: 1rem;
          align-items: center;
          padding: 0 0.5rem;
          white-space: nowrap;
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
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
        }
        .input {
          display: flex;
          width: 360px;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default ManageJobCardRepeat;
