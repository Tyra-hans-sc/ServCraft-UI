import {Button, Group} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import CreateNewCategoryForm from "@/PageComponents/Inventory/CreateNewCategoryForm";
import {FC} from "react";

const CreateNewCategoryModal: FC<{
    show?: boolean
    backButtonText?: string
    onClose: () => void
    inventoryCategoryCreated: (data: any) => void
}> = ({show, onClose, inventoryCategoryCreated, backButtonText}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={backButtonText} onClose={onClose}>
            <CreateNewCategoryForm isNew onCancel={onClose} inventoryCategoryCreated={inventoryCategoryCreated} />
        </SCModal>
    );
}

export default CreateNewCategoryModal;
