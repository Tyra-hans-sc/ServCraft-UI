import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import { Warehouse, WarehouseStock } from '@/interfaces/api/models';
import stockService from '@/services/stock/stock-service';
import { FC, useEffect, useMemo, useState } from 'react';
import * as Enums from '@/utils/enums';
import { Flex } from '@mantine/core';
import WarehouseTypeIcon from '@/PageComponents/Warehouse/WarehouseTypeIcon';

const WarehouseStockSelector: FC<{
  disabled?: boolean
  readOnly?: boolean
  title?: string
  selectedInventory: any
  selectedWarehouse: any
  setSelectedWarehouse: (warehouse: Warehouse) => void
  error: any
  required: boolean
  storeID?: string
  autoSelect: boolean
  hideFormView?: boolean
  onSuppressSave: (suppress: boolean) => void
  optionFilter?: ((text: string, item: any) => boolean)
}> = (props) => {

  const [warehouseStock, setWarehouseStock] = useState<WarehouseStock[]>([]);
  const [selectedWarehouseStock, setSelectedWarehouseStock] = useState<WarehouseStock | undefined>();

  const getWarehouseStock = async () => {
    if (!props.selectedInventory) {
      setWarehouseStock([]);
      setSelectedWarehouseStock(undefined);
      return;
    }
    let stock = await stockService.getWarehouseStockForInventory(props.selectedInventory.ID, props.storeID);

    stock = stock.filter(x => {
      if (props.optionFilter) {
        return props.optionFilter('', x);
      }
      return true;
    });

    setWarehouseStock(stock);
    let selectedStock = stock.find(x => x.InventoryID == props.selectedInventory.ID && x.WarehouseID === props.selectedWarehouse?.ID);
    if (!selectedStock && props.autoSelect && stock.length === 1) {
      let bestMatchStock = stock.find(x => x.Warehouse?.WarehouseType === Enums.WarehouseType.Warehouse);
      selectedStock = bestMatchStock ?? stock[0];
      handleChange(selectedStock)
    }
    else {
      setSelectedWarehouseStock(selectedStock);
    }
  };

  useEffect(() => {
    props.onSuppressSave(warehouseStock.length === 0);
    getWarehouseStock().finally(() => {
      props.onSuppressSave(false);
    });
  }, [props.selectedInventory]);

  useEffect(() => {
    let selectedStock = warehouseStock.find(x => x.InventoryID == props.selectedInventory.ID && x.WarehouseID === props.selectedWarehouse?.ID);
    setSelectedWarehouseStock(selectedStock);
  }, [props.selectedWarehouse]);

  const handleChange = (warehouseStock) => {
    //setSelectedWarehouseStock(warehouseStock); // should update via useEffect
    props.setSelectedWarehouse(warehouseStock?.Warehouse ?? null);
  }

  const selectedStockInfo = useMemo(() => {
    if (!selectedWarehouseStock) return "";

    return `Available: ${selectedWarehouseStock.QuantityAvailable}` /*, In Progress: ${selectedWarehouseStock.QuantityInProgress}*/;
  }, [selectedWarehouseStock]);

  return (
    <>
      <SCComboBox
        style={{ display: props.hideFormView && warehouseStock.length < 2 ? 'none' : 'inherit' }}
        dataItemKey="WarehouseID"
        textField="WarehouseCode"
        error={props.error}
        options={warehouseStock}
        label={"Warehouse/Van"}
        name="WarehouseStockSelector"
        onChange={handleChange}
        value={selectedWarehouseStock}
        required={props.required}
        itemRenderMantine={(itemProps) => {
          return (<div>
            <Flex align={"center"} gap={"xs"}>
              <WarehouseTypeIcon warehouse={itemProps.dataItem.Warehouse} />
              <span style={{ fontWeight: "bold" }}>{itemProps.dataItem.Warehouse.Code}</span>
            </Flex>
            <div>Available: {itemProps.dataItem.QuantityAvailable}</div>
            <div>In Progress: {itemProps.dataItem.QuantityInProgress}</div>
            {/* <div>{itemProps.dataItem.InventorySubcategoryDescription}</div>
                <div>{itemProps.dataItem.Code}</div>
                <div>{itemProps.dataItem.Quantity}</div> */}
          </div>);
        }}
        filterFunction={(text, item) => {
          // could filter by code and/or description, but this is doing server side filtering already and don't want to affect the results coming back in case the filter changes
          return true;
        }}
        forceBlurOnChange
        canClear={true}
        disabled={props.disabled}
        readOnly={props.readOnly}
        hint={selectedStockInfo}
      />

    </>
  )
};

export default WarehouseStockSelector;