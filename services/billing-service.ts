import { ManagerTenantBillingDetails, ManagerTenantDebitOrder } from '@/interfaces/api/models';
import Fetch from '../utils/Fetch';
import * as Enums from '../utils/enums';
import Storage from '../utils/storage';
import storage from '../utils/storage';
import helper from '@/utils/helper';
import config from '@/utils/config';

// subscriptionContext is optional so callers can fetch without providing context
const getSubcriptionInfo = async (subscriptionContext: any = null, invalidate = false) => {

  const isLoggedIn = Storage.getCookie(Enums.Cookie.token);
  if (!isLoggedIn) {
    return [null, "Not logged in"];
  }

  if (invalidate === undefined || invalidate === null) {
    invalidate = true;
  }

  const subscription = await Fetch.get({
    url: '/Billing/GetSubscription',
    params: {
      invalidate
    }
  } as any);

  if (subscription.HttpStatusCode === 200) {
    // Apply bypass lockout override before storing/returning
    let result = subscription.Result;
    if (Storage.getCookie('bypassLockout') === 'true'
        && result?.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      result = { ...result, AccessStatus: Enums.AccessStatus.Live };
    }
    Storage.setCookie(Enums.Cookie.subscriptionInfo, result);
    if (subscriptionContext) {
      subscriptionContext.setSubscriptionInfo(result);
    }
    return [result, ''];
  } else {
    return [null, subscription.Message];
  }
}

const applyVoucher = async (voucherCode, toast = null) => {
  return await Fetch.post({
    url: '/Company/ApplyVoucher',
    params: voucherCode,
    toastCtx: toast
  } as any);
};


const getTenantBillingDetails = async () => {
  const response = await Fetch.get({
    url: `/Billing/TenantBillingDetails`
  } as any);

  return response.Result as ManagerTenantBillingDetails | undefined;
};

const getUsage = async () => {
  const response = await Fetch.get({
    url: '/Billing/GetUsage'
  } as any);

  if (response.error || response.message || response.serverMessage) {
    throw new Error(response.error || response.message || response.serverMessage || 'Unexpected response from server');
  }

  if (response && response.Result) {
    return response.Result;
  }

  throw new Error('No data received');
};

const updateTenantBillingDetails = async (details: ManagerTenantBillingDetails, toastCtx: any) => {
  const response = await Fetch.put({
    url: `/Billing/TenantBillingDetails`,
    params: details,
    toastCtx: toastCtx
  } as any);

  return response?.Result as ManagerTenantBillingDetails | undefined;
};

const updateInvoiceCustomReference = async (invoiceID: string, customReference: string) => {
  const response = await Fetch.put({
    url: `/Billing/InvoiceCustomReference`,
    params: {
      InvoiceID: invoiceID,
      CustomReference: customReference
    }
  } as any);

  return response;
};

/// this method is 100% anonymous so it has to prelogin to get the correct url
const initDebitOrder = async (tenantID: string, forceNewPending: boolean | undefined) => {
  
  let apiUrlOverride = undefined;
  if (!config.isDebugging()) {

    let tenantCheck = await Fetch.preLogin({ tenantID: tenantID } as any);
    let tenant: any = null;
  
    if (tenantCheck.HttpStatusCode === 200 && tenantCheck.Results.length > 0) {
      tenant = tenantCheck.Results[0];
    }

    if (tenant) {
      apiUrlOverride = tenant.API;
    }
  }

  const response = await Fetch.get({
    url: `/Anon/InitialiseDebitOrder/${tenantID}/${helper.parseBool(forceNewPending)}`,
    apiUrlOverride: apiUrlOverride
  } as any);

  return response.Result as ManagerTenantDebitOrder | undefined;
};

export default {
  getSubcriptionInfo,
  applyVoucher,
  getTenantBillingDetails,
  updateTenantBillingDetails,
  updateInvoiceCustomReference,
  initDebitOrder,
  getUsage
};
