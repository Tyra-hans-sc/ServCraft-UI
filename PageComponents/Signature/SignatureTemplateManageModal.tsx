import SCModal from '@/PageComponents/Modal/SCModal';
import { FC, useEffect, useState } from 'react';
import SignatureTemplateManageComponent from './SignatureTemplateManageComponent';
import helper from '@/utils/helper';
import ConfirmAction from '@/components/modals/confirm-action';
import { SignatureTemplate } from '@/interfaces/api/models';

const SignatureTemplateManageModal: FC<{
    show?: boolean
    onClose?: () => void
    id?: string
    onChange?: (signatureTemplate: SignatureTemplate | null) => void
    onSave?: (signatureTemplate: SignatureTemplate) => void
}> = ({ show, onClose, id, onChange, onSave }) => {

    const [signatureTemplate, setSignatureTemplate] = useState<SignatureTemplate | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState({ ...helper.initialiseConfirmOptions() });

    helper.preventRouteChange(isDirty, setIsDirty, setConfirmOptions, null);

    useEffect(() => {
        onChange && onChange(signatureTemplate);
    }, [signatureTemplate]);

    return (<>

        <SCModal
            open={typeof show === 'undefined' || show}
            onClose={onClose}
            size={'xl'}
        >
            <SignatureTemplateManageComponent
                id={id}
                dirtyChanged={setIsDirty}
                onCancel={onClose}
                onChange={setSignatureTemplate}
                onSave={onSave}
            />
        </SCModal>

        <ConfirmAction
            key={"signatureTemplateManageModal_ConfirmAction"}
            options={confirmOptions}
            setOptions={setConfirmOptions}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default SignatureTemplateManageModal;