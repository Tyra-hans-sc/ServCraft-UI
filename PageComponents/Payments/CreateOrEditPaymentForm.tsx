import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useForm} from "@mantine/form";
import {Alert, Anchor, Button, Flex, Group, Loader, Space, Text, Title} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import ScTextAreaControl from "@/components/sc-controls/form-controls/v2/ScTextAreaControl";
import Helper from "@/utils/helper";
import * as Enums from "@/utils/enums";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import {useMutation} from "@tanstack/react-query";

import styles from '../CustomerZone/TableStyles.module.css'
import {showNotification, updateNotification} from "@mantine/notifications";
import {Payment, postPayment} from "@/PageComponents/Payments/payments";
import Time from "@/utils/time";
import DeletePromptModal from "@/PageComponents/Payments/DeletePromptModal";
import {IconInfoCircle} from "@tabler/icons";
import Link from "next/link";
import constants from "@/utils/constants";

export interface PaymentProps {
    customerID: string | null
    onClose?: () => void
    quote?: {
        ID: string
        Module: number
        ItemID: string
        Reference: string
        DepositPercentage?: number
        TotalInclusive: number
    }
    invoice?: {
        ID: string
        Module: number
        ItemID: string
        Reference: string
        InvoiceStatus: number
        DepositPercentage?: number
        TotalInclusive: number
    }
    onCreated?: (payment) => void
    editPaymentItem?: Payment | null
    amountDue: number
    currencySymbol: string
    module: number
    markInvoiceAsPaid?: () => void
    refreshParent?: () => Promise<void>
    showDocumentSettingsHint: boolean
}

// const paymentOptions = Enums.getEnumItemsVD(Enums.PaymentStatus);

