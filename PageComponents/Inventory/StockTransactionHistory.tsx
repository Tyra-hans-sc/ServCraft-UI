import { FC, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { Timeline, Text, ThemeIcon, Flex, Anchor, ScrollArea, Box, ActionIcon } from "@mantine/core";
import moment from "moment";
import EmployeeAvatar from "../Table/EmployeeAvatar";
import Link from "next/link";
import WarehouseSelector from "@/components/selectors/warehouse/warehouse-selector";
import { IconChevronRight, IconFilter } from "@tabler/icons-react";
import { useDidUpdate } from "@mantine/hooks";
import { AnimatePresence, motion } from "framer-motion";

interface WarehouseStockTransaction {
    CustomerName: string | null,
    InventoryCode: string,
    InventoryDescription: string,
    LinkedItemNumber: string,
    Module: number,
    Quantity: number,
    StockTransactionID: string | null,
    StockTransactionNumber: string,
    SupplierName: string | null,
    TransactionDate: string,
    TransactionID: string,
    TransactionType: 'Used' | 'Generic' | 'Adjustment' | 'Return' | 'Purchase',
    WarehouseCode: string,
    WarehouseName: string,
    Username: string,
    InvoiceID: string,
    InvoiceNumber: string,
    JobCardID: string,
    JobCardNumber: string,
    PurchaseOrderID: string,
    PurchaseOrderNumber: string,
}

const getWarehouseStock = (inventoryId: string, warehouseId: string, pageIndex: number = 0, pageSize: number = 100) => {
    return Fetch.get({
        url: '/WarehouseStock/History',
        params: {
            inventoryId, warehouseId, pageIndex, pageSize
        }
    }).then(
        (x) => {
            if (x.Results && Array.isArray(x.Results)) {
                return x
            } else {
                throw new Error(x.serverMessage || x.message || 'something went wrong')
            }
        }
    )
}

const StockTransactionHistory: FC<
    { inventoryId: string, warehouseId: string, refreshIncrement?: number, pageSize?: number, infiniteScroll?: boolean, maxHeight: string }
> = ({ inventoryId, warehouseId, ...props }) => {

    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)

    const [currentPage, setCurrentPage] = useState(0)
    const [historyData, setHistoryData] = useState<WarehouseStockTransaction[]>([])
    // Create state for collapse action
    const [isCollapsed, setIsCollapsed] = useState(true);

    const { isLoading, isFetching, refetch, data: warehouseStockData } = useQuery<{ Results: WarehouseStockTransaction[]; TotalResults: number; ReturnedResults: number }>(
        ['warehouseStock', inventoryId, selectedWarehouse, warehouseId, props.refreshIncrement, currentPage],
        () => getWarehouseStock(inventoryId, warehouseId ?? selectedWarehouse?.ID, currentPage),
        {
            onSettled: () => {
            },
            onError: console.error,
        }
    )

    useEffect(() => {
        if (warehouseStockData) {
            console.log(warehouseStockData.Results)
            setHistoryData(warehouseStockData.Results)
            /*if(warehouseStockData.Results.length < 100) {
                setCurrentPage(-1) // will stop further requests if there is not expected to be further data
            }*/
            // const reversedData = [...warehouseStockData.Results]/*.reverse()*/
            // setHistoryData(p => [...reversedData, ...p])
        }
    }, [warehouseStockData])

    useDidUpdate(() => {
        //setIsCollapsed(true)
    }, [inventoryId, warehouseId]);

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (historyData.length !== 0 && historyData.length < 101) {
            // console.log('scroll to bottom', scrollAreaRef.current)
            scrollAreaRef.current?.scrollTo({ top: 1000, behavior: 'smooth' })
        }
    }, [historyData.length]);

    /* todo const handleScroll = (scroll) => {
        const percentageScrolled = ((scroll.target.scrollTop) / (scroll.target.scrollHeight - scroll.target.offsetHeight)) * 100
        // console.log('scrolling: ' + percentageScrolled + '%')
    };*/

    return <>
        <Flex justify={'space-between'} align={'center'} mt={25}>
            <Flex gap={5} align={'center'} onClick={() => setIsCollapsed(p => !p)} role={'button'} style={{ cursor: 'pointer' }}>
                <Text c={historyData?.length === 0 && !isLoading ? 'dimmed' : 'gray.7'} size={'xl'} fw={600} lineClamp={1}>
                    Recent Stock Movement
                </Text>
                <ActionIcon
                    variant={'transparent'}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(p => !p);
                    }}
                    style={{
                        rotate: isCollapsed ? '0deg' : '90deg',
                        transition: '250ms'
                    }}
                    color={'gray'}
                >
                    <IconChevronRight size={18} />
                </ActionIcon>
            </Flex>

            <AnimatePresence>
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 2
                    }}
                >
                    {
                        !warehouseId && !isCollapsed && (historyData?.length !== 0 || selectedWarehouse) &&
                        <Box>
                            <WarehouseSelector
                                icon={<IconFilter size={'14px'} />}
                                size={'xs'}
                                selectedWarehouse={selectedWarehouse}
                                setSelectedWarehouse={(w) => {
                                    setSelectedWarehouse(w)
                                    setCurrentPage(0)
                                    // setHistoryData([])
                                }}
                                filterByEmployee={false}
                                label={''}
                                mt={0}
                                hideFromView
                                onSuppressSave={() => {}}
                                ignoreIDs={[]}
                                autoSelect={true}
                            />
                        </Box>
                    }
                </motion.div>

            </AnimatePresence>
        </Flex>

        {
            <AnimatePresence>
                {
                    !isCollapsed &&
                    <motion.div
                        initial={{
                            opacity: 0,
                            // height: 0
                        }}
                        animate={{
                            opacity: 1,
                            // height: 'auto'
                        }}
                        exit={{
                            opacity: 0,
                            // height: 0
                        }}
                        transition={{
                            duration: .4,
                        }}
                    >

                        <ScrollArea.Autosize
                            mah={props.maxHeight}
                            mih={isCollapsed ? 0 : 250}
                            h={'100%'}
                            offsetScrollbars
                            ref={scrollAreaRef}
                            // onScrollCapture={handleScroll}
                            scrollHideDelay={0}
                            scrollbars={'y'}
                        >
                            {
                                isFetching && <></>
                            }
                            {
                                historyData?.length ?
                                    <Timeline
                                        bulletSize={38}
                                        mt={'xl'}
                                    >
                                        {
                                            historyData.map(
                                                x => (
                                                    <Timeline.Item
                                                        title={
                                                            <Flex justify={'space-between'} align={'center'}>
                                                                <Flex align={'center'} gap={5}>
                                                                    {
                                                                        x.TransactionType !== 'Used' && x.TransactionType !== 'Purchase' &&
                                                                        <Text size={'md'} c={'gray.9'}>
                                                                            {/*x.TransactionType === 'Used' ? 'Used in ' : */x.TransactionType}
                                                                        </Text>
                                                                    }
                                                                    {
                                                                        x.TransactionType === 'Purchase' && <Link href={'/stocktransaction/' + x.StockTransactionID}
                                                                            style={{ textDecoration: 'none' }}
                                                                        >
                                                                            <Anchor size={'md'} c={'scBlue.9'}>
                                                                                {x.StockTransactionNumber}
                                                                            </Anchor>
                                                                        </Link>
                                                                    }
                                                                    {
                                                                        x.JobCardID &&
                                                                        <Link href={'/job/' + x.JobCardID}
                                                                            style={{ textDecoration: 'none' }}
                                                                        >
                                                                            <Anchor size={'md'} c={'scBlue.9'}>
                                                                                {x.JobCardNumber}
                                                                            </Anchor>
                                                                        </Link>
                                                                    }
                                                                    {
                                                                        x.PurchaseOrderID &&
                                                                        <Link href={'/purchase/' + x.PurchaseOrderID}
                                                                            style={{ textDecoration: 'none' }}
                                                                        >
                                                                            <Anchor size={'md'} c={'scBlue.9'}>
                                                                                {x.PurchaseOrderNumber}
                                                                            </Anchor>
                                                                        </Link>
                                                                    }
                                                                    {
                                                                        x.InvoiceID &&
                                                                        <Link href={'/invoice/' + x.InvoiceID}
                                                                            style={{ textDecoration: 'none' }}
                                                                        >
                                                                            <Anchor size={'md'} c={'scBlue.9'}>
                                                                                {x.InvoiceNumber}
                                                                            </Anchor>
                                                                        </Link>
                                                                    }
                                                                </Flex>

                                                                <Text c="gray.8" size="sm">
                                                                    {x.WarehouseCode ?? x.WarehouseName} {/*{(x.WarehouseCode ?? x.WarehouseName) && '-'} {(x.StockTransactionNumber)}*/}
                                                                </Text>
                                                            </Flex>
                                                        }
                                                        key={x.TransactionID}
                                                        bullet={
                                                            <ThemeIcon
                                                                size={34}
                                                                // variant="gradient"
                                                                // gradient={{ from: 'scBlue', to: 'lime' }}
                                                                radius="xl"
                                                                color={x.Quantity < 0 ? 'yellow.8' : 'scBlue.3'}
                                                            >
                                                                <Text size={'sm'}>
                                                                    {x.Quantity < 0 ? '' : '+'}{x.Quantity}
                                                                </Text>

                                                            </ThemeIcon>
                                                        }
                                                    >
                                                        <Flex align={'center'} justify={'space-between'}
                                                            direction={'row-reverse'} gap={'sm'} w={'100%'}>
                                                            <Flex gap={4} align={'center'}>
                                                                {/*<EmployeeAvatar name={x.Username} size={.9} color={''} />*/}
                                                                {/*<Text fw={'lighter'} size={'xs'}>
                                                                        Updated by
                                                                    </Text>*/}
                                                                <Text size={'sm'} fw={'lighter'}>
                                                                    {x.Username}
                                                                </Text>
                                                                {/*<EmployeeAvatar name={x.Username} size={.5} color={''} />*/}
                                                            </Flex>

                                                            <Text c="gray.7" size="sm" title={x.TransactionDate}>
                                                                {
                                                                    moment(Date.now()).diff(x.TransactionDate) < 1000 * 60 ? moment(x.TransactionDate).fromNow() :
                                                                        moment(Date.now()).isSame(x.TransactionDate, 'date') ? `Today - ${moment(x.TransactionDate).format('h:mm a')}` :
                                                                            moment(Date.now()).diff(x.TransactionDate) < 1000 * 60 * 60 * 24 * 364 ? moment(x.TransactionDate).format('ddd, D MMM - h:mm a') :
                                                                                moment(x.TransactionDate).format('D MMM YY - hh:mm a')
                                                                }
                                                            </Text>
                                                        </Flex>
                                                    </Timeline.Item>
                                                )
                                            )
                                        }

                                    </Timeline>
                                    :
                                    (
                                        <Text pt={25} ta={'center'} c={'dimmed'}>
                                            Stock level changes will be shown here
                                        </Text>
                                    )
                            }
                        </ScrollArea.Autosize>
                    </motion.div>
                }
            </AnimatePresence>

        }
    </>
}

export default StockTransactionHistory
