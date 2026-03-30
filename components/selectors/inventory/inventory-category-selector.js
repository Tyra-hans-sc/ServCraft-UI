import React, { useState, useEffect, useContext } from 'react';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ManageInventoryCategory from '../../modals/inventory-category/manage-inventory-category';

function InventoryCategorySelector({
                                       selectedCategory,
                                       setSelectedCategory,
                                       accessStatus,
                                       error,
                                       required,
                                       pageSize = 20,
                                       disabled = false,
                                       cypress,
                                       onCreateNewCategory,
                                        name = 'inventoryCategory'
                                   }) {
 
    const getData = async (skipIndex, take, filter) => {
        let params = {
            pageSize: take, pageIndex: skipIndex, 
            searchPhrase: filter, 
            SortExpression: "", SortDirection: ""
        };

        const data = await Fetch.post({
            url: `/InventoryCategory/GetInventoryCategories`,
            params: params
        });

        return {data: data.Results, total: data.TotalResults};
    };

    const handleChange = (value) => {
        setSelectedCategory(value);
    };

    const [showCreate, setShowCreate] = useState(false);
    const [triggerRefresh, setTriggerRefresh] = useState(false);

    const onSave = async (inventoryCategory) => {
        if (inventoryCategory) {           
            setTriggerRefresh(!triggerRefresh);
            setSelectedCategory(inventoryCategory);
        }
    
        setShowCreate(false);
    };    

    return (
        <>
            <SCComboBox 
                name={name}
                value={selectedCategory}
                dataItemKey="ID"
                textField="Description"
                getOptions={getData}
                pageSize={pageSize}
                label="Category"
                required={required}
                error={error}
                onChange={handleChange}
                addOption={(accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
                    { text: "Add new", action: () => onCreateNewCategory() } : null)}
                     //{ text: "Add new", action: () => setShowCreate(true) } : null)}
                disabled={disabled}
                triggerRefresh={triggerRefresh}
                cypress={cypress}
                filterFunction={(text, item) => true}
            />

            {showCreate ?
                <ManageInventoryCategory isNew={true} inventoryCategory={selectedCategory} onInventoryCategorySave={onSave} /> : ''
            }
        </>
    );
}

export default InventoryCategorySelector;
