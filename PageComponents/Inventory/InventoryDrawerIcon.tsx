import {FC} from "react";
import {ActionIcon, Anchor, Tooltip} from "@mantine/core";
import {IconLayoutSidebarRightExpand} from "@tabler/icons-react";
import {useAtom} from "jotai";
import {inventoryDrawerAtom} from "@/utils/atoms";
import styles from './InventoryDrawerIcon.module.css';
import PermissionService from "@/services/permission/permission-service"; // Import your CSS Module

import * as Enums from '@/utils/enums';

interface InventoryDrawerIconProps {
    inventory?: any;
    inventoryId?: any;
    label?: string;
    showOnNthParentHover?: number;
    linkMode?: boolean;
}

const inventoryPermission = PermissionService.hasPermission(Enums.PermissionName.Inventory);

const InventoryDrawerIcon: FC<InventoryDrawerIconProps> = ({inventory, inventoryId, label = 'View item', showOnNthParentHover, linkMode = false}) => {
    const [inventoryDrawerState, setInventoryDrawerState] = useAtom(inventoryDrawerAtom);

    const handleClick = async () => {

        if(!inventoryPermission) return;

        if(!!inventory && inventoryDrawerState?.selectedInventory?.ID !== inventory?.ID) {
            setInventoryDrawerState(prev => ({
                ...prev,
                selectedInventory: inventory
            }));
        } else if (!!inventoryId && inventoryDrawerState?.selectedInventory?.ID !== inventoryId) {
            setInventoryDrawerState(prev => ({
                ...prev,
                selectedInventory: {ID: inventoryId, Name: 'Loading...'}
            }));
        }

    };

    // Apply the parentHoverN class to the wrapper and hiddenOnParentHover to the ActionIcon
    const wrapperClassName = showOnNthParentHover 
        ? styles[`parentHover${showOnNthParentHover}`] || ''
        : '';

    const actionIconClassName = showOnNthParentHover
        ? styles.hiddenOnParentHover
        : '';

    return (
        <span className={wrapperClassName}>
            {
                linkMode ?
                    <Anchor
                        underline={'never'}
                        fw={'bolder'}
                        onClick={handleClick}
                        style={{cursor: inventoryPermission ? 'pointer' : 'default'}}
                    >
                        {label}
                    </Anchor> :
                    inventoryPermission &&
                    <Tooltip
                        color={'scBlue'}
                        label={label}
                    >
                        <ActionIcon
                            size={'xs'}
                            onClick={handleClick}
                            variant={'subtle'}
                            className={actionIconClassName}
                        >
                            <IconLayoutSidebarRightExpand/>
                        </ActionIcon>
                    </Tooltip>
            }
        </span>
    );
};

export default InventoryDrawerIcon;
