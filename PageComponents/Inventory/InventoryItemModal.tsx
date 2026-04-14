import SCModal from "@/PageComponents/Modal/SCModal";
import InventoryItemForm from "@/PageComponents/Inventory/InventoryItemForm";
import {FC} from "react";

const InventoryItemModal: FC<{
    show?: boolean
    isNew?: boolean
    inventory?: any
    onInventorySave: (data) => void
    onClose: () => void
    accessStatus: any
    isService?: boolean
    backLabel?: string
}> = ({onInventorySave, onClose, show, backLabel, ...others}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'}
                 decor={'none'}
                 size={'lg'}
                 headerSectionBackButtonText={backLabel || 'Add Item'}
                 onClose={onClose}
                 modalProps={{
                     closeOnClickOutside: false
                 }}
        >
            <InventoryItemForm onInventorySaved={onInventorySave} onClose={onClose} {...others} />
        </SCModal>
    );
}

export default InventoryItemModal;
