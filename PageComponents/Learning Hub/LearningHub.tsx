import {Box, Button} from "@mantine/core";
import React, {FC, useEffect, useRef, useState} from "react";
import * as Enums from '@/utils/enums';
import MessagePost from "@/components/modals/message-post";
import Storage from "@/utils/storage";
import {useRouter} from "next/router";
import PermissionService from "@/services/permission/permission-service";

// todo NB update test origin when building locally for iframe to load
// const helpCentreTestOrigin = 'http://localhost:3001'
const helpCentreTestOrigin = 'https://stagingwebsite.servcraft.co.za'
const helpCentreProdOrigin = 'https://www.servcraft.co.za'
const hcUrl = typeof window === 'undefined' || window.origin === 'https://app.servcraft.co.za' ? helpCentreProdOrigin : helpCentreTestOrigin
const LearningHub: FC<{toggleHelp: () => void, openHelp: () => void, helpOpened, isDragging: boolean}> = (props) => {

    const [helpCenterOrigin, setHelpCenterUrl] = useState(hcUrl)
    // show help center only after the helpCenterOrigin url is established as it will not change with rerender
    const [show, setShow] = useState(false)

    useEffect(() => {
        setHelpCenterUrl(typeof origin === 'undefined' || origin === 'https://app.servcraft.co.za' ? helpCentreProdOrigin : helpCentreTestOrigin)
        setShow(true)
    }, []);

    const router = useRouter()
    const [kbStartingPoint, setKbStartingPoint] = useState('')

    const [showMessagePost, setShowMessagePost] = useState(false);

    const iFrameRef = useRef<HTMLIFrameElement>(null)

    const handleEvent = (event: MessageEvent) => {
        if (typeof event.data === 'object' && event.data.hasOwnProperty('action')) {
            // console.log('transmission received from child, handled as:', event.data)
            // console.log('handle switch')
            switch (event.data.action.trim()) {
                case 'close': {
                    props.toggleHelp()
                    break;
                }
                case 'link': {
                    const path = event.data.href
                    // console.log('link to: ', path)
                    if(path && !path.startsWith('/')) {
                        router.push('/' + path)
                    } else {
                        path && router.push(path)
                    }
                    // props.toggleHelp()
                    break;
                }
                case 'contact-support': {
                    setShowMessagePost(true)
                    break;
                }
                case 'prevent-hint': {
                    localStorage && localStorage.setItem('hcHint', 'x')
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

    const sendPermissions = () => {
        // send message to help center containing permissions
        iFrameRef.current?.contentWindow?.postMessage({
            type: 'access',
            meta: {
                userId: Storage.getCookie(Enums.Cookie.userID),
                tenantId: Storage.getCookie(Enums.Cookie.tenantID),
                job: PermissionService.hasPermission(Enums.PermissionName.Job),
                query: PermissionService.hasPermission(Enums.PermissionName.Query),
                quote: PermissionService.hasPermission(Enums.PermissionName.Quote),
                // QuoteRevert: PermissionService.hasPermission(Enums.PermissionName.QuoteRevert),
                appointment: PermissionService.hasPermission(Enums.PermissionName.Appointment),
                product: PermissionService.hasPermission(Enums.PermissionName.Product),
                customer: PermissionService.hasPermission(Enums.PermissionName.Customer),
                inventory: PermissionService.hasPermission(Enums.PermissionName.Inventory),
                message: PermissionService.hasPermission(Enums.PermissionName.Message),
                reports: PermissionService.hasPermission(Enums.PermissionName.Reports),
                userManagement: PermissionService.hasPermission(Enums.PermissionName.UserManagement),
                masterOfficeAdmin: PermissionService.hasPermission(Enums.PermissionName.MasterOfficeAdmin),
                // MasterSystemAdmin: PermissionService.hasPermission(Enums.PermissionName.MasterSystemAdmin),
                // Technician: PermissionService.hasPermission(Enums.PermissionName.Technician),
                invoice: PermissionService.hasPermission(Enums.PermissionName.Invoice),
                // InvoiceRevert: PermissionService.hasPermission(Enums.PermissionName.InvoiceRevert),
                purchaseOrder: PermissionService.hasPermission(Enums.PermissionName.PurchaseOrder),
                // PurchaseOrderRevert: PermissionService.hasPermission(Enums.PermissionName.PurchaseOrderRevert),
                // EditJob: PermissionService.hasPermission(Enums.PermissionName.EditJob),
                // CloseJob: PermissionService.hasPermission(Enums.PermissionName.CloseJob),
                // ArchiveJob: PermissionService.hasPermission(Enums.PermissionName.ArchiveJob),
                // AddTaskItems: PermissionService.hasPermission(Enums.PermissionName.AddTaskItems),
                // RecurringJob: PermissionService.hasPermission(Enums.PermissionName.RecurringJob),
                // AddRepeatJobs: PermissionService.hasPermission(Enums.PermissionName.AddRepeatJobs),
                // ManageItemsUsed: PermissionService.hasPermission(Enums.PermissionName.ManageItemsUsed),
                manageMyTimers: PermissionService.hasPermission(Enums.PermissionName.ManageMyTimers),
                editOtherTimers: PermissionService.hasPermission(Enums.PermissionName.EditOtherTimers),
                project: PermissionService.hasPermission(Enums.PermissionName.Project),
                // EditCustomer: PermissionService.hasPermission(Enums.PermissionName.EditCustomer),
                // ModuleChangeCustomer: PermissionService.hasPermission(Enums.PermissionName.ModuleChangeCustomer),
                editCompany: PermissionService.hasPermission(Enums.PermissionName.EditCompany),
                changeMyPassword: PermissionService.hasPermission(Enums.PermissionName.ChangeMyPassword),
                exports: PermissionService.hasPermission(Enums.PermissionName.Exports),
                owner: PermissionService.hasPermission(Enums.PermissionName.Owner),
                // StoreChangeJob: PermissionService.hasPermission(Enums.PermissionName.StoreChangeJob),
                // AttachmentSecure: PermissionService.hasPermission(Enums.PermissionName.AttachmentSecure),
                // ChangeJobLocation: PermissionService.hasPermission(Enums.PermissionName.ChangeJobLocation),
                comment: PermissionService.hasPermission(Enums.PermissionName.Comment),
                allowPublicComments: PermissionService.hasPermission(Enums.PermissionName.AllowPublicComments),
                // EditComments: PermissionService.hasPermission(Enums.PermissionName.EditComments),
                integrations: PermissionService.hasPermission(Enums.PermissionName.Integrations),
                // Subscriptions: PermissionService.hasPermission(Enums.PermissionName.Subscriptions),
            }
        }, helpCenterOrigin)
    }

    useEffect(() => {
        if(iFrameRef.current) {
            if(!props.helpOpened) {
                // help center was closed from nav button
                iFrameRef.current.contentWindow?.postMessage({
                    type: 'closed'
                }, helpCenterOrigin)
            } else {
                sendPermissions()
                if (location && origin) {
                    iFrameRef.current?.contentWindow?.postMessage({
                        type: 'originOverride',
                        meta: origin
                    }, helpCenterOrigin)
                }
            }
        }
    }, [iFrameRef, props.helpOpened]);

    useEffect(() => {
        if (iFrameRef.current && !!props.toggleHelp) {
            // subscribe to help center incoming messages
            window.addEventListener('message', handleEvent)
        }
        return () => window.removeEventListener('message', handleEvent)
    }, [iFrameRef, props.toggleHelp])

    useEffect(() => {
        // console.log('query', router.query)
        if(router.query.help) {
            setKbStartingPoint(router.query.help as string)
            props.openHelp()
        }
    }, [router.query])

    return <>
        <Box h={'calc(100% - 45px)'}
        >
            {
                show &&
                <iframe
                    ref={iFrameRef}
                    style={{
                        zIndex: 20,
                        border: 'none',
                        pointerEvents: props.isDragging ? 'none' : 'auto'
                    }}
                    allow={`clipboard-write`}
                    allowFullScreen
                    height={'100%'}
                    width={'100%'}
                    src={helpCenterOrigin + '/knowledge-base' + kbStartingPoint}
                    referrerPolicy="no-referrer-when-downgrade"
                />
            }
        </Box>


        {
            showMessagePost &&
            <MessagePost
                onMessagePost={() => setShowMessagePost(false)}
                module={Enums.Module.Customer}
                customerZone={false}
                userName={Storage.getCookie(Enums.Cookie.servFullName)}
                commentType={Enums.CommentType.Help}
                itemID={undefined}
            />
        }
    </>
}

export default LearningHub
