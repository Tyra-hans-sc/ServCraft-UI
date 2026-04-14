import Fetch from '../../utils/Fetch';

const createReferral = async (referral, toast = null) => {
    return await Fetch.post({
        url: '/Company/CreateReferral',
        params: referral,
        toastCtx: toast
    });
};

export default {
    createReferral,
}
