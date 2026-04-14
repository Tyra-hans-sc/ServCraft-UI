import {FC} from "react";
import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import ManageInventoryWarehouseStockForm, {
    WarehouseStockFormComponentProps
} from "@/PageComponents/Inventory/ManageInventoryWarehouseStockForm";
import {DrawerProps} from "@mantine/core";

const ManageInventoryWarehouseStockDrawer: FC<WarehouseStockFormComponentProps & Omit<DrawerProps, 'opened'>> = ({warehouseStockItem, ...props}) => {
    return <ScDrawer
        title={'Stock for ' + warehouseStockItem?.Inventory?.Description}
        onClose={props.onClose}
        opened={!!warehouseStockItem}
    >
        {
            warehouseStockItem &&
            <ManageInventoryWarehouseStockForm
                warehouseStockItem={warehouseStockItem}
                onClose={props.onClose}
                onSaved={props.onSaved}
            />
        }
    </ScDrawer>
}

export default ManageInventoryWarehouseStockDrawer
