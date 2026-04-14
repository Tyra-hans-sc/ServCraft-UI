import { FC, useEffect, useRef, useState } from "react";
import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import { DrawerProps, Space } from "@mantine/core";
import ManageStockTransactionForm, { StockTransactionFormComponentProps } from "./ManageStockTransactionForm";
import * as Enums from '@/utils/enums';
import { useDidUpdate } from "@mantine/hooks";


const drawerSize = 800
const ManageStockTransactionDrawer: FC<StockTransactionFormComponentProps & Omit<DrawerProps, 'opened'>> = ({ stockTransaction, show, ...props }) => {

    const [validateAndCloseCounter, setValidateAndClose] = useState(0);

    const [forceRemount, setForceRemount] = useState(false)
    useEffect(() => {
        if (forceRemount) {
            setForceRemount(false)
        }
    }, [forceRemount]);

    const oldID = useRef<string | undefined>();

    useDidUpdate(() => {

        if (oldID.current && stockTransaction?.ID && oldID.current !== stockTransaction.ID) {
            setForceRemount(true)    
        }
        oldID.current = stockTransaction?.ID;
        
    }, [stockTransaction?.ID]);

    return <ScDrawer
        title={props.heading}
        onClose={() => setValidateAndClose(p => p + 1)}
        opened={show === true}
        showFullscreenExpandButton
        size={drawerSize}
        styles={{
            body: {
                paddingInlineEnd: 0
            },
            content: {
                overflowY: 'hidden'
            }
        }}
    // closeOnClickOutside={false}
    // withOverlay={true}
    >
        {
            show === true && !forceRemount &&
            <div><ManageStockTransactionForm
                stockTransaction={stockTransaction}
                isNew={props.isNew === true}
                stockTransactionType={props.stockTransactionType ?? Enums.StockTransactionType.NotSpecified}
                onCancel={props.onClose}
                onSaved={props.onSaved}
                purchaseOrderID={props.purchaseOrderID}
                validateAndCloseCounter={validateAndCloseCounter}
                hideHeading={!!props.heading}
                initialValues={props.initialValues}
            />
            </div>
        }
    </ScDrawer>
}

export default ManageStockTransactionDrawer