const CreateOrEditPaymentForm: FC<PaymentProps> = (props) => {

    // console.log(props, {...paymentOptions})

    // const queryClient = useQueryClient();

    const [realAmountDue] = useState(!!props.editPaymentItem ? props.amountDue + props.editPaymentItem.Amount : props.amountDue)

    const form= useForm(
        {
            initialValues: {
                CustomerID: !!props.editPaymentItem ? props.editPaymentItem?.CustomerID : props.customerID || '',
                QuoteID: !!props.editPaymentItem ? props.editPaymentItem?.QuoteID : props.quote?.ID ?? null,
                InvoiceID: !!props.editPaymentItem ? props.editPaymentItem?.InvoiceID : props?.invoice?.ID ?? null,
                PaymentDate: !!props.editPaymentItem ? props.editPaymentItem?.PaymentDate : Time.toISOString(new Date),
                PaymentStatus: !!props.editPaymentItem ? props.editPaymentItem?.PaymentStatus : Enums.PaymentStatus.Paid,
                Amount: !!props.editPaymentItem ? props.editPaymentItem?.Amount : 0,
                Fee: !!props.editPaymentItem ? props.editPaymentItem?.Fee : 0,
                Reference: !!props.editPaymentItem ? props.editPaymentItem?.Reference : props.invoice?.Reference || props.quote?.Reference || '',
                Comment: !!props.editPaymentItem ? props.editPaymentItem?.Comment : '',
                isActive: true
            },
            validate: {
                PaymentDate: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Date,
                    required: true,
                    customErrorText: 'Specify Date Received'
                } as any),
                Amount: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThan: 0,
                    customErrorText: 'Specify Amount Received'
                } as any),
                Fee: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThanOrEquals: 0,
                    customErrorText: 'Specify Fee Amount'
                } as any),
                Reference: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: 'Specify Payment Reference'
                } as any),
                /*Comment: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: 'Specify Description for Payment'
                } as any)*/
            }
        }
    );

    const [showMarkAsPaidButton, setShowMarkAsPaidButton] = useState(props.module === Enums.Module.Invoice && props.invoice?.InvoiceStatus === Enums.InvoiceStatus.Unpaid)
    useEffect(() => {setShowMarkAsPaidButton(props.module === Enums.Module.Invoice && props.invoice?.InvoiceStatus === Enums.InvoiceStatus.Unpaid)}, [props.invoice?.InvoiceStatus])
    const triggerMarkAsPaid = useRef(false)

    const payment = useMutation(
        ['payments', props.quote?.ID, props.customerID],
        postPayment,
        {
            onSuccess: async (data, x) => {
                updateNotification({
                    id: 'paymentPost',
                    message: !!props.editPaymentItem ? (!!deletePaymentItem ? 'Payment Deleted' : 'Payment Updated') : 'Payment Created',
                    color: 'scBlue'
                });
                setDeletePaymentItem(null);
                props.onCreated && props.onCreated(data);
                if (!props.editPaymentItem) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.createPayment);
                }
                props.refreshParent && await props.refreshParent()
                if(triggerMarkAsPaid.current && props.markInvoiceAsPaid) {
                    props.markInvoiceAsPaid()
                    triggerMarkAsPaid.current = false
                }
            },
            onError: (err: any) => {
                const message = `Unable to link payment`;
                updateNotification({
                    id: 'paymentPost',
                    title: err?.message && message,
                    message: err?.message || message,
                    color: 'red'
                });
            },
            onMutate: (x) => {
                showNotification({
                    loading: true,
                    id: 'paymentPost',
                    message: !!props.editPaymentItem ? (!!deletePaymentItem ? 'Deleting Payment' : 'Editing Payment') : 'Creating Payment',
                    color: 'scBlue'
                })
            }
        }
    )

    const [deletePaymentItem, setDeletePaymentItem] = useState<Payment | null>(null)

    const handleSubmit = (values) => {
        const payload = {...values};
        if(!!props.editPaymentItem) {
            payload.ID = props.editPaymentItem.ID
            payload.RowVersion = props.editPaymentItem.RowVersion
        }
        if(!payload.InvoiceID) delete payload.InvoiceID
        if(!payload.QuoteID) delete payload.QuoteID
        payment.mutate(
            {Payment: payload}
        )
    }

    function handleDelete() {
        const payload: any = {
            ...deletePaymentItem,
            IsActive: false
        }
        payment.mutate(
            {Payment: payload}
        )
    }

    const depositFormattedValue = useMemo(
        () => {
            const depositPercentage = props.module === Enums.Module.Quote ? props.quote?.DepositPercentage : props.invoice?.DepositPercentage
            const totalInclusive = props.module === Enums.Module.Quote ? props.quote?.TotalInclusive : props.invoice?.TotalInclusive

            if(depositPercentage && totalInclusive) {
                const value = Math.round(totalInclusive * (depositPercentage)) / 100
                let currValue = value.toFixed(2)
                let spacePos = currValue.indexOf('.')
                while (spacePos > 3) {
                    spacePos = spacePos - 3
                    currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('')
                }
                return {
                    value,
                    text: currValue
                }
            } else {
                return null
            }
        }, [props.quote, props.invoice])

    const onSettleDeposit = () => {
        if(depositFormattedValue?.value) {
            form.setFieldValue('Amount', depositFormattedValue.value)
            if(!form.values.Comment) {
                form.setFieldValue('Comment', 'Deposit')
            }
        }
    }

    const onSettleRemaining = () => {
        if(realAmountDue) {
            form.setFieldValue('Amount', realAmountDue)
        }
    }

    return (
        <>
            <form onSubmit={form.onSubmit(handleSubmit)}>

                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={16}
                    fw={600}
                >
                    {!!props.editPaymentItem ? 'Edit Payment' : 'Create Payment'}
                </Title>

                <Text size={'sm'} fw={'bolder'} >{'Amount Due: ' + (Math.round(realAmountDue * 100) / 100)}</Text>

                <Flex wrap={'wrap'} gap={'sm'} >

                    <ScNumberControl
                        className={styles.fieldControl}
                        hideControls
                        decimalScale={2}
                        thousandSeparator={' '}
                        fixedDecimalScale
                        min={0}
                        label={'Amount Received'}
                        withAsterisk
                        {...form.getInputProps('Amount')}
                        error={
                            (+form.values.Amount > realAmountDue && form.isDirty('Amount') && 'The payment amount exceeds the total amount due by ' + props.currencySymbol + Math.round((form.values.Amount - realAmountDue) * 100) / 100 ) ||
                            form.getInputProps('Amount').error
                        }
                    />


                    <SCDatePicker
                        className={styles.fieldControl}
                        label={'Date Received'}
                        required
                        {...form.getInputProps('PaymentDate')}
                    />

                    <ScTextControl
                        style={{maxWidth: '100%'}}
                        className={styles.fieldControl}
                        label={'Reference'}
                        withAsterisk
                        {...form.getInputProps('Reference')}
                    />

                    {/*<ScNumberControl
                        className={styles.fieldControl}
                        hideControls
                        decimalScale={2}
                        min={0}
                        label={'Payment Fee'}
                        withAsterisk
                        {...form.getInputProps('Fee')}
                    />*/}

                    {/*<div className={styles.fieldControl}>
                        <SCDropdownList
                            options={paymentOptions}
                            dataItemKey={'value'}
                            textField={'description'}
                            required
                            // className={styles.fieldControl}
                            label={'Payment Status'}
                            {...form.getInputProps('PaymentStatus')}
                            onChange={(x) => form.setFieldValue('PaymentStatus', x.value)}
                        />
                    </div>*/}


                    <ScTextAreaControl
                        className={styles.commentControl}
                        label={'Description'}
                        // withAsterisk
                        {...form.getInputProps('Comment')}
                    />

                </Flex>

                {
                    props.showDocumentSettingsHint &&
                    <Alert icon={<IconInfoCircle />} mt={'var(--mantine-spacing-lg)'} title="Did you know?" color="indigo.8">
                        You can display payments on your {props.module === Enums.Module.Invoice ? 'invoices' : props.module === Enums.Module.Quote ? 'quotes' : 'invoices and quotes'}. &nbsp; <br/>
                        <em>
                            Click <Anchor href="#" target="_blank" color={'scBlue'}>
                            <Link href={'https://app.servcraft.co.za/settings/payment/payfast'}>here</Link>
                        </Anchor> to set up.
                        </em>

                        {/*<Anchor href="#" target="_blank" align={'center'}>
                        Go to settings
                    </Anchor>*/}
                    </Alert>
                }

                <Group mt={'var(--mantine-spacing-lg)'} gap={'sm'}>
                    {
                        // if there is a deposit amount and it is not filled in and no previous payments have been made
                        depositFormattedValue?.value && form.values.Amount !== depositFormattedValue?.value && realAmountDue === (props.module === Enums.Module.Quote ? props.quote?.TotalInclusive : props.invoice?.TotalInclusive) &&
                        <Button
                            color={'scBlue'} variant={'outline'}
                            onClick={onSettleDeposit}
                        >
                            Settle Deposit Amount
                        </Button>
                    }

                    {
                        realAmountDue &&
                        realAmountDue !== (props.module === Enums.Module.Quote ? props.quote?.TotalInclusive : props.invoice?.TotalInclusive) &&
                        form.values.Amount !== realAmountDue &&
                        <Button
                            color={'scBlue'} variant={'outline'}
                            onClick={onSettleRemaining}
                        >
                            Settle Full Amount
                        </Button>
                    }
                </Group>

                <Space mt={'10vh'}/>

                <Flex mt={'var(--mantine-spacing-sm)'} gap={'xs'} wrap={'wrap'}>
                    <Group gap={'xs'} ml={'auto'}>
                        <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                            !!props.onClose && props.onClose()
                        }}>
                            Close
                        </Button>

                        {
                            !!props.editPaymentItem &&
                            <Button type={'button'} variant={'outline'} color={'yellow.7'} onClick={() => {
                                setDeletePaymentItem(props.editPaymentItem || null)
                            }}>
                                Delete Payment
                            </Button>
                        }

                        <Button color={'scBlue'} type={'submit'}
                                rightSection={payment.isLoading && !triggerMarkAsPaid.current && <Loader variant={'oval'} size={18} color={'white'}/>}
                        >
                            {!!props.editPaymentItem ? 'Update' : 'Create'}
                        </Button>

                        {
                            showMarkAsPaidButton && form.values.Amount >= realAmountDue &&
                            <Button color={'scBlue'} type={'submit'} variant={'outline'}
                                    onClickCapture={() => triggerMarkAsPaid.current = true}
                                    rightSection={payment.isLoading && triggerMarkAsPaid.current && <Loader variant={'oval'} size={18} color={'white'}/>}
                            >
                                {!!props.editPaymentItem ? 'Update' : 'Create'} & Mark as Paid
                            </Button>
                        }
                    </Group>
                </Flex>

            </form>


            {
                <DeletePromptModal deletePaymentItem={deletePaymentItem} onClose={() => setDeletePaymentItem(null)} onDelete={handleDelete} />
            }
        </>
    );
}

export default CreateOrEditPaymentForm;
