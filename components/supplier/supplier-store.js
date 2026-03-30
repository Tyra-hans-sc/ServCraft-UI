import React, { useState, useEffect, useContext } from 'react';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import DualList from '../dual-list';
import Button from '../button';
import ToastContext from '../../utils/toast-context';

function SupplierStores({supplierID, accessStatus}) {
  const toast = useContext(ToastContext);

  const [availableStores, setAvailableStores] = useState([]);
  const [assignedStores, setAssignedStores] = useState([]);

  const getStores = async () => {

    const allStoreResult = await Fetch.get({
      url: `/Store`
    });

    const supplierStoreResult = await Fetch.get({
      url: `/Store/GetSupplierStores?supplierID=${supplierID}`,
    });

    let allStores = allStoreResult.Results;
    let supplierStores = supplierStoreResult.Results;

    let available = [];
    let assigned = [];

    for (let store of allStores) {

      available.push({label: store.Name, value: store.ID, isActive: store.IsActive});

      let isAssigned = supplierStores.some(x => x.ID == store.ID);
      
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

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const supplierStoreUpdateResult = await Fetch.put({
      url: `/Store/SupplierStoreUpdate`,
      params: {
        supplierID: supplierID,
        storeIDList: assignedStores
      }
    });

    if (supplierStoreUpdateResult.HttpStatusCode == 200) {
      toast.setToast({
        message: 'Stores assigned successfully',
        show: true,
        type: 'success'
      });
    } else {
      toast.setToast({
        message: 'Stores failed to be assigned',
        show: true,
        type: Enums.ToastType.error
      });
    }

    setSaving(false);
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
        </div>
        <div className="column column-end">
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text={saving ? "Saving" : "Save"} extraClasses="auto save" onClick={save} />
        </div>
      </div>
      <div className="row">
      <DualList options={availableStores} selectedOptionIDs={assignedStores} onChange={onChange} canFilter={true}
          templateFunction={storeTemplateFunction}
          textField="label"
          valueField="value"
          assignedTitle="Assigned Stores"
          unassignedTitle="Unassigned Stores"

          />
      </div>

      <style>{`
        .row {
          display: flex;
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

export default SupplierStores;
