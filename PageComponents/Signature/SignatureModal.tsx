import { FC } from 'react';
import SignatureComponent from './SignatureComponent';
import { NewSignatureRequest } from '@/interfaces/internal/models';
import LegacyModal from '@/components/sc-controls/layout/sc-modal';
import { Signature } from '@/interfaces/api/models';
import SCModal from "@/PageComponents/Modal/SCModal";
import { Space } from '@mantine/core';

const SignatureModal: FC<{
    id?: string
    request?: NewSignatureRequest
    storeID?: string | null
    title: string
    onDismiss?: () => void
    onUpdate: (signature: Signature) => void
}> = ({ id, request, title = "Signatures", onDismiss, storeID = null, onUpdate }) => {
    
    return (<>

        <SCModal
            open
            onClose={onDismiss}
            withCloseButton
            size={'auto'}
        >
            <Space h={15} />
            <SignatureComponent
                id={id}
                request={request}
                storeID={storeID}
                onUpdate={onUpdate}
            />
        </SCModal>
        {/*<LegacyModal
            onDismiss={onDismiss}
            title={title}
            minWidth='none'
        >
        </LegacyModal>*/}
    </>);
};

export default SignatureModal;
