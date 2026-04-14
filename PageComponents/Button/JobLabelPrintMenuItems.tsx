import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import {ActionIcon, Flex, Menu, Text,} from "@mantine/core";
import {
    IconMinus,
    IconPlus,
} from "@tabler/icons-react";
import {FC, useState} from "react";
import {useLocalStorage} from "@mantine/hooks";
import {useMutation, useQuery} from "@tanstack/react-query";
import {showNotification} from "@mantine/notifications";
import * as Enums from "@/utils/enums"
import DownloadService from "@/utils/download-service";
import PremiumTooltip from "@/PageComponents/Premium/PremiumTooltip";
import PremiumIcon from "@/PageComponents/Premium/PremiumIcon";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";

/*const printLabel = async (params) => {
    const res = await Fetch.post({
        url: '/Job/PrintJobBarcodeDocument',
        params
    } as any)

    if(res.status === 200) {
        return await res.blob()
    } else if(res.serverMessage || res.message) {
        throw new Error(res.serverMessage || res.message || 'Something went wrong')
    } else {
        return res
    }
}*/

const JobLabelPrintMenuItems: FC<{job: any}> = (props) => {

    const {data: lablePrintingAccess, isLoading: loadingLabelPrintingAccess} = useQuery(['jobLabelPrinting'], () => featureService.getFeature(constants.features.ASSET_LABEL_PRINTING))

    const [lsJobCardCopies, setLsJobCardCopies] = useLocalStorage({key: 'jobCardCopiesPreference', defaultValue: 1, deserialize: value => value && !isNaN(+value) ? +value : 1 , serialize: value => value + ''})
    const [lsAssetCopies, setLsAssetCopies] = useLocalStorage({key: 'jobAssetCopiesPreference', defaultValue: 1, deserialize: value => value && !isNaN(+value) ? +value : 1 , serialize: value => value + ''})

    const [loadingItems, setLoadingItems] = useState<{[item: number]: 'loading' | 'none'}>({})
    const jobLabelMutation = useMutation(['test'], (params: {
            BarcodeDocumentType: number;
            ItemIDs: any;
            Copies: any;
        }) =>
            DownloadService.downloadFile('POST', '/Job/PrintJobBarcodeDocument', params, false, true),
            // printLabel(params),
        {
        onSuccess: async (data, {BarcodeDocumentType}) => {
            setLoadingItems(p => ({
                ...p, [BarcodeDocumentType]: 'none'
            }))
        },
        onError: (error: Error, {BarcodeDocumentType}, context) => {
            showNotification(({
                id: 'itemLabelDownload',
                message: error.message,
                autoClose: 3000,
                color: 'yellow'
            }))
            setLoadingItems(p => ({
                ...p, [BarcodeDocumentType]: 'none'
            }))
        },
        onMutate: ({BarcodeDocumentType}) => {
            setLoadingItems(p => ({
                ...p, [BarcodeDocumentType]: 'loading'
            }))
        }
    })


    const handleDownloadLabel = (type: 'job' | 'asset') => {
        jobLabelMutation.mutate(type === 'job' ? {
            BarcodeDocumentType: Enums.PrintLabelType.JobCard,
            ItemIDs: [props.job.ID],
            Copies: lsJobCardCopies
        } : {
            BarcodeDocumentType:  Enums.PrintLabelType.JobAsset,
            ItemIDs: props.job.JobInventory.filter(x => !!x.ProductID).map(x => x.ID),
            Copies: lsAssetCopies
        })
    };

    return (
        <>
            <Menu.Item
                // leftSection={<IconBarcode size={12} />}
                // closeMenuOnClick={false}
                onClick={() => handleDownloadLabel('job')}
            >

                <Flex align={'center'} gap={'sm'}>
                    <Text c={'dimmed'} size={'9px'}>(beta)</Text>
                    <Text size={'sm'}
                          style={{
                              // wordWrap: 'nowrap',
                              // wordBreak: 'keep-all'
                          }}
                    >Job Label</Text>
                    <Flex align={'center'} ml={'auto'}>
                        <ActionIcon
                            size={'xs'}
                            variant={'subtle'}
                            onClick={(e) => {
                                e.stopPropagation()
                                setLsJobCardCopies(p => p === 1 ? p : p - 1)
                            }}
                        >
                            <IconMinus size={8}/>
                        </ActionIcon>
                        <ScNumberControl
                            onClick={(e) => e.stopPropagation()}
                            variant={'unstyled'}
                            value={lsJobCardCopies}
                            onChange={n => setLsJobCardCopies(+n)}
                            size={"xs"}
                            styles={{
                                input: {textAlign: 'center'}
                            }}
                            py={0}
                            mt={0}
                            w={16}
                            hideControls
                            min={1}
                            max={99}
                            // description={'# of copies'}
                        />
                        <ActionIcon
                            size={'xs'}
                            variant={'subtle'}
                            onClick={(e) => {
                                e.stopPropagation()
                                setLsJobCardCopies(p => p === 99 ? p : p + 1)
                            }}
                        >
                            <IconPlus size={8}/>
                        </ActionIcon>
                    </Flex>
                    {/*<Flex>
                        <ActionIcon
                            // size={'xs'}
                            variant={'subtle'}
                            onClick={() => handleDownloadLabel('job')}
                        >
                            {
                                loadingItems?.[Enums.Module.JobCard] === 'loading' ? <Loader size={10} />
                                    : <IconDownload size={14}/>
                            }
                        </ActionIcon>
                        <ActionIcon
                            size={'xs'}
                            variant={'subtle'}
                        >
                            <IconExternalLink size={8}/>
                        </ActionIcon>
                    </Flex>*/}
                </Flex>
            </Menu.Item>
            {
                // Helper.getHasNewFeatureAccess('jobLabelPrinting' as any) &&
                !loadingLabelPrintingAccess && lablePrintingAccess &&
                props.job.JobInventory.filter(x => !!x.ProductID).length !== 0 &&
                <PremiumTooltip>

                    <Menu.Item
                        onClick={() => handleDownloadLabel('asset')}
                        // leftSection={<IconFileBarcode size={12} />}
                        // closeMenuOnClick={false}
                        // disabled={props.job.JobInventory.filter(x => !!x.ProductID).length === 0}
                    >
                        <Flex align={'center'} gap={'sm'}>

                            <PremiumIcon />


                            <Text size={'sm'}
                                // c={'goldenrod'}
                                  style={{
                                      // wordWrap: 'nowrap',
                                      // wordBreak: 'keep-all'
                                  }}
                            >Assets Label</Text>
                            <Flex align={'center'} ml={'auto'}>
                                <ActionIcon
                                    size={'xs'}
                                    variant={'subtle'}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLsAssetCopies(p => p === 1 ? p : p - 1)
                                    }}
                                >
                                    <IconMinus size={8}/>
                                </ActionIcon>
                                <ScNumberControl
                                    onClick={(e) => e.stopPropagation()}
                                    variant={'unstyled'}
                                    value={lsAssetCopies}
                                    onChange={n => setLsAssetCopies(+n)}
                                    size={"xs"}
                                    styles={{
                                        input: {textAlign: 'center'}
                                    }}
                                    py={0}
                                    mt={0}
                                    w={16}
                                    hideControls
                                    min={1}
                                    max={99}
                                    // description={'# of copies'}
                                />
                                <ActionIcon
                                    size={'xs'}
                                    variant={'subtle'}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLsAssetCopies(p => p === 99 ? p : p + 1)
                                    }}
                                >
                                    <IconPlus size={8}/>
                                </ActionIcon>
                            </Flex>

                            {/*<Flex>
                            <ActionIcon
                                // size={'xs'}
                                variant={'subtle'}
                                onClick={() => handleDownloadLabel('asset')}
                            >
                                {
                                    loadingItems?.[Enums.Module.Asset] === 'loading' ? <Loader size={10} />
                                        : <IconDownload size={14}/>
                                }
                            </ActionIcon>
                        <ActionIcon
                            size={'xs'}
                            variant={'subtle'}
                        >
                            <IconExternalLink size={8}/>
                        </ActionIcon>
                        </Flex>*/}
                        </Flex>
                    </Menu.Item>

                </PremiumTooltip>


            }
        </>
    );
}

export default JobLabelPrintMenuItems
