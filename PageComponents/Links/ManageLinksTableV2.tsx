import { Link } from '@/interfaces/api/models';
import linkService from '@/services/link/link-service';
import {Text} from '@mantine/core';
import React, { FC, useEffect, useMemo, useState } from 'react';
import * as Enums from '@/utils/enums';
import SimpleTable, {SimpleColumnMapping} from "@/PageComponents/SimpleTable/SimpleTable";
import LinkItem from "@/PageComponents/Links/LinkItem";
import {IconLinkMinus, IconLinkOff, IconSquareRoundedMinus} from "@tabler/icons-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {showNotification, updateNotification} from "@mantine/notifications";
import {getNewLink} from "@/PageComponents/Links/ManageLinksModalV2";
import { TableActionStates } from '../Table/table-model';
import {isActive} from "@tiptap/core";

const linkTableColumnMappingByModule: {[moduleNumber: number]: SimpleColumnMapping[]} = {
    [Enums.Module.JobCard]: [
        {
            label: 'Query Code',
            key: 'QueryCode',
            linkHrefFunction: (x: any) => ('/query/' + x.ID),
        },
        {
            label: 'Description',
            key: 'Description',
        },
        {
            label: 'Query Status',
            key: 'QueryStatusDescription',
            colorKey: 'QueryStatusDisplayColor',
            type: 'status'
        },
    ],
    [Enums.Module.Query]: [
        {
            label: 'Job Number',
            key: 'JobCardNumber',
            linkHrefFunction: (x: any) => ('/job/' + x.ID),
        },
        {
            label: 'Description',
            key: 'Description',
        },
        {
            label: 'Status',
            key: 'JobCardStatusDescription',
            colorKey: 'JobCardStatusDisplayColor',
            type: 'status',
        },
    ],
}

const getLinkedItems = (data: any[] | undefined, linkModule: number) => data?.map(link => {
    return link.Item1Module === linkModule ? link.Item1 : link.Item2Module === linkModule ? link.Item2 : undefined
})

