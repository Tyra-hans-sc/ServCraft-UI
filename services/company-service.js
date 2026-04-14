import Fetch from '../utils/Fetch';

const getCompany = async (context = null) => {
    return await Fetch.get({
        url: '/Company',
        ctx: context,
    });
};

const getCustomerZoneCompany = async (tenantID, customerID, api, context = null) => {
    return await Fetch.get({
        url: '/CustomerZone/Company',
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api
    });
};

const saveCompany = async (company, toast = null) => {
    return await Fetch.put({
        url: '/Company',
        params: company,
        toastCtx: toast
    });
};

const getCurrencies = async (context = null) => {
    return await Fetch.get({
        url: `/Company/GetCurrencies`,
        ctx: context,
    });
};

const getCurrencySymbol = async (context = null) => {
    const company = await getCompany(context);
    return company.Currency ? company.Currency.Symbol : '';
};

const getCustomerZoneCurrencySymbol = async (tenantID, customerID, api, context = null) => {
    const company = await getCustomerZoneCompany(tenantID, customerID, api, context);
    return company.Currency ? company.Currency.Symbol : '';
};

export default {
    getCompany,
    getCustomerZoneCompany,
    saveCompany,
    getCurrencies,
    getCurrencySymbol,
    getCustomerZoneCurrencySymbol,
};
