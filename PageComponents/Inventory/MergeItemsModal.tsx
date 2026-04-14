import { FC, useState } from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import { ActionIcon, Alert, Box, Button, Flex, Stack, Text } from '@mantine/core'
import styles from './MergeItemsModal.module.css'
import SCCheckbox from "@/components/sc-controls/form-controls/sc-checkbox";
import * as Enums from '@/utils/enums';

export interface MergeItemsModalOptions {
    canAdd: boolean
    canMerge: boolean
    canIgnore: boolean
    onCancel: () => void
    onAdd: () => void
    onMerge: () => void
    onIgnore: (remember: boolean) => void
}

const MergeItemsModal: FC<{ show: boolean; options: MergeItemsModalOptions, module: number }> = (props) => {

    const [rememberIgnore, setRememberIgnore] = useState(false);

    const isInvoice = props.module === Enums.Module.Invoice;
    const isPurchase = props.module === Enums.Module.PurchaseOrder;

    return (
        <SCModal
            open={props.show}
            size={500}
        // withCloseButton
        // onClose={props.onCancel}
        >
            <Box >
                <Text size={'lg'} lh={1.3} fw={'bolder'} mr={'sm'}>
                    Items listed on this {isInvoice ? "invoice" : isPurchase ? "purchase order" : ""} have not been assigned to the associated job card
                </Text>
                <Text c={'dimmed'} size={'sm'} mt={'xs'}>
                    Please choose one of the following options:
                </Text>
            </Box>

            <Flex align={'stretch'} direction={'column'} gap={8} mt={'lg'}>

                {props.options.canAdd && <Box className={styles.fadeHintText}>
                    <Button w={'100%'}
                        onClick={props.options.onAdd}
                    >
                        Add
                    </Button>
                    <Flex className={styles.hintText} align={'center'} justify={'start'} gap={3}>
                        {/*<IconInfoCircle size={14}/>*/}
                        <Alert w={'100%'} variant={'transparent'} mt={0} p={4} color={'teal'}>
                            <Text size={"sm"} c={'gray.7'}>
                                This option will add all materials and service items to the job.
                            </Text>
                        </Alert>
                    </Flex>
                </Box>
                }

                {props.options.canMerge && <Box className={styles.fadeHintText}>
                    <Button w={'100%'}
                        onClick={props.options.onMerge}
                    >
                        Merge
                    </Button>
                    <Flex className={styles.hintText} align={'center'} justify={'start'} gap={3}>
                        {/*<IconInfoCircle size={14}/>*/}
                        <Alert w={'100%'} variant={'transparent'} mt={0} p={4} color={'teal'}>
                            <Text size={"sm"} c={'gray.7'}>
                                This option merges missing items into the job card and updates quantities to match the {isInvoice ? "invoice" : isPurchase ? "purchase order" : ""}. {isInvoice && <span style={{ color: 'var(--mantine-color-yellow-8)' }}>Invoice sections won&apos;t be copied, and job sections may be updated.</span>}
                            </Text>
                        </Alert>
                    </Flex>
                </Box>
                }

                {props.options.canIgnore && <Box className={styles.fadeHintText}>
                    <Button w={'100%'}
                        onClick={() => props.options.onIgnore(rememberIgnore)}
                    >
                        Ignore
                    </Button>
                    <Flex className={styles.hintText} align={'center'} justify={'start'} gap={3}>
                        {/*<IconInfoCircle size={14}/>*/}

                        <Alert w={'100%'} variant={'transparent'} mt={0} p={4} color={'teal'}>
                            <Text size={"sm"} c={'yellow.8'}>
                                <span style={{ color: 'var(--mantine-color-gray-7)' }}>No items will be added to the Job.</span> Discrepancies will remain unresolved.
                            </Text>
                        </Alert>
                    </Flex>
                    <Alert p={"sm"} pt={0}>
                        <SCCheckbox
                            label={<span>Always ignore. <span style={{ fontStyle: "italic" }}> You can update this preference at any time.</span></span>}
                            title="Test"
                            value={rememberIgnore as any}
                            onChange={setRememberIgnore}
                        />
                    </Alert>
                </Box>
                }

                <Button
                    style={{ alignSelf: 'end' }}
                    onClick={props.options.onCancel}
                    variant={'outline'}
                >
                    Cancel
                </Button>
                {/*<Box>

                    <Flex align={'center'} gap={3}>
                        <IconInfoCircle size={14}/>
                        <Text size={"sm"} c={'gray.7'}>
                            Invoice will not be saved
                        </Text>
                    </Flex>
                </Box>*/}


            </Flex>


        </SCModal>
    )
}

export default MergeItemsModal
