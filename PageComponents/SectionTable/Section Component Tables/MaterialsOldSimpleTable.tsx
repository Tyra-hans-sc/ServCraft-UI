import React, {FC, useCallback} from "react";
import * as Enums from "@/utils/enums";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import {IconTrash} from "@tabler/icons";


const MaterialsSimpleTable: FC<
    {
        filteredJobInventory,
        onReorder,
        hasAssets,
        onItemClicked,
        permissionToUpdateItems,
        inlineQuantityEditEnabled,
        onRemoveItem,
        handleQuantityChange,
        onAddItem
        tableActionStates
        // handleSaveNewQuantity
    }> = (props) => {

    const handleItemAction = useCallback(
        (actionName: string, item: any, itemIndex: number) => {
            if(actionName === 'code') {
                props.onItemClicked(item, itemIndex)
            } else if(actionName === 'delete') {
                props.onRemoveItem(item)
            }
        }, [props.filteredJobInventory] // callback reference needs to update with inventory to keep row version fresh
    )

    const handleInputChange = (key, item, newValue) => {
        if(key === 'QuantityRequested') {
            props.handleQuantityChange(item, newValue)
        }
    }

    return <>

        <SimpleTable
            data={props.filteredJobInventory}
            mapping={[
                {
                    key: 'InventoryCode',
                    label: 'Code',
                    valueFunction: (item: any) => item.ProductID ? item.ProductNumber : item.InventoryCode,
                    linkAction: 'code'
                },
                {
                    key: 'InventoryDescription',
                    label: 'Description'
                },
                {
                    key: 'DynamicType',
                    label: 'Type',
                    type: 'status',
                    valueFunction: (item: any) => item.ProductID ? 'Asset' : Enums.getEnumStringValue(Enums.StockItemType, item.Inventory?.StockItemType)
                },
                ...(props.hasAssets && [{
                    key: 'ProductNumber',
                    label: 'Asset/Serial no.'
                }] || []),
                {
                    key: 'QuantityRequested',
                    label: 'Quantity',
                    // type: props.permissionToUpdateItems && props.inlineQuantityEditEnabled ? 'numberInput' : '',
                    min: 0,
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
            onReorderIndex={props.onReorder}
            onAction={handleItemAction}
            canEdit={props.permissionToUpdateItems}
            stylingProps={{
                compact: true,
                rows: true,
                darkerText: true
            }}
            height={'100%'}
            onInputChange={handleInputChange}
            addButton={{
                label: 'Add Material / Service',
                callback: props.onAddItem
            }}
            tableActionStates={props.tableActionStates}
            // onConfirmInputUpdate={props.handleSaveNewQuantity}
        />

        {/*<table className="table">
            <thead>
            <tr>
                <th className="header-item-move">
                </th>
                <th className="header-item-code">
                    CODE
                </th>
                <th className="header-item-desc">
                    DESCRIPTION
                </th>
                <th className="header-item-type">
                    TYPE
                </th>
                {hasInventory && false ?
                    <React.Fragment>
                        <th className="header-item-workedon">
                            WORKED ON
                        </th>
                        <th className="header-item-billable">
                            BILLABLE
                        </th>
                    </React.Fragment> : ''
                }
                {hasAssets ?
                    <React.Fragment>
                        <th className="header-item-assetnumber">
                            ASSET/SERIAL NO
                        </th>
                    </React.Fragment>
                    : ''
                }
                <th className="header-item-qty number-column">
                    QUANTITY
                </th>
                <th className="header-item-delete">
                </th>
            </tr>
            </thead>
            <Reorder reorderId={`quote-item-list-${clientID}`} onReorder={onReorder} lock='horizontal' component='tbody'
                     placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder || !hasEmployee || job.IsClosed || !manageItemsUsedPermission}>
                {filteredJobInventory.filter(x => x.IsActive === true).sort((a, b) => a.LineNumber - b.LineNumber).map((item, index) => {
                    return <tr key={index}>
                        <td className="body-item-move" title="Click and drag to reorder"
                            onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                            <img src="/icons/menu-light.svg" alt="move" />
                        </td>
                        <td className="body-item-code" title='Edit' onClick={() => toggleManageJobInventoryItemModal(item, index)}>
                            {item.ProductID ? item.ProductNumber : item.InventoryCode}
                        </td>
                        <td className="body-item-desc">
                            {item.InventoryDescription}
                        </td>
                        <td className="body-item-type">
                            {item.ProductID ? 'Asset' :

                                Enums.getEnumStringValue(Enums.StockItemType, item.Inventory?.StockItemType)

                            }
                        </td>
                        {hasInventory && false ?
                            <React.Fragment>
                                <td className="body-item-workedon">
                                    {item.ProductID ? '' :
                                        <Checkbox checked={item.StockItemStatus == Enums.StockItemStatus.WorkedOn} disabled={true} />
                                    }
                                </td>
                                <td className="body-item-billable">
                                    {item.ProductID ? '' :
                                        <Checkbox checked={item.Billable} disabled={true} />
                                    }
                                </td>
                            </React.Fragment> : ''
                        }
                        {hasAssets ?
                            <React.Fragment>
                                <td className="body-item-assetnumber">
                                    {item.ProductID ? item.ProductNumber : ''}
                                </td>
                            </React.Fragment>
                            : ''
                        }
                        <td className="body-item-qty number-column" onClick={() => { }}> { /* item.ProductID ? {} : toggleQuantityRequestedEdit(index)}>*!/
                            {quantityRequestedEditEnabled && quanityRequestedEditIndex == index ?
                                <InlineTextInput
                                    name={`quantityRequested${index}`}
                                    changeHandler={(e) => handleQuantityRequestedChange(item, e)}
                                    value={item.QuantityRequested}
                                    type='number'
                                    textAlign='right'
                                    width='100px'
                                    blurHandler={() => resetEdits(item)}
                                    inputFocus={quantityRequestedFocus}
                                />
                                :
                                <>{item.QuantityRequested}</>
                            }
                        </td>
                        <td className="body-item-delete" title="Delete job item">
                            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && !job.IsClosed && manageItemsUsedPermission ? <>
                                <img src="/icons/trash-bluegrey.svg" alt="delete" height={20} onClick={() => removeJobInventoryItem(item)} style={{cursor: "pointer"}} />
                            </> : ''}
                        </td>
                    </tr>
                })}
            </Reorder>
        </table>*/}

    </>
}
export default MaterialsSimpleTable
