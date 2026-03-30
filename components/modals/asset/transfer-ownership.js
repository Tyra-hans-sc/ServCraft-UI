import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import ToastContext from '../../../utils/toast-context';
import Helper from '../../../utils/helper';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import CustomerContactLocationSelector from '../../selectors/customer/customer-contact-location-selector';
import ConfirmAction from '../confirm-action';

function TransferOwnership({customer, sourceCustomer, canChangeCustomer, asset, onTransfer, accessStatus, module}) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reason, setReason] = useState('');

  const handleReasonChange = (e) => {
    setReason(e.value);
  };

  // CUSTOMERS
  
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedContact, setSelectedContact] = useState();
  const [selectedLocation, setSelectedLocation] = useState();

  useEffect(() => {
    if (customer) {
      setSelectedCustomer(customer);
    }
  }, [customer]);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const confirmTransfer = () => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: "Are you sure you want to transfer this asset?",
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        transferOwnershipConfirmed();
      }
    });
  };

  const transferOwnershipConfirmed = async () => {
    setIsSubmitting(true);

    let params = {
      ProductID: asset.ID,
      CustomerID: selectedCustomer.ID,
      CustomerContactID: selectedContact.ID,
      Reason: reason,
    };
    if (selectedLocation) {
      params = {...params, LocationID: selectedLocation.ID};
    }
    const productTransfer = await Fetch.put({
      url: '/Product/Transfer',
      params: params,
      toastCtx: toast
    });
    if (productTransfer.ID) {
      toast.setToast({
        message: 'Asset ownership transferred successfully',
        show: true,
        type: Enums.ToastType.success
      });
      onTransfer({
        Product: productTransfer,
        Customer: selectedCustomer,
        Contact: selectedContact,
        Location: selectedLocation,
        reason: reason,
      });
    } else {
      onTransfer(null);
    }

    setIsSubmitting(false);
  };

  const validate = () => {
    let validationItems = [
      { key: 'Customer', value: selectedCustomer, required: true, type: Enums.ControlType.Select },
      { key: 'Contact', value: selectedContact, required: true, type: Enums.ControlType.Select },
      { key: 'Reason', value: reason, required: true, type: Enums.ControlType.Text },
    ];
    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    return isValid;
  };

  const transferOwnership = () => {

    let isValid = validate();

    if (isValid) {
      confirmTransfer();
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };  

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="modal-title">
          <h1>Transferring Ownership for {asset.ProductNumber}</h1>
        </div>

        <div className="note">
          {module == Enums.Module.JobCard ? 
            <span>To use this asset in this job you'll need to transfer it from {asset.CustomerName} to {customer.CustomerName}</span>
            : 
            <span>To use this asset you'll need to transfer it from {asset.CustomerName}</span> 
          }
        </div>
        
        <div style={{marginTop: "0.5rem"}}>
            <CustomerContactLocationSelector
              selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} canChangeCustomer={canChangeCustomer}
              selectedContact={selectedContact} setSelectedContact={setSelectedContact} 
              selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
              excludedCustomerID={sourceCustomer ? sourceCustomer.ID : null} inputErrors={inputErrors} accessStatus={accessStatus}
            />       
        </div>        

        <div className="row">
          <div className="column">
            <SCTextArea
              label="Reason"
              onChange={handleReasonChange}
              value={reason}
              error={inputErrors.Reason}
            />
          </div>            
        </div>

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => onTransfer(null)} />
            <Button text={isSubmitting ? "Transferring..." : "Transfer"} disabled={isSubmitting} extraClasses="auto left-margin" onClick={transferOwnership} />
        </div>
      </div>

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .modal-container {
          min-height: 50%;
        }
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }
        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }
        .note {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.5rem;
        }
      `}</style>
    </div>
  );
}

export default TransferOwnership;
