import React, { useState, useEffect, useContext } from 'react';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import StoreService from '../../../services/store/store-service';

function StoreSelector({ selectedStore, setSelectedStore, required, error, accessStatus, cypress = "", disabled = false,
                           getAllStores = false, options = null, canClear = true, canSearch = true,
                            size = 'sm', hideLabel = false, mt = 'sm'
}) {

    const [stores, setStores] = useState([]);

    const getData = async () => {
        if (Array.isArray(options)) {
            setStores(options);
        } else {
            const data = getAllStores === true ? await StoreService.getListOfStores() : await StoreService.getStores();
            setStores(data.Results.sort((a, b) => {
                if (a.IsDefault) return -1;
                return a.Name - b.Name;
            }));
        }
    };

    useEffect(() => {
        getData();
    }, [options]);


    const handleChange = (value) => {
        setSelectedStore && setSelectedStore(value);
    };

    return (
        <>
            <SCComboBox
                mt={mt}
                size={size}
                name="Store"
                value={selectedStore}
                dataItemKey="ID"
                textField="Name"
                options={stores}
                label={!hideLabel && "Store"}
                required={required}
                disabled={disabled}
                error={error}
                onChange={handleChange}
                cypress={cypress}
                canClear={canClear}
                canSearch={false}
                placeholder={"Select a store"}
                itemRenderMantine={(itemProps) => {
                    return (<div className="store-container">

                        <div className="item1">{itemProps.dataItem.Name}</div>
                        <div className="item2">{itemProps.dataItem.AddressLine1}</div>

                        <style jsx>{`
                        .store-container {
                            display: flex;
                            flex-direction: column;
                            position: relative;
                        }
                        .item1 {
                            font-weight: bold;
                        }
                        .item2 {

                        }
                    `}</style>
                    </div>);
                }}
                filterFunction={(text, item) => {
                    return item.Name?.trim().toLowerCase().includes(text?.trim().toLowerCase());
                }}
            />
        </>
    );
}

export default StoreSelector;
