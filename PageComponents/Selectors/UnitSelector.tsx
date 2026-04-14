import { FC, useState } from "react";
import {ComboboxProps, InputBaseProps, MantineSize, TextInputProps} from "@mantine/core";
import Fetch from "@/utils/Fetch";
import CreateNewUnitModal from "./CreateNewUnitModal";
import ScDynamicSelect from "@/components/sc-controls/form-controls/ScDynamicSelect";


const fetchUnits = async (search: string) => {
    const response = await Fetch.post({
        url: '/UnitOfMeasurement/GetUnitOfMeasurements',
        params: {
            searchPhrase: search,
            onlyActive: true
        }
    });
    if (response?.error) {
        throw new Error(response.error);
    }
    return response?.Results || [];
};

const UnitSelector: FC<TextInputProps & { value?: string; onChange?: (value: string) => void; onItemSelected: (item: any | null) => void }> = ({ onChange, value, onItemSelected, ...inputProps }) => {

    const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);

    return (
        <>
            <ScDynamicSelect
                queryKey="units"
                value={value as string || ''}
                queryFn={fetchUnits}
                onChange={(val, item) => {
                    onChange?.(val as any);
                    onItemSelected?.(item || null);
                }}
                idProp="Name"
                labelProp="Name"
                showCreateButton
                createButtonText="Add New"
                onCreateClick={() => setShowCreateUnitModal(true)}
                debounceTime={250}
                label={inputProps.label || 'Unit'}
                textInputProps={inputProps}
            />

            <CreateNewUnitModal
                show={showCreateUnitModal}
                onClose={() => setShowCreateUnitModal(false)}
                unitCreated={
                    (e) => {
                        onChange?.(e?.Name || '' as any);
                        onItemSelected?.(e || null);
                        setShowCreateUnitModal(false);
                    }
                }
                isNew
                unit={null}
                backButtonText={'Create Unit Item'}
            />
        </>
    )
}

export default UnitSelector