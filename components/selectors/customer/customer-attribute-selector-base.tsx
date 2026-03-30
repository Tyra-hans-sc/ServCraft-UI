import SCMultiSelect from '@/components/sc-controls/form-controls/sc-multiselect';
import { ResultResponse } from '@/interfaces/api/models';
import { FC, useEffect, useMemo, useState } from 'react';

const CustomerAttributeSelectorBase: FC<{
    selectedItems: any[]
    setSelectedItems: (groups: any[]) => void
    customerServiceGetMethod: () => Promise<ResultResponse<any>>
    label: string
    dataItemKey?: string
    textField?: string
    placeholder?: string
    inOutAsID: boolean
    disabled: boolean
}> = ({ dataItemKey = "ID", textField = "Description", ...props }) => {

    const [customerAttributeItems, setCustomerAttributeItems] = useState<any[]>([]);

    useEffect(() => {
        props.customerServiceGetMethod().then(groups => {
            setCustomerAttributeItems(groups.Results as any[]);
        });
    }, []);

    const onChange: any = (items: any[]) => {
        if (props.inOutAsID) {
            props.setSelectedItems(items.map(x => x.ID));
        }
        else {
            props.setSelectedItems(items);
        }
    }

    const selectedItems = useMemo(() => {
        if (customerAttributeItems.length === 0) return [];

        if (props.inOutAsID) {
            return customerAttributeItems.filter(x => props.selectedItems.includes(x.ID));
        }
        else {
            return props.selectedItems;
        }

    }, [props.selectedItems, customerAttributeItems]);

    return (<>

        <SCMultiSelect
            availableOptions={customerAttributeItems}
            selectedOptions={selectedItems}
            dataItemKey={dataItemKey}
            textField={textField}
            onChange={onChange}
            label={props.label}
            placeholder={props.placeholder}
            disabled={props.disabled}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default CustomerAttributeSelectorBase;