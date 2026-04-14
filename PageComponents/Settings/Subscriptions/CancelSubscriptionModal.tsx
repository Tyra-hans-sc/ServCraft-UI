import { FC, useContext, useEffect, useState, useMemo } from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import SubscriptionContext from "@/utils/subscription-context";
import HubspotContext from "@/utils/contexts/hubspot-context";
import * as Enums from '@/utils/enums';

// Extend Window interface to include HubSpotConversations
declare global {
    interface Window {
        HubSpotConversations?: {
            widget: {
                open: () => void;
                refresh: () => void;
                load: (options?: { topic?: string; message?: string; chatflowId?: string; }) => void;
                remove: () => void;
            }
        }
    }
}
import {
    Alert,
    Anchor,
    Blockquote,
    Box,
    Button,
    Checkbox,
    Flex,
    Group,
    List,
    Loader,
    Space,
    Stack,
    Text,
    TextInput,
    Title,
    PasswordInput,
    ThemeIcon, SimpleGrid
} from '@mantine/core';
import moment from "moment";
import { IconInfoCircle, IconQuote, IconLock, IconCircleCheck } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { useMutation, useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useDidUpdate } from "@mantine/hooks";
import ToastContext from "@/utils/toast-context";

// Feature help path mapping
const featureHelpPaths = {
    'Forms': '/getting-started-with-servcraft/how-to-create-and-edit-forms-',
    'Payments': null,
    'Stock Takes': null,
    'Manage Costing': null,
    'Accounting Integration': '/getting-started-with-servcraft/how-to-set-up-integrations',
    'Jobs': '/how-to-manage-your-jobs/how-to-create-a-job',
    'Quotes': '/how-to-manage-your-jobs/how-to-raise-a-quote',
    'Invoices': '/how-to-manage-your-jobs/how-to-raise-an-invoice',
    'Customers': '/getting-started-with-servcraft/how-to-import-your-data-customers',
    'Appointments': '/getting-started-with-servcraft/how-to-schedule-appointments-with-job',
    'Assets': '/getting-started-with-servcraft/how-to-add-and-create-customer-assets-',
    'Inventory': '/getting-started-with-servcraft/how-to-import-your-data-inventory',
    'Queries': '/how-to-manage-your-jobs/how-to-create-a-query-from-a-web-form',
    'Purchase Orders': '/getting-started-with-servcraft/how-to-edit-your-documents'
};

const featureFullRoutes = {
    'Forms': '/settings/form/list',
    'Payments': '/settings/payment/payfast',
    'Stock Takes': null,
    'Manage Costing': '/settings/employee/list',
    'Accounting Integration': '/settings/integration/manage',
    'Jobs': '/job/list',
    'Quotes': '/quote/list?tab=all',
    'Invoices': '/invoice/list?tab=all',
    'Customers': '/customer/list',
    'Appointments': '/appointment/scheduler', // dynamic override applied at runtime based on feature
    'Assets': '/customer/list?tab=assets',
    'Inventory': '/inventory/list',
    'Queries': '/query/list',
    'Purchase Orders': '/purchase/list'
};

// Hardcoded list of industries
const industries = [
    'Agriculture',
    'Aluminium&Glass',
    'Appliance Repair',
    'AudioVisual',
    'Automotive',
    'Carpentry',
    'Cleaning',
    'Computer/CellRepair',
    'Construction',
    'Electrical',
    'Engineering',
    'Fire',
    'Gas/Air(Monitoring/Install)',
    'GeneralContractor/Construction',
    'Health&Beauty',
    'HVAC&Refrigeration',
    'IT',
    'Maintenance',
    'Manufacturing',
    'Other',
    'Plumbing',
    'Printing&Signage',
    'PropertyMaintenance',
    'PropertyManagement',
    'Retail',
    'Security/Automation',
    'Solar/Energy',
    'Telecommunications',
    'Water'
];

interface SMSRateExVATListItem {
    LowCount: number;
    HighCount: number | null;
    RateExclVAT: number;
}

interface BillingAccount {
    CustomerID: string;
    CustomerTradingName: string | null;
    CustomerCode: string | null;
    BillingProvider: number;
    ProviderToken: string;
    BillingStatus: number;
    RowVersion: string | null;
    ID: string;
    TenantID: string;
    TenantName: string | null;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedBy: string;
    ModifiedDate: string;
    IsActive: boolean;
    IsNew: boolean;
    UsageCount: number;
}

