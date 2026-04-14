//import fetch from 'isomorphic-unfetch';
import { auth, nextCookieContents, getApiHost, logout } from './auth';
import config from './config';
import Helper from "./helper";
import * as Enums from './enums';
import Storage from './storage';

async function request(url, params, method, ctx, toastCtx, czTenantID, czCustomerID, apiUrlOverride, caller, signal, statusIfNull) {

  const https = require("https");

  const getAgent = () => {
    let agent = new https.Agent({
      rejectUnauthorized: !config.isDebugging()
    });
    return agent;
  };

  const options: any = {
    method,
    headers: getHeaders(),
    agent: getAgent(),
    signal: signal // abort signal
  };

  if (params) {
    if (method === 'GET') {
      url += '?' + Helper.objectToQueryString(params);
    } else {
      //console.log(params);
      options.body = JSON.stringify(params);
    }
  }

  function getHeaders() {
    let path = "";
    if (typeof window !== "undefined") {
      path = window.location.href;
    } else if (ctx) {
      path = ctx.req.headers.referer;
    }

    caller = caller ? caller : "";

    if (czTenantID && !czCustomerID) {
      return {
        'cache': 'no-store',
        'tenantid': czTenantID,
        'Content-Type': 'application/json',
        'location': path,
        'caller': caller
      };
    } else if (czTenantID && czCustomerID) {
      return {
        'cache': 'no-store',
        'tenantid': czTenantID,
        'customerid': czCustomerID,
        'Content-Type': 'application/json',
        'location': path,
        'caller': caller
      };
    } else {
      const localToken = Storage.getCookie(Enums.Cookie.token);
      const localTenantID = Storage.getCookie(Enums.Cookie.tenantID);
      const localDeviceID = Storage.getCookie(Enums.Cookie.fingerPrint);
      const { token, tenantID, fingerPrint } = ctx ? auth(ctx) : { token: localToken, tenantID: localTenantID, fingerPrint: localDeviceID };

      return {
        'cache': 'no-store',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'tenantid': tenantID,
        'deviceid': fingerPrint,
        'location': path,
        'caller': caller
      };
    }
  }

  let apiHost = getApiHost(ctx, apiUrlOverride);

  const response = await fetch(apiHost + url, options as any)
    .catch(e => {
      let eString = e?.toString() ?? "";

      if (eString.indexOf("reason: getaddrinfo ENOTFOUND") > -1) {
        logout(true, ctx, "Server unavailable, retry login");
      }

      throw e;
    });

  if (response.status === 401) {
    let logoutMessage = await response.text();
    logout(true, ctx, logoutMessage);
    return { ResponseStatus: response.status, Results: [], Result: {}, TotalResults: 0 };
  }

  if (response.status !== 200 && response.status !== 204) {

    let serverMessage: string | null = null;
    try {
      serverMessage = await response.text();
    } catch { }

    // Try to parse serverMessage if it contains JSON (common API error envelope)
    const parsed = Helper.parseString(serverMessage);

    if (toastCtx) {
      toastCtx.setToast({
        message: parsed?.Message
          ? parsed.Message
          : (serverMessage ? serverMessage : 'The server responded with an unexpected status. (' + response.status + ')'),
        show: true,
        type: 'error'
      })
    }

    const errObj: any = {
      status: response.status,
      message: 'The server responded with an unexpected status. (' + response.status + ')',
      serverMessage: serverMessage
    };

    // Promote known fields from parsed server error so callers can rely on them
    if (parsed && typeof parsed === 'object') {
      if (parsed.HttpStatusCode !== undefined) errObj.HttpStatusCode = parsed.HttpStatusCode;
      if (parsed.Message !== undefined) errObj.Message = parsed.Message;
      if (parsed.ResponseStatus !== undefined) errObj.ResponseStatus = parsed.ResponseStatus;
      if (parsed.TotalResults !== undefined) errObj.TotalResults = parsed.TotalResults;
      if (parsed.ReturnedResults !== undefined) errObj.ReturnedResults = parsed.ReturnedResults;
      if (parsed.Results !== undefined) errObj.Results = parsed.Results;
      if (parsed.Result !== undefined) errObj.Result = parsed.Result;
      if (parsed.Metadata !== undefined) errObj.Metadata = parsed.Metadata;
    }

    return errObj;
  }

  const data = response.status === 204 ? "" : await response.text();
  let json = Helper.parseString(data);
  if (statusIfNull && !!!json) {
    json = {
      ResponseStatus: response.status
    };
  }

  const keys = json ? Object.keys(json) : [];
  if (keys.includes("headerTenantName") && keys.includes("data")) {
    // need to clean up the response and append headerTenantName to the data object
    let newJson = json.data;
    if (!!newJson && typeof newJson === "object") newJson.headerTenantName = json.headerTenantName;
    json = newJson;
  }

  if (json && json.SubscriptionInfo !== undefined && json.SubscriptionInfo !== null) {
    Storage.setCookie(Enums.Cookie.subscriptionInfo, json.SubscriptionInfo);
  }

  // if (options.headers.tenantid) {
  //   if (json) {
  //     let receivedTenantID = null;
  //     if (json.TenantID) receivedTenantID = json.TenantID;
  //     else if (json.Result && json.Result.TenantID) receivedTenantID = json.Result.TenantID;
  //     else if (json.Results && json.Results.length > 0 && json.Results[0].TenantID) receivedTenantID = json.Results[0].TenantID;

  //     if (!Helper.isNullOrWhitespace(receivedTenantID) && receivedTenantID !== Helper.emptyGuid() && options.headers.tenantid.toLowerCase() !== receivedTenantID.toLowerCase()) {
  //       // we have a tenantid mismatch
  //       json = { ResponseStatus: "Something went wrong" };
  //       // alert server of this issue
  //       await request('/Logging', { message: `TenantID mismatch ${options.headers.tenantid} ${receivedTenantID}` }, "POST",
  //         ctx, toastCtx, czTenantID, czCustomerID, apiUrlOverride);
  //     }
  //   }
  // }

  return json;
}

