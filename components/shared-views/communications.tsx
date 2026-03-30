import React, {useCallback, useContext, useEffect, useState} from 'react';
import Router from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {ActionIcon, Flex, Group, Loader} from "@mantine/core";
import { IconMail, IconMailFast, IconMessage2, IconRefresh } from '@tabler/icons-react';
import SCSplitButton from '../sc-controls/form-controls/sc-split-button';
import BillingService from '../../services/billing-service';
import MessageService from '../../services/message/message-service';
import Helper from '../../utils/helper';
import SubscriptionContext from '../../utils/subscription-context';
import * as Enums from '../../utils/enums';
import MessageItem, {Message} from "@/PageComponents/Message/MessageItems/MessageItem";
import DocumentService from "@/services/document/document-service";
import {AnimatePresence, motion } from 'framer-motion';
import ScPagination from "@/PageComponents/Table/ScPagination";
import {PageProps} from "@/PageComponents/Table/table-model";
import tableStyles from '@/PageComponents/Table/Table/ScTableData.module.css'

// Define the props interface
interface CommunicationsProps {
  customerID?: string | null;
  itemId: string;
  module: string;
  accessStatus: number;
  supplierID?: string | null;
  topMargin?: boolean;
}

interface FetchMessagesResponse {
  Results: Message[];
  TotalResults: number;
  ReturnedResults: number;
}

// Define animation variants for staggering children
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Time between the animation of child components
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};


const Communications: React.FC<CommunicationsProps> = ({
                                                         customerID,
                                                         itemId,
                                                         module,
                                                         accessStatus,
                                                         supplierID,
                                                         topMargin = true,
                                                       }) => {

    const [hasCreditsAvailable, setHasCreditsAvailable] = useState<boolean>(false);
    const [navigating, setNavigating] = useState<boolean>(false);

    const subscriptionContext = useContext(SubscriptionContext);

    // Fetch subscription info to determine if credits are available
    const getCreditsAvailable = async () => {
        const [subscriptionInfo] = await BillingService.getSubcriptionInfo(subscriptionContext);
        if (subscriptionInfo) {
            setHasCreditsAvailable(
                subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed || 0) > 0
            );
        }
    };

    const {data: documentDefinitions} = useQuery(['documentDefinitions'], async () => {
        // console.log('executing')
        const legacyDocuments = await DocumentService.getUseLegacyDocuments();
        if (!legacyDocuments) {
            // console.log('legacy documents not found')
            const documentDefinition = await DocumentService.getDocumentDefinition();
            if (documentDefinition && documentDefinition.MetaData !== undefined) {
                return JSON.parse(documentDefinition.MetaData);
            }
        }
        return null;
    }, {
        // onSuccess: (data) => {console.log('document definition', data)},
        onError: console.error
    })

    // Fetch subscription info to determine if credits are available
    const getDocumentDefinition = async () => {
        let documentDefinitionMetaData = null;

    };



    useEffect(() => {
        getCreditsAvailable();
        getDocumentDefinition();

    }, []);

    // Disable the creation buttons based on access status or null values
    const disableCreateButtons =
        accessStatus === Enums.AccessStatus.LockedWithAccess ||
        accessStatus === Enums.AccessStatus.LockedWithOutAccess ||
        (!customerID && !supplierID);


    const [tableState, setTableState] = useState<any>({
        pageSize: 10,
        pageIndex: 0,
    })