interface SubscriptionInfo {
    BillingAccount: BillingAccount | null;
    UserCount: number;
    Rate: number;
    CustomerStatus: string;
    CustomerStatusEnum: number;
    LicenseType: string;
    AccessStatus: number;
    AccessEndDate: string;
    Message: string;
    MessageOwner: null;
    MessageNonOwner: null;
    OwingBalance: number;
    LicenceFeeToSubscribeExVAT: number;
    LicenceFeeNextExVAT: number;
    VATPercentage: number;
    SMSRateExVAT: number;
    SMSRateExVATList: SMSRateExVATListItem[];
    SMSCreditsPurchased: number;
    SMSCreditsUsed: number;
    EmailCreditsPurchased: number;
    EmailCreditsUsed: number;
    DataPurchased: number;
    DataUsed: number;
    MaxJobCount: null;
    JobCount: number;
    MaxQueryCount: null;
    QueryCount: number;
    MaxQuoteCount: null;
    QuoteCount: number;
    MaxEmployeeCount: null;
    EmployeeCount: number;
    Integration: boolean;
    SetupComplete: boolean;
    MultiStore: boolean;
    FlowType: number;
    AdvancedPermission: boolean;
    MultiWorkflow: boolean;
    UserRate: number;
    UserDiscountPercentage: number;
    UserRateDiscounted: number;
    UserDiscountEnd: string;
    UserPromotionEnd: string;
    UserPromotionValidityMonths: number;
    PaymentErrorMessage: null;
    StoreCount: number;
    StoreRate: number;
    StoreDiscountPercentage: number;
    StoreRateDiscounted: number;
    StoreDiscountEnd: null;
    StorePromotionEnd: null;
    StorePromotionValidityMonths: number;
    PromotionText: null;
    FeeToSubscribeExVAT: number;
    GrossFeeToSubscribe: number;
    LicenceFeeToSubscribeInclVAT: number;
    LicenceFeeNextInclVAT: number;
    ProrataBillingRatio: number;
    VoucherID: null;
    VoucherCode: string;
    UserRateIncreaseDate: null;
    UserNewRateExcl: null;
    StoreRateIncreaseDate: null;
    StoreNewRateExcl: null;
    IsThirdParty: boolean;
    TrialDate: string;
    FirstTrialDate: string;
    SignUpCompleteDate: string;
    AnniversaryDate: null;
    FirstAnniversaryDate: null;
    IndustryList: string[];
    Industry?: string;
    ReferredSourceList: string[];
}

// Define interface for cancellation reasons
interface CancellationReason {
    ID: string;
    Label: string;
    RequiresAdditionalInfo: boolean;
    AdditionalInfoLabel: string | null;
}

// Define the form values type
interface CancellationFormValues {
    reasons: {
        [key: string]: string;
    }
}

