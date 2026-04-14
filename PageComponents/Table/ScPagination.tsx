import {FC, useEffect, useState} from "react";
import {ScTablePaginationProps} from "@/PageComponents/Table/table-model";
import {ActionIcon, Button, Flex, Group, Menu, Text} from "@mantine/core";
import {IconChevronDown, IconChevronLeft, IconChevronRight} from "@tabler/icons";
import {useElementSize} from "@mantine/hooks";


const ScPagination: FC<ScTablePaginationProps> = (props) => {
    const increment = () => {
        props.onChange({
            pageSize: props.pageSize,
            pageIndex: props.currentPage + 1
        })
    }
    const decrement = () => {
        props.onChange({
            pageSize: props.pageSize,
            pageIndex: props.currentPage - 1
        })
    }

    const setPage = (pageSize) => {
        const page = props.currentPage

        if (page === 0) {
            props.onChange(
                {
                    pageSize,
                    pageIndex: 0
                }
            )
        } else {
            const firstElement = props.pageSize * props.currentPage
            const pageIndex = Math.floor(firstElement / pageSize)
            props.onChange(
                {
                    pageSize,
                    pageIndex
                }
            )
        }
    }

   /* const [currentPage, setCurrentPage] = useState(props.currentPage)
    useEffect(() => {
        props.onChange({
            pageSize: pageSize,
            pageIndex: currentPage
        })
    }, [currentPage])
    const [pageSize, setPageSize] = useState(props.pageSize)*/

    const {ref, width} = useElementSize()
    const mobileView = width < 500
    const optimizePageText = width < 380

    return <>
        <Flex gap={'lg'} justify={'space-between'} hidden={props.totalElements === 0}
              ref={ref}
              w={'100%'}
              align={'center'}
        >
            <Flex>
                {
                    typeof props.totalOnPage === 'number' && typeof props.totalElements === 'number' && props.totalOnPage !== 0 &&
                    <Text c={'dimmed'} size={mobileView ? 'sm' : 'md'}>{props.pageSize * props.currentPage + 1}-{props.pageSize * props.currentPage + props.totalOnPage} of {props.totalElements}</Text>
                }
            </Flex>

            <Flex align={'center'} gap={'xl'}>
                {
                    // typeof props.pageSize === 'number' &&
                    !props.hidePageSizeDropdown && <Flex  align={'center'} gap={'xs'}>
                        <Text c={'dimmed'} size={mobileView ? 'sm' : 'md'}>{mobileView ? props.rowsRelabel ? props.rowsRelabel + ': ' : 'Rows:' :  (props.rowsRelabel ? props.rowsRelabel + ' ' : 'Rows ')  + 'per page:'} </Text>
                        <Menu width={10}>
                            <Menu position={'top-start'} withArrow>
                                <Menu.Target>
                                    <ActionIcon size={'sm'} w={45} variant={'transparent'} color={'gray'}>{props.pageSize} <IconChevronDown size={16} /></ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {
                                        [/*5, */10, 20, 50, 100].map(
                                            (n) => (
                                                <Menu.Item
                                                    key={'pageSize' + n}
                                                    onClick={() => setPage(n)}
                                                >
                                                    <Text c={'dimmed'}>{n}</Text>
                                                </Menu.Item>
                                            )
                                        )
                                    }
                                </Menu.Dropdown>
                            </Menu>
                        </Menu>
                    </Flex>
                }
                {
                    typeof props.totalElements === 'number' &&
                    <Flex align={'center'} gap={'sm'}>
                        <Text c={'dimmed'} size={mobileView ? 'sm' : 'md'}>{optimizePageText ? ('Page ') : 'Page '}{props.currentPage + 1}{!optimizePageText ? ' of ' : '/'}{Math.ceil(props.totalElements / props.pageSize)}</Text>
                        <Flex align={'center'} gap={'xs'}>
                            <ActionIcon
                                onClick={decrement}
                                // onClick={() => setCurrentPage(p => p - 1)}
                                // disabled={currentPage === 0}
                                disabled={props.currentPage === 0}
                                variant={'transparent'}
                                color={'gray'}
                                bg={'transparent'}
                            >
                                <IconChevronLeft />
                            </ActionIcon>
                            <ActionIcon
                                onClick={increment}
                                // onClick={() => setCurrentPage(p => p + 1)}
                                // disabled={currentPage === Math.floor(props.totalElements / props.pageSize)}
                                disabled={props.totalOnPage === 0 || props.currentPage + 1 === Math.ceil(props.totalElements / props.pageSize)}
                                variant={'transparent'}
                                color={'gray'}
                                bg={'transparent'}
                            >
                                <IconChevronRight />
                            </ActionIcon>
                        </Flex>
                    </Flex>
                }
            </Flex>
        </Flex>
    </>
}


export default ScPagination
