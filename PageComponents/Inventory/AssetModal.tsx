import {Button, Group} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import {FC} from "react";
import CreateNewSupplierForm, {SupplierResponse} from "@/PageComponents/Inventory/CreateNewSupplierForm";
import AssetForm from "@/PageComponents/Inventory/AssetForm";

const AssetModal: FC<{
    show?: boolean
    onClose: () => void
    editAsset?: any
    assetCreated: (data: any) => void
    accessStatus: any
    job?: any,
    previousHeader?: string
}> = ({show, onClose, editAsset, assetCreated, job, previousHeader = "Go Back"}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={previousHeader} onClose={onClose}
                 modalProps={{
                     closeOnClickOutside: false
                 }}
        >

            <AssetForm editAsset={editAsset} onClose={onClose} assetCreated={assetCreated} job={job}
                                   // assetCreatedAndCopied={!editAsset && (() => {}) || undefined}
            />

        </SCModal>
    );
}

export default AssetModal;
