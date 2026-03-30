import React, { useState, useEffect } from 'react';
import { colors } from '@/theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import PS from '../../../services/permission/permission-service';
import AssetService from '../../../services/asset/asset-service';
import CustomerService from '../../../services/customer/customer-service';
import ManageAsset from '../../modals/asset/manage-asset';
import TransferOwnership from '../../modals/asset/transfer-ownership';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import { ActionIcon, Flex, Group, Stack, Tooltip, Text } from "@mantine/core";
import WarrantyIndicator from "@/components/product/warranty-indicator";

function AssetSelector({ selectedAsset, setSelectedAsset, triggerEdit, setTriggerEdit, module,
    customerID, contactID, locationID, onSave, isRequired, transferable, setTransferable, error,
    accessStatus, ignoreIDs = [], w, onAddNewAsset, onTransferAsset,
    icon, placeholder = "Select an asset", useLocationFilter = false
}) {

    const [productPermission] = useState(PS.hasPermission(Enums.PermissionName.Product));

    useEffect(() => {
        getCustomer();
    }, []);

    useEffect(() => {
        setResetValue(current => current + 1);
    }, [selectedAsset]);

    const [resetValue, setResetValue] = useState(0);
    const [pageSize] = useState(10);
    const [assetFilter, setAssetFilter] = useState('');

    const prepareAssetDisplayLabel = (asset) => {

        if (!asset) return asset;

        return {
            ...asset,
            // DisplayLabel: asset.InventoryDescription + ' - ' + asset.ProductNumber + ' - ' + asset.InventoryCode
            DisplayLabel: asset.ProductNumber + " - " + asset.InventoryDescription + ' [' + asset.InventoryCode + ']'
        };
    }

    const [assetWithDisplayLabel, setAssetWithDisplayLabel] = useState(prepareAssetDisplayLabel(selectedAsset))
    useEffect(() => {
        setAssetWithDisplayLabel(null)
        setTimeout(() => {
            setAssetWithDisplayLabel(prepareAssetDisplayLabel(selectedAsset))
        }, 1)
    }, [selectedAsset])

    const searchAssets = async (skipIndex, take, filter) => {

        let params = {
            pageSize: take, pageIndex: skipIndex, searchPhrase: filter, ExcludeIDList: ignoreIDs
        };

        if (!transferable) {
            params = { ...params, CustomerIDList: [customerID] }
        }

        if (useLocationFilter) {
            params = { ...params, LocationID: locationID }
        }

        setAssetFilter(filter);
        let assets = await AssetService.getParameterizedAssets(params);

        if (Array.isArray(assets.Results) && selectedAsset && assets.Results.findIndex(x => x.ID === selectedAsset.ID) === -1) {
            assets.Results.push(selectedAsset);
            assets.TotalResults++;
            assets.ReturnedResults++;
        }

        return {
            data: assets.Results.map((x) => {
                return prepareAssetDisplayLabel(x);
            }), total: assets.TotalResults
        };
    };

    const [otherCustomerCount, setOtherCustomerCount] = useState(0);

    const searchForOtherCustomers = async (filter) => {
        if (!transferable && !Helper.isNullOrWhitespace(filter)) {
            let countRequest = await AssetService.getAssetCountForOtherCustomers(customerID, filter);
            setOtherCustomerCount(countRequest.Result);
        } else {
            setOtherCustomerCount(0);
        }
    };

    // MANAGE ASSET

    const [showManageAsset, setShowManageAsset] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [manageAsset, setManageAsset] = useState();

    const addNewAsset = async () => {
        setIsNew(true);
        setManageAsset({
            CustomerID: customerID,
            CustomerContactID: contactID,
            LocationID: locationID,
        });
        setShowManageAsset(true);
    };

    const editAsset = () => {
        setIsNew(false);

        setManageAsset({
            ...selectedAsset,
            CustomerID: customerID,
            CustomerContactID: contactID,
            LocationID: locationID
        });

        setShowManageAsset(true);
    };

    useEffect(() => {
        if (triggerEdit) {
            editAsset();
            setTriggerEdit(false);
        }
    }, [triggerEdit]);

    const onAssetSave = (result) => {
        setShowManageAsset(false);
        if (result) {
            onSave(result);
        }
    };

    // TRANSFER OF OWNERSHIP

    const [showTransferOfOwnership, setShowTransferOfOwnership] = useState(false);
    const [customer, setCustomer] = useState();
    const [assetToTransfer, setAssetToTransfer] = useState();

    const handleAssetTransfer = async (asset) => {
        setAssetToTransfer(asset);
        setShowTransferOfOwnership(true);
    };

    const getCustomer = async () => {
        setCustomer(await CustomerService.getCustomer(customerID));
    };

    const onTransferOfOwnersip = async (transfer) => {
        if (transfer) {
            setSelectedAsset(transfer.Product);
            setShowTransferOfOwnership(false);
            setTriggerRefresh(!triggerRefresh);
        }
        else {
            setShowTransferOfOwnership(false);
        }
    };

    const [triggerRefresh, setTriggerRefresh] = useState(false);

    useEffect(() => {
        setTriggerRefresh(old => !old);
    }, [useLocationFilter])

    useEffect(() => {
        setTriggerRefresh(!triggerRefresh);
    }, [transferable]);

    const assetItemClick = (asset) => {
        if (transferable && customerID !== asset.CustomerID) {
            onTransferAsset(asset);
            // setAssetToTransfer(asset);
            // setShowTransferOfOwnership(true);
        }

        /*if (transferable && customerID != asset.CustomerID) {
            setAssetToTransfer(asset);
            setShowTransferOfOwnership(true);
        }*/
    };

    const assetItemClickMantine = (item) => {
        //let asset = get asset somehow;
        console.log("TESTING", item);
    }

    const assetValueRender = (element, value) => {
        if (!value) {
            return element;
        }

        const children = [
            <span key={1} style={{
                display: "flex",
                color: `${colors.black}`,
                fontSize: "0.75rem",
            }}>
                {value.ProductNumber}
            </span>,
        ];
        return React.cloneElement(element, { ...element.props }, children);
    };

    const assetItemRenderMantine = (itemProps) => {
        return (
            <div className={`asset-container ${transferable && customerID !== itemProps.dataItem.CustomerID ? 'disabled-option' : ''}`}>
                <Group justify={'apart'}>
                    <div style={{ display: "flex" }}>
                        <div style={{ display: "inline-block", width: "36px" }}>
                            <WarrantyIndicator warrantyPeriod={itemProps.dataItem.WarrantyPeriod} purchaseDate={itemProps.dataItem.PurchaseDate} />
                        </div>
                        <Stack gap={3} style={
                            {
                                color: transferable && customerID !== itemProps.dataItem.CustomerID && 'var(--mantine-color-gray-6)'
                            }
                        }>
                            <Text size={'xs'} fw={'bolder'}>{itemProps.dataItem.ProductNumber}</Text>
                            <Group gap={5}>
                                <Text size={'xs'}>{itemProps.dataItem.InventoryCode}</Text>
                                -
                                <Text size={'xs'}>{itemProps.dataItem.InventoryDescription}</Text>
                            </Group>

                        </Stack>
                    </div>
                    <Flex align={'center'} gap={'xs'}>
                        {
                            transferable && customerID !== itemProps.dataItem.CustomerID &&
                            <Tooltip label={'Transfer Ownership'} color={'scBlue'}
                                     events={{ hover: true, focus: true, touch: true }}
                            >
                                <ActionIcon variant={'transparent'} size={'md'}>
                                    <img src="/icons/transfer-asset.svg" />
                                </ActionIcon>
                            </Tooltip>
                        }

                    </Flex>
                </Group>
            </div>
        );
    }

    const assetItemRender = (li, itemProps) => {
        const itemChildren = (
            <div className={`asset-container ${transferable && customerID != itemProps.dataItem.CustomerID ? 'disabled-option' : ''}`}
                onClick={() => assetItemClick(itemProps.dataItem)}>
                <div className="details-container">
                    <span className="item1">{itemProps.dataItem.ProductNumber}</span>
                    <span className="item2">{itemProps.dataItem.InventoryDescription}</span>

                    {transferable && customerID != itemProps.dataItem.CustomerID ?
                        <div className="button-transfer">
                            <img src="/icons/repeat-bluegrey.svg" title="Transfer Ownership" />
                        </div> : ''
                    }
                </div>
                <style jsx>{`
                    .asset-container {
                        display: flex;
                        align-items: center;
                        position: relative;
                        width: 100%;
                    }
                    .disabled-option {
                        
                    }
                    .button-transfer {
                        opacity: unset !important;
                        position: absolute;
                        right: 1rem;
                        top: 0.5rem;
                        cursor: pointer;
                    }
                    .button-transfer img {
                        opacity: unset !important;
                    }
                    .details-container {
                        display: flex;
                        margin-left: 8px;
                        flex-direction: column;
                    }
                    .details-container > span {
                        margin-top: -3px; 
                        margin-bottom: -3px;             
                    }
                    .item1 {
                        font-weight: bold;
                        opacity: ${transferable && customerID != itemProps.dataItem.CustomerID ? '0.5' : '1'};
                    }
                    .item2 {
                        opacity: ${transferable && customerID != itemProps.dataItem.CustomerID ? '0.5' : '1'};
                    }
                `}</style>
            </div>
        );

        //let props = {...li.props, custom: true};

        return React.cloneElement(li, li.props, itemChildren);
    };

    return (
        <>
            <SCComboBox
                w={w}
                addOption={(accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && productPermission ?
                    { text: "Add new asset", action: () => onAddNewAsset && onAddNewAsset() } : null)}
                // { text: "Add new asset", action: () => addNewAsset() } : null)}
                iconMantine={icon}
                name="Asset"
                value={assetWithDisplayLabel}
                onChange={setSelectedAsset}
                onChangeAcceptance={{ key: "CustomerID", value: customerID, option: "Equals", action: (newValue) => assetItemClick(newValue) }}
                dataItemKey="ID"
                textField="DisplayLabel"
                getOptions={searchAssets}
                pageSize={pageSize}
                label="Asset"
                required={isRequired}
                error={error}
                triggerRefresh={triggerRefresh}
                //valueRender={assetValueRender}
                // itemRender={assetItemRender}
                itemRenderMantine={assetItemRenderMantine}
                //filterFunction={(text, item) => true}
                disabled={!customerID || !contactID}
                hint={!customerID || !contactID ? "Customer and contact must be selected" : ""}
                placeholder={placeholder}
                resetValue={resetValue}
                forceBlurOnChange
            />

            {
                showManageAsset ?
                    <ManageAsset isNew={isNew} product={manageAsset} onProductSave={onAssetSave} accessStatus={accessStatus} /> : ''
            }

            {showTransferOfOwnership ?
                <TransferOwnership asset={assetToTransfer} customer={customer} canChangeCustomer={false}
                    onTransfer={onTransferOfOwnersip} accessStatus={accessStatus} module={module} />
                : ''
            }

        </>
    )
}

export default AssetSelector;
