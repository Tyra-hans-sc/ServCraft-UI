import Fetch from "@/utils/Fetch";

const getBundle = async (id: string, toastCtx?: any, ctx?: any) => {
    const bundle = await Fetch.get({
        url: `/Bundle?id=${id}`,
        toastCtx: toastCtx,
        ctx: ctx
    } as any);

    return bundle;
};

const saveBundle = async (bundle: any, toastCtx?: any) => {
    const bundleAsResult = await Fetch.post({
        url: `/Bundle`,
        params: {
            Bundle: bundle
        },
        toastCtx: toastCtx
    } as any);

    return bundleAsResult;
};

const GetBundlesCanCreate = async (toastCtx?: any) => {
    const response = await Fetch.get({
        url: `/Bundle/GetBundlesCanCreate`,
        toastCtx: toastCtx
    } as any);

    return response as { CanCreate: boolean, Count: number, MaxCount: number};
};

export default {
    getBundle,
    saveBundle,
    GetBundlesCanCreate
};