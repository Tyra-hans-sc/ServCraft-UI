import Fetch from '../utils/Fetch';
import Helper from '../utils/helper';
import Constants from '../utils/constants';
import * as Enums from '../utils/enums';

const getAttachment = async (id) => {
    const res = await Fetch.get({
        url: `/Attachment?id=${id}`,
    });
    if (res.ID) {
        return res;
    } else {
        throw new Error(res.serverMessage || res.message || 'Something went wrong');
    }
};

const getItemAttachments = async (itemID, excludeSignatures = true, context = null) => {
    const request = await Fetch.get({
      url: `/Attachment/GetItemAttachments?itemID=${itemID}&excludeSignatures=${excludeSignatures}`,
      ctx: context,
    });

    return {data: request.Results, total: request.TotalResults};
};

const searchAttachments = async (params) => {
    const request = await Fetch.post({
      url: `/Attachment/GetAttachments`,
      params,
    });

    if (request.Results) {
        return request;
    } else {
        throw new Error(request.serverMessage || request.message || 'Something went wrong');
    }
};

const getSignatures = async (itemID, context = null) => {
    const request = await Fetch.get({
        url: `/Attachment/GetItemAttachments?itemID=${itemID}&excludeSignatures=false`,
        ctx: context,
      });

      let customerSignature;    
      let technicianSignature;

      if (request && request.TotalResults > 0) {

        let customerSignatures = request.Results.filter(x => x.AttachmentType == Enums.AttachmentType.CustomerSignature);
        if (customerSignatures.length > 1) {
            customerSignatures = Helper.sortObjectArrayOnDate(customerSignatures, "ModifiedDate", true);
            customerSignature = customerSignatures[0];
        } else {
            customerSignature = request.Results.find(x => x.AttachmentType == Enums.AttachmentType.CustomerSignature);
        }
        
        let technicianSignatures = request.Results.filter(x => x.AttachmentType == Enums.AttachmentType.TechnicianSignature);
        if (technicianSignatures.length > 1) {
            technicianSignatures = Helper.sortObjectArrayOnDate(technicianSignatures, "ModifiedDate", true);
            technicianSignature = technicianSignatures[0];
        } else {
            technicianSignature = request.Results.find(x => x.AttachmentType == Enums.AttachmentType.TechnicianSignature);
        }
      }
  
      return {customerSignature, technicianSignature};
};

const getSignaturesCustomerZone = async (customerID, tenantID, api, itemID, context = null) => {
    const request = await Fetch.get({
        url: `/CustomerZone/GetItemAttachments?itemID=${itemID}&excludeSignatures=false`,
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });

    let customerSignature;    
    let technicianSignature;

    if (request && request.TotalResults > 0) {

        let customerSignatures = request.Results.filter(x => x.AttachmentType == Enums.AttachmentType.CustomerSignature);
        if (customerSignatures.length > 1) {
            customerSignatures = Helper.sortObjectArrayOnDate(customerSignatures, "ModifiedDate", true);
            customerSignature = customerSignatures[0];
        } else {
            customerSignature = request.Results.find(x => x.AttachmentType == Enums.AttachmentType.CustomerSignature);
        }
        
        let technicianSignatures = request.Results.filter(x => x.AttachmentType == Enums.AttachmentType.TechnicianSignature);
        if (technicianSignatures.length > 1) {
            technicianSignatures = Helper.sortObjectArrayOnDate(technicianSignatures, "ModifiedDate", true);
            technicianSignature = technicianSignatures[0];
        } else {
            technicianSignature = request.Results.find(x => x.AttachmentType == Enums.AttachmentType.TechnicianSignature);
        } 
    }

    return {customerSignature, technicianSignature};
};

const saveSignature = async (itemID, module, signature, isTechnician = false, context = null, toast = null) => {
    let id = Helper.newGuid();
    return await Fetch.post({
      url: '/Attachment',
      params: {
        AttachmentType: isTechnician ? Enums.AttachmentType.TechnicianSignature : Enums.AttachmentType.CustomerSignature,
        Description: isTechnician ? 'Technician Signature' : 'Customer Signature',
        FileName: `${id}.png`,
        FileBase64: signature,
        ItemID: itemID,
        Module: module,
        UserType: Enums.UserType.Employee,
        ContentType: 'image/png',
      },
      ctx: context,
      toastCtx: toast
    });
};

const saveSignatureCustomerZone = async (customerID, tenantID, api, itemID, module, signature, isTechnician = false, context = null, toast = null) => {
    let id = Helper.newGuid();
    return await Fetch.post({
        url: '/CustomerZone/SaveAttachment',
        params: {
            AttachmentType: isTechnician ? Enums.AttachmentType.TechnicianSignature : Enums.AttachmentType.CustomerSignature,
            Description: isTechnician ? 'Technician Signature' : 'Customer Signature',
            FileName: `${id}.png`,
            FileBase64: signature,
            ItemID: itemID,
            Module: module,
            UserType: Enums.UserType.Employee,
            ContentType: 'image/png',
        },
        ctx: context,
        toastCtx: toast,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });
};

const validateAttachment = async (fileBase64, fileUploadSize) => {

    let uploadLength = 2;

    if (fileUploadSize.Unit == 'kb') {
        uploadLength = fileBase64.length / 1024;
    } else if (fileUploadSize.Unit == 'mb') {
        uploadLength = fileBase64.length / 1024 / 1024;
    } else if (fileUploadSize.Unit == 'gb') {
        uploadLength = fileBase64.length / 1024 / 1024 / 1024;
    }

    // base64 converts 6bits to 8bits when encoding, so the actual file size is 3/4
    let scalingFactor = Constants.base64BitScalingFactor;
    uploadLength *= scalingFactor;

    if (uploadLength > parseFloat(fileUploadSize.Value)) {
        return false;
    }

    return true;
};

const saveAttachments = async (attachmentType, files, itemID, module, toast = null) => {
    return await Fetch.post({
        url: '/Attachment/SaveAttachments',
        params: {
            attachmentType,
            files,
            itemID,
            module,
        },
        toastCtx: toast,
        statusIfNull: true
    });
};

const updateAttachment = async (params, context = null) => {
    return await Fetch.put({
        url: `/Attachment`,
        params: params,
        ctx: context,
    })
}

const deleteAttachment = async (id, context = null) => {
    return await Fetch.destroy({
        url: `/Attachment?id=${id}`,
        ctx: context,
    });
};

const deleteAttachmentCustomerZone = async (customerID, tenantID, api, id, context = null) => {
    return await Fetch.destroy({
        url: `/CustomerZone/DeleteAttachment?id=${id}`,
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });
};

export default {
    getAttachment,
    searchAttachments,
    getItemAttachments,
    getSignatures,
    getSignaturesCustomerZone,
    saveSignature,
    saveSignatureCustomerZone,
    validateAttachment,
    saveAttachments,
    updateAttachment,
    deleteAttachment,
    deleteAttachmentCustomerZone,
};
