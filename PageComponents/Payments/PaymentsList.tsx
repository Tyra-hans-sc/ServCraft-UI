import {FC, useEffect, useState} from 'react';
import {useMutation, useQuery} from "@tanstack/react-query";
import {ActionIcon, Avatar, Button, Group, Loader, Table, Tooltip, Text, useMantineTheme} from '@mantine/core';
import CreateOrEditPaymentModal, {PaymentModalProps} from "@/PageComponents/Payments/CreateOrEditPaymentModal";
import {PaymentProps} from "@/PageComponents/Payments/CreateOrEditPaymentForm";
import styles from '../CustomerZone/TableStyles.module.css'
import Time from "@/utils/time";
import {IconPencil, IconUnlink} from "@tabler/icons";
import * as Enums from "../../utils/enums";
import LinkPaymentsModal from "@/PageComponents/Payments/LinkPaymentsModal";
import {getCustomerPayments, getItemPayments, Payment, postPayment} from "@/PageComponents/Payments/payments";
import {useTimeout} from "@mantine/hooks";
import {showNotification, updateNotification} from "@mantine/notifications";
import PS from "@/services/permission/permission-service";
import Helper from "@/utils/helper";
import DocumentService from '../../services/document/document-service';

interface PaymentListResponse {
    HttpStatusCode: number
    Results: Payment[]
    ReturnedResults: number
    TotalResults: number
}

const getDocDef = () => DocumentService.getDocumentDefinition()

