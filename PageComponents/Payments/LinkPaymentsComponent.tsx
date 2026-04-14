import React, {FC, useEffect, useRef, useState} from "react";
import {
    ActionIcon,
    Text,
    Button,
    Group,
    Loader,
    Table,
    Title,
    Tooltip,
    useMantineTheme,
    Alert,
    Anchor
} from "@mantine/core";
import styles from "@/PageComponents/CustomerZone/TableStyles.module.css";
import Time from "@/utils/time";
import {IconCheck, IconInfoCircle, IconLink} from "@tabler/icons";
import {showNotification, updateNotification} from "@mantine/notifications";
import {Payment, postPayment} from "@/PageComponents/Payments/payments";
import {useMutation} from "@tanstack/react-query";
import * as Enums from '@/utils/enums';
import Helper from "@/utils/helper";
import Link from "next/link";

export interface LinkPaymentsComponentProps {
    unlinkedPayments: Payment[]
    onComplete: (data) => void
    customerID?: string | null
    onClose: () => void
    module: number
    amountDue: number
    quote?: {
        ID: string
        Module: number
        ItemID: string
    }
    invoice?: {
        ID: string
        Module: number
        ItemID: string
        InvoiceStatus: number
    }
    refreshParent?: () => Promise<void>
    markInvoiceAsPaid?: () => void
    showDocumentSettingsHint: boolean
}

