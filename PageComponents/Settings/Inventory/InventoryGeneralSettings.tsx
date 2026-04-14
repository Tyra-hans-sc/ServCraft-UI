import React, { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Storage from '../../../utils/storage';
import FieldSettings from "../../../PageComponents/Settings/Field Settings/FieldSettings";
import { Space } from '@mantine/core';

const InventoryGeneralSettings: FC = () => {

  const router = useRouter()

  const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
  const getAccessStatus = () => {
    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    if (subscriptionInfo) {
      setAccessStatus(subscriptionInfo.AccessStatus);
    }
  }

  useEffect(() => {
    getAccessStatus();
  }, []);

  useEffect(() => {
    if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      Helper.nextRouter(router.replace, "/");
    }
  }, [accessStatus]);

  return (
    <>
      <FieldSettings module={Enums.Module.Inventory} />
    </>
  );
}

export default InventoryGeneralSettings;