const PaymentsList: FC<{
    accessStatus: string
    isNewQuoteOrInvoice?: boolean
    module: number
    setPayments: (payments: Payment[] | undefined) => void
} & PaymentModalProps & PaymentProps> = (props) => {

    const [hasEditPermission] = useState(PS.hasPermission(props.module === Enums.Module.Quote ? Enums.PermissionName.Quote : props.module === Enums.Module.Invoice ?  Enums.PermissionName.Invoice : ''));

    const [itemId] = useState(props.module === Enums.Module.Quote ? props.quote?.ID : props.invoice?.ID);

    const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
    const [showLinkPaymentsModal, setShowLinkPaymentsModal] = useState(false);

    const [unlinkedCustomerPayments, setUnlinkedCustomerPayments] = useState<Payment[]>([]);

    const [editPaymentItem, setEditPaymentItem] = useState<Payment | null>(null);

    const theme = useMantineTheme();

    const [activeModule] = useState(props.module === Enums.Module.Quote ? 'quote' : props.module === Enums.Module.Invoice ? 'invoice' : undefined);

    const [showSetupDocumentPaymentsHint, setShowDocumentPaymentsHint] = useState(false);
    const { data: documentData } = useQuery(['userDocument'], getDocDef);

    useEffect(() => {
        if (documentData) {
            // console.log('data', documentData, Object.keys(documentData))
            if(documentData.hasOwnProperty('MetaData')) {
                const meta = JSON.parse(documentData.MetaData);
                if(props.module === Enums.Module.Invoice && meta.InvoiceDocuments[0]?.hasOwnProperty('ShowPayments')) {
                    setShowDocumentPaymentsHint(!meta.InvoiceDocuments[0].ShowPayments)
                } else if(props.module === Enums.Module.Quote && meta.QuoteDocuments[0]?.hasOwnProperty('ShowPayments')) {
                    setShowDocumentPaymentsHint(!meta.QuoteDocuments[0].ShowPayments)
                }
            }
        }
    }, [documentData, props.module]);

    /*const documentDefinition = await DocumentService.getDocumentDefinition(ctx);

    console.log(documentDefinition);
    const [permissionsList, setPermissionsList] = useState(PS.getPermissions());
    console.log(permissionsList);*/

    const customerPaymentsQuery = useQuery<PaymentListResponse>(['payments', 'customerList', props.customerID],
        () => getCustomerPayments(props.customerID), {
            onError: console.error,
            enabled: !!props.customerID && (activeModule === 'quote' || activeModule === 'invoice')
        });

    useEffect(() => {
        if (customerPaymentsQuery.data) {
            const data = customerPaymentsQuery.data
            if(data.Results.length > 0) {
                // setUnlinkedCustomerPayments(() => )
                const unlinked = data.Results.filter(
                    (x) => activeModule === 'quote' && (!x.QuoteID || x.QuoteID !== props.quote?.ID)
                        || ( activeModule === 'invoice' && x.InvoiceID !== props.invoice?.ID)
                );
                setTimeout(() => setUnlinkedCustomerPayments(unlinked), 1)
            }
        }
    }, [customerPaymentsQuery.data, activeModule, props.quote?.ID, props.invoice?.ID]);

    const itemPaymentsQuery = useQuery(['payments', 'itemList', activeModule === 'quote' ? props.quote?.ID : props.invoice?.ID],
        () => getItemPayments(itemId, props.module), {
            onError: console.error,
            enabled: ((activeModule === 'quote' && !!props.quote?.ID)
                || (activeModule === 'invoice' && !!props.invoice?.ID)),
        });

    useEffect(() => {
        if (itemPaymentsQuery.data) {
            props.setPayments(itemPaymentsQuery.data.Results)
        }
    }, [itemPaymentsQuery.data, props.setPayments]);

    const { start, clear } = useTimeout(() => {
        customerPaymentsQuery.refetch();
        itemPaymentsQuery.refetch();
    }, 1000);

    const [paymentsUnlinkingState, setPaymentsUnlinkingState, ] = useState<{[paymentId: string]: 'none' | 'loading' | 'done' | 'error'}>({})
    const paymentMutations = useMutation(['updatePayment'], postPayment, {
        onSuccess: (data, x, context) => {
            setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'done'}));
            updateNotification({
                loading: false,
                id: 'paymentPost' + x.Payment.ID,
                message: 'Payment Successfully Unlinked',
                color: 'scBlue'
            });
        },
        onError: (error: any, x, context) => {
            setPaymentsUnlinkingState((s) => ({...s, [x.Payment.ID]: 'error'}));
            const message = `Unable to unlink payment`;
            showNotification({
                loading: false,
                id: 'paymentPost' + x.Payment.ID,
                title: error?.message && message,
                message: error?.message || message,
                color: 'red'
            })
        },
        onSettled: (data, error, x) => {
            props.refreshParent && props.refreshParent();
            clear();
            start();
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
                message: 'Unlinking payment on ' + Time.formatDate(x.Payment.PaymentDate),
                color: 'scBlue'
            });
        }
    });

    /*
    console.log(paymentsUnlinkingState);
    useEffect(
        () => {
            clear();
            if(Object.entries(paymentsUnlinkingState).filter(
                x => x[1] === 'loading'
            ).length === 0) {
                start();
            }
        }, [paymentsUnlinkingState]
    )
*/
    // console.log(props, itemId, module, 'customer payments:', customerPaymentsQuery.data,'item payments:', itemPaymentsQuery.data);


    function handleUnlinkPayment(x: Payment) {
        if (paymentsUnlinkingState[x.ID] !== 'loading' && paymentsUnlinkingState[x.ID] !== 'done') {
            paymentMutations.mutate({
                Payment: {
                    ...x,
                    QuoteID: props.module === Enums.Module.Quote ? null : x.QuoteID,
                    InvoiceID: props.module === Enums.Module.Invoice ? null : x.InvoiceID
                }
            })
        }
    }

    const rows = itemPaymentsQuery.isSuccess && itemPaymentsQuery.data.Results?.filter(x => x.IsActive).length > 0 && itemPaymentsQuery.data.Results.filter(x => x.IsActive)
        .sort((a, b) => a.PaymentDate > b.PaymentDate ? 1 : -1).map(x => (
        <tr key={x.ID} className={styles.tableRow} onClick={() => {
            /*setEditPaymentItem(x)*/
        }}>
            <td>{Time.getDate(x.PaymentDate)}</td>
            <td>{x.Reference}</td>
            <td>{x.Comment}</td>
            <td className={styles.textRight}>{Helper.getCurrencyValue(x.Amount)}</td>
            {
                hasEditPermission &&
                <td>
                    <Group gap={0} justify={'right'}>
                        <Tooltip events={{ hover: true, focus: true, touch: true }} color={'scBlue'} label={'Unlink Payment'}>
                            <ActionIcon
                                variant={'transparent'}
                                onClick={
                                    ($event) => {
                                        $event.stopPropagation();
                                        handleUnlinkPayment(x);
                                    }
                                }>
                                {
                                    paymentsUnlinkingState[x.ID] === 'loading' &&
                                    <Loader color={'scBlue'} size={16} /> ||
                                    <IconUnlink
                                        color={
                                            paymentsUnlinkingState[x.ID] === 'error' ? theme.colors.red[5]
                                                : paymentsUnlinkingState[x.ID] === 'done' ? theme.colors.gray[6]
                                                    : theme.colors.yellow[6]
                                        }
                                    />
                                }
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip events={{ hover: true, focus: true, touch: true }} color={'scBlue'} label={'Edit Payment Details'}>
                            <ActionIcon
                                variant={'transparent'}
                                onClick={($event) => {
                                $event.stopPropagation();
                                setEditPaymentItem(x);
                            }}>
                                <IconPencil />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </td>
            }
        </tr>
    )) || <tr>
        <td colSpan={hasEditPermission ? 6 : 5} className={styles.tableHead} style={{padding: 0, height: 48}}>
            <Text ta={'center'} size={'xs'} color={'gray.8'}>No payments are linked</Text>
        </td>
    </tr>

    return <>
        <Table highlightOnHover mt={'var(--mantine-spacing-lg)'}>
            {
                itemPaymentsQuery.isSuccess && itemPaymentsQuery.data.Results?.length > 0 &&
                <thead>
                <tr className={styles.tableHead} style={{height: 48}}>
                    <th>Payment Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th className={styles.textRight}>Amount</th>
                    {hasEditPermission && <th></th>}
                </tr>
                </thead>
            }
            <tbody className={styles.tableBody}>{rows}</tbody>
        </Table>

        <CreateOrEditPaymentModal
            show={showCreatePaymentModal || !!editPaymentItem}
            onClose={() => {
                setShowCreatePaymentModal(false)
                setEditPaymentItem(null)
            }}
            {...props}
            onCreated={(data) => {
                setShowCreatePaymentModal(false)
                setEditPaymentItem(null)
                clear();
                start();
            }}
            editPaymentItem={editPaymentItem}
            showDocumentSettingsHint={showSetupDocumentPaymentsHint}
        />

        <LinkPaymentsModal
            show={showLinkPaymentsModal}
            onClose={() => setShowLinkPaymentsModal(false)}
            {...props}
            onComplete={(data) => {
                clear();
                start();
                // update unlinked payments immediately
            }}
            unlinkedPayments={unlinkedCustomerPayments}
            showDocumentSettingsHint={showSetupDocumentPaymentsHint}
        />

        {
            hasEditPermission && !!props.customerID && props.hasOwnProperty('module') && !props.isNewQuoteOrInvoice
            && (
                <Button
                    my={'var(--mantine-spacing-sm)'}
                    color={'scBlue'}
                    size={'md'}
                    onClick={() => setShowCreatePaymentModal(true)}
                    disabled={props.amountDue <= 0}
                >
                    Create Payment
                </Button>
            )
        }

        {
            hasEditPermission && props.customerID
            && (
                <Button
                    my={'var(--mantine-spacing-sm)'}
                    ml={'var(--mantine-spacing-sm)'}
                    color={'scBlue'}
                    variant={'outline'}
                    size={'md'}
                    onClick={() => setShowLinkPaymentsModal(true)}
                    disabled={unlinkedCustomerPayments.length === 0 || props.amountDue <= 0}
                >
                    Link Payments
                </Button>
            )
        }

    </>
}

export default PaymentsList
