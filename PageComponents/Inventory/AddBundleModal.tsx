import SCModal from "@/PageComponents/Modal/SCModal";
import AddInventoryItemForm from "@/PageComponents/Inventory/AddInventoryItemForm";
import {Tabs, Title, Text, Box} from "@mantine/core";
import { FC, useEffect, useMemo, useState } from "react";
import AddAssetItemForm from "@/PageComponents/Inventory/AddAssetItemForm";
import * as Enums from '@/utils/enums';
import AddBundleToJobMaterialsForm from "@/PageComponents/Inventory/AddBundleToJobMaterialsForm";
import { Warehouse } from "@/interfaces/api/models";

const AddBundleModal: FC<{
    show: boolean
    onSaveNewListExternally?: (newItems: any[]) => void
    // jobInventoryItem: any
    // updateJobInventoryExternally: (itemToSave: any) => void
    onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any) => void
    jobQueryData: any
    accessStatus: number
    // jobSingleItem: any
    // linkedProductIDs: any
    type: 'Job' | 'Recurring'
    // jobItemSelection: any
    // jobItemOrder: any
    filteredStockItemStatus: any
    jobInventoryList: any[]
    onClose: () => void
    fromCreateJob: boolean
    fromStatusChange: boolean
    fromSchedule?: boolean
    // tableSectionItem?: any
    storeID: string
    warehouse?: Warehouse
}> = (props, context) => {



    return <SCModal open={props.show} decor={'none'} size={'lg'} onClose={props.onClose}>
        <Box pt={'sm'}>
            <Title
                my={'lg'}
                size={24}
            >
                Add Bundle
            </Title>
            <AddBundleToJobMaterialsForm
                {...props}
            />
        </Box>

    </SCModal>
}

export default AddBundleModal
