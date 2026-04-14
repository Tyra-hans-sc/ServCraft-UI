import React, {FC, useEffect, useState} from "react";
import {Link} from "@/interfaces/api/models";
import SCModal from "@/PageComponents/Modal/SCModal";
import ManageLinksTableV2 from "@/PageComponents/Links/ManageLinksTableV2";
import {Box, Button, Group, Loader, Title, Text} from "@mantine/core"; // Imported Text from mantine
import LinkItem from "@/PageComponents/Links/LinkItem";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import linkService from "@/services/link/link-service";
import {showNotification, updateNotification} from "@mantine/notifications";

export const getNewLink: (
        (
            linkItemProps: {
                item: any
                itemModule: number
                itemDocNumKey: string
                linkItemModule: number
                linkType: number
                linkItemDocNumKey: string
            },
            linkItem: any
        ) => Link
    ) = (props, linkItem) => {
    const linkedItem = {
        docNum: linkItem[props.linkItemDocNumKey],
        item: linkItem,
        id: linkItem.ID,
        module: props.linkItemModule
    }
    const moduleItem = {
        docNum: props.item[props.itemDocNumKey],
        item: props.item,
        id: props.item.ID,
        module: props.itemModule
    }

    return  {
        // which item is item1 and item2 does not matter
        LinkType: props.linkType,
        IsActive: true,
        Item1: /*props.linkItemNumber === 1 ? linkedItem.item : moduleItem.item,*/ moduleItem.item,
        Item1ID: /*props.linkItemNumber === 1 ? linkedItem.id : moduleItem.id,*/ moduleItem.id,
        Item1Module: /*props.linkItemNumber === 1 ? linkedItem.module : moduleItem.module,*/ moduleItem.module,
        Item1DocNum: /*props.linkItemNumber === 1 ? linkedItem.docNum : moduleItem.docNum,*/ moduleItem.docNum,
        Item2: /*props.linkItemNumber === 2 ? linkedItem.item : moduleItem.item,*/ linkedItem.item,
        Item2ID: /*props.linkItemNumber === 2 ? linkedItem.id : moduleItem.id,*/ linkedItem.id,
        Item2Module: /*props.linkItemNumber === 2 ? linkedItem.module : moduleItem.module,*/ linkedItem.module,
        Item2DocNum: /*props.linkItemNumber === 2 ? linkedItem.docNum : moduleItem.docNum*/ linkedItem.docNum,
    }
}

const ManageLinksModal: FC<{
    show: boolean
    onClose: () => void
    onSuccess: () => void
    item: any
    itemModule: number
    itemDocNumKey: string
    linkItemModule: number
    linkType: number
    linkItemDocNumKey: string
    linkItemNumber: 1 | 2
    linkNoun: string
    linkNounMultiple: string
    title: string
    onChange?: (links: Link[]) => void
    noItemsText: string
}> = (props) => {

    const [linkedItems, setLinkedItems] = useState<Link[]>([])
    const [initialItems, setInitialItems] = useState<any[] | null>(null)

    const [selectedItem, setSelectedItem] = useState<any>(null)

    const [error, setError] = useState<string | null>(null)

    const queryClient = useQueryClient()

    const linkMutation = useMutation(['link', props.itemModule, props.linkItemModule], linkService.saveLink, {
        onError: (error: any, {Item1DocNum, Item2DocNum, IsActive}) => {
            console.error(error)
            const message = error.message || `Unable to ${IsActive ? 'link' : 'unlink'} ${Item1DocNum} and ${Item2DocNum}`
            setError(message)
            updateNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum,
                message,
                color: 'yellow',
                loading: false,
                autoClose: 4000
            })
        },
        onMutate: ({Item1DocNum, Item2DocNum, IsActive}) => {
            showNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum,
                message: `${IsActive ? 'Linking ' : 'Unlinking'} ${Item1DocNum} and ${Item2DocNum}`,
                color: 'scBlue',
                loading: true,
                autoClose: false
            })
        },
        onSuccess: (data, {Item1DocNum, Item2DocNum, IsActive}, context) => {
            updateNotification({
                id: 'linkingItem' + Item1DocNum + Item2DocNum,
                message: `Successfully ${IsActive ? 'linked' : 'unlinked'} ${Item1DocNum} and ${Item2DocNum}`,
                color: 'scBlue',
                loading: false,
                autoClose: 3000
            })
        },
        onSettled: async () => {
            props.onSuccess && props.onSuccess()
            handleClose()
            await queryClient.invalidateQueries(['linkedItemsQuery'], {
                refetchType: 'all',
                type: 'all'
            })
        }
    })


    const onCreateLink = () => {
        // console.log('on create', props, selectedItem)

        if(!selectedItem) {
            setError(
                `Please select a ${props.linkNoun.toLowerCase()} to link`
            )
        } else if(!linkMutation.isLoading) {

            const newLink: any = getNewLink(props, selectedItem)

            linkMutation.mutate(newLink)
        }

    }

    useEffect(() => {
        if(selectedItem) {
            setError(null)
        }
    }, [selectedItem]);

    const handleClose = () => {
        setSelectedItem(null)
        setError(null)
        setInitialItems(null)
        setLinkedItems([])
        props.onClose && props.onClose()
    }

    return <>
        <SCModal open={props.show}
                 onClose={handleClose}
                 modalProps={{
                     size: 570,
                     // keeping mounted if component has loaded with items and busy - this ensures onSettled and onSuccess query callbacks are executed even when modal is closed - will destroy once completed
                     keepMounted: initialItems && !linkMutation.isIdle
                 }}
        >

            <Title order={4} mb={'md'} mt={25}>
                {props.title}
            </Title>

            <Box style={{
                display: linkedItems.length === 0 ? 'none' : 'block'
            }}>
                <ManageLinksTableV2
                    {...props}
                    title={`Already linked ${props.linkNounMultiple.toLowerCase()}:`}
                    withAddButton={false}
                    onLinkedItemsLoaded={setLinkedItems}
                    width={535}
                />

            </Box>

            <Box p={'sm'} pt={0}>
                <Box style={{
                    display: initialItems?.length === 0 ? 'none' : 'block'
                }}>
                    <Title order={6} mb={'md'} mt={25}>
                        Select a {props.linkNoun.toLowerCase()} to link <span style={{color: 'red'}}>*</span> {/* Changed Text component to span with style */}
                    </Title>

                    <LinkItem
                        module={props.linkItemModule}
                        customerID={props.item.CustomerID}
                        setSelected={setSelectedItem}
                        selectedItem={selectedItem}
                        onItemsLoaded={(items) => {
                            !initialItems && setInitialItems(items)
                        }}
                        blacklist={linkedItems}
                        inlineMode
                        error={error}
                        miw={500}
                        additionalQueryParams={{IncludeClosed: true}}
                    />
                </Box>
            </Box>
            {
                initialItems?.length === 0 &&
                <Box>
                    <Text my={'md'} mb={40} style={{textAlign: 'center'}}>
                        {props.noItemsText}
                    </Text>
                </Box>
            }


            <Group mt={'md'} justify={'right'} gap={'xs'}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={handleClose}>
                    Close
                </Button>
                <Button
                    color={'scBlue'}
                    type={'button'}
                    disabled={!selectedItem}
                    onClick={onCreateLink}
                        rightSection={linkMutation.isLoading && <Loader variant={'oval'} size={18} color={'white'}/>}
                >
                    Link
                </Button>
            </Group>

        </SCModal>
    </>
}

export default ManageLinksModal