const ManageLinksTable: FC<{
    item: any
    itemModule: number
    itemDocNumKey: string
    linkItemModule: number
    linkItemDocNumKey: string
    linkType: number
    title: string
    onChange?: (links: Link[]) => void
    onLinkedItemsLoaded?: (linkedItems: any[]) => void
    // triggers when items are removed and list becomes empty
    onNoItems?: () => void
    withAddButton?: boolean
    width?: number,
    countValue?: number
}> = (props/*{ item, itemModule, linkType, title = "Linked Items", onChange }*/) => {

    const linksQuery = useQuery(['linkedItemsQuery'], () => linkService.getLinksForItem(props.item.ID, props.linkType))

    // Call onNoItems when query data changes and is empty
    useEffect(() => {
        if (linksQuery.data?.length === 0) {
            props.onNoItems && props.onNoItems()
        }
    }, [linksQuery.data])

    const linkedItems = useMemo(
        () => getLinkedItems(linksQuery.data && [...linksQuery.data] || [], props.linkItemModule),
        [props.linkItemModule, linksQuery.data]
    )
    useEffect(() => {
        linkedItems && props.onLinkedItemsLoaded && props.onLinkedItemsLoaded(linkedItems)
    }, [linkedItems]);

    useEffect(() => {
        if(props.countValue !== linkedItems?.length && !linksQuery.isRefetching) {
            linksQuery.refetch({
                type: 'all'
            })
        }
    }, [props.countValue]);

    const [delinkingItems, setDelinkingItems] = useState<TableActionStates>({})
    const [busyStates, setBusyItems] = useState<string[]>([])

    const linkMutation = useMutation(['link', props.itemModule, props.linkItemModule], linkService.saveLink, {
        onError: (error: any, {Item1DocNum, Item2DocNum, IsActive, Item1ID, Item2ID, Item2Module}) => {
            console.error(error)
            const message = error.message || `Unable to ${IsActive ? 'link' : 'unlink'} ${Item1DocNum} and ${Item2DocNum}`
            updateNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum + IsActive,
                message,
                color: 'yellow',
                loading: false,
                autoClose: 4000
            })
            !IsActive && setDelinkingItems(p => ({...p, ['remove' + (props.linkItemModule === Item2Module ? Item2ID : Item1ID)]: 'error'}))
            setBusyItems(p => p.filter(x => x !== (props.linkItemModule === Item2Module ? Item2ID : Item1ID)))
        },
        onMutate: ({Item1DocNum, Item2DocNum, IsActive, Item1ID, Item2ID, Item2Module}) => {
            showNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum + IsActive,
                message: `${IsActive ? 'Linking ' : 'Unlinking'} ${Item1DocNum} and ${Item2DocNum}`,
                color: 'scBlue',
                loading: true,
                autoClose: false
            })
            !IsActive && setDelinkingItems(p => ({...p, ['remove' + (props.linkItemModule === Item2Module ? Item2ID : Item1ID)]: 'loading'}))
            setBusyItems(p => [...p, props.linkItemModule === Item2Module ? Item2ID : Item1ID])
        },
        onSuccess: (data, {Item1DocNum, Item2DocNum, IsActive, Item1ID, Item2ID, Item2Module}) => {
            updateNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum + IsActive,
                message: `Successfully ${IsActive ? 'linked' : 'unlinked'} ${Item1DocNum} and ${Item2DocNum}`,
                color: 'scBlue',
                loading: false,
                autoClose: 3000
            })
            props.onChange && props.onChange([]) // callback not currently using new links list so not implemented
            !IsActive && setDelinkingItems(p => ({...p, ['remove' + (props.linkItemModule === Item2Module ? Item2ID : Item1ID)]: 'success'}))
            !IsActive && setTimeout(() => setDelinkingItems(p => ({...p, ['remove' + (props.linkItemModule === Item2Module ? Item2ID : Item1ID)]: 'none'})), 1000)
            setBusyItems(p => p.filter(x => x !== (props.linkItemModule === Item2Module ? Item2ID : Item1ID)))
        },
        onSettled: () => {
            linksQuery.refetch()
        }
    })

    const handleTableAction = (actionName: string, tableItem: any, i: number) => {
        const link: Link | undefined = linksQuery.data?.find(x => props.linkItemModule === x.Item2Module ? x.Item2ID === tableItem.ID : x.Item1ID === tableItem.ID)
        if(link) {
            if(actionName === 'remove') {
                linkMutation.mutate({...link, IsActive: false})
            }
        }
    }

    const handleAddItemLink = (itemToBeLinked: any) => {
        const link = getNewLink(props, itemToBeLinked)
        linkMutation.mutate(link)
    };


    return (<>
        <Text mb={10} mt={'sm'} size={'md'} fw={600}>
            {props.title}
        </Text>


        <SimpleTable data={linkedItems || []}
                     mapping={linkTableColumnMappingByModule[props.itemModule]}
                     stylingProps={{
                         compact: true
                     }}
                     addButton={ props.withAddButton || typeof props.withAddButton === 'undefined' ?
                        {
                            label: 'test',
                            callback: () => {},
                            customComponent: <LinkItem
                                module={props.linkItemModule}
                                customerID={props.item.CustomerID}
                                setSelected={(itemToBeLinked) => handleAddItemLink(itemToBeLinked)}
                                selectedItem={null}
                                disabledItems={busyStates.map(id => ({ID: id}))}
                                blacklist={ linkedItems }
                                additionalQueryParams={{IncludeClosed: true}}
                            />
                        } : undefined
                     }
                     controls={[
                         {
                             label: 'Unlink',
                             activeLabel: 'Unlinking',
                             name: 'remove',
                             icon: <IconLinkMinus />,
                             type: 'warning'
                         }
                     ]}
                     onAction={handleTableAction}
                     tableActionStates={delinkingItems}
                     showControlsOnHover={false}
                     width={props.width}
        />
    </>);
};

export default ManageLinksTable;