const LinkPaymentsComponent: FC<LinkPaymentsComponentProps> = (props) => {

    const [showLinkedToCol, setShowLinkedToCol] = useState(props.unlinkedPayments.filter(x => props.module === Enums.Module.Invoice && x.QuoteNumber || props.module === Enums.Module.Quote && x.InvoiceNumber).length > 0)

    useEffect(() => {
        if(props.unlinkedPayments && props.unlinkedPayments.length === 0) {
            props.onClose()
        } else {
            setShowLinkedToCol(props.unlinkedPayments.filter(x => props.module === Enums.Module.Invoice && x.QuoteNumber || props.module === Enums.Module.Quote && x.InvoiceNumber).length > 0)
        }
    }, [props.unlinkedPayments]);

    /*const updateParent = () => {
        setTimeout(() => {
            if(triggerMarkAsPaid.current && props.markInvoiceAsPaid) {
                props.markInvoiceAsPaid()
                triggerMarkAsPaid.current = false
            }
        }, 3000)

    }*/

    const theme = useMantineTheme();
    const [paymentsUnlinkingState, setPaymentsUnlinkingState, ] = useState<{[paymentId: string]: 'none' | 'loading' | 'done' | 'error'}>({})
    const paymentMutations = useMutation(['updatePayment'], postPayment, {
        onSuccess: async (data, x, context) => {
            setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'done'}));
            updateNotification({
                loading: false,
                id: 'paymentPost' + x.Payment.ID,
                message: 'Payment Successfully Linked',
                color: 'scBlue'
            });
            props.onClose()
        },
        onError: (error: any, x, context) => {
            setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'error'}));
            const message = `Unable to link payment`;
            updateNotification({
                loading: false,
                id: 'paymentPost' + x.Payment.ID,
                title: error?.message && message,
                message: error?.message || message,
                color: 'red'
            })
        },
        onSettled: async (data, error, x) => {
            props.refreshParent && (await props.refreshParent().then(
                () => {
                    console.log('updated')
                    if(triggerMarkAsPaid.current && props.markInvoiceAsPaid) {
                        props.markInvoiceAsPaid()
                        triggerMarkAsPaid.current = false
                    }
                }
            ))
            props.onComplete(x)
            setTimeout(
                () => setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'none'})),
                5000
            )
        },
        onMutate: (x) => {
            setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'loading'}));
            showNotification({
                loading: true,
                id: 'paymentPost' + x.Payment.ID,
                message: 'Linking payment on ' + Time.formatDate(x.Payment.PaymentDate),
                color: 'scBlue'
            });
        }
    });

    const [showMarkAsPaidControl, setShowMarkAsPaidControl] = useState(props.module === Enums.Module.Invoice && props.invoice?.InvoiceStatus === Enums.InvoiceStatus.Unpaid)
    useEffect(() => {setShowMarkAsPaidControl(props.module === Enums.Module.Invoice && props.invoice?.InvoiceStatus === Enums.InvoiceStatus.Unpaid)}, [props.invoice?.InvoiceStatus])

    const triggerMarkAsPaid = useRef(false)

    function handleLinkPayment(x) {
        if(paymentsUnlinkingState[x.ID] !== 'loading' && paymentsUnlinkingState[x.ID] !== 'done') {
            const payload = {...x}
            if (props.module === Enums.Module.Quote) {
                payload.QuoteID = props.quote!.ID
            } else if (props.module === Enums.Module.Invoice) {
                payload.InvoiceID = props.invoice!.ID
            }
            paymentMutations.mutate({
                Payment: payload
            })
        }
    }

    const colorForX = (x) => (
        (props.amountDue - x.Amount) < 0 ? 'yellow.7' :
        +props.amountDue === +x.Amount ? /*'blue.7'*/ undefined /*'green.7'*/ : 'gray.6'
    )

    const rows = props.unlinkedPayments.length > 0 && props.unlinkedPayments.sort((a, b) => a.PaymentDate > b.PaymentDate ? 1 : -1).map(x => (
        <tr key={x.ID} className={styles.tableRow}>
            <td>{Time.getDate(x.PaymentDate)}</td>
            <td>{x.Reference}</td>
            <td>{x.Comment}</td>
            {
                showLinkedToCol &&
                <td>
                    {props.module === Enums.Module.Invoice && x.QuoteID && x.QuoteNumber ? x.QuoteNumber
                    : props.module === Enums.Module.Quote && x.InvoiceID && x.InvoiceNumber ? x.InvoiceNumber : ''}
                </td>
                // <td>{x.QuoteID ? 'Quote: ' + x.QuoteID : x.InvoiceID ? 'Invoice: ' + x.InvoiceID : ''}</td>
            }
            <td className={styles.textRight}>{Helper.getCurrencyValue(x.Amount)}</td>
            <td>
                <Group gap={'xs'} justify={'right'}>
                    {
                        showMarkAsPaidControl && x.Amount >= props.amountDue &&
                        <Tooltip events={{ hover: true, focus: true, touch: true }} color={'green'} label={'Link payment and mark invoice as paid'} onClick={() => {
                            triggerMarkAsPaid.current = true;
                            handleLinkPayment(x);
                        }}>
                            <ActionIcon
                                variant={'subtle'}
                                color={'green.7'}
                            >
                                {
                                    triggerMarkAsPaid.current && paymentsUnlinkingState[x.ID] === 'loading' &&
                                    <Loader color={'scBlue'} size={16} /> ||
                                    <IconCheck
                                        color={
                                            paymentsUnlinkingState[x.ID] === 'error' ? theme.colors.red[5] : undefined
                                        }
                                    />
                                }
                            </ActionIcon>
                        </Tooltip>
                    }
                    <Tooltip events={{ hover: true, focus: true, touch: true }} color={props.amountDue < x.Amount ? 'yellow.7' : 'scBlue'} label={props.amountDue < x.Amount ? 'Payment exceeds due amount' : 'Link Payment'} onClick={() => handleLinkPayment(x)}>
                        <ActionIcon
                            variant={'subtle'}
                            color={colorForX(x)}
                        >
                            {
                                !triggerMarkAsPaid.current && paymentsUnlinkingState[x.ID] === 'loading' &&
                                <Loader color={'scBlue'} size={16} /> ||
                                <IconLink
                                    color={
                                        paymentsUnlinkingState[x.ID] === 'error' ? theme.colors.red[5]
                                            : paymentsUnlinkingState[x.ID] === 'done' ? theme.colors.scBlue[5]
                                                : undefined
                                    }
                                />
                            }
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </td>
        </tr>
    ))

    return <>
        <Title
            my={'var(--mantine-spacing-lg)'}
            size={'md'}
            fw={600}
        >
            {'Link Payment'}
        </Title>

        <Text size={'sm'} fw={'bolder'} >{'Amount Due: ' + (Math.round(props.amountDue * 100) / 100)}</Text>

        <Table highlightOnHover mt={'var(--mantine-spacing-lg)'}>
            <thead>
            <tr className={styles.tableHead} style={{height: 48}}>
                <th>Payment Date</th>
                <th>Reference</th>
                <th>Description</th>
                {
                    showLinkedToCol &&
                    <th>Linked To</th>
                }
                <th className={styles.textRight}>Amount</th>
                <th></th>
            </tr>
            </thead>
            <tbody className={styles.tableBody}>{rows}</tbody>
        </Table>

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

        <Group justify={'right'} mt={'var(--mantine-spacing-xl)'}>
            <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                props.onClose()
            }}>
                Close
            </Button>
        </Group>
    </>
}


export default LinkPaymentsComponent;
