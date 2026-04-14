import SCModal from "@/PageComponents/Modal/SCModal";
import {FC} from "react";
import TransferAssetForm from "@/PageComponents/Inventory/TransferAssetForm";

const TransferAssetModal: FC<{
    show?: boolean
    onClose: () => void
    transferAsset?: any
    onAssetTransferred: (data: {
        Product: any,
        Customer: any,
        Contact: any,
        Location: any,
        reason: any,
    } | null) => void
    accessStatus: any
    job?: any
    module?: any,
    previousHeader?: string
}> = ({show, onClose, transferAsset, onAssetTransferred, job, module, accessStatus, previousHeader = "Go Back"}) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={previousHeader} onClose={onClose}
                 modalProps={{
                     closeOnClickOutside: false
                 }}
        >
            {
                show &&
                <TransferAssetForm
                    transferAsset={transferAsset}
                    onClose={onClose}
                    onAssetTransferred={onAssetTransferred}
                    job={job}
                    module={module}
                    accessStatus={accessStatus}
                />
            }

        </SCModal>
    );
}

export default TransferAssetModal;
