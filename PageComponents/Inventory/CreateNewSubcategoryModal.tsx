import {Button, Group} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import {FC} from "react";
import CreateNewSubcategoryForm, {SubcategoryFormProps} from "@/PageComponents/Inventory/CreateNewSubcategoryForm";

const CreateNewSubcategoryModal: FC<{
    show?: boolean,
    backButtonText?: string
} & SubcategoryFormProps> = ({show, onClose, inventorySubcategoryCreated, defaultInventoryCategory, backButtonText}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={backButtonText} onClose={onClose}
                 modalProps={{
                     closeOnClickOutside: false
                 }}
        >
            <CreateNewSubcategoryForm defaultInventoryCategory={defaultInventoryCategory} isNew onClose={onClose} inventorySubcategoryCreated={inventorySubcategoryCreated} />
        </SCModal>
    );
}

export default CreateNewSubcategoryModal;
