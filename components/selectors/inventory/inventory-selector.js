import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ManageInventory from '../../modals/inventory/manage-inventory';
import ToastContext from '../../../utils/toast-context';
import PS from '../../../services/permission/permission-service';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";
import {Box, Flex, Text} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getSystemNameForFormName } from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import { getFieldSettings } from "@/PageComponents/Settings/Field Settings/FieldSettings";
import useDebouncedCallback from "@restart/hooks/useDebouncedCallback";
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";
import helper from '@/utils/helper';
import Image from "next/image";

function InventorySelector({ selectedInventory, setSelectedInventory, setInventoryChanged = undefined, accessStatus, error = undefined, ignoreIDs = [], cypress = "",
  isRequired = true, ignoreAddOption = false, placeholder = "Select inventory", onCreateNewInventoryItem, label = "Inventory", canClear = true,
  disabled = false, readOnly = false, warehouseID = null, additionalQueryParams: queryParams = null, disableIDs = [], autoFocus = false }) {

  /** fieldSettings Start */
  const inventoryFieldSettings = useQuery(['inventoryFieldSettings'], () => getFieldSettings(Enums.Module.Inventory))
  const settingsBySystemName = useMemo(() => {
    if (inventoryFieldSettings.data) {
      return inventoryFieldSettings.data.reduce((previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.FieldSystemName]: { ...currentValue }
      }), {})
    } else {
      return {}
    }
  }, [inventoryFieldSettings.data])

  const isShown = useCallback((name) => {
    const systemName = getSystemNameForFormName(name)
    return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive : false
  }, [settingsBySystemName])
  /** fieldSettings End */

  const toast = useContext(ToastContext);
  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));

  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const [additionalQueryParams, setAdditionalQueryParams] = useState(queryParams)
  const handleQueryParamsUpdate = useDebouncedCallback((newQueryParams) => {
    setAdditionalQueryParams(newQueryParams)
    setTriggerRefresh(p => !p)
  }, 100)
  useEffect(() => {
    handleQueryParamsUpdate(queryParams)
  }, [queryParams])

  const handleInventoryChange = (inventory) => {
    if (!inventory) {
      setAdditionalQueryParams({})
    }
    setSelectedInventory(inventory);
    setInventoryChanged && setInventoryChanged(true);
  };

  const [pageSize] = useState(10);

  const searchInventorySC = async (skipIndex, take, filter) => {
    // console.log('searching',additionalQueryParams)
    const inventory = await Fetch.post({
      url: `/Inventory/GetInventories`,
      params: {
        pageSize: take, pageIndex: skipIndex, searchPhrase: filter,
        SortExpression: "", SortDirection: "", ExcludeIDList: ignoreIDs,
        WarehouseID: warehouseID,
        PopulateThumbnails: true,
        ...additionalQueryParams
      }
    });

    let results = inventory.Results;

    return { data: results, total: inventory.TotalResults };
  };

  /*useEffect(() => {

 todo find better way and debounce filter changes - state is not current when filter is cleared
 ** ** ** ** ** ** ** ** ** ** ** ** **
    console.log('triggering refresh')
    setTriggerRefresh(p => !p)
  }, [additionalQueryParams]);*/

  const [showLegacyCreateInventory, setShowLegacyCreateInventory] = useState(false);

  const addNewInventory = () => {

    if (!!onCreateNewInventoryItem) {
      onCreateNewInventoryItem();
    } else {
      setShowLegacyCreateInventory(true)
    }
  };

  const onInventoryCreate = (inventory) => {
    if (inventory) {
      setTriggerRefresh(!triggerRefresh);
      setSelectedInventory(inventory);
      setInventoryChanged && setInventoryChanged(true);

      // toast.setToast({
      //   message: 'Inventory created successfully',
      //   show: true,
      //   type: Enums.ToastType.success
      // });
    }
    setShowLegacyCreateInventory(false);
  };

  const valueRender = (element, value) => {
    if (!value) {
      return element;
    }

    const children = [
      <span
        key={1}
        style={{
          display: "inline-block",
          background: "#333",
          color: "#fff",
          borderRadius: "50%",
          width: "18px",
          height: "18px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {value}
      </span>,
      <span key={2}>&nbsp; {element.props.children}</span>,
    ];
    return React.cloneElement(element, { ...element.props }, children);
  };

  // useEffect(() => {
  //   //console.warn(selectedInventory?.ThumbnailUrl)
  // }, [selectedInventory])



  return (
    <>


      <SCComboBox
        autoFocus={autoFocus}
        addOption={(inventoryPermission && !ignoreAddOption ? { text: "Add new inventory", action: () => addNewInventory() } : "")}
        dataItemKey="ID"
        textField={"Description"}
        error={error}
        extraClasses="inventory-selector"
        cypress={cypress ? cypress : null}
        getOptions={searchInventorySC}
        pageSize={pageSize}
        label={label}
        name="Inventory"
        onChange={handleInventoryChange}
        value={selectedInventory}
        required={isRequired}
        triggerRefresh={triggerRefresh}
        placeholder={placeholder}
        itemRenderMantine={(itemProps) => {
          return (<Flex
            direction={'column'}
            gap={5}
            w={'100%'}
            py={1}
          >
            <Flex align={'center'} justify={'left'} gap={7} w={'100%'}>

              <Box pos="relative" w={40} h={40}>
                {(itemProps.dataItem.ThumbnailUrl || itemProps.dataItem.ImageUrl) ? (
                    <Image
                        src={itemProps.dataItem.ThumbnailUrl || itemProps.dataItem.ImageUrl || ''}
                        alt=""
                        width={36}
                        height={36}
                        style={{
                          borderRadius: '4px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                    />
                ) : (
                    <Box pos={'absolute'} top={'50%'} left={'50%'} style={{transform: 'translate(-50%, -50%)'}}>
                      <StockItemTypeIcon stockItemType={itemProps.dataItem.StockItemType} size={25} />
                    </Box>
                )}
              </Box>


              <Flex direction={'column'} gap={0} align={'left'} w={'100%'} >
                <Flex
                    w={'100%'}
                    direction={'row'}
                    gap={0}
                    align={'center'}
                    justify={'space-between'}
                    wrap={'wrap-reverse'}
                >
                  <Text fw={'bold'} size={'sm'}>{itemProps.dataItem.Description}</Text>
                  <Text fw={'bolder'} size={'sm'} ml={'auto'}>{itemProps.dataItem.Code}</Text>
                </Flex>
                <Flex
                    direction={'row'}
                    gap={'sm'}
                    align={'center'}
                    justify={'space-between'}
                >
                  {
                    // (isShown('InventoryCategory') || isShown('InventorySubcategory')) &&
                    <Flex
                        // ml={'auto'}
                        gap={5}
                        align={'center'}
                        wrap={'wrap'}
                    >
                      {(itemProps.dataItem.ThumbnailUrl || itemProps.dataItem.ImageUrl) && <StockItemTypeIcon stockItemType={itemProps.dataItem.StockItemType}/>}
                      {isShown('InventorySubcategory') && itemProps.dataItem.InventorySubcategoryDescription && <Text fw={'normal'} size={'xs'}>{itemProps.dataItem.InventorySubcategoryDescription}</Text>}
                      {isShown('InventorySubcategory') && itemProps.dataItem.InventorySubcategoryDescription && <Text fw={'lighter'} size={'xs'}> - </Text>}
                      {isShown('InventoryCategory') && itemProps.dataItem.InventoryCategoryDescription && <Text fw={'lighter'} size={'xs'}>{itemProps.dataItem.InventoryCategoryDescription}</Text>}
                    </Flex>
                  }
                  {
                    itemProps.dataItem.Integrated && (helper.isInventoryWarehoused(itemProps.dataItem) || itemProps.dataItem.Quantity !== 0) &&
                      <Text fw={'normal'} size={'sm'}>Acc Qty: {itemProps.dataItem.Quantity}</Text>
                  }
                </Flex>
              </Flex>
            </Flex>



          </Flex>);
        }}
        filterFunction={(text, item) => {
          // could filter by code and/or description, but this is doing server side filtering already and don't want to affect the results coming back in case the filter changes
          return true;
        }}
        forceBlurOnChange
        canClear={canClear}
        hideDataItemKeys={ignoreIDs}
        disabled={disabled}
        readOnly={readOnly}
        cascadeDependency={warehouseID}
        disableIDs={disableIDs}
      />

      {
        showLegacyCreateInventory && <InventoryItemModal isNew={true} onInventorySave={onInventoryCreate} accessStatus={accessStatus} onClose={() => setShowLegacyCreateInventory(false)} /> ||
        showLegacyCreateInventory && <ManageInventory isNew={true} onInventorySave={onInventoryCreate} accessStatus={accessStatus} />
      }
    </>
  )
}

export default InventorySelector;
