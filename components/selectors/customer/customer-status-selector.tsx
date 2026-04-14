import customerService from '@/services/customer/customer-service';
import { FC } from 'react';
import CustomerAttributeSelectorBase from './customer-attribute-selector-base';

const CustomerStatusSelector: FC<{
    selectedStatuses: any[]
    setSelectedStatuses: (statuses: any[]) => void
    label?: string
    inOutAsID: boolean
    disabled: boolean
    placeholder?: string
}> = ({label = "Customer Status", placeholder = "Select customer status", ...props}) => {


    return (<>

        <CustomerAttributeSelectorBase
            customerServiceGetMethod={customerService.getCustomerStatuses}
            label={label}
            selectedItems={props.selectedStatuses}
            setSelectedItems={props.setSelectedStatuses}
            inOutAsID={props.inOutAsID}
            disabled={props.disabled}
            placeholder={placeholder}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default CustomerStatusSelector;