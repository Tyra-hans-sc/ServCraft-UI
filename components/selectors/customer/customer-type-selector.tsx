import customerService from '@/services/customer/customer-service';
import { FC } from 'react';
import CustomerAttributeSelectorBase from './customer-attribute-selector-base';

const CustomerTypeSelector: FC<{
    selectedTypes: any[]
    setSelectedTypes: (types: any[]) => void
    label?: string
    inOutAsID: boolean
    disabled: boolean
    placeholder?: string
}> = ({label = "Customer Type", placeholder = "Select customer type", ...props}) => {


    return (<>

        <CustomerAttributeSelectorBase
            customerServiceGetMethod={customerService.getCustomerTypes}
            label={label}
            selectedItems={props.selectedTypes}
            setSelectedItems={props.setSelectedTypes}
            inOutAsID={props.inOutAsID}
            disabled={props.disabled}
            placeholder={placeholder}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default CustomerTypeSelector;