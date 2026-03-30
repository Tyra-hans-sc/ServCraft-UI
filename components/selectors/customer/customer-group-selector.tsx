import customerService from '@/services/customer/customer-service';
import { FC } from 'react';
import CustomerAttributeSelectorBase from './customer-attribute-selector-base';

const CustomerGroupSelector: FC<{
    selectedGroups: any[]
    setSelectedGroups: (groups: any[]) => void
    label?: string
    inOutAsID: boolean
    disabled: boolean
}> = ({label = "Customer Group", ...props}) => {


    return (<>

        <CustomerAttributeSelectorBase
            customerServiceGetMethod={customerService.getCustomerGroups}
            label={label}
            selectedItems={props.selectedGroups}
            setSelectedItems={props.setSelectedGroups}
            inOutAsID={props.inOutAsID}
            disabled={props.disabled}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default CustomerGroupSelector;