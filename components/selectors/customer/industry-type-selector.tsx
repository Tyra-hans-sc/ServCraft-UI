import customerService from '@/services/customer/customer-service';
import { FC } from 'react';
import CustomerAttributeSelectorBase from './customer-attribute-selector-base';

const IndustryTypeSelector: FC<{
    selectedTypes: any[]
    setSelectedTypes: (types: any[]) => void
    label?: string
    inOutAsID: boolean
    disabled: boolean
    placeholder?: string
}> = ({label = "Industry Type", placeholder = "Select industry type", ...props}) => {


    return (<>

        <CustomerAttributeSelectorBase
            customerServiceGetMethod={customerService.getIndustryTypes}
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

export default IndustryTypeSelector;