const CancelSubscriptionModal: FC<{
    open: boolean,
    onClose: () => void,
    onCancelCompleted: (cancellationResponse: any) => void
}> = ({
    open,
    onCancelCompleted,
    ...props
}) => {

        const router = useRouter();
        const toast = useContext(ToastContext);

        // Handle query parameter updates
        const showHelpCenterViaQueryParamsForFeature = (featureName: string) => {
            const helpPath = featureHelpPaths[featureName as keyof typeof featureHelpPaths] || null;
            const fullRoute = featureFullRoutes[featureName as keyof typeof featureFullRoutes] || null;

            if (fullRoute) {
                // Construct the URL with the help path as a query parameter if it exists
                let url = fullRoute;
                if (helpPath) {
                    // Check if the route already has query parameters
                    if (url.includes('?')) {
                        url += `&help=${helpPath}`;
                    } else {
                        url += `?help=${helpPath}`;
                    }
                }

                // Open the URL in a new tab
                window.open(url, '_blank');
            }
        };

        // const userFullName = Storage.getCookie(Enums.Cookie.servFullName);

        const subscriptionContext = useContext<any>(SubscriptionContext);
        const hubspotContext = useContext<any>(HubspotContext);
        const { subscriptionInfo } = subscriptionContext;
        let billingAccount: BillingAccount = subscriptionInfo?.BillingAccount?.IsActive === false ? null : subscriptionContext.subscriptionInfo?.BillingAccount;
        let isCancelled = billingAccount?.BillingStatus === Enums.BillingStatus.Cancelled/* || subscriptionCancelled*/;

        // const [reasons, setReasons] = useState<any[]>([]);
        // const [selectedReason, setSelectedReason] = useState<any | undefined>();
        // const [reasonText, setReasonText] = useState<string>('');

        /*const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
            setReasonText(e.target.value);
        };*/

        /*const getReasons = async (): Promise<void> => {
            const response = await Fetch.get({
                url: '/Billing/GetReasons',
            });
            setReasons(response.Results);
        };*/

        /*useEffect(() => {
            getReasons();
        }, []);*/

        // Function to open Hubspot chat with preset message and topic
        const openHubspotChat = async (topic: string = 'Subscription Cancellation', message: string = 'I need help with my subscription cancellation', chatWithCEO?: boolean) => {
            // chatWithCEO && window.HubSpotConversations?.widget.refresh();

            window.HubSpotConversations?.widget.remove();

            // Update URL query parameter without navigation
            await router.replace(
                {
                    pathname: router.pathname,
                    query: { ...router.query, chatflow: chatWithCEO ? 'talk_to_ceo' : 'help' },  // the query param is set as a way for hubspot to pick up specific target
                },
                undefined,
                { shallow: true }
            ).then(
                () => {
                    if (typeof window !== 'undefined' && window.HubSpotConversations) {
                        // Set the initial message if the API supports it
                        try {
                            // Open the widget first
                            window.HubSpotConversations?.widget.open();

                            // Some implementations might support setting a message via the API
                            if (window.HubSpotConversations?.widget.load) {
                                window.HubSpotConversations?.widget.load({
                                    chatflowId: chatWithCEO ? 'talk_to_ceo' : '',
                                    topic: topic,
                                    message: message
                                });
                            }
                        } catch (error) {
                            console.error('Error opening Hubspot chat:', error);
                        }
                    }
                }
            );

            // Use the context to activate the chat widget
            /*if (hubspotContext && hubspotContext.setIsActive) {
                hubspotContext.setIsActive(true);
            } else {
                console.warn('Hubspot context not available');
            }*/

            // Close the modal if needed
            // onClose();
        };

        useDidUpdate(
            () => {
                !open && router.replace(
                    {
                        pathname: router.pathname,
                        query: {},
                    },
                    undefined,
                    { shallow: true }
                )
            }, [open]
        )

        const owingBalance = subscriptionContext.subscriptionInfo?.OwingBalance ?? 0;
        // const owingBalance = 500;
        const isOwing = owingBalance > 0;

        /*const validate = (): boolean => {
            let validationItems = [
                { key: 'Reason', value: selectedReason, required: true, type: Enums.ControlType.Select },
                { key: 'PasswordCheck', value: passwordCheck, required: true, type: Enums.ControlType.Text },
            ];
            const { isValid, errors } = Helper.validateInputs(validationItems);
            setInputErrors(errors);
            return isValid;
        };
    
        const settleAndCancel = async (): Promise<void> => {
    
            let isValid = validate();
            if (isValid) {
    
                const redirUrl = await Fetch.post({
                    url: '/Billing/PayFastCheckoutUrlOnceOffCancellationSettlement',
                    params: {
                        reason_id: selectedReason?.ID,
                        password: passwordCheck,
                        additional_answer: additionalAnswer,
                    },
                });
    
                if (redirUrl.indexOf("http") === -1) {
                    toast.setToast({
                        message: redirUrl,
                        show: true,
                        type: Enums.ToastType.error
                    });
                    return;
                }
    
                let win = window.open(redirUrl, "_blank");
                let int = setInterval(() => {
                    if (win && win.closed) {
                        clearInterval(int);
                        toast.setToast({
                            message: 'Your subscription cancellation has been submitted',
                            show: true,
                            type: 'success'
                        });
                        onCancel(true);
                    }
                }, 100);
    
            } else {
                toast.setToast({
                    message: 'There are errors on the page',
                    show: true,
                    type: Enums.ToastType.error
                });
            }
    
        }
    
        const cancelSubscription = async (): Promise<void> => {
    
            let isValid = validate();
            if (isValid) {
    
                const res = await Fetch.post({
                    url: `/Billing/SubscriptionCancel`,
                    params: {
                        reason_id: selectedReason?.ID,
                        password: passwordCheck,
                        additional_answer: additionalAnswer,
                    },
                    toastCtx: toast,
                    statusIfNull: true
                });
    
                if (res.ResponseStatus === 200) {
                    toast.setToast({
                        message: 'Your subscription has been cancelled',
                        show: true,
                        type: 'success'
                    });
                    onCancel(true);
                } else {
    
                }
    
            } else {
                toast.setToast({
                    message: 'There are errors on the page',
                    show: true,
                    type: Enums.ToastType.error
                });
            }
        };*/


        // Format the access end date for display using moment.js
        const formatDate = (dateString: string) => {
            if (!dateString) return '';
            return moment(dateString).format('D MMMM YYYY');
        };

        // Get the day after access end date using moment.js
        const getNextDay = (dateString: string) => {
            if (!dateString) return '';
            return moment(dateString).add(1, 'days').format('D MMMM, YYYY');
        };

        // Check if subscription is active or overdue
        //const isNotOverdue = subscriptionInfo?.CustomerStatusEnum !== Enums.CustomerStatus.Overdue;
        // const isNotOverdue = subscriptionInfo?.CustomerStatusEnum === Enums.CustomerStatus.Overdue;
        const accessEndDate = subscriptionInfo?.AccessEndDate;
        const userCount = subscriptionInfo?.UserCount || 0;
        const userText = userCount > 1 ? `Your ${userCount} users` : 'You';

        const [step, setStep] = useState(0);

        const onClose = () => {
            setStep(0);
            form.reset();
            props.onClose();
        }

        // Get testimonial quote based on industry type
        /*const getQuoteByIndustry = () => {
            const industry = subscriptionInfo?.Industry || '';

            // Format: "200 South African plumbers use ServCraft to transform their business every day."
            switch (industry) {
                case 'Agriculture':
                    return {
                        quote: "200 South African farmers use ServCraft to transform their business every day.",
                        author: "Agriculture Professional"
                    };
                case 'Aluminium&Glass':
                    return {
                        quote: "200 South African glass specialists use ServCraft to transform their business every day.",
                        author: "Aluminium & Glass Professional"
                    };
                case 'Appliance Repair':
                    return {
                        quote: "200 South African appliance technicians use ServCraft to transform their business every day.",
                        author: "Appliance Repair Professional"
                    };
                case 'AudioVisual':
                    return {
                        quote: "200 South African AV specialists use ServCraft to transform their business every day.",
                        author: "AudioVisual Professional"
                    };
                case 'Automotive':
                    return {
                        quote: "200 South African mechanics use ServCraft to transform their business every day.",
                        author: "Automotive Professional"
                    };
                case 'Carpentry':
                    return {
                        quote: "200 South African carpenters use ServCraft to transform their business every day.",
                        author: "Carpentry Professional"
                    };
                case 'Cleaning':
                    return {
                        quote: "200 South African cleaning companies use ServCraft to transform their business every day.",
                        author: "Cleaning Professional"
                    };
                case 'Computer/CellRepair':
                    return {
                        quote: "200 South African tech repair specialists use ServCraft to transform their business every day.",
                        author: "Computer Repair Professional"
                    };
                case 'Construction':
                    return {
                        quote: "200 South African construction companies use ServCraft to transform their business every day.",
                        author: "Construction Professional"
                    };
                case 'Electrical':
                    return {
                        quote: "200 South African electricians use ServCraft to transform their business every day.",
                        author: "Electrical Professional"
                    };
                case 'Engineering':
                    return {
                        quote: "200 South African engineers use ServCraft to transform their business every day.",
                        author: "Engineering Professional"
                    };
                case 'Fire':
                    return {
                        quote: "200 South African fire safety specialists use ServCraft to transform their business every day.",
                        author: "Fire Safety Professional"
                    };
                case 'Gas/Air(Monitoring/Install)':
                    return {
                        quote: "200 South African gas and air specialists use ServCraft to transform their business every day.",
                        author: "Gas/Air Professional"
                    };
                case 'GeneralContractor/Construction':
                    return {
                        quote: "200 South African general contractors use ServCraft to transform their business every day.",
                        author: "General Contractor"
                    };
                case 'Health&Beauty':
                    return {
                        quote: "200 South African health and beauty professionals use ServCraft to transform their business every day.",
                        author: "Health & Beauty Professional"
                    };
                case 'HVAC&Refrigeration':
                    return {
                        quote: "200 South African HVAC technicians use ServCraft to transform their business every day.",
                        author: "HVAC Professional"
                    };
                case 'IT':
                    return {
                        quote: "200 South African IT specialists use ServCraft to transform their business every day.",
                        author: "IT Professional"
                    };
                case 'Maintenance':
                    return {
                        quote: "200 South African maintenance companies use ServCraft to transform their business every day.",
                        author: "Maintenance Professional"
                    };
                case 'Manufacturing':
                    return {
                        quote: "200 South African manufacturers use ServCraft to transform their business every day.",
                        author: "Manufacturing Professional"
                    };
                case 'Plumbing':
                    return {
                        quote: "200 South African plumbers use ServCraft to transform their business every day.",
                        author: "Plumbing Professional"
                    };
                case 'Printing&Signage':
                    return {
                        quote: "200 South African printing specialists use ServCraft to transform their business every day.",
                        author: "Printing & Signage Professional"
                    };
                case 'PropertyMaintenance':
                    return {
                        quote: "200 South African property maintenance specialists use ServCraft to transform their business every day.",
                        author: "Property Maintenance Professional"
                    };
                case 'PropertyManagement':
                    return {
                        quote: "200 South African property managers use ServCraft to transform their business every day.",
                        author: "Property Management Professional"
                    };
                case 'Retail':
                    return {
                        quote: "200 South African retailers use ServCraft to transform their business every day.",
                        author: "Retail Professional"
                    };
                case 'Security/Automation':
                    return {
                        quote: "200 South African security specialists use ServCraft to transform their business every day.",
                        author: "Security Professional"
                    };
                case 'Solar/Energy':
                    return {
                        quote: "200 South African solar energy specialists use ServCraft to transform their business every day.",
                        author: "Solar/Energy Professional"
                    };
                case 'Telecommunications':
                    return {
                        quote: "200 South African telecom specialists use ServCraft to transform their business every day.",
                        author: "Telecommunications Professional"
                    };
                case 'Water':
                    return {
                        quote: "200 South African water specialists use ServCraft to transform their business every day.",
                        author: "Water Professional"
                    };
                default:
                    return {
                        quote: "200 South African professionals use ServCraft to transform their business every day.",
                        author: "ServCraft Customer"
                    };
            }
        };*/

        // const testimonial = getQuoteByIndustry();
        const testimonial = `Over 4,500 South African service and maintenance professionals use ServCraft everyday to run their businesses.`;

        // Fetch feature usage stats from API
        const { data: featureUsageStats, isLoading: isLoadingFeatures, error: featuresError } = useQuery(
            ['featureUsageStats'],
            async () => {
                const res = await Fetch.get({
                    url: '/Company/FeatureUsageStats',
                });
                if (!res || res.serverMessage || res.message) {
                    throw new Error(res.serverMessage || res.message || 'Unexpected Server Response');
                } else {
                    return res;
                }
            },
            {
                staleTime: 1000 * 60 * 5, // 5 minutes
                cacheTime: 1000 * 60 * 30, // 30 minutes
                refetchOnWindowFocus: false,
                enabled: open
            }
        );

        // Transform feature usage stats into a format suitable for display
        const unusedFeatures = useMemo(() => {
            if (!featureUsageStats) return [];

            // Filter out features that are used (value is true)
            const unusedFeatureEntries = Object.entries(featureUsageStats)
                .filter(([_, isUsed]) => !isUsed)
                .map(([featureName, _]) => ({
                    name: featureName,
                    // description: `Enhance your workflow with ${featureName}`
                }));

            return unusedFeatureEntries;
        }, [featureUsageStats]);

        // Check if all features are used
        const allFeaturesUsed = useMemo(() => {
            if (!featureUsageStats) return true;
            return unusedFeatures.length === 0;
        }, [featureUsageStats, unusedFeatures]);

        const {
            data: cancellationReasons,
            isLoading: isLoadingCancellationReasons,
            error: cancellationReasonsError
        } = useQuery<CancellationReason[]>(
            ['cancellationReasons'],
            async () => {
                const res = await Fetch.get({
                    url: '/Billing/GetCancellationReasons',
                });
                if (res.Results) {
                    return res.Results;
                } else {
                    throw new Error(res.serverMessage || res.message || 'Unexpected Server Response');
                }
            },
            {
                refetchOnWindowFocus: false,
                enabled: open,
                onSuccess: (data) => {
                    console.log('Cancellation reasons:', data)
                }
            }
        );

        // Form for cancellation reasons
        const form = useForm<
            CancellationFormValues
        >({
            initialValues: {
                reasons: {}
            },
            validate: {
                // reasons: (value) => Object.keys(value).length === 0 ? 'Please select at least one reason' : null,
                // reasons: (value) => Object.entries(value).filter((k, v) => !!v).length === 0 ? 'Please select at least one reason' : null,
                reasons: {
                    moved_to_different_system: (value, {reasons}) => (Object.keys(reasons).includes('moved_to_different_system') && !value ? 'Please specify which system you are using' : null),
                    missing_features: (value, {reasons}) => (Object.keys(reasons).includes('missing_features') && !value ? 'Please specify what feature is missing' : null),
                    none_selected: (value, {reasons}) => (Object.keys(reasons).length === 0 ? 'Please select at least one reason' : null),
                    // missing_features: isNotEmpty('Please specify what feature is missing')
                },
            }
        });

    useEffect(() => {
        console.log('Form :', form.values)
    }, [form.values]);

        const handleSubmit = (values: CancellationFormValues) => {
            console.log('Form values:', values);
            // Move to the final step
            setStep(x => x + 1);
        };

        // Password form
        const passwordForm = useForm({
            initialValues: {
                password: ''
            },
            validate: {
                password: (value) => !value ? 'Password is required' : null,
            }
        });

        // Cancellation mutation
        const cancelSubscriptionMutation = useMutation(
            ['subscription', 'cancel'],
            async () => {
                const passwordValidation = passwordForm.validate();
                if (passwordValidation.hasErrors) {
                    return null;
                }

                // Combine form data with password
                const payload = {
                    ...form.values,
                    ...passwordForm.values
                    /*reasons: form.values.reasons,
                    movedToSystem: form.values.movedToSystem,
                    missingFeature: form.values.missingFeature,
                    password: passwordForm.values.password*/
                };

                // Check if user has an owing balance
                if (false && isOwing) {
                    // Handle settlement and cancellation
                    const redirUrl = await Fetch.post({
                        url: '/Billing/PayFastCheckoutUrlOnceOffCancellationSettlement',
                        params: payload,
                    });

                    if (redirUrl.indexOf("http") === -1) {
                        showNotification({
                            message: redirUrl,
                            color: 'yellow'
                        });
                        return null;
                    }

                    let win = window.open(redirUrl, "_blank");
                    let int = setInterval(() => {
                        if (win && win.closed) {
                            clearInterval(int);
                            showNotification({
                                message: 'Your subscription cancellation has been submitted',
                                color: 'scBlue'
                            });
                            onClose();
                        }
                    }, 100);

                    return { success: true };
                } else {
                    // Handle regular cancellation
                    const res = await Fetch.post({
                        url: `/Billing/SubscriptionCancel`,
                        params: payload,
                        statusIfNull: true,
                        toastCtx: toast
                    });

                    return res;
                }
            },
            {
                onSuccess: (data) => {
                    if (data && data.ResponseStatus === 200) {
                        showNotification({
                            message: 'Your subscription has been cancelled',
                            color: 'scBlue'
                        });
                        onCancelCompleted(data);
                        onClose();
                        setStep(0)
                    }
                },
                onError: (error: any) => {
                    showNotification({
                        message: error?.message || 'There was an error cancelling your subscription',
                        color: 'yellow'
                    });
                }
            }
        );

        return <>
            <SCModal
                open={open && step === 0}
                size={550}
                onClose={onClose}
            >
                <Box>
                    <Title order={3} mb="md" c={'scBlue.8'}>Cancel Subscription</Title>

                    {!isOwing ? (
                        <>
                            <Text size="md" mb="md">
                                Your current subscription runs until {formatDate(accessEndDate)}.
                            </Text>
                            <Text size="md" mb="md">
                                If you proceed with cancelling, {userText.toLowerCase()} will lose access to ServCraft starting on {getNextDay(accessEndDate)}.
                            </Text>
                        </>
                    ) : (
                        <Text size="md" mb="md">
                            If you proceed with cancelling, {userText.toLowerCase()} will lose access to ServCraft immediately.
                        </Text>
                    )}

                    <Alert icon={<IconInfoCircle />} color={'scBlue'} mt={50} title={<Text size="md">Note: You can reactivate your subscription at any time.</Text>} >
                        {/*Note: You can reactivate your subscription at any time. <br/>*/}
                        <Text size="md">
                            For additional assistance, contact us at <Anchor size="md" href={'mailto:support@servcraft.co.za'}>support@servcraft.co.za</Anchor> or <Anchor size="md" onClick={() => openHubspotChat('Subscription Cancellation', 'I need help with my subscription cancellation')} style={{ cursor: 'pointer' }}>chat with us</Anchor>.
                        </Text>
                    </Alert>

                    <Space h={55} />

                    <Flex gap="md" justify="flex-end">
                        <Button variant="outline" onClick={onClose}>
                            Back
                        </Button>
                        <Button color="yellow.7" onClick={() => setStep(x => x + 1)}>
                            Continue to Cancel
                        </Button>
                    </Flex>
                </Box>
            </SCModal>

            <SCModal
                open={open && step === 1}
                size={600}
                onClose={onClose}
            >
                <Box>
                    <Title order={3} mb={7} c={'scBlue.8'}>Cancel Subscription</Title>

                    {
                    /*isLoadingFeatures ? (
                    <Flex justify="center" align="center" direction="column" my="xl">
                        <Loader size="md" color="scBlue" />
                        <Text mt="md" size="md" c="dimmed">Loading features...</Text>
                    </Flex>
                ) : featuresError ? (
                    <Alert color="red" mb="xl">
                        <Text size="md">There was an error loading feature information. Please try again later.</Text>
                    </Alert>
                ) :*/ !isLoadingFeatures && !allFeaturesUsed && (
                            <>
                                <Text size="md" mb={0} lh={1.5}><strong style={{ color: 'var(--mantine-color-scBlue-7)' }}>There&apos;s more to ServCraft.</strong> We found some tools that you haven&apos;t used yet. Other customers love how these tools save them time.</Text>
                                <Text size="md" mt={5} mb={'md'}>Click to learn more about each:</Text>
                                <List spacing={0} size="sm" mb={30}
                                    icon={
                                        <ThemeIcon color="scBlue" size={24} radius="xl">
                                            <IconCircleCheck size={16} />
                                        </ThemeIcon>
                                    }>
                                    <SimpleGrid cols={2} px={'lg'}>
                                        {unusedFeatures.map((feature, index) => {
                                            const hasFullRoute = !!featureFullRoutes[feature.name as keyof typeof featureFullRoutes]
                                            return (
                                                <List.Item key={index}
                                                    style={{ cursor: hasFullRoute ? 'pointer' : 'default' }}
                                                    onClick={() => showHelpCenterViaQueryParamsForFeature(feature.name)}
                                                >
                                                    <Flex align={'center'} gap={7}>
                                                        <Text fw={'bolder'} size={'md'} c={'scBlue.9'}
                                                        >{feature.name}</Text> {/*- <Text size={'sm'}>{feature.description}</Text>*/}
                                                    </Flex>
                                                </List.Item>
                                            )
                                        }
                                        )}
                                    </SimpleGrid>

                                </List>
                            </>
                        )}

                    <Blockquote icon={<IconQuote />} mb="xl"
                                mt={
                                    (isLoadingFeatures || featuresError || allFeaturesUsed) ? 'xl' : 0
                                }
                    // cite={`~ ${testimonial.author}`}
                    >
                        {/*{testimonial.quote}*/}
                        {testimonial}
                    </Blockquote>

                    <Alert icon={<IconInfoCircle />} color={'teal'} mt="xl" mb={0} >
                        <Text size="md">
                            If there is anything we can do to improve our service, {' '}
                            <Anchor size="md"
                                onClick={() => openHubspotChat('Feedback About ServCraft', 'I would like to provide some feedback about my experience with ServCraft.', true)}
                                style={{ cursor: 'pointer' }}>
                                click here
                            </Anchor> to schedule a call with our CEO.
                        </Text>
                    </Alert>

                    <Space h={30} />

                    <Flex gap="md" justify="flex-end">
                        <Button variant="outline" onClick={() => setStep(x => x - 1)}>
                            Back
                        </Button>
                        <Button color="yellow.7" onClick={() => setStep(x => x + 1)}>
                            Continue to Cancel
                        </Button>
                    </Flex>
                </Box>
            </SCModal>

            <SCModal
                open={open && step === 2}
                size={600}
                onClose={onClose}
            >
                <Box>
                    <Title order={3} mb={7} c={'scBlue.8'}>Cancel Subscription</Title>

                    <form onSubmit={form.onSubmit(handleSubmit)}>


                        {isLoadingCancellationReasons ? (
                            <Flex justify="center" align="center" direction="column" my="xl">
                                <Loader size="md" color="scBlue" />
                                <Text mt="md" size="md" c="dimmed">Loading cancellation reasons...</Text>
                            </Flex>
                        ) : cancellationReasonsError ? (
                            <Alert color="yellow.7" mb="xl">
                                <Text size="md">There was an error loading cancellation reasons. Please try again later.</Text>
                            </Alert>
                        ) : (
                            <>
                                <Checkbox.Group
                                    value={Object.keys(form.values.reasons)}
                                    onChange={(value) => {

                                        let currVal = {};
                                        value.forEach(id => {
                                            currVal[id] = form.values.reasons[id] ?? null;
                                        });

                                        form.setFieldValue("reasons", currVal);

                                    }}
                                    label={<>
                                        <Text size="md" lh={1.5}>
                                            <span style={{ fontWeight: 'bolder', color: 'var(--mantine-color-scBlue-6)' }}>Help make ServCraft better for the next South African {subscriptionInfo?.Industry || 'professional'}.</span>
                                            <br />
                                            Why are you cancelling? Please select any that apply.
                                        </Text>
                                    </>}
                                >
                                    {form.errors['reasons.none_selected'] && (
                                        <Text c="yellow.7" size="md">{form.errors['reasons.none_selected']}</Text>
                                    )}
                                    <Stack pt="md" gap={'xs'}>
                                        {cancellationReasons?.map((reason) => (
                                            <Box key={reason.ID}>
                                                <Checkbox.Card
                                                    p={'md'}
                                                    value={reason.ID}
                                                    radius={4}
                                                    styles={{
                                                        card: {
                                                            backgroundColor: Object.keys(form.values.reasons).includes(reason.ID)
                                                                ? 'var(--mantine-color-scBlue-0)'
                                                                : 'var(--mantine-color-gray-0)',
                                                            borderColor: Object.keys(form.values.reasons).includes(reason.ID)
                                                                ? 'var(--mantine-color-scBlue-6)'
                                                                : 'var(--mantine-color-gray-3)',
                                                            ...(Object.keys(form.values.reasons).includes(reason.ID) && reason.RequiresAdditionalInfo ? {
                                                                borderBottomLeftRadius: 0,
                                                                borderBottomRightRadius: 0,
                                                                borderBottomColor: 'transparent',
                                                            } : {})
                                                        }
                                                    }}
                                                >
                                                    <Group wrap="nowrap" align="flex-start">
                                                        <Checkbox.Indicator />
                                                        <div>
                                                            <Text size="md" fw={500}>{reason.Label}</Text>
                                                        </div>
                                                    </Group>
                                                </Checkbox.Card>

                                                {reason.RequiresAdditionalInfo && Object.keys(form.values.reasons).includes(reason.ID) && (
                                                    <Box
                                                        bg={'scBlue.0'}
                                                        pt={0}
                                                        px={'md'}
                                                        pb={2}
                                                        style={{
                                                            borderBottomLeftRadius: 4,
                                                            borderBottomRightRadius: 4,
                                                            borderLeft: '1px solid var(--mantine-color-scBlue-6)',
                                                            borderRight: '1px solid var(--mantine-color-scBlue-6)',
                                                            borderBottom: '1px solid var(--mantine-color-scBlue-6)',
                                                            borderTop: 0
                                                        }}
                                                    >
                                                        <Box mx={35} mb={'xs'} onClick={e => e.stopPropagation()}

                                                        >
                                                            <TextInput
                                                                maw={'100%'}
                                                                label={reason.AdditionalInfoLabel}
                                                                withAsterisk
                                                                {...form.getInputProps('reasons.' + reason.ID)}
                                                                styles={{
                                                                    error: {
                                                                        color: 'var(--mantine-color-red-9) !important'
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Checkbox.Group>
                            </>
                        )}

                        <Space h={30} />

                        <Flex gap="md" justify="flex-end">
                            <Button variant="outline" onClick={() => setStep(x => x - 1)}>
                                Back
                            </Button>
                            <Button type="submit" color="yellow.7">
                                Continue to Cancel
                            </Button>
                        </Flex>
                    </form>
                </Box>
            </SCModal>

            <SCModal
                open={open && step === 3}
                size={600}
                onClose={onClose}
            >
                <Box>
                    <Title order={3} mb="md" c={'scBlue.8'}>Cancel Subscription</Title>

                    <Text size="md" mb="lg">
                        Enter your password to confirm the cancellation.
                    </Text>

                    <form id="password-form" onSubmit={(e) => {
                        e.preventDefault();
                        if (!passwordForm.validate().hasErrors) {
                            cancelSubscriptionMutation.mutate();
                        }
                    }}>
                        <PasswordInput
                            maw={'100%'}
                            label="Password"
                            placeholder="Enter your password"
                            leftSection={<IconLock size={16} />}
                            {...passwordForm.getInputProps('password')}
                            withAsterisk
                            mb="md"
                        />
                    </form>

                    {!isOwing ? (
                        <Alert icon={<IconInfoCircle />} color="scBlue" mb="xl" mt={40}>
                            <Text size="md">

                                {/*If you proceed with cancelling, */}{userText} will lose access to ServCraft starting on {getNextDay(accessEndDate)}.
                            </Text>
                            <Text size="md" mt={'xs'}>
                                Note: You can reactivate your subscription at any time. For additional assistance contact support at <Anchor size="md" href={'mailto:support@servcraft.co.za'}>support@servcraft.co.za</Anchor> or <Anchor size="md" onClick={() => openHubspotChat('Subscription Cancellation', 'I need help with my subscription cancellation')} style={{ cursor: 'pointer' }}>chat with us</Anchor>.
                            </Text>
                        </Alert>
                    ) : (
                        <Alert icon={<IconInfoCircle />} color="yellow" mb="xl" mt={40}>
                            <Text size="md">
                                {/*If you proceed with cancelling, */}{userText} will lose access to ServCraft immediately.
                            </Text>
                            <Text size="md" mt="xs">
                                Note: You can reactivate your subscription at any time. For additional assistance contact support at <Anchor size="md" href={'mailto:support@servcraft.co.za'}>support@servcraft.co.za</Anchor> or <Anchor size="md" onClick={() => openHubspotChat('Subscription Cancellation', 'I need help with my subscription cancellation')} style={{ cursor: 'pointer' }}>chat with us</Anchor>.
                            </Text>
                            {false && isOwing && (
                                <Text size="md" mt="xs" c="yellow.9">
                                    Your account has an outstanding balance of {owingBalance}. You will be redirected to a payment page to settle your account.
                                </Text>
                            )}
                        </Alert>
                    )}

                    <Space h={30} />

                    <Flex gap="md" justify="flex-end">
                        <Button variant="outline" onClick={() => setStep(x => x - 1)}>
                            Back
                        </Button>
                        <Button
                            color="yellow.7"
                            type="submit"
                            form="password-form"
                            loading={cancelSubscriptionMutation.isLoading}
                            disabled={cancelSubscriptionMutation.isLoading}
                        >
                            {false && isOwing ? 'Settle & Cancel Subscription' : 'Confirm Cancellation'}
                        </Button>
                    </Flex>
                </Box>
            </SCModal>
        </>

    }


export default CancelSubscriptionModal
