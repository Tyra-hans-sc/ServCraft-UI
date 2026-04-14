import SCModal from "@/PageComponents/Modal/SCModal";
import AddInventoryItemForm from "@/PageComponents/Inventory/AddInventoryItemForm";
import { Tabs, Title, Text } from "@mantine/core";
import { FC, useEffect, useMemo, useState } from "react";
import AddAssetItemForm from "@/PageComponents/Inventory/AddAssetItemForm";
import * as Enums from '@/utils/enums';

const AddInventoryItemModal: FC<{
    show: boolean
    isNew: boolean
    jobInventoryItem: any
    tableSectionItem?: any
    updateJobInventoryExternally: (itemToSave: any, addAndContinue?: boolean) => void // this is actually NOT on save but really when not posting to api at all
    onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any, addAndContinue?: boolean) => void // a save has actually happened
    job: any
    jobQueryData: any
    accessStatus: number
    jobSingleItem: any
    linkedProductIDs: any
    type: 'Job' | 'Recurring'
    jobItemSelection: any
    jobItemOrder: any
    filteredStockItemStatus: any
    jobInventoryList: any[]
    onClose: () => void
    selectMode: 'inventory' | 'asset' | 'both',
    fromCreateJob?: boolean
    fromStatusChange?: boolean
    fromSchedule?: boolean
    useSectionTable?: boolean
}> = (props, context) => {

    const [selectMode, setSelectMode] = useState(props.selectMode);
    const [activeTab, setActiveTab] = useState<string | null>(null);

    useEffect(() => {
        if (!!props.jobInventoryItem?.ProductID) {
            setSelectMode('asset')
            setActiveTab('asset')
        } else if (!!props.jobInventoryItem?.InventoryID && !props.jobInventoryItem?.ProductID) {
            setSelectMode('inventory')
            setActiveTab('inventory')
        }
    }, [props.jobInventoryItem?.ProductID, props.jobInventoryItem?.InventoryID]);

    // this is obsolete but still used to trigger other logic
    const assetFirst = useMemo(() => {
        let af = false;
        if (props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {
            af = true; // props.jobItemOrder === Enums.JobItemOrder.Asset;
        }
        return af;
    }, []);

    const tabsToAdd = useMemo(() => {

        if (!props.isNew) {
            return props.jobInventoryItem.ProductID ?
                <>
                    <Tabs.Tab value="asset" hidden={true}>Serialised</Tabs.Tab>
                </>
                :
                <>
                    <Tabs.Tab value="inventory" hidden={true}>Non-serialised</Tabs.Tab>
                </>;
        }

        if (props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {
            return (<Tabs.Tab value="inventory" hidden={true}>Non-serialised</Tabs.Tab>);
        }

        switch (props.jobItemSelection) {
            case Enums.JobItemSelection.Both:
                return (<>
                    <Tabs.Tab value="asset">Serialised</Tabs.Tab>
                    <Tabs.Tab value="inventory">Non-serialised</Tabs.Tab>
                </>);
            case Enums.JobItemSelection.Asset:
                return (<>
                    <Tabs.Tab value="asset" hidden={true}>Serialised</Tabs.Tab>
                </>);
            case Enums.JobItemSelection.Inventory:
                return (<>
                    <Tabs.Tab value="inventory" hidden={true}>Non-serialised</Tabs.Tab>
                </>);
            default:
                return (<></>);
        }
    }, [props.filteredStockItemStatus, assetFirst]);

    useEffect(() => {
        let at = "";

        if (!props.isNew) {
            at = props.jobInventoryItem.ProductID ? "asset" : "inventory";
        }
        else if (props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {
            at = "inventory";
        }
        else {
            if (selectMode === 'both') {
                at = assetFirst ? "asset" : "inventory"
            } else if (selectMode === 'inventory') {
                at = "inventory";
            } else {
                at = "asset";
            }
        }

        setActiveTab(at);
    }, [selectMode, assetFirst]);

    return <SCModal open={props.show} decor={'none'} size={530} onClose={props.onClose} >
        <Tabs value={activeTab} onChange={setActiveTab} color={'scBlue'}>
            {/* NB this was the only implementation of conditional rendering that worked - not best practice but works */}
            {tabsToAdd.props.children.length === 2 ? <Tabs.List>
                {tabsToAdd}
            </Tabs.List> : null}


            <Tabs.Panel value="inventory" pt="var(--mantine-spacing-sm)" >
                {/* hidden={selectMode === 'asset'} */}
                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={24}
                >
                    {props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed ? `${props.jobInventoryItem ? 'Edit' : 'Add'} Materials` :
                        props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? `${props.jobInventoryItem ? 'Edit' : 'Add'} Non-serialised Customer Asset` : ""}

                </Title>
                <Text
                    // maw={'22rem'}
                    my={'var(--mantine-spacing-lg)'}
                    color={'gray.9'}
                    size={'16px'}
                >
                    {props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed ? "" :
                        props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? "These are non-serialised items that belong to your customer that you are working on. These are not materials that are used within the job." :
                            ""}


                </Text>

                <AddInventoryItemForm
                    {...props}
                    storeID={props.job?.StoreID}
                    initialWarehouse={!!props.job?.Vans && props.job?.Vans.length > 0 ? props.job?.Vans[0] : null}
                />
            </Tabs.Panel>

            <Tabs.Panel value="asset" pt="var(--mantine-spacing-xs)" >
                {/* hidden={selectMode === 'inventory'} */}
                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={24}
                >
                    {props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed ? `` :
                        props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? `${props.jobInventoryItem ? 'Edit' : 'Add'} Serialised Customer Asset` : ""}
                </Title>
                <Text
                    // maw={'21rem'}
                    my={'var(--mantine-spacing-lg)'}
                    c={'gray.9'}
                    size={'16px'}
                >

                    {props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? "These are serialised items that belong to your customer that you are working on. These are not materials that are used within the job." :
                        ""}


                </Text>

                <AddAssetItemForm
                    {...props}
                    previousHeader={`${props.jobInventoryItem ? 'Edit' : 'Add'} Serialised Customer Asset`}
                />
            </Tabs.Panel>
        </Tabs>


    </SCModal>
}

export default AddInventoryItemModal
