import { FC, useMemo, useState } from 'react';
import SimpleTable from '../SimpleTable/SimpleTable';
import { Box, Flex, Text } from '@mantine/core';
import { TableAction, TableActionStates } from '../Table/table-model';
import { IconX } from '@tabler/icons-react';
import * as Enums from '@/utils/enums';
import constants from '@/utils/constants';

const MessageQueueBulkItemTable: FC<{
    items: any[]
    updateItems: (items: any[]) => void
    inputErrors: any
}> = (props) => {

    const [inputProps, setInputProps] = useState({}); // not sure how this is used yet
    const [actionStates, setActionStates] = useState<TableActionStates>({}); // not sure how this is used yet

    const handleRemoveItem = (actionItem) =>  {
        console.log("handleRemoveItem", actionItem);
    }

    const tableControls = useMemo<TableAction[]>(() => {
        return props.items && [
            {
                label: 'Remove',
                disabledLabel: 'Cannot modify without paying your subscription and having access',
                activeLabel: 'Removing',
                name: 'remove',
                type: 'warning',
                icon: <IconX />,
                // conditionalDisable: (x: any) => {
                //     return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
                // }
            }
        ] || []
    }, [/*accessStatus*/]);

    

    return (<>

        <Text size={'sm'} c={'dimmed'} mb={0} mt={"sm"}>Add adhoc contacts below (coming soon)</Text>

        <Box mt={"sm"} maw={constants.maxFormWidth}>
            <SimpleTable
                stylingProps={{ compact: false, darkerText: true, rows: false }}
                data={props.items}
                height={'100%'}
                canEdit={false}
                // onReorder={onReorder}
                // onInputChange={handleBundleInventoryInputChange}
                onAction={(actionName, actionItem, actionItemIndex) => (actionName === 'remove' && handleRemoveItem(actionItem))}
                mapping={[
                    {
                        label: 'Contact',
                        key: 'Contact',
                        valueFunction: (item) => {
                            return `${item.Contact.FirstName} ${item.Contact.LastName}`;
                        }
                    },
                    {
                        label: 'Mobile Number',
                        key: 'Contact',
                        valueFunction: (item) => {
                            return `${item.Contact.MobileNumber}`;
                        }
                    }
                ]}
                tableItemInputMetadataByKeyName={inputProps}
                controls={tableControls}
                tableActionStates={actionStates}
                showControlsOnHover={false}
                addButton={{
                    customComponent:
                        <Box
                        // p={'sm'}
                        >
                            <Flex justify={"space-between"}>
                                <div style={{ width: '100%' }}>
                                    {/* <InventorySelector
                                        accessStatus={accessStatus}
                                        selectedInventory={selectedInventory}
                                        setSelectedInventory={inventorySelected}
                                        onCreateNewInventoryItem={undefined}
                                    /> */}
                                </div>
                            </Flex>
                            {props.inputErrors.BundleInventory && <Text size={'sm'} c={'yellow'} mb={0}>{props.inputErrors.BundleInventory}</Text>}

                        </Box>,
                    label: '',
                }}
            />
        </Box>

        <style jsx>{`
            
        `}</style>
    </>);
};

export default MessageQueueBulkItemTable;