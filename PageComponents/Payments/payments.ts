import Fetch from "@/utils/Fetch";
import Storage from "@/utils/storage";
import * as Enums from "@/utils/enums";

export interface Payment {
    Amount: number
    Comment: string
    CreatedBy: string
    CreatedDate: string
    Customer: null
    CustomerID: string
    Fee: number
    ID: string
    Invoice: any
    InvoiceID: string | null
    IsActive: boolean
    ModifiedBy: string
    ModifiedDate: string
    PaymentDate: string
    PaymentStatus: string
    Quote: null
    QuoteID: string | null
    QuoteNumber: string | null
    InvoiceNumber: string | null
    Reference: string
    RowVersion: string
}

// modify to restrict payment feature access to specific tenants
const paymentAccessWhiteList: string[] = []
const paymentAccessBlackList: string[] = []
export const getPaymentAccess = (tenantId?: string) => {
    let id = tenantId ?? Storage.getCookie(Enums.Cookie.tenantID)
    return (paymentAccessWhiteList.length === 0 || paymentAccessWhiteList.includes(id)) && !paymentAccessBlackList.includes(id)
}

export const getCustomerPayments = async (customerId) => Fetch.get({url: `/Payment/GetCustomerPayments?customerID=${customerId}`} as any)
export const getItemPayments = async (itemId, module) => Fetch.get({url: `/Payment/GetItemPayments?itemID=${itemId}&module=${module}`} as any)
export const getCustomerZoneItemPayments = async (itemId, module, tenantID, customerID, apiUrl) => Fetch.get(
    {
        url: `/CustomerZone/GetItemPayments?itemID=${itemId}&module=${module}`,
        tenantID,
        customerID,
        apiUrlOverride: apiUrl
    } as any
)

export const postPayment = async (payload: {Payment: Payment}) => {
    const res = await Fetch.post({
        url: '/Payment',
        params: payload
    } as any)

    if (!!res.Payment) {
        return res
    } else {
        throw new Error( res.Message || res.message || res.serverMessage || '' )
    }
}
