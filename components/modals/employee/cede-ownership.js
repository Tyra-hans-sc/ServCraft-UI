import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import Button from '../../button';
import Checkbox from '../../checkbox';
import SelectInput from '../../select-input';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import Storage from '../../../utils/storage';
import { logout } from '../../../utils/auth';
import EmployeeService from '../../../services/employee/employee-service';
import SCMessageBarContext from '../../../utils/contexts/sc-message-bar-context';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import EmployeeSelector from '../../selectors/employee/employee-selector';

function CedeOwnership({ employeeID, setShowModal }) {

  const toast = useContext(ToastContext);
  const messageBarContext = useContext(SCMessageBarContext);

  const [inputErrors, setInputErrors] = useState({});

  const [ownerUserID, setOwnerUserID] = useState();

  const [agree, setAgree] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState();

  const [employeeSearch, setEmployeeSearch] = useState('');
  const handleEmployeeChange = (e) => {
    setEmployeeSearch(e.target.value);
  }

  const getEmployees = async () => {
    const response = await EmployeeService.getEmployees(null);
    let responseResults = response.Results;

    let currentOwner = responseResults.find(x => x.ID == employeeID);
    setOwnerUserID(currentOwner.UserID);

    let employeeSet = responseResults.filter(x => !x.Owner && x.AuthUserIsActive);
    setEmployees(employeeSet);
    setTotalEmployees(employeeSet.length);
  }

  useEffect(() => {
    getEmployees();
  }, []);

  const validate = () => {
    const { isValid, errors } = Helper.validateInputs([
      { key: "Employee", value: selectedEmployee, type: Enums.ControlType.Custom, required: true },
    ]);

    setInputErrors(errors);
    return isValid;
  }

  const submitOwnershipChange = async () => {

    let isValid = validate();
    if (isValid) {
      const response = await Fetch.post({
        url: `/Employee/CedeOwnership?fromUserID=${ownerUserID}&toEmployeeID=${selectedEmployee ? selectedEmployee.ID : null}`,
      });

      if (response.HttpStatusCode) {
        toast.setToast({
          message: response.Message,
          show: true,
          type: response.HttpStatusCode === 200 ? 'success' : Enums.ToastType.error
        });

        if (response.HttpStatusCode === 200) {
          setShowModal(false);
          if (messageBarContext.isActive) {
            messageBarContext.setIsActive(false);
          }
          logout();
        }
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          Cede ownership
        </div>
        <div className="employee">
          {/* <SCDropdownList
            error={inputErrors.Employee}
            label="Employee"
            options={employees}
            placeholder="Select employee"
            required={false}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            textField='FullName'
            dataItemKey='ID'
          /> */}
          <EmployeeSelector
            error={inputErrors.Employee}
            label="Employee"
            placeholder="Select employee"
            required={false}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            filter={(x) => !x.Owner && x.AuthUserIsActive}
          />
          {/* <SelectInput
            changeHandler={handleEmployeeChange}
            error={inputErrors.Employee}
            label="Employee"
            options={employees}
            placeholder="Select employee"
            required={false}
            setSelected={setSelectedEmployee}
            totalOptions={totalEmployees}
            type="employee"
            value={employeeSearch}
          /> */}
        </div>
        <div className="text">
          <p>
            Are you sure you want to cede ownership to the above Employee?
          </p>
          <p>
            Doing so will log you out and give ownership to the selected Employee. They will need to log out and log in again to view the changes.
          </p>
        </div>
        <div className="agree">
          <SCCheckbox
            value={agree}
            label='Agree'
            onChange={setAgree}
          />
          {/* <Checkbox checked={agree} label={'Agree'} changeHandler={() => setAgree(!agree)} /> */}
        </div>

        <div className="row">
          <div className="cancel">
            <Button text='Cancel' extraClasses="hollow" onClick={() => setShowModal(false)} />
          </div>
          <div className="update">
            <Button text='Cede Ownership' extraClasses="" onClick={submitOwnershipChange} disabled={!agree} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .row {
          display: flex;
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
        .agree {
          display: flex;
          flex-direction: row-reverse;
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
        }
        .text {
          line-height: 1.25rem;
        }
        .employee {
          margin-bottom: 1rem;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
      `}</style>
    </div>
  );
}

export default CedeOwnership;
