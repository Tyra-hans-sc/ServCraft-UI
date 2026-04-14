import React, { useState, useEffect, useContext, useRef, useCallback, ForwardedRef } from 'react';
import ToastContext from '../../utils/toast-context';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import FileService from '../../services/file-service';
import AttachmentService from '../../services/attachment-service';
import BusyIndicatorContext from '../../utils/busy-indicator-context';
import Constants from '../../utils/constants';
import MenuButton from "../../PageComponents/Button/MenuButton";
import { ActionIcon, Box, Flex, Group, Loader, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconDragDrop, IconDragDrop2, IconPhoto, IconPhotoFilled, IconRefresh, IconX } from "@tabler/icons-react";
import tableStyles from "@/PageComponents/Table/Table/ScTableData.module.css";
import ScPagination from "@/PageComponents/Table/ScPagination";
import { PageProps } from "@/PageComponents/Table/table-model";
import AttachmentItem from "@/PageComponents/Attachment/AttachmentItem";
import { Dropzone } from "@mantine/dropzone";
import { AnimatePresence, motion } from "framer-motion";
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import { IconSearch } from "@tabler/icons";
import useDebouncedCallback from "@restart/hooks/useDebouncedCallback";
import styles from "@/PageComponents/Message/MessageItems/MessageItem.module.css";
import { Attachment } from '@/interfaces/api/models'
import { set } from "zrender/lib/core/vector";
import helper from "@/utils/helper";
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import { colors } from '@/theme';
import { notifications } from "@mantine/notifications";

// Define types for props
interface AttachmentsProps {
    topMargin?: boolean;
    displayName: string;
    itemId: number;
    module: string;
    onRefresh: () => void;
    accessStatus: number;
    triggerRefresh: boolean;
}

interface FilterIds {
    AttachmentTypes: number[];
}

type ViewType = "Large Thumbnail" | "Small Thumbnail";
const viewTypeStorage = "att_vt";

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20, // Start with a slight downward motion
    },
    visible: {
        opacity: 1,
        y: 0, // Move into place
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: -20, // Exit upwards
        transition: {
            duration: 0.3,
            ease: "easeIn",
        },
    },
};

//
const determineBestAttachmentTypeBasedOnContentType: (contentType: string) => typeof Enums.AttachmentType[keyof typeof Enums.AttachmentType] = (contentType) => {
    // Convert to lowercase for easier comparison
    const type = contentType.toLowerCase();

    // Image types
    if (type.startsWith('image/')) {
        return Enums.AttachmentType.Image;
    }

    // Audio types
    if (type.startsWith('audio/')) {
        return Enums.AttachmentType.Audio;
    }

    // Default fallback
    return Enums.AttachmentType.Other;
};


export const attachmentTypeOptions = Object.entries(Enums.AttachmentType).filter(([, v]) => (
        [
            Enums.AttachmentType.Quote,
            Enums.AttachmentType.Invoice,
            Enums.AttachmentType.POP,
            Enums.AttachmentType.POD,
            Enums.AttachmentType.Image,
            Enums.AttachmentType.DisplayImage,
            Enums.AttachmentType.Audio,
            Enums.AttachmentType.Contract,
            Enums.AttachmentType.Logo,
            Enums.AttachmentType.JobCard,
            Enums.AttachmentType.PurchaseOrder,
            Enums.AttachmentType.None,
            Enums.AttachmentType.Other,
        ].includes(v)
    )).map(
        ([name, val]) => ({
            // label: name.replace(/([A-Z])/g, ' $1').trim(),
            label: name.replace(/([A-Z]+)([A-Z][a-z])|([a-z])([A-Z])/g, '$1$3 $2$4').trim(),
            value: val + '',
        })
    );

