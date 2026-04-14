import React, { useState, useEffect, useContext } from 'react'
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme'
import TextInput from '../text-input'
import Button from '../button'
import Fetch from '../../utils/Fetch'
import ToastContext from '../../utils/toast-context';

function ManagePermissions({allEmployees, employee, setAllEmployees, setEmployee}) {

  const [availPermissions, setAvailPermissions] = useState([]);
  const [employeePermissions, setEmpoyeePermissions] = useState(employee.Permissions);
  const toast = useContext(ToastContext);

  useEffect(() => {
    const fetchData = async () => {
      const permissionRequest = await Fetch.get({
        url: '/Permission'
      });
      setAvailPermissions(permissionRequest.Results)
    };
    fetchData();  
  }, []);

  async function update() {
    let newPermissions = employeePermissions.map(permission => permission.ID);

    const employeePostResponse = await Fetch.post({
      url: '/Employee/Permission?employeeID='+employee.ID,
      params: newPermissions,
      toastCtx: toast,
    });

    if (employeePostResponse.ID) {
      toast.setToast({
        message:  'Employee updated successfully',
        show: true,
        type: 'success'
      })
      let newEmployees = [
        ...allEmployees
      ]
      newEmployees.find(emp => emp.ID == employeePostResponse.ID).Permissions = employeePostResponse.Permissions;
      setAllEmployees(newEmployees)
    }
    setEmployee(undefined)
  }

  function togglePermission(permission) {
    let newPermissions = [];
    if (employeePermissions.find(empPermission => empPermission.ID == permission.ID)) {
      newPermissions = employeePermissions.filter(empPermission => empPermission.ID != permission.ID)
    } else {
      newPermissions = [
        ...employeePermissions,
        permission
      ]
    }
    setEmpoyeePermissions(newPermissions);
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          {"Editing permissions for " + employee.FirstName + " " + employee.LastName}
        </div>
        <div className="option-container">
          {availPermissions.map(function(permission, index){
            const permissionSelected = employeePermissions.find(empPermission => empPermission.ID == permission.ID);
            return (
              <div className={`option ${permissionSelected ? "selected" : ""}`} onClick={() => togglePermission(permission)}>
                <div className="box"></div>
                {permission.Name}
              </div>
            )
          })}
        </div>
        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setEmployee(undefined)}/>
          </div>
          <div className="update">
            <Button text="Update" onClick={update}/>
          </div>
        </div>
      </div>
      <style jsx>{`
      .overlay {
        align-items: center;
        background-color: rgba(19, 106, 205, 0.9);
        bottom: 0;
        display: flex;
        justify-content: center;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 9999;
      }
      .container {
        background-color: ${colors.white};
        border-radius: ${layout.cardRadius};
        padding: 2rem 3rem;
        width: 24rem;
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
        background-color: rgba(28,37,44,0.2);
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
      .cancel {
        width: 6rem;
      }
      .update {
        width: 14rem;
      }
      .option-container {
        max-height: 26rem;
        overflow-y: scroll;
      }
      .option {
        align-items: center;
        cursor: pointer;
        display: flex;
        height: 2rem;
      }
      .box {
        border: 1px solid ${colors.labelGrey};
        border-radius: ${layout.inputRadius};
        box-sizing: border-box;
        cursor: pointer;
        height: 1rem;
        margin-right: 1rem;
        opacity: 0.4;
        width: 1rem;
      }
      .selected .box {
        background-color: ${colors.bluePrimary};
        background-image: ${tickSvg};
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
        border: none;
        opacity: 1;
      }
      `}</style>
    </div>
  )
}

export default ManagePermissions
