import { Box } from '@mantine/core';
import { FC } from 'react';
import SimpleTable from '../SimpleTable/SimpleTable';
import time from '@/utils/time';
import { IconCheck } from '@tabler/icons-react';

const MessageReplyTable: FC<{
    replies: any[]
}> = (props) => {
    
    
    
    return (<>
        
        <Box p={'sm'}>
                <SimpleTable
                    stylingProps={{ compact: false, darkerText: true, rows: false }}
                    data={props.replies}
                    height={'100%'}
                    canEdit={true}
                    // onAction={(actionName, actionItem, actionItemIndex) => (actionName === 'remove' && handleRemoveItem(actionItem)) || (actionName === "editInventory" && editInventoryForBundleInventory(actionItem))}
                    mapping={[
                        {
                            label: 'Customer',
                            key: 'CustomerName',
                            linkHrefFunction: (item) => {
                                return `/customer/${item.CustomerID}`;
                            },
                        },
                        {
                            label: 'Contact',
                            key: 'CustomerContactFullName'
                        },
                        {
                            label: 'Number',
                            key: 'SenderDetail',
                        },
                        {
                            label: 'Received',
                            key: 'ReceivedDateTime',
                            valueFunction: (item) => {
                                return `${time.formatDate(time.parseDate(item.ReceivedDateTime))}, ${time.getTimeFormatted(time.parseDate(item.ReceivedDateTime), 'hh:mm')}`;
                            }
                        },
                        {
                            label: 'Opted Out',
                            key: 'IsOptOut',
                            valueFunction: (item) => {
                                return item.IsOptOut ? <><IconCheck height={16} /></> : <></>;
                            }
                        },
                        {
                            label: 'Response',
                            key: 'Body'
                        }
                    ]}
                    tableItemInputMetadataByKeyName={{}}
                    controls={[]}
                    tableActionStates={{}}
                    showControlsOnHover={false}
                />
            </Box>
        
        <style jsx>{`
            
        `}</style>
    </>);
};

export default MessageReplyTable;