import React, { useState, useEffect, useContext } from 'react';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import DualList from '../dual-list';
import ToastContext from '../../utils/toast-context';
import SCSwitch from "../sc-controls/form-controls/sc-switch";
import {showNotification} from "@mantine/notifications";

function EmployeeStore({ employee, accessStatus, customerStatus, updateEmployeeProperty, employeeSaving }) {

  const toast = useContext(ToastContext);

  const [availableStores, setAvailableStores] = useState([]);
  const [assignedStores, setAssignedStores] = useState([]);

  const getStores = async () => {

    const allStoreResult = await Fetch.post({
      url: `/Store/GetStores`,
      params: {
        IncludeClosed: true,
        PageSize: 1000
      }
    });

    /*const employeeStoreResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${employee.ID}&searchPhrase=&showAll=true`,
    });*/

    let allStores = allStoreResult.Results;
    // let employeeStores = employeeStoreResult.Results;
    // let employeeStores = employee.Stores;
    let employeeStores = (await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${employee.ID}&searchPhrase=`,
    }))?.Results;

    let available = [];
    let assigned = [];

    for (const store of allStores) {

      available.push({ label: store.Name, value: store.ID, isActive: store.IsActive });

      let isAssigned = employeeStores.some(x => x.ID === store.ID);

      if (isAssigned) {
        assigned.push(store.ID);
      }
    }

    setAvailableStores(available);
    setAssignedStores(assigned);
  };

  useEffect(() => {
    getStores();
  }, []);

  const onChange = (values) => {
    setAssignedStores(values);
  };

  const [storeAssigned, setStoreAssigned] = useState(0);

  useEffect(() => {
    if (storeAssigned > 1) {
      save();
    }

    setStoreAssigned(storeAssigned + 1);
  }, [assignedStores]);

  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);

    if(assignedStores.length !== 0) {
      const employeeStoreUpdateResult = await Fetch.put({
        url: `/Store/EmployeeStoreUpdate`,
        params: {
          employeeID: employee.ID,
          storeIDList: assignedStores
        }
      });
      if (employeeStoreUpdateResult.HttpStatusCode == 200) {
        // toast.setToast({
        //   message: 'Stores assigned successfully',
        //   show: true,
        //   type: 'success'
        // });
      } else {
        toast.setToast({
          message: 'Stores failed to be assigned',
          show: true,
          type: Enums.ToastType.error
        });

      }
    } else {
      showNotification({
        id: 'employeeStores',
        title: 'Please assign at least one store to save changes',
        // message: 'Assign at lease one store for changes to be saved',
        color: 'yellow.7'
      })
    }

    setSaving(false);
  };

  const isAllStoreChanged = async (checked) => {
    updateEmployeeProperty("IsAllStore", checked);
  };


  const storeTemplateFunction = (props) => {
    let { dataItem, selected, ...others } = props;
    return (
      <li {...others}>
        <div>
          <span
            style={{
              opacity: (props.dataItem.isActive ? 1 : 0.4)
            }}
          >
            {props.dataItem.label} {props.dataItem.isActive ? "" : "(Disabled)"}
          </span>
        </div>
      </li>
    );
  };

  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h3>Stores for {employee.FirstName} {employee.LastName}</h3>
        </div>
        {/* <div className="column column-end">
          <Button disabled={(accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) && customerStatus !== "Trial"}
            text={saving ? "Saving" : "Save"} extraClasses="auto save" onClick={save} />
        </div> */}
      </div>

      <div className="row row-margins">
        <SCSwitch label={employeeSaving ? "Access all stores updating..." : "Access all stores"} disabled={employeeSaving} checked={employee.IsAllStore} onToggle={isAllStoreChanged} />
      </div>

      {employee.IsAllStore ? "" : <>
        <div className="row">
          <div className="column">
            <DualList options={availableStores} selectedOptionIDs={assignedStores} onChange={onChange} canFilter={true}
              showHeaderLabels={true}
              assignedTitle="Assigned Stores"
              templateFunction={storeTemplateFunction}
              textField="label"
              valueField="value"
              unassignedTitle="Unassigned Stores"
            />
          </div>
        </div>
      </>
      }
      <style>{`
        .row {
          display: flex;
        }

        .row-margins {
          margin: 0 0 1rem 0;
        }

        .space-between {
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column-end {
          align-items: flex-end;
        }
        .column-margin {
          margin-left: 24px;
        }  
      `}</style>
    </div>
  );
}

export default EmployeeStore;
