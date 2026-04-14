import Fetch from "../utils/Fetch";

export default function useFetch() {

    let controller = new AbortController();
    let { signal } = controller;

    let fetchObj = {
        get: ({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller }) => {
            return Fetch.get({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal });
        },
        post: ({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller }) => {
            return Fetch.post({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal });
        },
        put: ({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller }) => {
            return Fetch.put({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal });
        },
        destroy: ({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller }) => {
            return Fetch.destroy({ url, params, ctx, toastCtx, tenantID, customerID, apiUrlOverride, caller, signal });
        }
    };

    let cancel = () => {
        controller.abort();
    };

    return [fetchObj, cancel];
};



  //// logic to abort requests
  // const controller = new AbortController();
  // const {signal} = controller;
  // options.signal = signal;
  // controller.abort();