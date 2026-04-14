import React, {FC, useCallback, useEffect, useState} from "react";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import * as Enums from "@/utils/enums";
import {IconTrash} from "@tabler/icons";
import permissionService from "@/services/permission/permission-service";
import {Anchor, Button, Flex, Menu} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";
import NewText from "@/PageComponents/Premium/NewText";


const PurchasesTable: FC<{
    purchaseOrderItems,
    onReorder,
    onItemClicked,
    permissionToUpdateItems,
    onRemoveItem,
    handleInputChange,
    onAddItem,
    tableActionStates,
    companyTaxPercentage,
    integration,
    addOptions,
    onAddAction
}> = (props) => {

    const handleItemAction = useCallback(
        (actionName: string, item: any, itemIndex: number) => {
            if(actionName === 'code') {
                props.onItemClicked(item, itemIndex)
            } else if(actionName === 'delete') {
                props.onRemoveItem(item)
            }
        }, [props.purchaseOrderItems] // callback reference needs to update with inventory to keep row version fresh
    )

    const handleInputChange = (key, item, newValue) => {
        props.handleInputChange(key, item, newValue)
    }

    console.log(props.purchaseOrderItems)

    /*
    const [items, setItems] = useState(props.purchaseOrderItems)

    useEffect(() => {
        setItems(props.purchaseOrderItems.map(x => ({...x, ID: x.ID ?? crypto.randomUUID()}))) // need to add ids when they do not exist in order for reordering to work.  IDs will be a
    }, [props.purchaseOrderItems]);*/

    return <>

        <SimpleTable
            uniqueIdKey={'LineNumber'}
            data={props.purchaseOrderItems}
            mapping={[
                {
                    key: 'InventoryCode',
                    label: 'Code',
                    valueFunction: (item: any) => item.ProductID ? item.ProductNumber : item.InventoryCode,
                    linkAction: 'code'
                },
                {
                    key: 'Description',
                    label: 'Description',
                    // type: canUpdate ? 'textInput' : undefined,
                    typeFunction: (item) => item.InventoryID ? 'textInput' : 'textArea',
                    stylingProps: {
                        miw: '30vw',
                        darkerText: true
                    },
                    inputProps: {
                        width: '100%'
                    }
                },
                ...(props.integration ? [
                    {
                        key: 'ItemType',
                        label: 'Status',
                        type: 'status',
                        colorFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory ? (item.Integrated ? 'Green' : item.IntegrationMessage ? `Yellow` : undefined) : undefined),
                        valueFunction: (item: any) => (
                            item.InvoiceItemType === Enums.ItemType.Inventory && (item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'
                            ) || null),
                        showFunction: (item: any) => item.ItemType === Enums.ItemType.Inventory,
                    }
                ] : []) as any,
                {
                    key: 'Quantity',
                    label: 'Quantity',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (props.permissionToUpdateItems ? 'numberInput' : undefined) : undefined,
                    min: 0,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                },
                /*...(hasManageCostingPermission ? [
                    {
                        key: 'UnitCostPrice',
                        label: 'Cost',
                        currencyValue: true,
                        customNumberProps: {
                            focusOnSelect: true
                        },
                        typeFunction: (item) => canUpdate && !!item.InventoryID ? 'numberInput' : undefined,
                        valueFunction: (item: any) => {
                            let costPrice = item.UnitCostPrice ?? +(item.Inventory?.CostPrice ?? 0);
                            return !!item.InventoryID ? costPrice : <></>;
                        }
                    }
                ] : []),*/
                {
                    key: 'UnitPriceExclusive',
                    label: 'Price',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (props.permissionToUpdateItems ? 'numberInput' : undefined) : undefined,
                    // min: 0,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                },
                {
                    key: 'LineDiscountPercentage',
                    label: 'Discount %',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (props.permissionToUpdateItems ? 'numberInput' : undefined) : undefined,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    numberInputProps: {
                        min: 0,
                        max: 100
                    },
                },
                {
                    key: 'TaxPercentage',
                    label: 'Tax Rate',
                    valueFunction: (item => item.TaxPercentage + ''),
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (props.permissionToUpdateItems ? 'selectInput' : undefined) : undefined,
                    selectOptions: [
                        {
                            label: 'Standard Rate',
                            value: props.companyTaxPercentage + ''
                        },
                        {
                            label: props.companyTaxPercentage === 0 ? 'Default (No VAT)' : 'No VAT',
                            value: 0 + ''
                        },
                    ].filter(x => x.label !== 'Standard Rate' || props.companyTaxPercentage !== 0),
                    alignRight: true
                },
                {
                    key: 'LineTotalExclusive',
                    label: 'Amount',
                    currencyValue: true,
                    alignRight: true,
                    // type: canUpdate ? 'numberInput' : undefined,
                    min: 0,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory)
                }
            ]}
            controls={[
                ...(props.permissionToUpdateItems ? [{
                    name: 'delete',
                    // type: 'warning',
                    icon: <IconTrash />,
                    label: 'Remove',
                    activeLabel: 'Removing'
                }] : [])
            ]}
            // onReorder={setItems}
            onReorderIndex={props.onReorder}
            onAction={handleItemAction}
            canEdit={props.permissionToUpdateItems}
            stylingProps={{
                compact: true,
                rows: false,
                darkerText: true,
                rowBorders: false
            }}
            height={'100%'}
            onInputChange={handleInputChange}
            addButton={props.permissionToUpdateItems ? {
                label: '',
                // callback: props.onAddItem,
                customComponent: <Flex w={'100%'} gap={'md'}>
                    <Menu
                        shadow="md"
                    >
                        <Menu.Target>
                            <Button c={'scBlue'} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                <IconPlus size={16} />
                                <Anchor size={'sm'}>
                                    Add Line
                                </Anchor>
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {
                                props.addOptions.map(
                                    (x, i) => (
                                        <Menu.Item key={x.text + i} onClick={() => props.onAddAction && props.onAddAction(x.link)}>
                                            {x.text} {x.newOption && <NewText h={12} />}
                                        </Menu.Item>
                                    )
                                )
                            }
                        </Menu.Dropdown>
                    </Menu>
                </Flex>
            } : undefined}
            // tableActionStates={props.tableActionStates}
            // onConfirmInputUpdate={props.handleSaveNewQuantity}
        />
    </>
}

export default PurchasesTable
