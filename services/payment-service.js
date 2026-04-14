import Fetch from '../utils/Fetch';
import * as Enums from '../utils/enums';

const getPayNowLink = async (itemID, itemName, module, amount, tenantID, customerID, api) => {
    let app = window.location.origin;
    let view = module === Enums.Module.Quote ? "viewquote" : "viewinvoice";

    const url = await Fetch.get({
        url: `/CustomerZone/GetPayNowLink`,
        params: {
          itemID: itemID,
          itemName: encodeURIComponent(itemName),
          module: module,
          returnUrl: encodeURIComponent(`${app}/customerzone/${view}?t=${tenantID}&c=${customerID}&i=${itemID}`),
          cancelUrl: encodeURIComponent(`${app}/customerzone/${view}?t=${tenantID}&c=${customerID}&i=${itemID}`),
          notifyUrl: encodeURIComponent(`${api}/payfast/itn`),
          amount: amount
        },
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });
    return url;
};

export default {
    getPayNowLink,
};
