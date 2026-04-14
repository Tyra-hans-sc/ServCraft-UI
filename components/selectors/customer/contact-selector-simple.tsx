import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import Fetch from '@/utils/Fetch';
import { FC } from 'react';

const ContactSelectorSimple: FC<{
    selectedContact: any
    setSelectedContact: (contact: any) => void
    customerID?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    error?: string
    canClear?: boolean
}> = ({
    selectedContact,
    setSelectedContact,
    customerID,
    label = "Contact",
    placeholder = "Choose contact...",
    disabled = false,
    readOnly = false,
    required = false,
    error,
    canClear = true
}) => {

        const searchContactsSC = async (skipIndex, take, filter) => {

            const contactList = await Fetch.post({
                url: `/Contact/GetContacts`,
                params: {
                    pageSize: take,
                    pageIndex: skipIndex,
                    searchPhrase: filter,
                    sortExpression: "",
                    sortDirection: "",
                    isActive: true,
                    customerID: customerID ?? null,
                }
            } as any);

            return { data: contactList.Results, total: contactList.TotalResults };
        };

        const handleContactChangeSC = (contact) => {
            setSelectedContact(contact);
        };


        return (<>

            <SCComboBox
                onChange={handleContactChangeSC}
                error={error}
                label={label}
                getOptions={searchContactsSC}
                placeholder={placeholder}
                required={required}
                value={selectedContact}
                disabled={disabled}
                readOnly={readOnly}
                dataItemKey="ID"
                textField="FullName"
                cascadeDependency={customerID}
                name="contact-selector-simple"
                canClear={canClear}
            />

            <style jsx>{`
            
        `}</style>
        </>);
    };

export default ContactSelectorSimple;