export const attachmentTypeOptionsNonImage = Object.entries(Enums.AttachmentType).filter(([, v]) => (
    [
        Enums.AttachmentType.Quote,
        Enums.AttachmentType.Invoice,
        Enums.AttachmentType.POP,
        Enums.AttachmentType.POD,
        Enums.AttachmentType.Audio,
        Enums.AttachmentType.Contract,
        Enums.AttachmentType.JobCard,
        Enums.AttachmentType.PurchaseOrder,
        Enums.AttachmentType.None,
        Enums.AttachmentType.Other,
    ].includes(v)
)).map(
    ([name, val]) => ({
        // label: name.replace(/([A-Z])/g, ' $1').trim(),
        label: name.replace(/([A-Z]+)([A-Z][a-z])|([a-z])([A-Z])/g, '$1$3 $2$4').trim(),
        value: val + '',
    })
);

const Attachments: React.FC<AttachmentsProps> = ({
    topMargin = true,
    displayName,
    itemId,
    module,
    onRefresh,
    accessStatus,
    triggerRefresh,
}) => {
    const busyIndicator = useContext<any>(BusyIndicatorContext);
    const toast = useContext<any>(ToastContext);

    const [attachmentType, setAttachmentType] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [searchVal, setSearchVal] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);
    const attachmentTypes = Enums.getAttachmentTypes(); // Should be typed if enum is available
    const [activeFilterIds, setActiveFilterIds] = useState<FilterIds>({ AttachmentTypes: [] });

    const [totalResults, setTotalResults] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const pageSizeUpdate = useRef<boolean>(true);

    const [taskItems, setTaskItems] = useState<any[]>([]); // Adjust the type based on actual task item structure

    const pageSizeChanged = (size: number) => {
        if (size !== pageSize) {
            setPageSize(size);
        } else {
            pageSizeUpdate.current = false;
        }
    };

    const pageChanged = (page: number) => {
        setCurrentPage(page);
    };

    const getTaskItems = async () => {
        const taskItemResponse = await Fetch.get({
            url: '/TaskItem/GetTaskItemsForItem',
            params: {
                itemID: itemId,
            },
        });

        setTaskItems(taskItemResponse.Results);
    };

    useEffect(() => {

        if (typeof window !== "undefined") {
            let vt = window.localStorage.getItem(viewTypeStorage);
            setViewType(_vt => (vt as ViewType) ?? _vt);
        }

        getTaskItems();
    }, []);

    useEffect(() => {
        searchAttachments();
    }, [triggerRefresh]);

    useEffect(() => {
        if (pageSizeUpdate.current) {
            pageSizeUpdate.current = false;
            return;
        }
        if (currentPage === 1) {
            searchAttachments();
        } else {
            setCurrentPage(1);
        }
    }, [pageSize, activeFilterIds]);

    const firstUpdatePage = useRef<boolean>(true);

    useEffect(() => {
        if (firstUpdatePage.current) {
            firstUpdatePage.current = false;
        } else {
            searchAttachments();
        }
    }, [currentPage]);

    const viewTypes: ViewType[] = ["Large Thumbnail", "Small Thumbnail"];
    const [viewType, setViewType] = useState<ViewType>("Large Thumbnail");

    const [queryParams, setQueryParams] = useState<any>({
        pageSize: 20,
        pageIndex: 0,
        searchPhrase: '',
        AttachmentTypeList: [],
        ItemID: itemId,
        SortDirection: 'descending',
        SortExpression: 'CreatedDate',
    })

    const handlePaginationChange = useCallback(
        (pageProps: PageProps) => {
            // cancelActiveDataQuery()
            setQueryParams(p => ({ ...p, ...pageProps }))
            // cancelDebouncedTableState()
        }, []
    )

    const [attachmentItems, setAttachmentItems] = useState<Attachment[]>([]);

    const attachmentsQuery = useQuery(
        ['itemAttachments', itemId, queryParams],
        () => AttachmentService.searchAttachments(queryParams),
        {
            keepPreviousData: true,
       }
    )

    useEffect(()=>{
        if(attachmentsQuery.isSuccess && attachmentsQuery.data?.Results){
            setAttachmentItems(attachmentsQuery.data.Results)
        }
    },[attachmentsQuery.data,attachmentsQuery.isSuccess ])

    const searchAttachments = async () => {
        setSearching(true);

        const attachmentsResponse = await Fetch.post({
            url: `/Attachment/GetAttachments`,
            params: {
                pageSize: pageSize,
                pageIndex: (currentPage - 1),
                searchPhrase: searchVal,
                AttachmentTypeList: activeFilterIds["AttachmentTypes"],
                ItemID: itemId,
                sortDirection: 'descending',
                sortExpression: 'createddate',
            }
        });

        setAttachments(attachmentsResponse.Results);
        setTotalResults(attachmentsResponse.TotalResults);
        setSearching(false);
    };

    const removeAttachment = (attachmentToRemove: Attachment) => {
        attachmentsQuery.refetch()
        setAttachmentItems(p => p.filter((x) => x.ID !== attachmentToRemove.ID));
        // setAttachments(attachments?.filter((x) => x.ID !== attachmentToRemove.ID));
        // searchAttachments();
        // onRefresh();
    };

    const selectAttachments = async (type: string) => {
        setAttachmentType(+type);
        await helper.waitABit()
        setTimeout(() => {
            openRef.current?.();
        }, 1)
        // document.getElementById('js-attachments-input')?.click();
    };

    const handleAttachmentsChange = async (items: File[]) => {

        setUploading(true);
        busyIndicator.setText("Uploading...");

        let numberOfFiles = items.length;
        let maxFiles = Constants.maximumAttachments;

        if (numberOfFiles > maxFiles) {
            setUploading(false);
            busyIndicator.setText(null);
            toast.setToast({
                message: `You can only select up to ${maxFiles} files at a time.`,
                show: true,
                type: 'error'
            });
            return;
        }

        const fileUploadSize = await FileService.getFileUploadSize();

        let files = items.map((file: any) => {
            let reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        if (reader.result && typeof reader.result === 'string') {
                            let returnObject: any = { Description: file.name, FileName: file.name };
                            let fileBase64 = reader.result.replace(/^data:.+;base64,/, '');

                            let isValid = await AttachmentService.validateAttachment(fileBase64, fileUploadSize);

                            if (isValid) {
                                returnObject.FileBase64 = fileBase64;
                                resolve(returnObject);
                            } else {
                                returnObject.error = `The attachment ${file.name} must be smaller than ${fileUploadSize.Value}${fileUploadSize.Unit}`;
                                resolve(returnObject);
                            }
                        }
                    } catch (e) {
                        console.error(e)
                        reject(e);
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            let results = await Promise.all(files);
            let validFiles = results.filter((res: any) => !res.error);
            let invalidFiles = results.filter((res: any) => res.error);
            if (validFiles.length > 0) {
                
                let saveResponse = await AttachmentService.saveAttachments(attachmentType, validFiles, itemId, module, toast);
                
                if (saveResponse && saveResponse.ResponseStatus === 200) {

                    notifications.show({
                        message: 'The following files uploaded successfully: ' + validFiles.map((f: any) => f.FileName).join(', '),
                        color: 'green',

                    });
                    // searchAttachments();
                    // onRefresh();
                    attachmentsQuery.refetch();
                    onRefresh && onRefresh();
                }
            }
            invalidFiles.forEach((file: any) => {
                notifications.show({
                    message: file.error,
                    color: 'red',
                });
            });
            setUploading(false);
            busyIndicator.setText(null);
        }
        catch (result: any) {
            // console.log('Error:', result);
            notifications.show({
                message: `${result.message || `An error occurred while uploading attachments: ${result}`}`,
                color: 'red',
            });
            setUploading(false);
            busyIndicator.setText(null);
        }
    };

    const setSearch = useDebouncedCallback((searchVal) => setQueryParams(p => ({ ...p, searchPhrase: searchVal })), 300)

    const openRef = useRef<() => void>(null);

    return (
        <div>
            <Flex align={'center'} justify={'space-between'} wrap={'wrap-reverse'} gap={'sm'} mt={topMargin ? 25 : 0}>

                <ScTextControl
                    miw={420}
                    leftSection={<IconSearch />}
                    defaultValue={queryParams.searchPhrase}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setQueryParams(p => ({
                        ...p,
                        searchPhrase: e.currentTarget.value
                    }))}
                    enterKeyHint={'search'}
                    placeholder={'Search'}
                    mt={8}
                />

                <ScDataFilter
                    initialValues={queryParams}
                    onChange={(newFilterValue) => {
                        setQueryParams(p => ({ ...p, ...newFilterValue }));
                    }}
                    optionConfig={{
                        options: [
                            {
                                label: 'Attachment Type',
                                hardcodedOptions: attachmentTypeOptions,
                                filterName: 'AttachmentTypeList',
                            }
                        ]
                    }}
                    tableNoun={'Attachment'}
                    tableName={'attachments'}
                    module={Enums.Module.Attachment}
                />



                <Flex mt={4} align="center" >

                    <Tooltip openDelay={300} color={'scBlue'} label={'Small Thumbnail'} >
                        <ActionIcon
                            c={colors.bluePrimary}
                            variant={'transparent'}
                            size={'xs'}
                            onClick={e => {
                                e.stopPropagation();
                                let val: ViewType = "Small Thumbnail";
                                setViewType(val);
                                window.localStorage.setItem(viewTypeStorage, val);
                            }}
                        >
                            {viewType === "Small Thumbnail" ? <IconPhotoFilled /> : <IconPhoto />}
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip openDelay={300} color={'scBlue'} label={'Large Thumbnail'} >
                        <ActionIcon
                            c={colors.bluePrimary}
                            variant={'transparent'}
                            size={'xl'}
                            onClick={e => {
                                e.stopPropagation();
                                let val: ViewType = "Large Thumbnail";
                                setViewType(val);
                                window.localStorage.setItem(viewTypeStorage, val);
                            }}
                        >
                            {viewType === "Large Thumbnail" ? <IconPhotoFilled /> : <IconPhoto />}
                        </ActionIcon>
                    </Tooltip>
                </Flex>
                <Box ml={'auto'}>
                    <MenuButton
                        disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                        action={selectAttachments}
                        text="Add Attachment(s)"
                        isBusy={uploading}
                        legacyOptions={[
                            { text: 'Other', link: Enums.AttachmentType.Other + '' },
                            { text: 'Quote', link: Enums.AttachmentType.Quote + '' },
                            { text: 'Invoice', link: Enums.AttachmentType.Invoice + '' },
                            { text: 'POP', link: Enums.AttachmentType.POP + '' },
                            { text: 'POD', link: Enums.AttachmentType.POD + '' },
                            { text: 'Image', link: Enums.AttachmentType.Image + '' },
                            { text: 'Audio', link: Enums.AttachmentType.Audio + '' },
                            { text: 'Contract', link: Enums.AttachmentType.Contract + '' },
                            { text: 'Logo', link: Enums.AttachmentType.Logo + '' },
                            { text: 'Job Card', link: Enums.AttachmentType.JobCard + '' },
                            { text: 'Purchase Order', link: Enums.AttachmentType.PurchaseOrder + '' },
                            { text: 'None', link: Enums.AttachmentType.None + '' },
                        ]}
                    />
                </Box>
            </Flex>

            <Dropzone openRef={openRef}
                activateOnClick={false}
                onDrop={(files) => handleAttachmentsChange(files)}
                onReject={(files) => console.log('rejected files', files)}
            >
                {
                    attachmentsQuery.isInitialLoading ? (
                        <Flex align={'center'} justify={'center'} direction={'column'} mih={'40vh'}>
                            <Loader size={40} />
                        </Flex>
                    )
                        :

                        <SimpleGrid
                            my={'sm'}
                            cols={viewType === "Large Thumbnail" ?
                                { base: 1, xs: 2, sm: 3, lg: 6, xl: 7, xxl: 8 }
                                : viewType === "Small Thumbnail" ?
                                    { base: 3, xs: 4, sm: 5, lg: 8, xl: 9, xxl: 10 } :
                                    { base: 1, xs: 2, sm: 3, lg: 6, xl: 7, xxl: 8 }}
                            spacing={{ base: 10, sm: 'xl' }}
                            verticalSpacing={{ base: 'md', sm: 'xl' }}
                        >
                            <Dropzone.Accept>
                                <Flex mih={attachments.length === 0 ? 150 : 'auto'} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                    className={styles.placeholderCard} bg={'scBlue.0'} style={{ borderColor: 'var(--mantine-color-scBlue-5)' }}
                                >
                                    <IconDragDrop size={32} color="var(--mantine-color-scBlue-5)" stroke={1.5} />
                                    <Text size={'sm'} c={'scBlue'}>Drop to upload </Text>
                                </Flex>
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <Flex mih={attachments.length === 0 ? 150 : 'auto'} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                    className={styles.placeholderCard}
                                    bg={'yellow.0'} style={{ borderColor: 'var(--mantine-color-yellow-7)' }}
                                >
                                    <IconX size={32} color="var(--mantine-color-yellow-7)" stroke={1.5} />
                                    <Text size={'sm'} c={'yellow.7'}>File type not supported</Text>

                                </Flex>
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <Flex mih={attachments.length === 0 ? 150 : 'auto'} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                    className={styles.placeholderCard}
                                    onClick={() => openRef.current?.()}
                                >
                                    <IconDragDrop2 size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
                                    <Text size={'sm'} c={'dimmed'}>Drag and drop files here</Text>
                                </Flex>
                            </Dropzone.Idle>
                            <AnimatePresence
                                mode={'sync'}
                            // presenceAffectsLayout
                            >
                                {
                                    attachmentItems.map((attachment, i) =>
                                        <motion.div
                                            key={attachment.ID}
                                            variants={itemVariants}
                                            initial={{
                                                opacity: 0,
                                                y: 20
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0
                                            }}
                                            transition={
                                                {
                                                    ease: 'easeOut',
                                                    duration: .15,
                                                    delay: i * .05
                                                    // delay: (attachmentsQuery.data?.Results?.length - (i + 1)) * .05
                                                }
                                            }
                                            exit={{
                                                opacity: 0,
                                                y: -20,
                                                transition: {
                                                    duration: .15,
                                                    ease: "easeIn",
                                                    // delay: (attachmentsQuery.data?.Results?.length - (i + 1)) * .05
                                                    // delay: i * .05
                                                }
                                            }}
                                        >
                                            <AttachmentItem attachments={attachmentItems} setAttachmentItems={setAttachmentItems} key={attachment.ID} attachment={attachment} removeAttachment={removeAttachment}
                                                taskItems={taskItems} smallThumb={viewType === "Small Thumbnail"} />
                                        </motion.div>
                                        // <Attachment attachment={attachment} key={attachment.ID} updateAttachments={updateAttachments} taskItems={taskItems} />
                                    )
                                }
                            </AnimatePresence>
                        </SimpleGrid>
                }

            </Dropzone>


            <Flex align={'center'} gap={'xs'} mt={3}>

                <Group miw={15} justify={'center'}>
                    {
                        !attachmentsQuery.isInitialLoading &&
                        <ActionIcon ml={3} color={'gray.7'} variant={'transparent'} size={'sm'}
                            onClick={() => attachmentsQuery.refetch()}>
                            <IconRefresh
                                style={{ transition: '2s ease-in-out' }}
                                className={attachmentsQuery.isFetching ? tableStyles.rotate : ''} />
                        </ActionIcon>
                    }
                    {
                        !attachmentsQuery.isInitialLoading && attachmentsQuery.isLoading &&
                        <Loader size={16} color={'scBlue'} />
                    }
                </Group>

                <div style={{ flexGrow: 1, marginRight: 65 }}>
                    <ScPagination
                        totalElements={attachmentsQuery.data?.TotalResults}
                        totalOnPage={attachmentsQuery.data?.ReturnedResults}
                        currentPage={queryParams.pageIndex}
                        pageSize={queryParams.pageSize}
                        onChange={handlePaginationChange}
                        rowsRelabel={'Items'}
                    />
                </div>

            </Flex>

        </div>
    );
}

export default Attachments;
