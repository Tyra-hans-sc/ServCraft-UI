import InventoryItemDrawer from "@/PageComponents/Inventory/InventoryItemDrawer";
import { useAtom } from "jotai";
import { inventoryDrawerAtom, savedInventoryAtom } from "@/utils/atoms";
import { useState } from "react";

const InventoryDrawerProvider = () => {
    const [inventoryDrawerState, setInventoryDrawerState] = useAtom(inventoryDrawerAtom);
    const [, setSavedInventory] = useAtom(savedInventoryAtom);

    // Extract values from the atom
    const { selectedInventory } = inventoryDrawerState;

    // Helper function to update the atom
    const updateInventoryDrawerState = (updates: Partial<typeof inventoryDrawerState>) => {
        setInventoryDrawerState(prev => ({
            ...prev,
            ...updates
        }));
    };

    return <>
        <InventoryItemDrawer
            inventory={selectedInventory}
            show={!!selectedInventory}
            isNew={false} // As per requirement, it will never be in create mode
            isNestedForm={true} // Prevent accidental submit on nested forms
            onClose={() => {
                updateInventoryDrawerState({
                    selectedInventory: null
                });
            }}
            onInventorySave={(item) => {
                updateInventoryDrawerState({
                    selectedInventory: null
                });

                // Update the savedInventoryAtom with the saved inventory
                setSavedInventory(item);

                // Emit event when inventory is saved/updated
                const event = new CustomEvent('inventory-saved', { detail: item });
                window.dispatchEvent(event);
            }}
            onSetInventory={(inventory) => {
                updateInventoryDrawerState({
                    selectedInventory: inventory
                });
            }}
        />
    </>
}

export default InventoryDrawerProvider
