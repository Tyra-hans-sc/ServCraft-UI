import React, { useState, useContext } from 'react';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import SCModal from "@/PageComponents/Modal/SCModal";
import CustomerForm from "@/components/customer/CustomerForm";
import {Button, Flex} from "@mantine/core";

function EditCustomer({ customer, setEditCustomer, updateCustomer }) {


  const toast = useContext(ToastContext);

  const [submitting, setSubmitting] = useState(false);

  const [triggerSaveCounter, setTriggerSaveCounter] = useState(0)
  const initiateSave = () => {
    setSubmitting(true);
    setTriggerSaveCounter(p => p + 1)
  }

  async function update(newCustomerFields) {

    const updatedCustomer = {
      ...customer,
      ...newCustomerFields
      /*CustomerName: inputs.CustomerName,
      CustomerCode: inputs.CustomerCode,
      IsCompany: type == 'Company' ? true : false,
      CustomerTypeID: selectedCustomerType ? selectedCustomerType.ID : null,
      IndustryTypeID: selectedIndustryType ? selectedIndustryType.ID : null,
      MediaTypeID: selectedMediaType ? selectedMediaType.ID : null,
      CustomerStatusID: selectedCustomerStatus ? selectedCustomerStatus.ID : null,
      CustomField1: inputs.CustomField1,
      CustomField2: inputs.CustomField2,
      CustomField3: inputs.CustomField3,
      CustomField4: inputs.CustomField4,
      CustomDate1: inputs.CustomDate1,
      CustomDate2: inputs.CustomDate2,
      CustomFilter1: inputs.CustomFilter1,
      CustomFilter2: inputs.CustomFilter2,
      CustomNumber1: inputs.CustomNumber1,
      CustomNumber2: inputs.CustomNumber2,
      VATNumber: inputs.VATNumber,
      DefaultDiscount: inputs.DefaultDiscount,*/
    };
    let savedCustomer = await saveCustomer(updatedCustomer);
    if (savedCustomer) {
      updateCustomer(savedCustomer);
      setEditCustomer(null);
    }
    setSubmitting(false);
  }

  const handleError = () => {
    toast.setToast({
      message: 'There are errors on the page',
      show: true,
      type: Enums.ToastType.error
    });

    // handle error
    setSubmitting(false);
  }

  async function saveCustomer(customerToSave) {
    const customerPut = await Fetch.put({
      url: '/Customer',
      params: customerToSave,
      toastCtx: toast
    });

    if (customerPut.ID) {
      return customerPut;
    } else {
      return null;
    }
  }

  return (
      <>
        <SCModal open onClose={() => setEditCustomer(null)}>

          <CustomerForm
              customer={customer}
              triggerFormSaveCounter={triggerSaveCounter}
              onSaveValues={update}
              onErrors={handleError}
              showTitle
          />

          <Flex gap={'sm'} justify={'end'} mt={'lg'}>
            <Button
                variant={'subtle'}
                color={'gray.9'}
                onClick={() => setEditCustomer(null)}
            >
              Cancel
            </Button>
            <Button
                disabled={submitting}
                onClick={() => initiateSave()}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </SCModal>
      </>
  )
}

export default EditCustomer
