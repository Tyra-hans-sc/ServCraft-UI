import React, { useState, useContext } from 'react';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context.js';
import constants from '../../../utils/constants';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button, Group, Loader} from "@mantine/core";
import CustomerForm from "@/components/customer/CustomerForm";

function CreateCustomer({ setShowCreateCustomer, createCustomer, customer = null }) {

  const toast = useContext(ToastContext);

  const [saving, setSaving] = useState(false);
  const [triggerSaveCounter, setTriggerSaveCounter] = useState(0)

  const handleErrors = () => {
    toast.setToast({
      message: 'There are errors on the page',
      show: true,
      type: Enums.ToastType.error,
    });
    setSaving(false);
  }

  const handleSubmit = () => {
    setSaving(true);
    setTriggerSaveCounter(p => p + 1)
  }

  const create = async (newCustomer) => {
    try {
      let savedCustomer = await saveCustomer(newCustomer);
      if (savedCustomer) {
        createCustomer(savedCustomer);
        setShowCreateCustomer(false);
      }
    }
    catch (e) {
      setSaving(false);
    }
  }

  async function saveCustomer(customerToSave) {
    const customerPost = await Fetch.post({
      url: '/Customer',
      params: customerToSave,
      toastCtx: toast
    });

    if (customerPost.ID) {
      Helper.mixpanelTrack(constants.mixPanelEvents.createCustomer, {
        "customerID": customerPost.ID
      });
      return customerPost;
    } else {
      throw new Error(customerPost.serverMessage || customerPost.message || 'something went wrong');
    }
  }

  return (
      <SCModal open={true}
               size={'lg'}
               onClose={() => setShowCreateCustomer(false)}
               modalProps={{
                 closeOnClickOutside: false
               }}
               /*modalProps={{
                 styles: {
                   body: {padding: 0}
                 }
               }}*/
      >

        <CustomerForm
            triggerFormSaveCounter={triggerSaveCounter}
            onSaveValues={create}
            onErrors={handleErrors}
            showAddContactAndLocationForms
            showTitle
        />

        <Group justify={'right'} gap={'xs'} mt={'xl'}>
          <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => setShowCreateCustomer(false)}>
            Cancel
          </Button>
          <Button color={'scBlue'}
                  disabled={saving}
                  rightSection={saving && <Loader variant={'oval'} size={18} color={'white'}/>}
                  onClick={handleSubmit}
          >
            Create
          </Button>
        </Group>

      </SCModal>
  );
}

export default CreateCustomer
