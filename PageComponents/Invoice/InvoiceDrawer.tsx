import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import {Flex, LoadingOverlay} from "@mantine/core";
import React, {FC, useEffect, useRef, useState} from "react";
import ManageQuoteForm, {ManageQuoteProps} from "@/PageComponents/Quote/ManageQuoteForm";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {useDidUpdate, useViewportSize} from "@mantine/hooks";
import ManageInvoiceForm, {ManageInvoiceProps} from "@/PageComponents/Invoice/ManageInvoiceForm";
const InvoiceDrawer: FC<{
    show?: boolean
    onCreated?: (result: any, close: boolean) => void
    onSaved: (result: any) => void
    setIsNew: (isNew: boolean) => void
} & ManageInvoiceProps> = ({show, ...others}) => {

    const [validateAndCloseCounter, setValidateAndClose] = useState(0)

    const [currentInvoice, setCurrentInvoice] = useState(others.invoice)

    const [isNew, setIsNew] = useState(others.isNew)

    useEffect(() => {
        if(!isNew && !currentInvoice) {
            setCurrentInvoice(others.invoice) // it is needed to set the initial invoice as this component is not unmounted when not shown.  Current invoice is managed in order to allow prompt before updating
        }
    }, [others.invoice]);

    const {data: invoice, isFetching} = useQuery(['invoice', currentInvoice?.ID], () => Fetch.get({
        url: `/Invoice/${currentInvoice?.ID}`
    }), {
        enabled: !!currentInvoice?.ID && !isNew && show,
        staleTime:0
    })

    const {width: viewportWidth} = useViewportSize()
    const drawerSize = Math.min(1320, Math.max(900, viewportWidth - 310))

    const [fullScreen, setFullScreen] = useState(false)

    useEffect(() => {
        if(!show) {
            setCurrentInvoice(null)
        }
    }, [show]);

    const [forceRemount, setForceRemount] = useState(false)
    useEffect(() => {
        if(forceRemount) {
            setForceRemount(false)
        }
    }, [forceRemount])
    useDidUpdate(() => {
        setForceRemount(true)
        setIsNew(others.isNew)
        if(others.isNew) {
            setCurrentInvoice(null)
        }
    }, [others.isNew]);

    const prevTitleRef = useRef('');
    useEffect(() => {
        if (show) {
            prevTitleRef.current = document.title;
            return () => { document.title = prevTitleRef.current; };
        }
    }, [show]);
    useEffect(() => {
        if (!show) return;
        document.title = isNew
            ? 'Create Invoice | Invoices'
            : (currentInvoice?.InvoiceNumber ? `${currentInvoice.InvoiceNumber} | Invoices` : 'Invoices | ServCraft');
    }, [show, currentInvoice?.InvoiceNumber, isNew]);

    return <ScDrawer
        linkToFullPage={!isNew && ('/invoice/' + currentInvoice?.ID)}
        opened={show || typeof show === 'undefined'}
        onClose={() => {
            // others.onClose()
            (isFetching && others.onClose && others.onClose()) ||
            setValidateAndClose(p => p + 1)
        }}
        title={isNew ? 'Create Invoice' :
            <Flex gap={'sm'} align={'center'}>
                <span>Invoice {currentInvoice?.InvoiceNumber}</span>
            </Flex>
        }
        size={drawerSize}
        styles={{
            body: {
                paddingInlineEnd: 0
            },
            content: {
                overflowY: 'hidden'
            }
        }}
    >
        {
            show && !isFetching && (isNew || typeof invoice !== 'undefined') && !!others.company && !forceRemount &&
            <ManageInvoiceForm
                {...others}
                useTabs
                isNew={isNew}
                invoice={invoice ?? currentInvoice}
                width={fullScreen ? 2000 : (drawerSize - 30)}
                validateAndCloseCounter={validateAndCloseCounter}
                attemptUpdate={{
                    newItem: others.invoice,
                    onUpdateConfirm: (q) => {
                        others.setIsNew(false)
                        setCurrentInvoice(q)
                    },
                    onUpdateReject: () => {}
                }}
                onClose={() => {
                    others.onClose && others.onClose()
                }}
                onSaved={(inv) => {
                    others.onSaved?.(inv)
                    setCurrentInvoice(inv)
                }}
                fullscreenMode={fullScreen}
                mode={'drawer'}
                onCreated={(item, close) => {
                    others.onCreated && others.onCreated(item, close)
                }}
                onCreateNew={others.onCreateNew}
                onCopyToInvoice={others.onCopyToInvoice}
                copyFromInvoice={others.copyFromInvoice}
            />
        }

        <LoadingOverlay
            visible={isFetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}
        />

    </ScDrawer>;

}

export default InvoiceDrawer
