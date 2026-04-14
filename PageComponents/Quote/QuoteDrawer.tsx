import ScDrawer from "@/PageComponents/Drawer/ScDrawer";
import { Flex, LoadingOverlay } from "@mantine/core";
import React, { FC, useEffect, useRef, useState } from "react";
import ManageQuoteForm, { ManageQuoteProps } from "@/PageComponents/Quote/ManageQuoteForm";
import { useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { useDidUpdate, useViewportSize } from "@mantine/hooks";
const QuoteDrawer: FC<{
    show?: boolean
    onCreated?: (createdQuoteResult: any, close: boolean) => void
    onSaved: (savedQuoteResult) => void
    setIsNew: (isNew: boolean) => void
    // onSavedRefreshOnly: (data) => void
} & ManageQuoteProps> = ({ show, ...others }) => {

    const [validateAndCloseCounter, setValidateAndClose] = useState(0)

    const [currentQuote, setCurrentQuote] = useState(others.quote)

    const [isNew, setIsNew] = useState(others.isNew)

    useEffect(() => {
        if (!isNew && !currentQuote) {
            setCurrentQuote(others.quote) // it is needed to set the initial quote as this component is not unmounted when not shown.  Current quote is managed in order to allow prompt before updating
        }/* else if(isNew) {
            console.log('attempt to set quote')
            setValidateAndClose(p => p + 1)
        }*/
    }, [others.quote]);

    const { data: quote, isFetching } = useQuery(['quote', currentQuote?.ID], () => Fetch.get({
        url: `/Quote/${currentQuote?.ID}`
    }), {
        enabled: !!currentQuote?.ID && !isNew && show,
        staleTime:0
    })

    const {width: viewportWidth} = useViewportSize()
    const drawerSize = Math.min(1320, Math.max(900, viewportWidth - 310))

    const [fullScreen, setFullScreen] = useState(false)

    useEffect(() => {
        if (!show) {
            setCurrentQuote(null)
        }
    }, [show]);

    const [forceRemount, setForceRemount] = useState(false)
    useEffect(() => {
        if (forceRemount) {
            setForceRemount(false)
        }
    }, [forceRemount])
    useDidUpdate(() => {
        setForceRemount(true)
        setIsNew(others.isNew)
        if (others.isNew) {
            setCurrentQuote(null)
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
            ? 'Create Quote | Quotes'
            : (currentQuote?.QuoteNumber ? `${currentQuote.QuoteNumber} | Quotes` : 'Quotes | ServCraft');
    }, [show, currentQuote?.QuoteNumber, isNew]);

    return <ScDrawer
        linkToFullPage={!isNew && ('/quote/' + currentQuote?.ID)}
        opened={show || typeof show === 'undefined'}
        onClose={() => {
            // others.onClose()
            (isFetching && others.onClose && others.onClose()) ||
                setValidateAndClose(p => p + 1)
        }}
        title={isNew ? 'Create Quote' :
            <Flex gap={'sm'} align={'center'}>
                <span>Quote {currentQuote?.QuoteNumber}</span>
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
            show && !isFetching && (isNew || typeof quote !== 'undefined') && !!others.company && !forceRemount &&
            <ManageQuoteForm
                {...others}
                useTabs
                isNew={isNew}
                quote={quote ?? currentQuote}
                width={fullScreen ? 2000 : (drawerSize - 30)}
                validateAndCloseCounter={validateAndCloseCounter}
                attemptUpdate={{
                    newItem: others.quote,
                    onUpdateConfirm: (q) => {
                        others.setIsNew(false)
                        setCurrentQuote(q)
                    },
                    onUpdateReject: () => { }
                }}
                onClose={() => {
                    others.onClose && others.onClose()
                }}
                fullscreenMode={fullScreen}
                mode={'drawer'}
                onCreated={(item, close) => {
                    /*if(close) {
                        others.onClose && others.onClose()
                    } else {
                        setCurrentQuote(item)
                    }*/
                    others.onCreated && others.onCreated(item, close)
                }}
                onCreateNew={others.onCreateNew}
                onCopyToQuote={others.onCopyToQuote}
                copyFromQuote={others.copyFromQuote}
            /*dirtyStateChange={console.log}
            onSaved={(result) => {
                if(others.quote.ID !== result?.ID) {
                    // setCurrentQuote(others.quote)
                }
            }}*/
            /*isNew={isNew}
            copyFromQuote={others.copyFromQuote}
            module={others.module}
            moduleID={others.moduleID}
            customerID={others.customerID}
            accessStatus={others.accessStatus}
            company={others.company}
            quote={others.quote}*/
            />
        }

        <LoadingOverlay
            visible={isFetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}
        />


        {
            /*(isNew || !!others.inventory) &&
            <InventoryItemForm
                onInventorySaved={onInventorySave}
                onClose={onClose}
                hideTitle
                {...others}
                validateAndCloseCounter={validateAndCloseCounter}
                forceFetchLatestData
            />*/
        }
    </ScDrawer>;

}

export default QuoteDrawer
