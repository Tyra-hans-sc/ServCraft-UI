import { ResultResponse } from '@/interfaces/api/models';
import Fetch from '../../utils/Fetch';

const getInvoice = async (id) => {
    let invoice = await Fetch.get({
        url: `/Invoice/${id}`
    } as any)
    return invoice
};

const markInvoiceStockAsUsed = async (id, toastCtx) => {
    let result = await Fetch.post({
        url: `/Invoice/MarkInvoiceStockAsUsed?invoiceID=${id}`,
        toastCtx: toastCtx
    });

    return result;
};

const compareJobInventory = async (invoice, invoiceItems, toastCtx) => {
    let result = await Fetch.post({
        url: `/Invoice/CompareJobInventory`,
        params: {
            Invoice: invoice,
            InvoiceItems: invoiceItems
        },
        toastCtx: toastCtx
    });

    return result;
}

export default {
    getInvoice,
    markInvoiceStockAsUsed,
    compareJobInventory
};
