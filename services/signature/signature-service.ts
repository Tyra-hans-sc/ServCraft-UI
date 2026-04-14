import { NewSignatureRequest, SignatureSaveRequest } from "@/interfaces/internal/models";
import { Signature, ResultResponse, SignatureTemplate } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";

const getSignature: (id: string) => Promise<Signature> = async (id: string) => {
    const signature = await Fetch.get({
        url: `/Signature/${id}`
    } as any) as Signature;

    return signature;
}

const newSignature: (params: NewSignatureRequest) => Promise<Signature> = async (params: NewSignatureRequest) => {
    const signature = await Fetch.post({
        url: `/Signature`,
        params: params
    } as any) as Signature;

    return signature;
};

const saveSignature: (signatureSaveRequest: SignatureSaveRequest) => Promise<Signature> = async (signatureSaveRequest: SignatureSaveRequest) => {
    const signature = await Fetch.put({
        url: `/Signature`,
        params: signatureSaveRequest
    } as any) as Signature;

    return signature;
};

const saveSignatureTemplate: (signatureTemplate: SignatureTemplate, isNew: boolean, toastCtx?: any) => Promise<SignatureTemplate> = async (signatureTemplate: SignatureTemplate, isNew: boolean, toastCtx: any) => {

    let submitObj = {
        url: `/Signature/Template`,
        params: {
            SignatureTemplate: signatureTemplate
        },
        toastCtx: toastCtx
    } as any;

    const signatureTemp = isNew ? await Fetch.post(submitObj)
        : await Fetch.put(submitObj);

    return signatureTemp as SignatureTemplate;
};

const getSignatureTenantZone: (id: string, tenantID: string, api: string, context?: any) => Promise<Signature> = async (id, tenantID, api, context = null) => {
    const signature = await Fetch.get({
        url: `/TenantZone/Signature/${id}`,
        ctx: context,
        tenantID: tenantID,
        apiUrlOverride: api
    } as any) as Signature;

    return signature;
}

const saveSignatureTenantZone: (signatureSaveRequest: SignatureSaveRequest, tenantID: string, api: string, context?: any, toast?: any) => Promise<Signature> = async (signatureSaveRequest: SignatureSaveRequest, tenantID, api, context = null, toast = null) => {
    const signature = await Fetch.put({
        url: `/TenantZone/Signature`,
        params: signatureSaveRequest,
        ctx: context,
        tenantID: tenantID,
        apiUrlOverride: api,
        toastCtx: toast
    } as any) as Signature;

    return signature;
};

const getSignatureTemplate: (id: string) => Promise<SignatureTemplate | null> = async (id) => {
    const signatureTemplate = await Fetch.get({
        url: `/Signature/Template/${id}`
    } as any) as SignatureTemplate | null;

    return signatureTemplate;
};

const getLinkedItemsForSignatureTemplate: (id: string) => Promise<{Module: string, Description: string, ExtraInfo?: string}[]> = async (id) => {
    const linkedItems = await Fetch.get({
        url: `/Signature/Template/LinkedItems/${id}`
    } as any) as ResultResponse<{Module: string, Description: string, ExtraInfo?: string}>;

    return linkedItems.Results as {Module: string, Description: string, ExtraInfo?: string}[];
};

/**
 * Just for testing!!!
 *
 * @returns array of signature
 */
const getSignatures: () => Promise<Signature[]> = async () => {
    const signatures = await Fetch.get({
        url: `/Signature`
    } as any) as ResultResponse<Signature>;

    return signatures.Results as Signature[];
};

const getSignatureTemplates: () => Promise<SignatureTemplate[]> = async () => {
    const signatureTemplates = await Fetch.get({
        url: `/Signature/Template`
    } as any) as ResultResponse<SignatureTemplate>;

    return signatureTemplates.Results as SignatureTemplate[];
};


export default {
    getSignature,
    newSignature,
    getSignatures,
    saveSignature,
    getSignatureTenantZone,
    saveSignatureTenantZone,
    getSignatureTemplates,
    getSignatureTemplate,
    saveSignatureTemplate,
    getLinkedItemsForSignatureTemplate
}