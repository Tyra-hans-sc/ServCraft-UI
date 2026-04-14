import InventoryItemForm from "@/PageComponents/Inventory/InventoryItemForm";
import {FC, useEffect, useRef, useState} from "react";
import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import {ActionIcon, Flex} from "@mantine/core";
import {IconEdit} from "@tabler/icons-react";
import Link from "next/link";

const InventoryItemDrawer: FC<{
    show?: boolean
    isNew?: boolean
    inventory?: any
    onSetInventory?: (data: any) => void
    onInventorySave: (data) => void
    onInventorySavedRefreshOnly?: (data) => void // not used
    onClose: () => void
    isService?: boolean
    isNestedForm?: boolean
}> = ({onInventorySave, onClose, show, ...others}) => {

    const [validateAndCloseCounter, setValidateAndClose] = useState(0)

    const prevTitleRef = useRef('');
    useEffect(() => {
        if (show) {
            prevTitleRef.current = document.title;
            return () => { document.title = prevTitleRef.current; };
        }
    }, [show]);
    useEffect(() => {
        if (!show) return;
        document.title = others.isNew
            ? 'Create Inventory Item | Inventory'
            : (others.inventory?.Code ? `${others.inventory.Code} | Inventory` : 'Inventory | ServCraft');
    }, [show, others.inventory?.Code, others.isNew]);

    return (
        <ScDrawer
            opened={show || typeof show === 'undefined'}
            onClose={() => setValidateAndClose(p => p + 1)}
            title={others.isNew ? 'Create Inventory Item' :
                    <Flex gap={'sm'} align={'center'}>
                        <span>Edit Inventory Item</span>
                        <Link href={'/inventory/' + others.inventory?.ID}>
                            <ActionIcon variant={'outline'}><IconEdit /></ActionIcon>
                        </Link>
                    </Flex>
        }
        >
            {
                (others.isNew || !!others.inventory) &&
                <InventoryItemForm
                    onInventorySaved={onInventorySave}
                    onClose={onClose}
                    hideTitle
                    {...others}
                    validateAndCloseCounter={validateAndCloseCounter}
                    forceFetchLatestData
                />
            }
        </ScDrawer>
    );
}

export default InventoryItemDrawer;
