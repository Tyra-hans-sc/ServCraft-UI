import React, { useState } from 'react';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ManageSupplier from '../../modals/supplier/manage-supplier';
import PS from '../../../services/permission/permission-service';
import CreateNewSupplierModal from "@/PageComponents/Inventory/CreateNewSupplierModal";

function SupplierSelector({
                              selectedSupplier,
                              setSelectedSupplier,
                              accessStatus,
                              error,
                              required,
                              pageSize = 20,
                              disabled = false,
                              onCreateNewSupplier,
                              label = "Supplier",
                              canClear = true,
                              readOnly = false
                          }) {

    const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));

    const getData = async (skipIndex, take, filter) => {

        let params = {
            pageSize: take, pageIndex: skipIndex,
            searchPhrase: filter,
            SortExpression: "", SortDirection: "",
            PopulatedList: false,
        };

        const request = await Fetch.post({
            url: `/Supplier/GetSuppliers`,
            params: params
        });

        return { data: request.Results, total: request.TotalResults };
    };

    const handleChange = (value) => {
        setSelectedSupplier(value);
    };

    const [showCreate, setShowCreate] = useState(false);

    const addNew = () => {
        setShowCreate(true);
    };

    const [triggerRefresh, setTriggerRefresh] = useState(false);

    const onSave = async (result) => {
        if (result) {
            setTriggerRefresh(!triggerRefresh);
            setSelectedSupplier(result);
        }

        setShowCreate(false);
    };

    return (
        <>
            <SCComboBox
                name="Supplier"
                value={selectedSupplier}
                dataItemKey="ID"
                textField="Name"
                getOptions={getData}
                pageSize={pageSize}
                label={label}
                placeholder='Select supplier'
                required={required}
                error={error}
                onChange={handleChange}
                disabled={disabled}
                addOption={(accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && inventoryPermission ?
                    { text: "Add new", action: () => onCreateNewSupplier ? onCreateNewSupplier() : setShowCreate(true) } : null)}
                    //{ text: "Add new", action: () => addNew() } : null)}
                triggerRefresh={triggerRefresh}
                filterFunction={(text, item) => true}
                canClear={canClear}
                readOnly={readOnly}
            />

            {
                showCreate &&
                <>
                    <CreateNewSupplierModal
                        show={showCreate}
                        onClose={() => setShowCreate(false)}
                        supplierCreated={onSave}
                        isNew
                        supplier={selectedSupplier}
                    />
                    {/*<ManageSupplier isNew={true} supplier={selectedSupplier} onSupplierSave={onSave} />*/}

                </>

            }
        </>
    );
}

export default SupplierSelector;