interface RequestObject {
  url: string
  params?: any
  ctx?: any
  toastCtx?: any
  tenantID?: string
  customerID?: string
  apiUrlOverride?: string
  caller?: string
  signal?: any
  statusIfNull?: boolean
}

function get({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull = false }: RequestObject) {
  return request(url, params, 'GET', ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull);
}

function post({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull = false }: RequestObject) {
  return request(url, params, 'POST', ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull);
}

function put({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull = false }: RequestObject) {
  return request(url, params, 'PUT', ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull);
}

function destroy({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull = false }: RequestObject) {
  return request(url, params, 'DELETE', ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal, statusIfNull);
}

async function preLogin({ userName, password, tenantID, managerServCraftLoginCredentials, toastCtx }) {

  const https = require("https");

  const opts = {
    method: "POST",
    body: JSON.stringify({
      userName,
      password,
      customerID: tenantID,
      managerServCraftLoginCredentials: managerServCraftLoginCredentials
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    agent: new https.Agent({
      rejectUnauthorized: !config.isDebuggingManager()
    })
  };

  const response = await fetch(config.managerHost + "/Authentication/PreLogin", opts);

  if (response.status === 401) {
    logout(true);
  }

  if (response.status !== 200) {
    if (toastCtx) {
      toastCtx.setToast({
        message: 'The server responded with an unexpected status. (' + response.status + ')',
        show: true,
        type: 'error'
      })
    }

    return {
      status: response.status,
      message: 'The server responded with an unexpected status. (' + response.status + ')'
    };
  }

  const data = await response.text();
  const json = (data.length ? JSON.parse(data) : { ResponseStatus: response.status });

  return json;
}



// const generic_ObjectToQueryString = (obj, encodeUri = false) => {
//   return Object.keys(obj).map(key => key + '=' + (encodeUri === true ? encodeURIComponent(obj[key]) : obj[key])).join('&');
// }

// const generic_GetOrigin = () => {
//   // let origin = window ? window.location.origin : "";
//   // if (origin === "file://") {
//   //     origin = "http://test.com";
//   // }
//   return "";
// };

// const generic_Request = async (url, params, method, key) => {

//   const getHeaders = () => {

//       return {
//           servcraftorigin: generic_GetOrigin(),
//           servcraftkey: key
//       };
//   }

//   const options = {
//       method,
//       headers: getHeaders()
//   };

//   if (params) {
//       if (method === 'GET') {
//           url += '?' + generic_ObjectToQueryString(params, true);
//       } else {
//           options.body = JSON.stringify(params);
//       }
//   }

//   let response = null;

//   try {
//       response = await fetch(url, options);
//   } catch (error) {
//       return {
//           status: -1,
//           message: `Try Catch ${error}`,
//           serverMessage: "Fail",
//           data: null
//       }
//   }

//   if (response.status !== 200) {

//       let serverMessage = null;
//       try {
//           serverMessage = await response.text();
//       } catch { }

//       return {
//           status: response.status,
//           message: `The server responded with an unexpected status. (${response.status})`,
//           serverMessage: serverMessage,
//           data: null
//       };
//   }

//   const data = await response.text();
//   const json = data.length ? JSON.parse(data) : null;

//   return {
//       status: response.status,
//       message: `Success ${response.status}`,
//       serverMessage: "Success",
//       data: json
//   };
// };

// const generic_Get = async (url, params, key) => {
//   return await generic_Request(url, params, "GET", key);
// };

// const generic_Post = async (url, params, key) => {
//   return await generic_Request(url, params, "POST", key);
// };



export default {
  get,
  post,
  put,
  destroy,
  preLogin,
  // generic_Post,
  // generic_Get
};
