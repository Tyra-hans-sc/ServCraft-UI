import { FC } from "react";
import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import StockTransactionDetails from "@/PageComponents/Inventory/StockTransactionDetails";
import { DrawerProps } from "@mantine/core";
import { StockTransactionFormComponentProps } from "../StockTransaction/ManageStockTransactionForm";

const StockTransactionDetailsDrawer: FC<StockTransactionFormComponentProps & Omit<DrawerProps, 'opened'>> = ({ stockTransaction, ...props }) => {
    return <ScDrawer
        title={'Details for ' + stockTransaction?.StockTransactionNumber}
        onClose={props.onClose}
        opened={!!stockTransaction}
    >
        {
            stockTransaction &&
            <StockTransactionDetails
                stockTransaction={stockTransaction}
                onClose={props.onClose}
                onSaved={props.onSaved}
            />
        }
    </ScDrawer>
}

export default StockTransactionDetailsDrawer
