import {Button, Group} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import {FC} from "react";
import CreateNewSupplierForm, {SupplierResponse} from "@/PageComponents/Inventory/CreateNewSupplierForm";

const CreateNewSupplierModal: FC<{
    show?: boolean
    onClose: () => void
    supplierCreated: (data: SupplierResponse) => void
    supplier: any
    isNew: boolean,
    backButtonText?: string
}> = ({show, onClose, supplierCreated, supplier, isNew = true, backButtonText}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={backButtonText} onClose={onClose}
                 modalProps={{
                     closeOnClickOutside: false
                 }}
        >
            <CreateNewSupplierForm supplier={supplier} isNew={isNew} onClose={onClose} supplierCreated={supplierCreated} />
        </SCModal>
    );
}

export default CreateNewSupplierModal;
