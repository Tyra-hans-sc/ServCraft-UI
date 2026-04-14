import React, { useState, useEffect, useContext } from 'react';
import StoreService from '../../../services/store/store-service';
import SCMultiSelect from '@/components/sc-controls/form-controls/sc-multiselect';

function StoreMultiSelector({ selectedStores, setSelectedStores, required, error, accessStatus, cypress, disabled = false, getAllStores = false, options = null }) {

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
        setSelectedStores && setSelectedStores(value);
    };

    return (
        <>
            <SCMultiSelect
                name="Store"
                selectedOptions={selectedStores}
                dataItemKey="ID"
                textField="Name"
                availableOptions={stores}
                label="Store"
                required={required}
                disabled={disabled}
                error={error}
                onChange={handleChange}
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
            />
        </>
    );
}

export default StoreMultiSelector;
