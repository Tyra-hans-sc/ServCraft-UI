import Fetch from '../utils/Fetch';

const getFeedbackList = async (itemID, module, context = null) => {
    let request = await Fetch.post({
        url: '/Feedback/GetFeedback',
        params: {
          itemID,
          module
        },
        ctx: context
    });

    return {data: request.Results, total: request.TotalResults};
};

const getFeedbackListCustomerZone = async (tenantID, customerID, api, itemID, module, context = null) => {
    let request = await Fetch.post({
        url: '/CustomerZone/GetFeedback',
        params: {
          itemID,
          module
        },
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api
    });

    return {data: request.Results, total: request.TotalResults};
};

const hasFeedbackForTenant = async (context = null) => {
    let request = await Fetch.get({
        url: '/Feedback/FeedbackForTenant',
        ctx: context
    });
    return request ? true : false;
};

const getFeedbackByItemIDCustomerZone = async (itemID, tenantID, customerID, api, context = null) => {
    return await Fetch.get({
        url: '/CustomerZone/FeedbackGetByItemID',
        params: {
            itemID,
        },
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api
    });
};

const saveFeedbackCustomerZone = async (feedback, tenantID, customerID, api, context = null) => {
    let result = await Fetch.put({
        url: '/CustomerZone/FeedbackPut',
        params: feedback,
        ctx: context,        
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api
    });

    return result;
};

export default {
    getFeedbackList,
    getFeedbackListCustomerZone,
    hasFeedbackForTenant,
    getFeedbackByItemIDCustomerZone,
    saveFeedbackCustomerZone,
};