/*

    const refreshInterval = useInterval(() => {

    }, 5000)
*/

    const {data, isLoading, refetch: fetchMessages, isFetching, isInitialLoading} = useQuery<FetchMessagesResponse>(
        ['messages', itemId, tableState],
        () => MessageService.getMessages(itemId, tableState.pageIndex, tableState.pageSize),
        {
            keepPreviousData: true,
            /*onSuccess: (data) => {
                if(data.Results.some(x => x.MessageStatus === Enums.MessageStatus.InProgress || x.MessageStatus === Enums.MessageStatus.Queued)) {
                    set
                }
            },*/
            refetchInterval: (data) => data?.Results.some(x => x.MessageStatus === Enums.MessageStatus.InProgress || x.MessageStatus === Enums.MessageStatus.Queued) ? 3000 : false
        }
    );

    const messages = data?.Results || [];
    const totalMessages = data?.TotalResults || 0;


    const handlePaginationChange = useCallback(
        (pageProps: PageProps) => {
            // cancelActiveDataQuery()
            setTableState(p => ({...p, ...pageProps}))
            // cancelDebouncedTableState()
        }, []
    )

    const optionsClick = (link: string) => {
        setNavigating(true);
        const baseUrl = '/new-communication/[id]';
        const routeParams = `/new-communication/${itemId}?moduleCode=${module}&method=`;

        switch (link) {
            case 'CreateSMS':
                Helper.nextRouter(Router.push, `${baseUrl}?moduleCode=${module}&method=sms`, `${routeParams}sms`);
                break;
            case 'CreateEmail':
                Helper.nextRouter(Router.push, `${baseUrl}?moduleCode=${module}&method=email`, `${routeParams}email`);
                break;
            case 'CreateSMSEmail':
                Helper.nextRouter(Router.push, `${baseUrl}?moduleCode=${module}&method=both`, `${routeParams}both`);
                break;
        }
    };

    return (
        <div>
            <Flex justify={'end'} mt={topMargin ? 25 : 0}>

                <SCSplitButton
                    disabled={disableCreateButtons || navigating}
                    items={[{
                        key: "Email",
                        label: "Create Email",
                        defaultItem: true,
                        action: () => optionsClick('CreateEmail'),
                        leftSection: <IconMail size={18}/>,
                        rightSection: navigating && <Loader size={18}/>
                    },
                        {
                            key: "SMS",
                            label: "Create SMS",
                            defaultItem: false,
                            action: () => optionsClick('CreateSMS'),
                            leftSection: <IconMessage2 size={18}/>
                        },
                        {
                            key: "Both",
                            label: "Create Both",
                            defaultItem: false,
                            action: () => optionsClick('CreateSMSEmail'),
                            leftSection: <IconMailFast size={18}/>
                        }]}
                />

            </Flex>

            {
                messages.length > 0
                    ? <div>
                        <Flex w={'100%'} direction={'column'} gap={10} my={'10px'}>
                            <div>
                                <AnimatePresence
                                    // mode={'popLayout'}
                                    mode={'wait'}
                                    presenceAffectsLayout
                                >
                                    {messages.map((message, key) => (
                                        <motion.div
                                            style={{marginTop: '10px'}}
                                            key={message.ID} // Ensure a unique key is used
                                            transition={{
                                                delay: key * .02,
                                                ease: 'easeOut',
                                                duration: 0.2,
                                            }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20, transition: { duration: 0.15, ease: 'easeIn', delay: /*(messages.length - 1 - key)*/ key * .02 } }}
                                        >
                                            <MessageItem
                                                message={message}
                                                fetchMessages={fetchMessages}
                                                hasCreditsAvailable={hasCreditsAvailable}
                                                documentDefinitionMetaData={documentDefinitions}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                        </Flex>

                        <Flex align={'center'} gap={'xs'} mt={3}>

                            <Group miw={15} justify={'center'}>
                                {
                                    !isInitialLoading &&
                                    <ActionIcon ml={3} color={'gray.7'} variant={'transparent'} size={'sm'} onClick={() => fetchMessages()}>
                                        <IconRefresh style={isFetching ? {transition: '2s ease-in-out'} : {}} className={isFetching ? tableStyles.rotate : ''} />
                                    </ActionIcon>
                                }
                            </Group>
                            <div style={{flexGrow: 1, marginRight: 65}}>
                                <ScPagination
                                    totalElements={data?.TotalResults}
                                    totalOnPage={data?.ReturnedResults}
                                    currentPage={tableState.pageIndex}
                                    pageSize={tableState.pageSize}
                                    onChange={handlePaginationChange}
                                />
                            </div>

                        </Flex>

                    </div>
                    :
                    isLoading ? (
                        <Flex align={'center'} justify={'center'} direction={'column'} mih={'40vh'}>
                            <Loader size={40}/>
                        </Flex>
                        )
                        :
                        <Flex align={'center'} justify={'center'} direction={'column'} mih={'40vh'} gap={'3rem'}>
                            <img src="/quotes-box.svg" alt=""/>
                            <h3>No messages</h3>
                        </Flex>
            }
        </div>
    );
};

export default Communications;