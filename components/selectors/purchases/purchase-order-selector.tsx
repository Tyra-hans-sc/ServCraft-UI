import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import { ReplaceWithModel } from '@/interfaces/api/models';
import Fetch from '@/utils/Fetch';
import { FC, useEffect } from 'react';
import * as Enums from '@/utils/enums';

const PurchaseOrderSelector: FC<{
    selectedPurchaseOrder: ReplaceWithModel
    setSelectedPurchaseOrder: (purchaseOrder: ReplaceWithModel) => void
    supplierID?: string
    canClear?: boolean
    disabled?: boolean
    label?: string
    required?: boolean
    error?: string
    placeholder?: string
    readOnly?: boolean
    title?: string
    hideFullyReceived?: boolean
}> = ({ selectedPurchaseOrder, setSelectedPurchaseOrder, supplierID, canClear = true, disabled = false, label = "Purchase Order", required = false,
    error, placeholder = "Select purchase order", readOnly = false, ...others }) => {

        const searchPurchaseOrders = async (skipIndex, take, filter) => {
            const inventory = await Fetch.post({
                url: `/PurchaseOrder/GetPurchaseOrders`,
                params: {
                    pageSize: take,
                    pageIndex: skipIndex,
                    searchPhrase: filter,
                    SortExpression: "",
                    SortDirection: "",
                    SupplierIDList: supplierID ? [supplierID] : [],
                    HideFullyReceived: others.hideFullyReceived === true,
                    PurchaseOrderStatusIDList: [
                        Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Approved, false),
                        Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Billed, false)
                    ]
                }
            });

            return { data: inventory.Results, total: inventory.TotalResults };
        };

        return (<>

            <SCComboBox
                value={selectedPurchaseOrder}
                dataItemKey='ID'
                textField='PurchaseOrderNumber'
                canClear={canClear}
                cascadeDependency={supplierID}
                cascadeDependencyKey={"SupplierID"}
                canSearch={true}
                disabled={disabled}
                label={label}
                getOptions={searchPurchaseOrders}
                onChange={setSelectedPurchaseOrder}
                required={required}
                error={error}
                placeholder={placeholder}
                readOnly={readOnly}
                title={others.title}
            />

            <style jsx>{`
            
        `}</style>
        </>);
    };

export default PurchaseOrderSelector;