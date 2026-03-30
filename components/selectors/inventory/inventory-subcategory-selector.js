import React, { useState, useEffect, useContext, useRef } from 'react';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Fetch from '../../../utils/Fetch';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ManageInventorySubcategory from '../../modals/inventory-subcategory/manage-inventory-subcategory';
import ToastContext from '../../../utils/toast-context';

function InventorySubcategorySelector({
                                          selectedSubcategory,
                                          setSelectedSubcategory,
                                          selectedCategory,
                                          accessStatus,
                                          error,
                                          required,
                                          pageSize = 20,
                                          cypress,
                                          onCreateNewInventorySubcategory,
                                          hint = undefined,
                                          disabled,
                                            name = 'inventorySubcategory'
                                      }) {
 
    const toast = useContext(ToastContext);

    const getData = async (skipIndex, take, filter) => {

        let data = [];
        let total = 0;

        if (selectedCategory) {
            let params = {
                pageSize: take, pageIndex: skipIndex, 
                searchPhrase: filter, 
                SortExpression: "", SortDirection: "",
                CategoryIDList: [selectedCategory.ID]
            };           
    
            const request = await Fetch.post({
                url: `/InventorySubcategory/GetInventoryCategories`,
                params: params
            });
            data = request.Results;
            total = request.TotalResults;
        }

        return {data: data, total: total};
    };

    const handleChange = (value) => {
        setSelectedSubcategory(value);
    };

    const [showCreate, setShowCreate] = useState(false);

    const addNew = () => {
        if (selectedCategory) {
          setShowCreate(true);
        } else {
          toast.setToast({
            message: `Please select a category first`,
            show: true,
            type: 'error'
          });
        }
    };

    const [triggerRefresh, setTriggerRefresh] = useState(false);

    const onSave = async (inventorySubcategory) => {
        if (inventorySubcategory) {
          setSelectedSubcategory(inventorySubcategory);
          setTriggerRefresh(!triggerRefresh);
        }
    
        setShowCreate(false);
    };

    return (
        <>
            <SCComboBox
                name={name}
                value={selectedSubcategory}
                dataItemKey="ID"
                textField="Description"
                getOptions={getData}
                pageSize={pageSize}
                label="Subcategory"
                required={required}
                error={error}
                onChange={handleChange}
                addOption={(accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
                    { text: "Add new", action: () => onCreateNewInventorySubcategory() } : null)}
                   // { text: "Add new", action: () => addNew() } : null)}
                triggerRefresh={triggerRefresh}
                cascadeDependency={selectedCategory}
                cypress={cypress}
                filterFunction={(text, item) => true}
                hint={hint}
                disabled={disabled}
            />

            {/*{showCreate ?
                <ManageInventorySubcategory isNew={true} inventorySubcategory={selectedSubcategory} onInventorySubcategorySave={onSave} 
                    inventoryLockdown={true} defaultInventoryCategory={selectedCategory}
                /> 
                : ''
            }*/}
        </>
    );
}

export default InventorySubcategorySelector;
