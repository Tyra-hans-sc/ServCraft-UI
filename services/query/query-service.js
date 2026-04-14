import Fetch from '../../utils/Fetch';

const getQueriesForCustomer = async (customerID, pageSize, pageIndex, searchPhrase, sortExpression, sortDirection, includeClosed, toast = null) => {
    let params = {
        pageSize: pageSize,
        pageIndex,
        searchPhrase,
        sortExpression,
        sortDirection,
        customerIDList: [customerID],
        includeClosed,
    };

    return await Fetch.post({
        url: '/Query/GetQueries',
        params: params,
        toastCtx: toast
    });
};

const getQuery = async (queryID, context = null, caller = null) => {
    return await Fetch.get({
        url: `/Query/${queryID}`,
        ctx: context,
        caller,
    });
};

const getCounts = async (queryID) => {
    let countRequest = await Fetch.get({
      url: `/Query/GetCounts?id=${queryID}`,
    });
    let result = countRequest.Results;
    let quoteCount = result.find(x => x.Key == 'Quotes').Value;
    let invoiceCount = result.find(x => x.Key == 'Invoices').Value;
    let puchaseOrderCount = result.find(x => x.Key == 'PurchaseOrders').Value;
    let appointmentCount = result.find(x => x.Key == 'Appointments').Value;
    let attachmentCount = result.find(x => x.Key == 'Attachments').Value;
    let communicationCount = result.find(x => x.Key == 'Communication').Value;
    let queryStatusChangesCount = result.find(x => x.Key == 'QueryStatusChanges')?.Value || 0;
    let jobCount = result.find(x => x.Key == 'Jobs').Value;

    return {quoteCount, invoiceCount, puchaseOrderCount, appointmentCount, attachmentCount, communicationCount, queryStatusChangesCount, jobCount};
};

const updateQuery = async (query, toast = null) => {
    return await Fetch.put({
        url: '/Query',
        params: {
          query
        },
        toastCtx: toast
    });
};

const closeQuery = async (queryID, toast = null) => {
    return await Fetch.get({
        url: '/Query/Close?id=' + queryID,
        toastCtx: toast
    });
};

const openQuery = async (queryID, toast = null) => {
    return await Fetch.get({
        url: '/Query/Open?id=' + queryID,
        toastCtx: toast
    });
};

const archiveQueryToggle = async (queryID, toast = null) => {
    return await Fetch.get({
        url: '/Query/Archive?id=' + queryID,
        toastCtx: toast
    });
};

export default {
    getQueriesForCustomer,
    getQuery,
    getCounts,
    updateQuery,
    closeQuery,
    openQuery,
    archiveQueryToggle,
};
