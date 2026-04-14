import SCModal from "@/PageComponents/Modal/SCModal";
import { FC } from "react";
import CreateNewUnitForm, { UnitResponse } from "./CreateNewUnitForm";

const CreateNewUnitModal: FC<{
    show?: boolean
    onClose: () => void
    unitCreated: (data: UnitResponse) => void
    unit: any
    isNew: boolean,
    backButtonText?: string
}> = ({ show, onClose, unitCreated, unit, isNew = true, backButtonText }) => {
    return (
        <SCModal open={show || typeof show === 'undefined'} decor={'none'} size={'lg'} headerSectionBackButtonText={backButtonText} onClose={onClose}
            modalProps={{
                closeOnClickOutside: false
            }}
        >
            <CreateNewUnitForm unit={unit} isNew={isNew} onClose={onClose} unitCreated={unitCreated} />
        </SCModal>
    );
}

export default CreateNewUnitModal;
