import Fetch from "../../utils/Fetch";

const getFormDataOptions = async ({formDefinitionMasterID, toastCtx}) => {
    const response = await Fetch.get({
        url: '/FormDefinition/GetFormDataOptions',
        params: {
            formDefinitionMasterID: formDefinitionMasterID
        },
        toastCtx: toastCtx
    })

    return response;
};

const getForm = async (id) => {
    const res = await Fetch.get({
        url: `/Form?id=${id}`,
    });
    if (res.ID) {
        return res;
    } else {
        throw new Error(res.serverMessage || res.message || 'Something went wrong');
    }
}


export default {
    getFormDataOptions,
    getForm
};