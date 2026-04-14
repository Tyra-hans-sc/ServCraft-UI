import React, { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import PS from "@/services/permission/permission-service";
import * as Enums from "@/utils/enums";
import useRefState from "@/hooks/useRefState";
import { useQuery } from "@tanstack/react-query";
import OptionService from "@/services/option/option-service";
import Constants from "@/utils/constants";
import Helper from "@/utils/helper";
import quoteService from "@/services/quote/quote-service";
import ToastContext from "@/utils/toast-context";
import Router from "next/router";
import Storage from "@/utils/storage";
import Fetch from "@/utils/Fetch";
import CommentService from "@/services/comment/comment-service";
import Time from "@/utils/time";
import featureService from "@/services/feature/feature-service";
import CustomerService from "@/services/customer/customer-service";
import { getSectionsFromTableData } from "@/PageComponents/SectionTable/SectionTable";
import constants from "@/utils/constants";
import DownloadService from "@/utils/download-service";
import { ActionIcon, Anchor, Badge, Box, Button, Card, Flex, Loader, Menu, ScrollArea, Text, Tooltip } from "@mantine/core";
import StoreSelector from "@/components/selectors/store/store-selector";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import Link from "next/link";
import {
    IconChevronDown,
    IconDeviceFloppy,
    IconDotsVertical,
    IconDownload,
    IconExternalLink, IconEye, IconFileCheck, IconLayoutSidebarRightCollapse,
    IconPrinter,
    IconSend,
    IconShare2
} from "@tabler/icons-react";
import SCInput from "@/components/sc-controls/form-controls/sc-input";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import LinkItem from "@/PageComponents/Links/LinkItem";
import EmployeeSelector from "@/components/selectors/employee/employee-selector";
import QuoteDetailsSections from "@/components/quote/quote-details-sections";
import SCTextArea from "@/components/sc-controls/form-controls/sc-textarea";
import SCNumericInput from "@/components/sc-controls/form-controls/sc-numeric-input";
import { getPaymentAccess } from "@/PageComponents/Payments/payments";
import PaymentsList from "@/PageComponents/Payments/PaymentsList";
import { colors, layout } from "@/theme";
import { useDidUpdate, useElementSize, useViewportSize } from "@mantine/hooks";
import ToolbarButtons from "@/PageComponents/Button/ToolbarButtons";
import ConfirmAction from "@/components/modals/confirm-action";
import SendToCustomerModal from "@/PageComponents/Quote/SendToCustomerModal";
import QuoteService from "@/services/quote/quote-service";
import PageTabs from "@/PageComponents/Layout/PageTabs";
import ItemComments from "@/components/shared-views/item-comments";
import Communications from "@/components/shared-views/communications";
import Attachments from "@/components/shared-views/attachments";
import AuditLog from "@/components/shared-views/audit-log";
import Breadcrumbs from "@/components/breadcrumbs";
import QuotePreferencesDrawer from "@/PageComponents/Quote/QuotePreferencesDrawer";
import SCSplitButton from "@/components/sc-controls/form-controls/sc-split-button";
import UpdateInventoryPricesModal, { InventoryUpdateItem, detectInventoryPriceChanges, InventoryPriceDetectionResult } from "@/PageComponents/Inventory/UpdateInventoryPricesModal";
import permissionService from "@/services/permission/permission-service";

export interface ManageQuoteProps {
    quote?: any
    isNew?: boolean
    copyFromQuote?: any
    module?: number
    moduleID?: string
    customerID?: string
    accessStatus?: any
    company: any
    onClose?: () => void
    dirtyStateChange?: (newState: boolean) => void
    onSaved?: (quoteSavedResult: any) => void
    onCreated?: (quoteSavedResult: any, closeAfterSave: boolean) => void
    useTabs?: boolean
    attemptUpdate?: {
        newItem?: any,
        onUpdateConfirm?: (newItem) => void,
        onUpdateReject?: (newItem) => void
    },
    comments?: any[]
    initTab?: string
    onCopyToQuote?: (quote: any) => void;
    onCreateNew?: () => void;
}

interface PendingSaveParams {
    status: any;
    routeChange: boolean;
    exportMode: 'none' | 'view' | 'download';
    closeAfterSave: boolean;
    sendToCustomer: boolean;
}

const ManageQuoteForm: FC<ManageQuoteProps & {
    width?: number;
    validateAndCloseCounter?: number;
    fullscreenMode?: boolean; mode: 'drawer' | 'page';
}> = ({ ...props }) => {
    const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
    const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
    const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));
    const [quoteRevertPermission] = useState(PS.hasPermission(Enums.PermissionName.QuoteRevert));
    const [quoteApprovePermission] = useState(PS.hasPermission(Enums.PermissionName.QuoteApprove));
    const [hasManageCostingPermission] = useState(PS.hasPermission(Enums.PermissionName.ManageCosting));
    const [costPricePermission] = useState(permissionService.hasPermission(Enums.PermissionName.InventoryCostPrice));
    const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));

    const isNew = props.isNew;
    const copyFromQuote = props.copyFromQuote;
    const externalModule = props.module;
    const externalModuleID = props.moduleID;
    const externalCustomerID = props.customerID;

    const [quote, setQuote, getQuoteValue] = useRefState(isNew ? (copyFromQuote ? copyFromQuote : {
        Reference: '',
        DiscountPercentage: 0,
        QuoteStatus: Enums.QuoteStatus.Draft,
    }) : props.quote);

    const { data: quoteOptionsData } = useQuery(['quoteOptions'], () => OptionService.getCustomFields(Enums.Module.Quote), {
        enabled: typeof quote.DepositPercentage === 'undefined'
    })

    useEffect(() => {
        if (quoteOptionsData) {
            const depositPercentageOption = quoteOptionsData.find(x => x.OptionName === 'Quote Default Deposit Percentage')
            const defaultDepositPercentageValue = depositPercentageOption && +depositPercentageOption.OptionValue || Constants.defaultQuoteDepositPercentage
            if (!quote.DiscountPercentage) {
                setQuote(x => ({ ...x, DepositPercentage: defaultDepositPercentageValue }))
            }
        }
    }, [quoteOptionsData, quote.DiscountPercentage])

    // for displaying the total amount in currency obtained
    const depositAmountFormatted = useMemo(() => {
        const value = Math.round(quote.TotalInclusive * (quote.DepositPercentage || Constants.defaultQuoteDepositPercentage)) / 100
        let currValue = value.toFixed(2);
        let spacePos = currValue.indexOf('.');
        while (spacePos > 3) {
            spacePos = spacePos - 3;
            currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
        }
        return currValue;
    }, [quote.TotalInclusive, quote.DepositPercentage])

    const [paymentsList, setPaymentsList] = useState<any>([]);
    const [paymentsReceivedTotal, setPaymentsReceivedTotal] = useState(0);
    const [amountDue, setAmountDue] = useState(0);
    useEffect(
        () => {
            let total = 0;
            let amountDue = +quote.TotalInclusive;
            paymentsList.forEach((x: any) => {
                total = total + +x.Amount;
                amountDue = amountDue - +x.Amount;
            })
            setPaymentsReceivedTotal(Helper.roundToTwo(total))
            setAmountDue(Helper.roundToTwo(amountDue))
        }, [paymentsList, quote.TotalInclusive]
    )

    const refreshQuote = async () => {
        const quo = await quoteService.getQuote(quote.ID)
        await setQuote((x) => ({ ...x, QuoteStatus: quo?.QuoteStatus ?? x.QuoteStatus, RowVersion: quo.RowVersion, TotalPayments: quo.TotalPayments }))
        props.mode === 'drawer' && props.onSaved && props.onSaved(quo)
    }


    const [module, setModule] = useState<number>();
    const [itemID, setItemID] = useState<string>();

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [selectedQuery, setSelectedQuery] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const [comments, setComments] = useState(props.comments ? props.comments : []);

    const [totalComments, setTotalComments] = useState(0);

    // TABS
    const [pageTabs, setPageTabs] = useState<any>([]);
    const [selectedTab, setSelectedTab] = useState(props.initTab ?? null);

    const [attachmentCount, setAttachmentCount] = useState(0);
    const [communicationCount, setCommunicationCount] = useState(0);
    const [countsToggle, setCountsToggle] = useState(false);

    const getCounts = async () => {
        let counts = await QuoteService.getCounts(quote.ID);
        setAttachmentCount(counts.attachmentCount);
        setCommunicationCount(counts.communicationCount);

        setCountsToggle(!countsToggle);
    };

    useEffect(() => {
        buildUpPageTabs();
    }, [countsToggle, totalComments]);

    const onAttachmentRefresh = () => {
        getCounts();
    };

    const buildUpPageTabs = () => {
        let tabs = [
            { text: 'Quote' },
            { text: 'Comments', count: totalComments },
            { text: 'Attachments', count: attachmentCount },
            { text: 'Communication', count: communicationCount },
        ];
        setPageTabs(tabs);
        if (!selectedTab) setSelectedTab(tabs[0].text);
    };

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveQuote);

    useDidUpdate(() => {
        if (props.validateAndCloseCounter) {
            if (formIsDirty) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    showCancel: true,
                    showDiscard: true,
                    onDiscard: () => {
                        props.onClose && props.onClose()
                    },
                    heading: "Save Changes?",
                    text: `Would you like to save your changes to ${quote.QuoteNumber}?`,
                    confirmButtonText: "Save",
                    onConfirm: saving ? () => { } : () => setTimeout(() => { saveQuote(quote.QuoteStatus, false, 'none', true); }, 50)
                })
            } else {
                props.onClose && props.onClose()
            }
        }
    }, [props.validateAndCloseCounter]);

    useDidUpdate(() => {
        if (props.attemptUpdate?.newItem) {
            if (formIsDirty) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    showCancel: true,
                    showDiscard: true,
                    onDiscard: () => {
                        props.attemptUpdate?.onUpdateConfirm && props.attemptUpdate.onUpdateConfirm(props.attemptUpdate.newItem)
                    },
                    heading: "Save Changes?",
                    text: `Would you like to save your changes to ${quote.QuoteNumber}?`,
                    confirmButtonText: "Save",
                    onConfirm: saving ? () => { } : () => setTimeout(() => { saveQuote(quote.QuoteStatus, false, 'none', true); }, 50)
                })
            } else {
                props.attemptUpdate?.onUpdateConfirm && props.attemptUpdate.onUpdateConfirm(props.attemptUpdate.newItem)
            }
        }

    }, [props.attemptUpdate?.newItem]);

    const [inputErrors, setInputErrors] = useState<any>({});

    const toast = useContext<any>(ToastContext);

    const updateQuote = (field, value) => {
        let temp = { ...quote };
        temp[field] = value;
        setQuote(temp);
        setFormIsDirty(true);
    };

    const updateBulkTimeout = useRef<any>(null);
    const updateBulkRef = useRef<any>({});
    function updateQuoteBulk(orKeyValues, markAsDirty = true) {
        // console.log("orKeyValues", orKeyValues);

        clearTimeout(updateBulkTimeout.current);

        if (orKeyValues && orKeyValues.length > 0) {
            orKeyValues.map((item) => {
                updateBulkRef.current[item.key] = item.value;
            });
        }

        updateBulkTimeout.current = setTimeout(() => {

            let newQuoteState = { ...getQuoteValue() };

            // console.log("updateBulkRef.current", updateBulkRef.current);

            if (updateBulkRef.current) {
                Object.keys(updateBulkRef.current).map((key) => {
                    newQuoteState[key] = updateBulkRef.current[key];
                });
                updateBulkRef.current = {};
            }

            setQuote(newQuoteState);
            setFormIsDirty(markAsDirty);

        }, 100);


    }

    const [showPreferences, setShowPreferences] = useState<any>(false)
    const [tableColumnMapping, setTableColumnMapping] = useState<any[]>()
    const [userColumnConfig, setUserColumnConfig] = useState<any[]>()

    const [optionButtons, setOptionButtons] = useState<any>([]);

    const getOptionButtons = (status = quote.QuoteStatus) => {
        const workflowItems: any[] = [];
        if (status != Enums.QuoteStatus.Cancelled) {
            workflowItems.push({ text: 'Cancel Quote', link: `CancelQuote` });
        }
        if (status == Enums.QuoteStatus.Approved || status == Enums.QuoteStatus.Accepted || status == Enums.QuoteStatus.Declined) {
            if (quoteRevertPermission) {
                workflowItems.push({ text: 'Revert to Draft', link: `RevertToDraft` });
            }
        }
        if (status == Enums.QuoteStatus.Approved || status == Enums.QuoteStatus.Accepted) {
            workflowItems.push({ text: 'Mark as Invoiced', link: `MarkAsInvoiced` });
        }

        const documentItems = [
            { text: 'Copy Quote', link: `CopyQuote` },
            { text: 'New Quote', link: `NewQuote` },
            { text: 'Export Line Items', link: `ExportLineItems` },
        ];

        const linkedItems: any[] = [];
        if (customerPermission && !(props.mode === 'drawer' && externalModule === Enums.Module.Customer))
            linkedItems.push({ text: 'Open Customer', link: `OpenCustomer` });
        if (selectedJob && jobPermission && !(props.mode === 'drawer' && externalModule == Enums.Module.JobCard))
            linkedItems.push({ text: 'Open Job', link: `OpenJob` });
        if (selectedQuery && queryPermission && !(props.mode === 'drawer' && externalModule == Enums.Module.Query))
            linkedItems.push({ text: 'Open Query', link: `OpenQuery` });
        if (Helper.isNullOrUndefined(selectedJob) && Helper.isNullOrUndefined(selectedQuery)) {
            if (jobPermission) linkedItems.push({ text: 'Create Job', link: `CreateJob` });
            if (queryPermission) linkedItems.push({ text: 'Create Query', link: `CreateQuery` });
        }

        const groups: any[] = [
            { label: 'Workflow', items: workflowItems },
            { label: 'Document', items: documentItems },
        ];
        if (linkedItems.length > 0) groups.push({ label: 'Linked Records', items: linkedItems });

        setOptionButtons(groups);
    };

    // const [drawerQuote, setDrawerQuote] = useState<any>(null)
    // const [createNewQuote, setCreateNewQuote] = useState<boolean>(false)

    const optionsClick = async (link) => {

        let routeChange: boolean | undefined = true;
        if (formIsDirty) {
            routeChange = await saveQuote(quote.QuoteStatus, routeChange);
        }

        const currentQuote = getQuoteValue();

        if (routeChange) {
            switch (link) {
                case 'CopyQuote': {
                    if (props.mode === 'drawer') {
                        props.onCopyToQuote && props.onCopyToQuote({ ...currentQuote })
                    } else if (props.mode === 'page') {
                        Helper.nextRouter(Router.push, `/quote/create?id=${quote.ID}`);
                    } else {
                        Helper.nextRouter(Router.push, `/quote/create?id=${quote.ID}`);
                    }
                    break;
                }
                case 'CancelQuote':
                    confirmChangeStatus('cancel', Enums.QuoteStatus.Cancelled);
                    break;
                case 'RevertToDraft':
                    revertToDraft();
                    break;
                case 'MarkAsInvoiced':
                    markAsInvoiced();
                    break;
                case 'CreateJob':
                    Helper.nextRouter(Router.push, `/job/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}&customerID=${selectedCustomer.ID}`);
                    break;
                case 'CreateQuery':
                    Helper.nextRouter(Router.push, `/query/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}&customerID=${selectedCustomer.ID}`);
                    break;
                case 'NewQuote': {
                    if (props.mode === 'drawer') {
                        // emit event to set create new
                        /*if (formIsDirty)  {
                            setConfirmOptions({
                                ...Helper.initialiseConfirmOptions(),
                                display: true,
                                showCancel: true,
                                showDiscard: true,
                                onDiscard: () => {
                                    props.onCreateNew && props.onCreateNew()
                                },
                                heading: "Save Changes?",
                                text: `Would you like to save your changes to ${quote.QuoteNumber}?`,
                                confirmButtonText: "Save",
                                onConfirm: saving ? () => {} : () => setTimeout(() => { saveQuote(quote.QuoteStatus, false, 'none', true); }, 50)
                            })
                        } else {
                            props.onCreateNew && props.onCreateNew()
                        }*/
                        props.onCreateNew && props.onCreateNew()
                    } else if (props.mode === 'page') {
                        Helper.nextRouter(Router.push, '/quote/create')
                        // open drawer
                        // setDrawerQuote()
                    } else {
                        Helper.nextRouter(Router.push, '/quote/create')
                    }
                    break;
                }
                case 'OpenJob':
                    Helper.nextRouter(Router.push, `/job/[id]`, `/job/${selectedJob?.ID}`);
                    break;
                case 'OpenQuery':
                    Helper.nextRouter(Router.push, `/query/[id]`, `/query/${selectedQuery?.ID}`);
                    break;
                case 'OpenCustomer':
                    Helper.nextRouter(Router.push, `/customer/[id]`, `/customer/${selectedCustomer?.ID}`);
                    break;
                case 'Preferences':
                    setShowPreferences(true)
                    break;
                case 'ExportLineItems':
                    exportLineItems("download")
            }
        }
    };

    useEffect(() => {
        getOptionButtons();
    }, [selectedJob, selectedQuery]);

    // Keep options in sync with status changes without refetching
    useEffect(() => {
        getOptionButtons(quote.QuoteStatus);
    }, [quote.QuoteStatus]);

    const copyTo = async (link) => {

        let routeChange: undefined | boolean = true;
        if (formIsDirty) {
            routeChange = await saveQuote(quote.QuoteStatus, routeChange);
        }

        if (link === 'invoice') {
            if (module == Enums.Module.Project) {
                Helper.nextRouter(Router.push, `/invoice/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}&rootModule=${Enums.Module.Project}&customerID=${selectedCustomer.ID}`);
            } else {
                Helper.nextRouter(Router.push, `/invoice/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}&customerID=${selectedCustomer.ID}`);
            }
        } else if (link === 'po') {
            if (module == Enums.Module.Project) {
                Helper.nextRouter(Router.push, `/purchase/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}&rootModule=${Enums.Module.Project}`);
            } else {
                Helper.nextRouter(Router.push, `/purchase/create?module=${Enums.Module.Quote}&moduleID=${quote.ID}`);
            }
        }
    };
    // QUOTE STATUS

    const approveQuoteClick = () => {
        const quoteItems = getQuoteItemsValue();
        const changes = detectInventoryPriceChanges(quoteItems, 'Quote', costPricePermission);
        if (changes.items.length > 0 && inventoryPermission) {
            setInventoryPriceChanges(changes);
            setPendingSaveParams({ status: Enums.QuoteStatus.Approved, routeChange: false, exportMode: 'none', closeAfterSave: false, sendToCustomer: false });
            setConfirmOptions({
                display: true,
                // customContent: <Text fw={600} size={'lg'}>Approve the quote?</Text>,
                discardButtonText: "Approve quote",
                heading: "Confirm",
                text: `Are you sure you want to approve this quote?`,
                // confirmButtonText: "Approve quote",
                showCancel: true,
                showDiscard: true,
                confirmButtonText: "Approve and update pricing",
                onConfirm: async () => {
                    setShowUpdateInventoryModal(true);
                },
                onDiscard: async () => {
                    statusChangeConfirmed(Enums.QuoteStatus.Approved);
                }
            } as any);
        } else {
            confirmChangeStatus('approve', Enums.QuoteStatus.Approved);
        }
    };

    const acceptDeclineQuoteClick = (status) => {
        if (status == Enums.QuoteStatus.Accepted) {
            confirmChangeStatus('accept', Enums.QuoteStatus.Accepted);
        } else if (status == Enums.QuoteStatus.Declined) {
            confirmChangeStatus('decline', Enums.QuoteStatus.Declined);
        }
    };

    const statusChangeConfirmed = (status) => {
        saveQuote(status);
        getOptionButtons(status);
    };

    const confirmChangeStatus = async (statusString, status) => {
        setConfirmOptions({
            display: true,
            heading: "Confirm",
            text: `Are you sure you want to ${statusString} this quote?`,
            confirmButtonText: "Confirm",
            showCancel: true,
            onConfirm: async () => {
                statusChangeConfirmed(status);
            }
        } as any);
    };

    const revertToDraft = async () => {
        confirmRevert();
    };

    const confirmRevert = async () => {
        setConfirmOptions({
            display: true,
            heading: "Confirm",
            text: `Are you sure you want to revert this quote?`,
            confirmButtonText: "Confirm",
            showCancel: true,
            onConfirm: async () => {
                const result = await Fetch.post({
                    url: `/Quote/QuoteToDraft?quoteid=${quote.ID}`,
                    toastCtx: toast
                });
                if (result.ID) {
                    setQuote(result);
                    getOptionButtons(result.QuoteStatus);

                    toast?.setToast({
                        message: 'Quote reverted successfully',
                        show: true,
                        type: 'success'
                    });
                    !!props.onSaved && props.onSaved(result)
                }
            }
        } as any);
    };

    const markAsInvoiced = async () => {
        confirmMarkAsInvoiced();
    };

    const confirmMarkAsInvoiced = async () => {
        setConfirmOptions({
            display: true,
            heading: "Confirm",
            text: `Are you sure you want to mark this quote as Invoiced?`,
            confirmButtonText: "Confirm",
            showCancel: true,
            onConfirm: async () => {
                const result = await Fetch.post({
                    url: `/Quote/QuoteToInvoiced?quoteid=${quote.ID}`,
                    toastCtx: toast
                });
                if (result.ID) {
                    setQuote(result);
                    getOptionButtons(result.QuoteStatus);

                    toast?.setToast({
                        message: 'Quote marked as Invoiced successfully',
                        show: true,
                        type: 'success'
                    });
                }
            }
        } as any);
    };

    const [clearLinks, setClearLinks] = useState(isNew);
    const [showJobLink, setShowJobLink] = useState(isNew);
    const [showQueryLink, setShowQueryLink] = useState(isNew);
    const [showProjectLink, setShowProjectLink] = useState(isNew);
    const [jobLinkLockdown, setJobLinkLockdown] = useState(false);
    const [queryLinkLockdown, setQueryLinkLockdown] = useState(false);
    const [customerLinkLockdown, setCustomerLinkLockdown] = useState(false);
    const [projectLinkLockdown, setProjectLinkLockdown] = useState(false);

    const handleInputChange = (e) => {
        updateQuote([e.target.name], e.target.value);
    };

    const logoRef = useRef();
    const [logo, setLogo] = useState();

    const company = props.company;
    const currencySymbol = company.Currency ? company.Currency.Symbol : '';

    useEffect(() => {
        if (company.LogoExists) {
            setLogo(company.LogoUrl);
        } else {
            setShowHeaderContents(true);
        }
    }, [company]);

    // STORES

    const [searching, setSearching] = useState<boolean>(false);
    const [isMultiStore, setIsMultiStore] = useState<boolean>(false);
    const [stores, setStores] = useState<any[]>([]);
    const [storesTotalResults, setStoresTotalResults] = useState<any>();
    const [storeSearch, setStoreSearch] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<any>();

    const getStore = async () => {
        const storesResult = await Fetch.get({
            url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
        });
        setIsMultiStore(storesResult.TotalResults > 1);

        if (storesResult.TotalResults > 1) {
            // set store from quote
            if (!isNew && !Helper.isNullOrUndefined(quote.StoreID)) {
                const storeResult = await Fetch.get({
                    url: `/Store/${quote.StoreID}`,
                });
                preventNextEmployeeClearOnStoreChangeRef.current = !!copyFromQuote;
                setSelectedStore(storeResult);
            }
        } else {
            preventNextEmployeeClearOnStoreChangeRef.current = !!copyFromQuote;
            setSelectedStore(storesResult.Results ? storesResult.Results[0] : null);
        }
    };

    const searchStores = async () => {
        setSearching(true);
        const storesResult = await Fetch.get({
            url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
        });
        setStores(storesResult.Results);
        setStoresTotalResults(storesResult.TotalResults);
        setSearching(false);
    };

    const handleStoreChange = (e) => {
        setStoreSearch(e.target.value);
        setFormIsDirty(true);
    };

    const [totalMessages, setTotalMessages] = useState(0);
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        if (messages.length == 0) {
            const messagesRes = await Fetch.post({
                url: '/Message/GetMessages',
                params: {
                    ItemId: quote.ID,
                    pageIndex: 0,
                    pageSize: 5
                }
            });
            setMessages(messagesRes.Results);
            setTotalMessages(messagesRes.TotalResults);
        }
    };

    // Comments

    // const [commentsPage, setCommentsPage] = useState(0);
    // const [canLoadMoreComments, setCanLoadMoreComments] = useState(props.totalComments > 5);

    // const loadMoreComments = () => {
    //   setCommentsPage(commentsPage + 1);
    //   fetchComments(comments, commentsPage + 1)
    // };

    // const handleCommentChange = (e) => {
    //   setNewComment(e.target.value);
    // };

    // const [newComment, setNewComment] = useState('');

    // const submitComment = async () => {
    //   if (newComment.length != 0) {
    //     await Fetch.post({
    //       url: '/Comment',
    //       params: {
    //         ItemID: quote.ID,
    //         CommentText: newComment,
    //         Module: Enums.Module.Quote,
    //         StoreID: quote.StoreID
    //       }
    //     });
    //     setCommentsPage(0);
    //     fetchComments();
    //     setNewComment('');
    //   }
    // };

    // const [submittingComment, setSubmittingComment] = useState(false);

    // async function saveComment() {
    //   if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
    //     return;
    //   }
    //   setSubmittingComment(true);
    //   submitComment();
    //   setSubmittingComment(false);
    // }

    async function fetchComments() {
        // const request = await Fetch.post({
        //   url: '/Comment/GetComments',
        //   params: {
        //     ItemId: quote.ID,
        //     PageIndex: page ? page : 0,
        //     PageSize: 5
        //   }
        // });

        if (props.isNew) return;

        const request = await CommentService.getComments(quote.ID, 0, 10);

        setTotalComments(request.TotalResults);

        // let newComments = [];
        // if (currentComments) {
        //   if (page != commentsPage) {
        //     newComments.push(...currentComments);
        //   }
        // }

        // newComments.push(...request.Results);
        // setComments(newComments);

        // if (request.ReturnedResults < 5) {
        //   setCanLoadMoreComments(false);
        // } else if (newComments.length == request.TotalResults) {
        //   setCanLoadMoreComments(false);
        // } else {
        //   setCanLoadMoreComments(true);
        // }
    }


    const prevSelectedStore = useRef(undefined);

    // this is a plastered on hack to not clear the employee when copying a quote and fetching and setting the store
    const preventNextEmployeeClearOnStoreChangeRef = useRef(!!copyFromQuote)

    useDidUpdate(() => {

        // if (prevSelectedStore.current !== undefined && prevSelectedStore.current?.ID === selectedStore?.ID) return;
        // prevSelectedStore.current = selectedStore ?? null;

        if (isNew && selectedStore && !Helper.isNullOrUndefined(selectedStore)) {

            if (copyFromQuote) {
                updateQuoteBulk([{
                    key: "ExpiryDate",
                    value: selectedStore.QuoteExpiryPeriod ? Time.addDays(selectedStore.QuoteExpiryPeriod, Time.now()) : Time.parseDate(Time.now()),
                }, {
                    key: "QuoteDate",
                    value: Time.toISOString(Time.now()),
                }, {
                    key: "Reference",
                    value: '',
                }, {
                    key: "QuoteStatus",
                    value: Enums.QuoteStatus.Draft,
                }, {
                    key: "ItemID",
                    value: copyFromQuote.CustomerID,
                }, {
                    key: "Module",
                    value: Enums.Module.Customer,
                }], false);
            } else {
                updateQuoteBulk([{
                    key: 'Comment',
                    value: quote.Comment ? quote.Comment : selectedStore.QuoteComment
                }, {
                    key: "ExpiryDate",
                    value: selectedStore.QuoteExpiryPeriod ? Time.toISOString(Time.addDays(selectedStore.QuoteExpiryPeriod, Time.now())) : Time.toISOString(Time.now()),
                }, {
                    key: "QuoteDate",
                    value: Time.toISOString(Time.now())
                }], false);
            }

            setStoreSearch(selectedStore.Name);

            if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee) && !preventNextEmployeeClearOnStoreChangeRef.current) {
                setSelectedEmployee(null);
                toast.setToast({
                    message: 'Employee has been cleared',
                    show: true,
                    type: Enums.ToastType.success
                });
            }
            preventNextEmployeeClearOnStoreChangeRef.current = false;
        }
    }, [selectedStore]);

    // Page load effect
    useEffect(() => {

        getStore();

        if (isNew) {
            if (typeof externalModule !== 'undefined') {
                switch (externalModule) {
                    case Enums.Module.Customer:
                        setModule(Enums.Module.Customer);
                        break;
                    case Enums.Module.JobCard:
                        setJobLinkLockdown(true);
                        setShowQueryLink(false);
                        setShowProjectLink(false);
                        getLinkedJobCard(externalModuleID).then(job => {
                            setSelectedStore(job ? job.Store : selectedStore);
                        });
                        setModule(Enums.Module.JobCard);
                        break;
                    case Enums.Module.Query:
                        setQueryLinkLockdown(true);
                        setShowJobLink(false);
                        setShowProjectLink(false);
                        getLinkedQuery(externalModuleID);
                        setModule(Enums.Module.Query);
                        break;
                    case Enums.Module.Project:
                        setShowQueryLink(false);
                        setShowJobLink(false);
                        setShowProjectLink(true);
                        setProjectLinkLockdown(true);
                        getLinkedProject(externalModuleID);
                        setModule(Enums.Module.Project);
                        break;
                }

                setCustomerLinkLockdown(true);
                selectCustomer(externalCustomerID);
                setItemID(externalModuleID);
            }

            if (copyFromQuote) {
                selectCustomer(copyFromQuote.CustomerID);
                setCustomerLinkLockdown(false);
                if (copyFromQuote.Store) {
                    preventNextEmployeeClearOnStoreChangeRef.current = true;
                    setSelectedStore(copyFromQuote.Store);
                }
            }
        } else {
            if (externalModule) {

                switch (externalModule) {
                    case Enums.Module.Customer:
                        if (quote.Module == Enums.Module.JobCard) {
                            getLinkedJobCard(quote.ItemID);
                            setModule(Enums.Module.JobCard);
                        } else if (quote.Module == Enums.Module.Query) {
                            getLinkedQuery(quote.ItemID);
                            setModule(Enums.Module.Query);
                        }
                        setItemID(quote.ItemID);
                        break;
                    case Enums.Module.JobCard:
                        setShowJobLink(true);
                        setShowQueryLink(false);
                        setShowProjectLink(false);
                        setJobLinkLockdown(true);
                        getLinkedJobCard(externalModuleID);
                        setModule(Enums.Module.JobCard);
                        setItemID(externalModuleID);
                        break;
                    case Enums.Module.Query:
                        setShowQueryLink(true);
                        setShowJobLink(false);
                        setShowProjectLink(false);
                        setQueryLinkLockdown(true);
                        getLinkedQuery(externalModuleID);
                        setModule(Enums.Module.Query);
                        setItemID(externalModuleID);
                        break;
                    case Enums.Module.Project:
                        if (quote.Module == Enums.Module.Project) {
                            setShowProjectLink(true);
                            setShowJobLink(false);
                            setProjectLinkLockdown(true);
                            getLinkedProject(quote.ItemID);
                            setModule(Enums.Module.Project);
                            setItemID(quote.ItemID);
                        } else if (quote.Module == Enums.Module.JobCard) {
                            setShowJobLink(true);
                            setJobLinkLockdown(true);
                            getLinkedJobCard(quote.ItemID);
                            setModule(Enums.Module.JobCard);
                            setItemID(quote.ItemID);
                        }
                        setShowQueryLink(false);
                        break;
                }
                setCustomerLinkLockdown(true);
            } else {
                if (quote.Module == Enums.Module.JobCard) {
                    getLinkedJobCard(quote.ItemID);
                    setShowJobLink(true);
                    setShowQueryLink(false);
                    setShowProjectLink(false);
                    setModule(Enums.Module.JobCard);
                    setItemID(quote.ItemID);
                } else if (quote.Module == Enums.Module.Query) {
                    getLinkedQuery(quote.ItemID);
                    setShowJobLink(false);
                    setShowQueryLink(true);
                    setShowProjectLink(false);
                    setModule(Enums.Module.Query);
                    setItemID(quote.ItemID);
                } else if (quote.Module == Enums.Module.Project) {
                    getLinkedProject(quote.ItemID);
                    setShowJobLink(false);
                    setShowQueryLink(false);
                    setShowProjectLink(true);
                    setModule(Enums.Module.Project);
                    setItemID(quote.ItemID);
                } else {
                    setShowJobLink(true);
                    setShowQueryLink(true);
                    setShowProjectLink(true);
                }
            }

            // getPeripheralJoins();
            fetchMessages();
            getOptionButtons();
            getCounts();
            getEmployeeLogin();
        }

        getIntegration();
        fetchComments();

        featureService.getFeature(Constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
            setUseNewTable(!!feature);
        });
    }, []);

    // #region Quote Items

    const sortQuoteItems = (items) => {
        return items.sort((a, b) => {
            if (a.LineNumber > b.LineNumber) {
                return 1;
            } else if (a.LineNumber < b.LineNumber) {
                return -1;
            } else {
                return 0;
            }
        });
    };

    const [quoteItems, setQuoteItems, getQuoteItemsValue] = useRefState<any[]>(isNew ? copyFromQuote ? copyFromQuote.QuoteItems : [] : sortQuoteItems(props.quote.QuoteItems));
    const [originalItems, setOriginalItems] = useState<any[]>([]);
    const [showUpdateInventoryModal, setShowUpdateInventoryModal] = useState(false);
    const [inventoryPriceChanges, setInventoryPriceChanges] = useState<InventoryPriceDetectionResult | null>(null);
    const [pendingSaveParams, setPendingSaveParams] = useState<PendingSaveParams | null>(null);

    useEffect(() => {
        if (quoteItems) {
            setOriginalItems(prev => {
                const newOriginals = [...prev];
                let changed = false;
                quoteItems.forEach(item => {
                    if (!newOriginals.find(oi => oi.ID === item.ID)) {
                        newOriginals.push(JSON.parse(JSON.stringify(item)));
                        changed = true;
                    }
                });
                return changed ? newOriginals : prev;
            });
        }
    }, [quoteItems]);

    /*const [quoteSections, setQuoteSections] = useState(
        isNew ? (
            copyFromQuote ? getSectionsFromTableData(
                copyFromQuote.QuoteItems,
                'InventorySectionName',
                'InventorySectionID',
                !Helper.isNullOrUndefined(module) ? module : quote.Module,
                itemID ? itemID : quote.ItemID
            ) : []
        ) :
        getSectionsFromTableData(
            sortQuoteItems(props.quote.QuoteItems),
            'InventorySectionName',
            'InventorySectionID',
            !Helper.isNullOrUndefined(module) ? module : quote.Module,
            itemID ? itemID : quote.ItemID
        )
    );*/

    const getTotals = (overrideTaxPercentage = false, items?: any[] | null) => {
        let subTotalExclusive = 0;
        // total tax should be calculated at the end to avoid rounding issues during calculation
        let totalTax = 0;
        let totalExclusive = 0;

        if ((items || quoteItems).length > 0) {
            (items || quoteItems).forEach((item: any) => {
                if (item.QuoteItemType == Enums.QuoteItemType.Inventory) {
                    subTotalExclusive += Helper.roundToTwo(parseFloat(item.LineTotalExclusive));
                    if (item.TaxPercentage > 0) {
                        if (overrideTaxPercentage) {
                            totalTax += Helper.roundToTwo((item.LineTotalExclusive * company.TaxPercentage * (1 - quote.DiscountPercentage / 100)));
                        } else {
                            totalTax += Helper.roundToTwo((item.LineTotalExclusive * item.TaxPercentage / 100 * (1 - quote.DiscountPercentage / 100)));
                        }
                    }
                }
            });
            totalExclusive = Helper.roundToTwo(((subTotalExclusive * (1 - quote.DiscountPercentage / 100))));
        }
        return { 'subTotalExclusive': subTotalExclusive, 'totalTax': totalTax, 'totalExclusive': totalExclusive };
    };

    const [afterFirstLoad, setAfterFirstLoad] = useState(false);

    const updateQuoteItemTotals = (items: any[] | null = null) => {

        let { subTotalExclusive, totalTax, totalExclusive } = getTotals(false, items);

        updateQuoteBulk([{
            key: 'SubTotalExclusive',
            value: Helper.roundToTwo(subTotalExclusive)
        }, {
            key: "TotalExclusive",
            value: Helper.roundToTwo(totalExclusive)
        }, {
            key: "TotalTax",
            value: Helper.roundToTwo(totalTax)
        }, {
            key: "TotalInclusive",
            // value: Helper.roundToTwo(totalExclusive + totalTax)
            value: Helper.roundToTwo(totalExclusive) + Helper.roundToTwo(totalTax),
        }], afterFirstLoad);
        setAfterFirstLoad(true);
    };

    const updateQuoteItems = (items) => {
        setQuoteItems([...items]);
        updateQuoteItemTotals(items);
        setFormIsDirty(true);
    };

    useEffect(() => {
        updateQuoteItemTotals();
    }, [quote.DiscountPercentage]);

    // #endregion

    // #region Customer / Contact / Location

    const [selectedCustomer, setSelectedCustomer] = useState(isNew ? undefined : quote.Customer);
    const prevSelectedCustomer = useRef(isNew ? undefined : quote.Customer);

    const [primaryContact, setPrimaryContact] = useState(isNew ? undefined : quote.Contact ? quote.Contact : undefined);

    const updateContact = (updatedContact, markDirty = true) => {
        setPrimaryContact(updatedContact);

        if (primaryContact && updatedContact) {
            if (primaryContact.ID != updatedContact.ID) {
                updateQuoteBulk([{
                    key: 'Contact',
                    value: updatedContact
                }, {
                    key: "CustomerContactID",
                    value: updatedContact.ID
                }], markDirty);
            }
        }
    };

    const [primaryLocation, setPrimaryLocation] = useState(isNew ? undefined : quote.Location ? quote.Location : undefined);

    const updateLocation = (updatedLocation, markDirty = true) => {
        setPrimaryLocation(updatedLocation);
        if (CustomerService.hasLocationChanged(primaryLocation, updatedLocation)) {
            updateQuoteBulk([{
                key: 'Location',
                value: updatedLocation
            }, {
                key: "LocationID",
                value: updatedLocation ? updatedLocation.ID : null
            }], markDirty);
        }
    };

    async function selectCustomer(customerID, markDirty = true) {
        if (customerID) {
            const customer = await Fetch.get({
                url: `/Customer/${customerID}`,
            });
            setSelectedCustomer(customer);

            const linkedItem = selectedJob || selectedQuery || selectedProject;

            if (customer.Contacts) {
                let contact = linkedItem?.CustomerContactID ? customer.Contacts.find(x => x.ID === linkedItem?.CustomerContactID) : customer.Contacts.find(x => x.IsPrimary);
                updateContact(contact, markDirty);
            }
            if (customer.Locations) {
                let location = linkedItem?.LocationID ? customer.Locations.find(x => x.ID === linkedItem?.LocationID) : customer.Locations.find(x => x.IsPrimary);
                updateLocation(location, markDirty);
            }
        }
        if (markDirty) {
            setFormIsDirty(markDirty);
        }
    }

    useEffect(() => {
        if (externalCustomerID) {
            selectCustomer(externalCustomerID, false)
            const linkedItem = selectedJob || selectedQuery || selectedProject || quote;
            if (!!linkedItem?.Store) {
                setSelectedStore(linkedItem.Store)
            }
        }
    }, [selectedJob, selectedQuery, selectedProject])

    const firstCustomerUpdate = useRef(true);

    useEffect(() => {
        let isDirty = prevSelectedCustomer.current?.ID !== selectedCustomer?.ID;

        if (selectedCustomer && isDirty) {

            if (isNew && !externalModuleID) {
                setModule(Enums.Module.Customer);
                setItemID(selectedCustomer.ID);
            }

            if (clearLinks && !externalModule) {
                setSelectedJob(null);
                setSelectedQuery(null);
                setSelectedProject(null);
                setShowJobLink(true);
                setShowQueryLink(true);
                setShowProjectLink(true);
            }
            setClearLinks(true);
        }

        if (firstCustomerUpdate.current) firstCustomerUpdate.current = false;
        else if (isDirty) {
            setFormIsDirty(true);
        }
        prevSelectedCustomer.current = selectedCustomer;
    }, [selectedCustomer]);

    // #endregion

    const headerAccordionBodyRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState('0px');
    const [headerChevron, setHeaderChevron] = useState('');
    const [showHeaderContents, setShowHeaderContents] = useState(false);

    async function toggleHeaderAccordion() {
        await Helper.waitABit();
        setShowHeaderContents(!showHeaderContents);
    }

    useEffect(() => {
        setHeaderHeight(showHeaderContents ? `${headerAccordionBodyRef.current ? headerAccordionBodyRef.current.scrollHeight + 5 : 0}px` : `0px`);
        setHeaderChevron(showHeaderContents ? `accordion-header-img-flipped` : ``);
    }, [showHeaderContents, selectedStore]);

    const detailsAccordionBodyRef = useRef<HTMLDivElement>(null);
    const [detailsHeight, setDetailsHeight] = useState('0px');
    const [detailsChevron, setDetailsChevron] = useState('');
    const [showDetailContents, setShowDetailContents] = useState(isNew);
    const [detailsOpened, setDetailsOpened] = useState(isNew);

    async function toggleDetailsAccordion() {
        await Helper.waitABit();
        setShowDetailContents(!showDetailContents);
        setDetailsOpened(!detailsOpened);
    }

    useEffect(() => {
        setDetailsHeight(showDetailContents ? `${detailsAccordionBodyRef.current ? detailsAccordionBodyRef.current.scrollHeight + 65 : 0}px` : `0px`);
        setDetailsChevron(showDetailContents ? `accordion-header-img-flipped` : ``);
    }, [showDetailContents, quoteItems.length, selectedCustomer, selectedStore, showProjectLink, showJobLink, showQueryLink]);

    // JOB LINK

    async function getLinkedJobCard(id) {
        let job = await Fetch.get({
            url: `/Job/${id}`,
            caller: "components/quote/manage.js:getLinkedJobCard()"
        });
        setSelectedJob(job);
        return job;
    }

    const linkQuoteToJob = (job) => {
        setFormIsDirty(true);
        setSelectedJob(job);
        if (job) {
            setModule(Enums.Module.JobCard);
            setItemID(job.ID);
            setSelectedQuery(null);
            if (!externalModule) {
                setShowProjectLink(false);
                setShowQueryLink(false);
            }
        } else {
            if (!Helper.isEmptyObject(selectedCustomer)) {
                setModule(Enums.Module.Customer);
                setItemID(selectedCustomer.ID);
            }
            if (!externalModule) {
                setShowProjectLink(true);
                setShowQueryLink(true);
                setProjectLinkLockdown(false);
                setQueryLinkLockdown(false);
            }
        }
    };

    // QUERY LINK

    async function getLinkedQuery(id) {
        let query = await Fetch.get({
            url: `/Query/${id}`,
            caller: "components/quote/manage.js:getLinkedQuery()"
        });
        setSelectedQuery(query);
    }

    const linkQuoteToQuery = (query) => {
        setSelectedQuery(query);
        if (query) {
            setModule(Enums.Module.Query);
            setItemID(query.ID);
            setSelectedJob(null);
            if (!externalModule) {
                setShowProjectLink(false);
                setShowJobLink(false);
            }
        } else {
            if (!Helper.isEmptyObject(selectedCustomer)) {
                setModule(Enums.Module.Customer);
                setItemID(selectedCustomer.ID);
            }
            if (!externalModule) {
                setShowProjectLink(true);
                setShowJobLink(true);
                setProjectLinkLockdown(false);
                setJobLinkLockdown(false);
            }
        }
    };

    // PROJECT LINK

    const getLinkedProject = async (id) => {
        let project = await Fetch.get({
            url: `/Project/${id}`
        });
        setSelectedProject(project);
    };

    const linkQuoteToProject = (project) => {
        setSelectedProject(project);
        if (project) {
            setModule(Enums.Module.Project);
            setItemID(project.ID);
            if (!externalModule) {
                setShowJobLink(false);
                setShowQueryLink(false);
            }
        } else {
            if (!Helper.isEmptyObject(selectedCustomer)) {
                setModule(Enums.Module.Customer);
                setItemID(selectedCustomer.ID);
            }
            if (!externalModule) {
                setShowJobLink(true);
                setShowQueryLink(true);
                setJobLinkLockdown(false);
                setQueryLinkLockdown(false);
            }
        }
    };

    // EMPLOYEE

    const [selectedEmployee, setSelectedEmployee] = useState(isNew ? copyFromQuote ? copyFromQuote.Employee : null : quote.Employee);

    const assignEmployee = (employee) => {
        setSelectedEmployee(employee);
        setFormIsDirty(true);
    };

    const [employeeLogin, setEmployeeLogin] = useState();

    const getEmployeeLogin = async () => {
        const userResult = await Fetch.get({
            url: `/Employee?id=${Storage.getCookie(Enums.Cookie.employeeID)}`,
        });
        setEmployeeLogin(userResult);
    };

    const [saving, setSaving] = useState(false);

    const validate = () => {
        let inputs = [
            { key: 'DepositPercentage', value: quote.DepositPercentage, btw: [0, 100], type: Enums.ControlType.Number },
            { key: 'DiscountPercentage', value: quote.DiscountPercentage, btw: [0, 100], type: Enums.ControlType.Number },
            { key: 'Customer', value: selectedCustomer, required: true, type: Enums.ControlType.Custom },
            { key: 'Contact', value: primaryContact, required: true, type: Enums.ControlType.Custom },
            { key: 'QuoteDate', value: quote.QuoteDate, required: true, type: Enums.ControlType.Date },
            { key: 'ExpiryDate', value: Time.getDateFormatted(quote.ExpiryDate, 'yyyy-MM-dd'), gte: Time.getDateFormatted(quote.QuoteDate, 'yyyy-MM-dd'), df: 'yyyy-MM-dd', required: true, type: Enums.ControlType.Date },
        ];

        if (isMultiStore && isNew) {
            inputs = [...inputs,
            { key: 'Store', value: selectedStore, required: true, type: Enums.ControlType.Select }
            ];
        }

        const { isValid, errors } = Helper.validateInputs(inputs);
        setInputErrors(errors);

        return isValid;
    };

    async function saveQuote(status: any, routeChange = false, exportMode: 'none' | 'view' | 'download' = 'none', closeAfterSave = false, sendToCustomer = false, skipInventoryCheck = false) {
        setSaving(true);

        let isValid = validate();

        let quoteItemsToSave = getQuoteItemsValue();
        // Ensure financial values are rounded to 4 decimals before sending to API
        quoteItemsToSave = quoteItemsToSave.map((it:any) => ({
            ...it,
            UnitPriceExclusive: typeof it.UnitPriceExclusive === 'number' ? Math.round(it.UnitPriceExclusive * 10000) / 10000 : it.UnitPriceExclusive,
        }));

        if (!isValid) {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
            return false;
        }

        if (quoteItemsToSave.length <= 0) {
            toast.setToast({
                message: 'Please add quote items',
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
            return false;
        }
        else if (useNewTable && quoteItemsToSave.length > 0) {
            let itemsInError = quoteItemsToSave.filter(x => !!x.InventorySectionID && !x.InventorySectionName);
            if (itemsInError.length > 0) {
                toast.setToast({
                    message: 'All sections require a title',
                    show: true,
                    type: Enums.ToastType.error
                })
                setSaving(false);
                return false;
            }
        }


        if (quote.TotalInclusive < 0) {
            toast.setToast({
                message: 'Quote total can\'t be negative',
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
            return false;
        }

        let result: any = {};

        let quoteToSave = {
            ...quote,
            CustomerID: selectedCustomer.ID,
            CustomerContactID: primaryContact ? primaryContact.ID : null,
            LocationID: primaryLocation ? primaryLocation.ID : null,
            EmployeeID: selectedEmployee ? selectedEmployee.ID : null,
            Customer: selectedCustomer,
            Contact: primaryContact ? primaryContact : null,
            Location: primaryLocation ? primaryLocation : null,
            Employee: selectedEmployee,
            QuoteStatus: status ? status : quote.QuoteStatus ?? Enums.QuoteStatus.Draft,
            Module: !Helper.isNullOrUndefined(module) ? module : quote.Module,
            ItemID: itemID ? itemID : quote.ItemID,
        };

        const sections = getSectionsFromTableData(quoteItemsToSave, 'InventorySectionName', 'InventorySectionID', Enums.Module.Quote, quote.ID || null)

        if (isMultiStore && isNew) {
            quoteToSave = {
                ...quoteToSave,
                StoreID: selectedStore ? selectedStore.ID : null,
                Store: selectedStore ? selectedStore : null,
            };
        }

        if (isNew) {

            if (copyFromQuote) {
                quoteItemsToSave.map((item, index) => {
                    item.ID = null;
                    item.QuoteID = null;
                });
                quoteToSave = {
                    ...quoteToSave,
                    ID: null,
                    ConvertDate: null,
                    QuoteSentFlag: false,
                    QuoteNumber: null,
                    InvoiceNumber: null,
                    ReminderSent: false,
                    PurchaseOrderNumber: null,
                    Invoiced: false,
                    JobCardID: null,
                    QueryID: null,
                    Locked: false,
                    DeliveryStatus: Enums.DeliveryStatus.Unsent,
                    IsClosed: false,
                    IsArchived: false,
                    IsActive: true,
                    IntegrationLineID: null,
                    IntegrationLineExternalDocNumber: null
                };
            }

            quoteItemsToSave.map((item, index) => {
                if (!item.TaxPercentage) {
                    item.TaxPercentage = 0;
                }
            });

            result = await Fetch.post({
                url: `/Quote`,
                params: {
                    Quote: quoteToSave,
                    QuoteItems: quoteItemsToSave,
                    InventorySections: sections
                },
                toastCtx: toast
            });
        } else {

            let { subTotalExclusive, totalTax, totalExclusive } = getTotals(true);
            const temp = {
                ...quoteToSave,
                SubTotalExclusive: Helper.roundToTwo(subTotalExclusive),
                TotalExclusive: Helper.roundToTwo(totalExclusive),
                TotalTax: Helper.roundToTwo(totalTax),
                TotalInclusive: Helper.roundToTwo(totalExclusive + totalTax),
            };

            quoteItemsToSave.map((item, index) => {
                if (item.TaxPercentage) {
                    if (item.TaxPercentage > 0) {
                        item.TaxPercentage = company.TaxPercentage;
                    }
                } else {
                    item.TaxPercentage = 0;
                }
            });

            result = await Fetch.put({
                url: '/Quote',
                params: {
                    Quote: temp,
                    QuoteItems: quoteItemsToSave,
                    InventorySections: sections
                },
                toastCtx: toast
            });
        }

        if (result.ID) {

            if (isNew) {
                Helper.mixpanelTrack(constants.mixPanelEvents.createQuote, {
                    "quoteID": result.ID
                } as any);
            } else {
                Helper.mixpanelTrack(constants.mixPanelEvents.editQuote, {
                    "quoteID": result.ID
                } as any);
            }

            if (!routeChange) {
                toast.setToast({
                    message: 'Quote saved successfully',
                    show: true,
                    type: Enums.ToastType.success
                });
            }

            /*todo this will not work because component is being unmounted and remounted by parent drawer on completion after create*/
            if (sendToCustomer) {
                // sendQuote(result)
                setSendItem(result);
            }

            if (closeAfterSave) {
                props.onClose && props.onClose()
            }

            setFormIsDirty(false);
            await Helper.waitABit();

            if (exportMode !== 'none') {
                exportDocument(exportMode);
            }

            !!props.onSaved && props.onSaved(result)

            if (props.mode === 'drawer' && isNew) {
                !!props.onCreated && props.onCreated(result, closeAfterSave)
            } else if (isNew) {
                Helper.nextRouter(Router.push, '/quote/[id]', `/quote/${result.ID}`);
            } else {
                setQuote(result);
                if (result.QuoteItems) {
                    setOriginalItems(JSON.parse(JSON.stringify(result.QuoteItems)));
                }
            }
        } else {
            setSaving(false);
            isValid = false;
        }

        if (!isNew) {
            setSaving(false);
        }

        return isValid;
    }

    const [isPrinting, setIsPrinting] = useState(false);
    const exportDocument = async (mode: 'view' | 'download') => {
        /*let proceed = true;
        // if (formIsDirty) {
        //   proceed = await saveQuote(quote.QuoteStatus);
        // }

        if (proceed) {
            DownloadService.downloadFile("GET", `/Quote/GetQuoteDocument?quoteID=${quote.ID}`, null, true, false);
        }*/
        setIsPrinting(true)
        // DownloadService.downloadFile("GET", `/Quote/GetQuoteDocument?quoteID=${quote.ID}`, null, true, false);
        DownloadService.downloadFile("GET", `/Quote/GetQuoteDocument?quoteID=${quote.ID}`, null, mode === 'view', false, "", "", null, false, (() => {
            setIsPrinting(false);
        }) as any);
    };

    const [isExportLineItems, setIsExportLineItems] = useState(false);
    const exportLineItems = async (mode: 'download') => {
        setIsExportLineItems(true)
        DownloadService.downloadFile("GET", `/Quote/GetExportedQuoteLineItems?quoteID=${quote.ID}`, null, false, false, "", "", null, false, (() => {
            setIsExportLineItems(false);
        }) as any);
    };

    // const printDocument = async () => {
    //   DownloadService.downloadFile("GET", `/Quote/PrintQuote?quoteID=${quote.ID}`, null, true, false);
    // };

    const sendQuote = async (item?: any) => {
        await saveQuote((item ?? quote).QuoteStatus, false, "none", false, true);
        // setSendItem(item ?? quote)
        // Helper.nextRouter(Router.push, `/new-communication/[id]?moduleCode=${Enums.Module.Quote}&method=email&attachQuote=true`, `/new-communication/${quote.ID}?moduleCode=${Enums.Module.Quote}&method=email&attachQuote=true`);
    };

    // Invoice to Integration Partner

    const [integration, setIntegration] = useState<any>(null);
    const [integrationTooltip, setIntegrationTooltip] = useState('');

    const getIntegration = async () => {
        const integrations = await Fetch.get({
            url: '/Integration'
        });
        if (integrations.TotalResults > 0) {
            let integrationList = integrations.Results;
            let temp = integrationList.find(x => x.Status == Enums.IntegrationStatus.Live && x.Type == Enums.IntegrationType.Accounting);
            if (temp) {
                setIntegration(temp);
                setIntegrationTooltip(temp.Status == Enums.IntegrationStatus.Live ? ''
                    : `Invoice on ${Enums.getEnumStringValue(Enums.IntegrationPartner, temp.Partner)} has status of ${Enums.getEnumStringValue(Enums.IntegrationStatus, temp.Status)}`);
            }
        }
    };

    const sendToPartner = async () => {

        let inactiveInventory = quoteItems.some(x => x.QuoteItemType == Enums.QuoteItemType.Inventory && !x.InventoryActive);

        if (inactiveInventory) {
            toast.setToast({
                message: 'Quote items contains inventory that is not active',
                show: true,
                type: Enums.ToastType.error
            });
        } else {
            const result = await Fetch.post({
                url: `/Quote/QuoteToInvoice?quoteID=${quote.ID}`,
                toastCtx: toast
            });
            if (result.ID) {
                toast.setToast({
                    message: 'Quote successfully queued for sync',
                    show: true,
                    type: 'success'
                });
                setQuote(result);
            } else {
                toast.setToast({
                    message: 'Quote failed to sync',
                    show: true,
                    type: Enums.ToastType.error
                });
            }
        }
    };

    const getQuoteStatusButtonText = () => {
        if (quote.HasPayFastIntegration && quote.PayFastExternalID) {
            return Enums.getEnumStringValue(Enums.QuoteStatus, quote.QuoteStatus) + " (PayFast Ref: " + quote.PayFastExternalID + ")";
        }

        return Enums.getEnumStringValue(Enums.QuoteStatus, quote.QuoteStatus);
    };

    const calculateQuoteItemProfit = (quoteItem) => {
        if (!quoteItem.Inventory || !quoteItem.Quantity || !quoteItem.UnitPriceExclusive) return 0;
        let totalDiscount = !quote.DiscountPercentage ? 0 : +quote.DiscountPercentage;
        let lineDiscount = !quoteItem.LineDiscountPercentage ? 0 : +quoteItem.LineDiscountPercentage;
        let quantity = +quoteItem.Quantity;
        let unitPrice = +quoteItem.UnitPriceExclusive;
        let costPrice = quoteItem.UnitCostPrice ?? +quoteItem.Inventory.CostPrice;
        let linePrice = quantity * unitPrice * (1 - lineDiscount / 100) * (1 - totalDiscount / 100);
        let lineCost = quantity * costPrice;
        return linePrice - lineCost;
    }

    const quoteProfit = useMemo(() => {
        return quoteItems.reduce((prev, qi) => {
            let profitLine = calculateQuoteItemProfit(qi);
            // console.log(prev, profitLine, prev + profitLine);
            return prev + profitLine;
        }, 0);

    }, [quote, quoteItems]);

    const [useNewTable, setUseNewTable] = useState<boolean | null>(null);

    const [sendItem, setSendItem] = useState<any>(null)
    const quoteDetails = () => {
        return (
            <>
                <div>
                    <Flex justify={'space-between'} wrap={'wrap'} gap={'sm'}>
                        <div style={{ flexGrow: 1 }}>

                            {
                                isMultiStore ?
                                    <StoreSelector
                                        mt={{ base: 0, md: 'sm' } as any}
                                        disabled={!isNew || (!!externalModule && !!externalModuleID)}
                                        error={inputErrors.Store}
                                        required={true}
                                        selectedStore={selectedStore}
                                        setSelectedStore={(e) => {
                                            setSelectedStore(e);
                                            setFormIsDirty(true);
                                        }}
                                        {...{} as any}
                                    />
                                    :
                                    <></>
                            }

                            <CustomerContactLocationSelector
                                isNew={isNew}
                                selectedCustomer={selectedCustomer}
                                setSelectedCustomer={setSelectedCustomer}
                                canChangeCustomer={isNew && !customerLinkLockdown}
                                selectedContact={primaryContact}
                                setSelectedContact={updateContact}
                                selectedLocation={primaryLocation}
                                setSelectedLocation={updateLocation}
                                detailsView={false}
                                canEditCustomerInNormalView={true}
                                module={Enums.Module.Quote as any}
                                inputErrors={inputErrors}
                                accessStatus={props.accessStatus}
                                cypressCustomer={"data-cy-customer"}
                                cypressContact={"data-cy-contact"}
                                cypressLocation={"data-cy-location"}
                                iconMode
                                mt={{ base: 'sm', md: (!isMultiStore ? 32 : 'sm') } as any}
                                {...{} as any}
                            />

                        </div>
                        <Box w={{ base: '100%', md: 'auto' }} style={{ flexGrow: 0, maxWidth: 500 }}>
                            {
                                !company?.LogoExists &&
                                <div className={'row'} style={{ padding: 10 }}>
                                    <Link
                                        style={{ float: 'right', textDecoration: 'none' }}
                                        href={'/settings/company/manage'}
                                    >
                                        <Anchor style={{ alignItems: 'center', display: 'flex', gap: 3 }}>
                                            <IconExternalLink size={18} /> Edit logo and business details in settings
                                        </Anchor>
                                    </Link>
                                </div>
                            }
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        label="Reference number"
                                        onChange={(e) => handleInputChange({
                                            target: {
                                                name: "Reference",
                                                value: e.value
                                            }
                                        })}
                                        value={quote.Reference}
                                        error={inputErrors.Reference}
                                    />
                                </div>

                            </div>
                            <div className="row">
                                <div className="column right-padding">
                                    <SCDatePicker
                                        label="Quote date"
                                        required={true}
                                        onChange={(day) => handleInputChange({ target: { name: "QuoteDate", value: day } })}
                                        value={quote.QuoteDate}
                                        error={inputErrors.QuoteDate}
                                    />

                                </div>
                                <div className="column left-padding">
                                    <SCDatePicker
                                        label="Expiry date"
                                        required={true}
                                        onChange={(day) => handleInputChange({
                                            target: {
                                                name: "ExpiryDate",
                                                value: day
                                            }
                                        })}
                                        value={quote.ExpiryDate}
                                        error={inputErrors.ExpiryDate}
                                    />

                                </div>
                            </div>
                            {
                                (!!selectedCustomer) &&
                                <Flex gap={'md'} mt={'lg'} justify={'space-around'}>
                                    <>
                                        {showJobLink && (selectedJob || (!selectedQuery && !selectedProject)) &&
                                            <>
                                                <LinkItem lockdown={jobLinkLockdown} customerID={selectedCustomer.ID}
                                                    setSelected={linkQuoteToJob}
                                                    selectedItem={selectedJob} module={Enums.Module.JobCard}
                                                    size={{ label: 'md', actionIcon: 'sm' }}
                                                    storeID={selectedStore?.ID ?? quote.StoreID}
                                                />
                                                {/*<LinkToJob lockdown={jobLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkQuoteToJob} selectedJob={selectedJob} />*/}
                                            </>
                                        }
                                    </>
                                    <>
                                        {showQueryLink && (selectedQuery || (!selectedJob && !selectedProject)) &&
                                            <>
                                                <LinkItem lockdown={queryLinkLockdown} customerID={selectedCustomer.ID}
                                                    setSelected={linkQuoteToQuery}
                                                    selectedItem={selectedQuery} module={Enums.Module.Query}
                                                    size={{ label: 'md', actionIcon: 'sm' }}
                                                    storeID={selectedStore?.ID ?? quote.StoreID}
                                                />
                                                {/*<LinkToQuery lockdown={queryLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkQuoteToQuery} selectedQuery={selectedQuery} />*/}
                                            </>
                                        }
                                    </>
                                    <>
                                        {showProjectLink && (selectedProject || (!selectedQuery && !selectedJob)) &&
                                            <>
                                                <LinkItem selectedItem={selectedProject}
                                                    setSelected={linkQuoteToProject}
                                                    customerID={selectedCustomer.ID}
                                                    lockdown={projectLinkLockdown} module={Enums.Module.Project}
                                                    size={{ label: 'md', actionIcon: 'sm' }}
                                                    storeID={selectedStore?.ID ?? quote.StoreID}
                                                />
                                                {/*<LinkToProject selectedProject={selectedProject} onProjectSelect={linkQuoteToProject} customerID={selectedCustomer.ID}
                                     lockdown={projectLinkLockdown} dropdownDirection={'down'} />*/}
                                            </>
                                        }
                                    </>
                                </Flex>
                            }

                            <div className="row">
                                <div className="column">
                                    <EmployeeSelector
                                        selectedEmployee={selectedEmployee}
                                        setSelectedEmployee={assignEmployee}
                                        storeID={(quote.StoreID ? quote.StoreID : selectedStore ? selectedStore.ID : null)}
                                        {...{} as any}
                                    />
                                </div>
                            </div>
                        </Box>
                    </Flex>
                </div>

                <div>
                    <QuoteDetailsSections quote={quote} quoteItems={quoteItems} updateQuoteItems={updateQuoteItems}
                        companyTaxPercentage={company.TaxPercentage}
                        accessStatus={props.accessStatus} integration={integration}
                        error={inputErrors.QuoteItems} isNew={isNew}
                        itemID={itemID} module={module}
                        customerID={selectedCustomer ? selectedCustomer.ID : externalCustomerID || null}
                        cypressSelector={"data-cy-inventory-selector"}
                        cypressQuantity={"data-cy-quantity"}
                        descriptionColumnWidth={props.fullscreenMode ? '30vw' : '250px'}
                        onColumnMappingLoaded={setTableColumnMapping}
                        userColumnConfig={userColumnConfig}
                        customChildren={<Tooltip
                            events={{ hover: true, focus: true, touch: true }}
                            label={'My preferences'}
                            openDelay={400}
                            color={'scBlue'}
                        >
                            <ActionIcon
                                variant={'subtle'}
                                size={'sm'}
                                onClick={() => setShowPreferences(true)}
                            >
                                <IconDotsVertical />
                            </ActionIcon>
                        </Tooltip>}
                    />
                </div>

                <Flex gap={'xl'} justify={'space-between'} wrap={'wrap'} w={'100%'}>
                    <Box style={{ flexGrow: 1 }} maw={800} miw={{ base: 'auto', xs: 400 }}>

                        {/*Discount percentage section*/}
                        {/* <Stack gap={5} mt={'var(--mantine-spacing-sm)'}>
              <Flex align={'center'} gap={'sm'}>

                <Text mt={'var(--mantine-spacing-sm)'} size={'sm'}>
                  <label htmlFor={'DepositPercentage'}>
                    Deposit %
                    <span className="" aria-hidden="true" style={{ color: '#fa5252' }}> *</span>
                  </label>
                </Text>

                <SCNumericInput
                  id={'DepositPercentage'}
                  withAsterisk
                  disabled={quote.QuoteStatus !== Enums.QuoteStatus.Draft && quote.QuoteStatus !== Enums.QuoteStatus.None}
                  maw={100}
                  step={5}
                  format={Enums.NumericFormat.Decimal}
                  max={100}
                  min={0}
                  name={'DepositPercentage'}
                  value={+quote.DepositPercentage}
                  onChange={(e) => handleInputChange({ target: { name: 'DepositPercentage', value: e.value } })}
                />
              </Flex>

              <Flex gap={'sm'}>
                <Text size={'sm'} color={'dimmed'}>
                  Deposit ({currencySymbol})
                </Text>

                <Text color={'dimmed'} ml={5}>
                  {depositAmountFormatted}
                </Text>
              </Flex>
            </Stack> */}

                        {
                            // !isNew &&
                            <SCTextArea
                                label="Notes"
                                onChange={(e) => handleInputChange({ target: { name: "Comment", value: e.value } })}
                                value={quote.Comment}
                                readOnly={quote.QuoteStatus !== Enums.QuoteStatus.Draft}
                                maw={'100%' as any}
                                w={'100%'}
                                miw={'100%'}
                            />
                        }
                    </Box>

                    <Box miw={340} ml={'auto'}
                        mr={useNewTable ? (quote.QuoteStatus === Enums.QuoteStatus.Draft ? "30px" : "30px") : "0"}
                        style={{ alignSelf: 'start' }}>
                        <div>
                            {isNew ? <div className="add-top-margin"></div> :
                                quote.DiscountPercentage > 0 ? <div className="row add-bottom-margin">
                                    <div className="column end">
                                        <SCNumericInput
                                            format={Enums.NumericFormat.Percentage}
                                            label="Total Discount %"
                                            onChange={(e) => handleInputChange({
                                                target: {
                                                    name: "DiscountPercentage",
                                                    value: e.value
                                                }
                                            })}
                                            required={false}
                                            value={quote.DiscountPercentage}
                                            error={inputErrors.DiscountPercentage}
                                            {...{} as any}
                                        />
                                        {/* <TextInput
                    label="Total Discount %"
                    type="number"
                    changeHandler={(e) => handleInputChange({ target: { name: "DiscountPercentage", value: e.target.value } })}
                    required={false}
                    value={quote.DiscountPercentage}
                    error={inputErrors.DiscountPercentage}
                  /> */}
                                    </div>
                                </div> : <div className="add-top-margin"></div>
                            }

                            <div className="row total-row">
                                <div className="column">
                                    Subtotal Excl VAT
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(quote.SubTotalExclusive, currencySymbol)}
                                </div>
                            </div>

                            {quote.DiscountPercentage > 0 ?
                                <div className="row total-row">
                                    <div className="column">
                                        Discount
                                    </div>
                                    <div className="column end">
                                        {Helper.getCurrencyValue(-(quote.SubTotalExclusive - quote.TotalExclusive), currencySymbol)}
                                    </div>
                                </div> : ''
                            }

                            <div className="row total-row">
                                <div className="column">
                                    Total Excl VAT
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(quote.TotalExclusive, currencySymbol)}
                                </div>
                            </div>
                            <div className="row total-row">
                                <div className="column">
                                    VAT
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(quote.TotalTax, currencySymbol)}
                                </div>
                            </div>
                            <div className="row total-row grand-total">
                                <div className="column">
                                    Total Incl VAT
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(quote.TotalInclusive, currencySymbol)}
                                </div>
                            </div>
                            <div className="row total-row">
                                <div className="column" style={{ alignSelf: "center" }}>
                                    <label htmlFor={'DepositPercentage'}>
                                        Deposit %
                                        <span className="" aria-hidden="true" style={{ color: '#fa5252' }}> *</span>
                                    </label>
                                </div>
                                <div className="column end" style={{ alignSelf: "center" }}>
                                    <SCNumericInput
                                        id={'DepositPercentage'}
                                        withAsterisk
                                        disabled={quote.QuoteStatus !== Enums.QuoteStatus.Draft && quote.QuoteStatus !== Enums.QuoteStatus.None}
                                        maw={100}
                                        step={5}
                                        format={Enums.NumericFormat.Decimal}
                                        max={100}
                                        min={0}
                                        name={'DepositPercentage'}
                                        value={+quote.DepositPercentage}
                                        onChange={(e) => handleInputChange({
                                            target: {
                                                name: 'DepositPercentage',
                                                value: e.value
                                            }
                                        })}
                                        mt={0}
                                        alignRight
                                        {...{} as any}
                                    />
                                </div>
                            </div>
                            <div className="row total-row">
                                <div className="column">
                                    Deposit Amount
                                </div>
                                <div className="column end">
                                    {currencySymbol} {depositAmountFormatted}
                                </div>
                            </div>
                            {
                                hasManageCostingPermission &&
                                userColumnConfig?.find(x => x.ID === 'Profit')?.Show !== false &&
                                <div className="row total-row">
                                    <div className="column">
                                        Profit
                                    </div>
                                    <div className="column end">
                                        {Helper.getCurrencyValue(quoteProfit, currencySymbol)}
                                    </div>
                                </div>
                            }
                        </div>
                    </Box>
                </Flex>

                <Flex gap={'lg'} justify={'space-between'} wrap={'wrap-reverse'}>
                    {
                        !isNew && getPaymentAccess() &&
                        <Box style={{ flexGrow: 1 }} maw={800}>
                            <PaymentsList
                                showDocumentSettingsHint
                                // isNew={isNew}
                                customerID={selectedCustomer ? selectedCustomer.ID : null}
                                // itemID={quote.ID}
                                accessStatus={props.accessStatus}
                                module={Enums.Module.Quote}
                                quote={quote}
                                setPayments={setPaymentsList}
                                amountDue={amountDue}
                                currencySymbol={currencySymbol}
                                refreshParent={async () => await refreshQuote()}
                            />
                        </Box>
                    }

                    {
                        !!paymentsList && paymentsList?.length > 0 &&
                        <Box miw={340}
                            mt={'lg'}
                            ml={'auto'}
                            mr={useNewTable ? (quote.QuoteStatus === Enums.QuoteStatus.Draft ? "30px" : "30px") : "0"}
                        >
                            <div className="row total-row">
                                <div className="column">
                                    Payments Received
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(paymentsReceivedTotal, currencySymbol)}
                                </div>
                            </div>

                            <div className="row total-row">
                                <div className="column">
                                    Amount Due
                                </div>
                                <div className="column end">
                                    {Helper.getCurrencyValue(amountDue, currencySymbol)}
                                </div>
                            </div>
                        </Box>
                    }
                </Flex>

                <div className="row">
                    <div className="column">
                        {/* <SCTextArea
              label="Comments"
              onChange={(e) => handleInputChange({ target: { name: "Comment", value: e.value } })}
              value={quote.Comment}
              readOnly={quote.QuoteStatus != Enums.QuoteStatus.Draft}
            /> */}
                    </div>
                    {/* <TextArea
            label="Comments"
            changeHandler={(e) => handleInputChange({ target: { name: "Comment", value: e.target.value } })}
            value={quote.Comment}
            readOnly={quote.QuoteStatus != Enums.QuoteStatus.Draft}
          /> */}
                </div>
                {selectedStore ?
                    <div className={`row add-top-margin ${isNew ? '' : 'add-bottom-margin'}`}>
                        <div className="column-fixed">
                            <div className="row bank-detail">
                                Bank: {selectedStore.BankName}
                            </div>
                            <div className="row bank-detail">
                                Account Number: {selectedStore.BankAccountNumber}
                            </div>
                            <div className="row bank-detail">
                                Branch Code: {selectedStore.BankBranchCode}
                            </div>
                        </div>
                        <div className="column">
                        </div>
                    </div> : ''
                }

                {isNew &&
                    <Flex align={'center'} justify={'end'} gap={5}
                        mr={25}
                        mt={20}
                        mb={80} // margin needed for help center chat widget interface room at the bottom right of the page
                    >
                        {/*<AnimatePresence>
                            {
                                !saving && <>
                                <motion.div
                                    exit={{
                                        opacity: 0
                                    }}
                                >
                                    <Button
                                        color={'green'}
                                        onClick={() => saveQuote(Enums.QuoteStatus.Approved, false, false, false, true)}
                                        disabled={saving}
                                        variant={'outline'}
                                    >
                                        Approve and Send
                                    </Button>
                                </motion.div>
                                <motion.div
                                    exit={{
                                        opacity: 0
                                    }}

                                >
                                    <Button
                                        color={'teal'}
                                        onClick={() => saveQuote(Enums.QuoteStatus.Approved)}
                                        disabled={saving}
                                        variant={'outline'}
                                    >
                                        Approve
                                    </Button>
                                </motion.div>
                                </>
                            }
                        </AnimatePresence>


                        <Button
                            onClick={() => saveQuote(Enums.QuoteStatus.Draft)}
                            disabled={saving}
                            rightSection={saving && <Loader color={'gray'} size={16} />}
                        >
                            {saving ? 'Saving' : 'Save as Draft'}
                        </Button>*/}

                        <SCSplitButton
                            disabled={saving}
                            items={[
                                {
                                    key: "createQuoteBtn1",
                                    label: "Save as Draft",
                                    defaultItem: true,
                                    disabled: false,
                                    leftSection: saving &&
                                        <Loader size={17} />
                                        ||
                                        <IconDeviceFloppy size={19} />,
                                    action: () => {
                                        saveQuote(Enums.QuoteStatus.Draft)
                                    },
                                },
                                {
                                    key: "createQuoteBtn2",
                                    label: "Create and Approve",
                                    defaultItem: false,
                                    disabled: !quoteApprovePermission || saving,
                                    leftSection: <IconFileCheck height={20} color={'var(--mantine-color-green-8)'} />,
                                    action: () => {
                                        saveQuote(Enums.QuoteStatus.Approved)
                                    },
                                    title: !quoteApprovePermission ? "You must have quote approval permission" : undefined
                                },
                                ...(props.mode === 'drawer' ? [{
                                    key: "createQuoteBtn3",
                                    label: "Approve and close",
                                    defaultItem: false,
                                    disabled: !quoteApprovePermission || saving,
                                    leftSection: <IconLayoutSidebarRightCollapse height={20} color={'var(--mantine-color-green-8)'} />,
                                    action: () => {
                                        saveQuote(Enums.QuoteStatus.Approved, false, 'none', true, false)
                                    },
                                    title: !quoteApprovePermission ? "You must have quote approval permission" : undefined
                                }] : [])
                            ]}
                        />

                    </Flex>
                }

                {!isNew &&
                    <AuditLog recordID={quote.ID} retriggerSearch={quote} />
                }

                <style jsx>{`
                    .quote-section {
                        padding-top: 0.5rem;
                    }

                    .edit-settings {
                        align-items: center;
                        color: ${colors.bluePrimary};
                        cursor: pointer;
                        display: flex;
                        font-size: 0.875rem;
                        margin-top: 1rem;
                    }

                    .edit-settings img {
                        width: 1.3rem;
                        height: auto;
                        transform: rotate(180deg);
                    }

                    .row {
                        display: flex;
                        justify-content: space-between;
                    }

                    .end {
                        align-items: flex-end;
                    }

                    .justify-end {
                        justify-content: flex-end;
                    }

                    .center {
                        align-items: center;
                    }

                    .column {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                    }

                    .column-margin {
                        margin-left: 24px;
                    }

                    .column-fixed {
                        display: flex;
                        flex-direction: column;
                        width: 500px;
                    }

                    .left-padding {
                        padding-left: 0.5em;
                    }

                    .right-padding {
                        padding-right: 0.5em;
                    }

                    .store-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        line-height: 24px;
                        color: ${colors.darkPrimary};
                    }

                    .store-header {
                        font-weight: bold;
                    }

                    .store-details {

                    }

                    .store-selection {
                        display: flex;
                        flex-direction: column;
                        width: 320px;
                        margin-bottom: 1rem;
                    }

                    .logo-container {
                        /* margin-top: 1.5rem; */
                        width: 10rem;
                    }

                    .logo {
                        align-items: center;
                        border: 1px solid ${colors.borderGrey};
                        border-radius: ${layout.cardRadius};
                        display: flex;
                        height: 10rem;
                        justify-content: center;
                        object-fit: contain;
                        overflow: hidden;
                        position: relative;
                        width: 100%;
                    }

                    .logo img {
                        height: auto;
                        max-width: 100%;
                    }

                    .details-section {
                        /* padding-top: 0.5rem; */
                    }

                    .customer-container {
                        line-height: 24px;
                        color: ${colors.darkPrimary};
                    }

                    .customer-header {
                        font-weight: bold;
                        margin-top: 0.5rem;
                    }

                    .customer-header img {
                        margin-left: 1rem;
                        margin-bottom: -0.3rem;
                        cursor: pointer;
                    }

                    .customer-buttons {
                        display: flex;
                        flex-direction: row;
                        line-height: 48px;
                    }

                    .customer-button {
                        color: ${colors.bluePrimary};
                        cursor: pointer;
                        margin-right: 26px;
                    }

                    .no-location {
                        color: ${colors.blueGrey};
                    }

                    .no-location img {
                        margin-left: 1rem;
                        margin-bottom: -0.3rem;
                        cursor: pointer;
                    }

                    .total-row {
                        line-height: 24px;
                    }

                    .grand-total {
                        margin-top: 8px;
                        margin-bottom: 8px;
                        font-weight: bold;
                    }

                    .add-top-margin {
                        margin-top: 1rem;
                    }

                    .add-bottom-margin {
                        margin-bottom: 1rem;
                    }

                    .bank-detail {
                        line-height: 24px;
                    }

                    .preview-button {
                        width: 6rem;
                        margin-right: 1rem;
                    }

                    .create-button {
                        width: 10rem;
                        margin-top: 1rem;
                        margin-bottom: 1rem;
                    }

                    .actions {
                        display: flex;
                    }

                    .actions :global(.button) {
                        margin-left: 0.5rem;
                        margin-top: 0;
                        padding: 0 1rem;
                        white-space: nowrap;
                    }

                    .status {
                        width: 20rem;
                        margin-top: -1rem;
                    }

                    .status :global(.input-container) {
                        background-color: ${colors.bluePrimary};
                    }

                    .status :global(input) {
                        color: ${colors.white};
                    }

                    .status :global(label) {
                        color: ${colors.white};
                        opacity: 0.8;
                    }
                `}
                </style>
            </>
        );
    }

    const { height: viewportHeight, width: viewportWidth } = useViewportSize()

    const { height: toolbarHeight, ref: toolbarRef } = useElementSize()

    const content = () => {
        switch (selectedTab) {
            case 'Quote':
                return quoteDetails();
            case 'Comments':
                return <ItemComments
                    itemID={quote.ID}
                    module={Enums.Module.Quote}
                    storeID={quote.StoreID}
                    setTotalComments={setTotalComments}
                    {...{} as any}
                // comments={comments}
                // handleCommentChange={handleCommentChange}
                // newComment={newComment}
                // submitComment={saveComment}
                // submitting={submittingComment}
                // canLoadMoreComments={canLoadMoreComments}
                // loadMoreComments={loadMoreComments}
                />;
            case 'Communication':
                return <Communications
                    topMargin={false} itemId={quote.ID} module={Enums.Module.Quote}
                    customerID={selectedCustomer ? selectedCustomer.ID : null}
                    accessStatus={props.accessStatus}
                    {...{} as any}
                />;
            case 'Attachments':
                return <Attachments
                    topMargin={false} displayName={selectedCustomer ? selectedCustomer.CustomerName : ''}
                    itemId={quote.ID} module={Enums.Module.Quote} onRefresh={onAttachmentRefresh} accessStatus={props.accessStatus}
                    {...{} as any}
                />;
            default:
                return '';
        }
    }

    return (
        <div>
            <SendToCustomerModal
                onClose={() => setSendItem(null)}
                onSent={async () => {
                    // console.log('should refresh and get counts')
                    await Helper.waitABit()
                    await refreshQuote()
                    await getCounts()
                }}
                show={!!sendItem}
                id={sendItem?.ID}
                method={'email'}
                module={Enums.Module.Quote}
                attachQuote={true}
            />

            {
                tableColumnMapping &&
                <QuotePreferencesDrawer
                    mapping={tableColumnMapping}
                    open={showPreferences}
                    onClose={() => setShowPreferences(false)}
                    onUserColumnConfigLoaded={setUserColumnConfig}
                // onUserConfigLoaded={console.log}
                />
            }

            {
                <Box mt={props.mode === 'page' ? 3 : 0} bg={'white'} ref={toolbarRef}>
                    <Flex justify={'apart'} w={'100%'} mt={props.mode === 'page' ? 5 : 0} px={10}>
                        {props.mode !== 'drawer' &&
                            <Flex align={'center'} gap={'sm'}>
                                {isNew ?
                                    <Breadcrumbs
                                        currPage={{ text: 'Create Quote', link: '/quote/create', type: 'create' }} /> :
                                    <Breadcrumbs currPage={{
                                        text: quote.QuoteNumber,
                                        link: `/quote/${quote.ID}`,
                                        type: 'quote-show'
                                    }} />
                                }
                            </Flex>
                        }
                        {
                            !isNew &&
                            <ToolbarButtons
                                pt={4} // required for focus outline
                                style={{ flexGrow: 1 }} ml={'auto'} gap={'xs'} wrap={'wrap'}
                                buttonGroups={[
                                    [
                                        {
                                            show: true,
                                            type: 'custom',
                                            children: [
                                                <Badge
                                                    key={'quoteStatusBadge'}
                                                    variant={'light'}
                                                    classNames={{ root: Enums.getEnumStringValue(Enums.QuoteStatusColor, quote.QuoteStatus) ?? undefined }}
                                                    size={'lg'}
                                                    fw={700}
                                                    radius={'sm'}
                                                >
                                                    {getQuoteStatusButtonText()}
                                                </Badge>
                                            ]
                                        }
                                    ],
                                    [
                                        {
                                            breakpoint: 1100,
                                            type: 'menu',
                                            icon: <IconDotsVertical />,
                                            disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            action: optionsClick,
                                            text: 'Actions',
                                            groupedOptions: optionButtons,
                                        }
                                    ],
                                    [
                                        {
                                            type: 'custom',
                                            children: [
                                                viewportWidth > 1100 ? (
                                                    <Button.Group key={'printGroup'}>
                                                        <Button
                                                            variant={'default'}
                                                            onClick={() => !saving && !isPrinting && saveQuote(quote.QuoteStatus, false, 'view')}
                                                            leftSection={isPrinting ? <Loader size={16} /> : <IconPrinter size={18} />}
                                                        >
                                                            {isPrinting ? "Printing..." : "Print"}
                                                        </Button>
                                                        <Menu position="bottom-end">
                                                            <Menu.Target>
                                                                <Button variant={'default'} px={6} style={{ minWidth: 'unset' }}>
                                                                    <IconChevronDown size={14} />
                                                                </Button>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => !saving && !isPrinting && saveQuote(quote.QuoteStatus, false, 'download')}>
                                                                    Download PDF
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Button.Group>
                                                ) : (
                                                    <Tooltip key={'printIcon'} label={'Print'} color={'scBlue'} events={{ hover: true, focus: true, touch: true }}>
                                                        <ActionIcon size={'lg'} variant={'subtle'} onClick={() => !saving && !isPrinting && saveQuote(quote.QuoteStatus, false, 'view')}>
                                                            {isPrinting ? <Loader size={16} /> : <IconPrinter size={18} />}
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )
                                            ]
                                        },
                                        {
                                            breakpoint: 1100,
                                            icon: <IconSend />,
                                            type: 'button',
                                            disabled: !quoteApprovePermission || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            text: "Send Quote",
                                            variant: 'default',
                                            onClick: () => sendQuote(),
                                            tooltip: !quoteApprovePermission ? "You must have quote approval permission to send quotes" : undefined
                                        }
                                    ],
                                    [
                                        {
                                            type: 'button',
                                            show: quote.QuoteStatus === Enums.QuoteStatus.Draft,
                                            disabled: !quoteApprovePermission || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            text: "Approve Quote",
                                            variant: 'default',
                                            onClick: approveQuoteClick,
                                            tooltip: !quoteApprovePermission ? "You must have quote approval permission" : undefined
                                        },
                                        {
                                            show: quote.QuoteStatus === Enums.QuoteStatus.Approved,
                                            type: 'menu',
                                            disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            action: acceptDeclineQuoteClick,
                                            text: 'Accept / Decline',
                                            legacyOptions: [
                                                { text: 'Accept Quote', link: `${Enums.QuoteStatus.Accepted}` },
                                                { text: 'Decline Quote', link: `${Enums.QuoteStatus.Declined}` },
                                            ]
                                        },
                                        {
                                            breakpoint: 1100,
                                            icon: <IconShare2 />,
                                            show: quote.QuoteStatus == Enums.QuoteStatus.Accepted,
                                            type: 'menu',
                                            disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            action: copyTo,
                                            text: 'Copy To',
                                            legacyOptions: [
                                                { text: 'Purchase Order', link: `po` },
                                                { text: 'Invoice', link: `invoice` },
                                            ]
                                        },
                                    ],
                                    ...(
                                        integration && quote.QuoteStatus === Enums.QuoteStatus.Accepted && !quote.Invoiced && [
                                            [
                                                {
                                                    show: quote.QuoteToInvoiceSyncStatus === Enums.SyncStatus.Pending,
                                                    type: 'button',
                                                    disabled: true,
                                                    text: `Pending Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}`,
                                                },
                                                {
                                                    show: quote.QuoteToInvoiceSyncStatus === Enums.SyncStatus.Synced,
                                                    type: 'button',
                                                    disabled: true,
                                                    text: `Synced: ${quote.QuoteToInvoiceExternalDocNumber}`,
                                                },
                                                {
                                                    show: quote.QuoteToInvoiceSyncStatus === Enums.SyncStatus.Deleted,
                                                    type: 'button',
                                                    disabled: true,
                                                    text: `Synced`,
                                                }
                                            ]
                                        ] || []
                                    ) as any,
                                    ...(!!quote.InvoiceNumber && [
                                        [{
                                            type: 'button',
                                            disabled: true,
                                            text: `Synced: ${quote.InvoiceNumber}`,
                                        }]
                                    ] || []),
                                    [
                                        {
                                            breakpoint: 780,
                                            type: 'button',
                                            icon: <IconDeviceFloppy />,
                                            isBusy: saving,
                                            disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                            text: saving ? "Saving" : "Save",
                                            onClick: saving ? null : () => setTimeout(() => {
                                                saveQuote(quote.QuoteStatus);
                                            }, 50),
                                        }
                                    ]
                                ]}
                            />
                        }
                    </Flex>
                    {
                        !isNew &&
                        <PageTabs
                            selectedTab={selectedTab || ''}
                            setSelectedTab={setSelectedTab}
                            tabs={pageTabs}
                            tabsProps={
                                { mt: { base: 'sm', xl: 0 }, mx: { base: 1, sm: 'xs', md: 'sm', lg: 'md' } }
                            }
                        />
                    }
                </Box>
            }

            <ScrollArea.Autosize
                bg={props.mode !== 'drawer' && !props.isNew ? 'gray.1' : 'transparent'}
                py={{ base: 5, xs: 8, sm: 'md' }}
                ps={props.mode !== 'drawer' ? { base: 5, xs: 8 } : 0}
                h={viewportHeight < 500 ? '100%' : `calc(100dvh - ${(!isNew && toolbarHeight ? (toolbarHeight + 50) : 50)}px)`}
                scrollbars={'y'}
                offsetScrollbars
                type={'auto'}
            >
                {
                    props.mode === 'drawer' ?
                        <Box
                            mx={'auto'}
                            p={4} // requires padding for focus outline styling
                            maw={props.fullscreenMode ? 'calc(2000px - 50px)' : (props.width ? props.width - 15 : '100%')}
                            w={'calc(100vw - 50px)'}
                        // maw={props.width}
                        >
                            {props.useTabs && !isNew ? content() : quoteDetails()}
                        </Box> :
                        <Card
                            p={'md'}
                            px={{ base: 1, xs: 5, sm: 'sm' }}
                            radius={'md'}
                            maw={{ base: 'calc(100dvw - 40px)', sm: 'calc(100dvw - 220px)', xl: props.width }}
                            mx={'auto'}
                        >
                            {props.useTabs && !isNew ? content() : quoteDetails()}
                        </Card>
                }
            </ScrollArea.Autosize>

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            {showUpdateInventoryModal &&
                <UpdateInventoryPricesModal
                    opened={showUpdateInventoryModal}
                    onClose={() => setShowUpdateInventoryModal(false)}
                    onContinue={(updatedInventories) => {
                        setShowUpdateInventoryModal(false);

                        if (updatedInventories) {
                            const currentQuoteItems = getQuoteItemsValue();
                            const updatedQuoteItems = currentQuoteItems.map(item => {
                                if (item.InventoryID && updatedInventories[item.InventoryID]) {
                                    return {
                                        ...item,
                                        Inventory: {
                                            ...item.Inventory,
                                            CostPrice: updatedInventories[item.InventoryID].CostPrice,
                                            ListPrice: updatedInventories[item.InventoryID].ListPrice,
                                        }
                                    };
                                }
                                return item;
                            });
                            setQuoteItems(updatedQuoteItems);
                        }

                        if (pendingSaveParams) {
                            saveQuote(pendingSaveParams.status, pendingSaveParams.routeChange, pendingSaveParams.exportMode, pendingSaveParams.closeAfterSave, pendingSaveParams.sendToCustomer, true);
                        }
                    }}
                    detectionResult={inventoryPriceChanges!}
                    module="Quote"
                    hasCostPricePermission={costPricePermission}
                />
            }
        </div>
    );
}

export default ManageQuoteForm
