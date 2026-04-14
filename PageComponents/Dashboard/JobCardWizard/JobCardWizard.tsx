import React, {FC, useContext, useEffect, useMemo, useState} from "react";
import {
    Title,
    Text,
    Box,
    Flex,
    Textarea,
    ModalBaseProps,
    Button,
    Loader, CloseButton
} from "@mantine/core";
import { useForm } from '@mantine/form';
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import Storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import styles from "./JobCardWizard.module.css";
import {AnimatePresence, motion} from "framer-motion";
import JobCardWizardUploadZone  from './JobCardWizardUploadDropZone';
import MaterialsManager from './Materials/MaterialsManager';
import { DEFAULT_SELECTED_INDUSTRY, getIndustryDefaultDescription, getIndustryDefaultMaterials } from '@/PageComponents/Dashboard/JobCardWizard/industry-defaults';
import Fetch from '@/utils/Fetch';
import CustomerService from '@/services/customer/customer-service';
import EmployeeService from '@/services/employee/employee-service';
import Helper from '@/utils/helper';
import Router from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import InventoryService from '@/services/inventory/inventory-service';
import Time from '@/utils/time';
import JobCardCompleteCard from './JobCardCompleteCard';
import {Employee} from "@/interfaces/api/models";
import CompanyService from "@/services/company-service";
import BasicModal from "@/PageComponents/Modal/BasicModal";

// Reusable slide variants and transition (full-width slide)
const slideVariants = {
    enter: (dir: 1 | -1) => ({
        x: dir > 0 ? '100%' : '-100%',
        opacity: 0,
        position: 'absolute' as const,
        inset: 0
    }),
    center: { x: 0, opacity: 1, position: 'static' as const },
    exit: (dir: 1 | -1) => ({
        x: dir > 0 ? '-100%' : '100%',
        opacity: 0,
        position: 'absolute' as const,
        inset: 0
    })
}

const slideTransition = { type: 'tween', duration: 0.25 } as const;

type WizardFormStep1 = {
    description: string;
    employeeId: string;
    customerId?: string | null;
}

type WizardFormStep2 = {
    inventory: any[];
}

type WizardForm = WizardFormStep1 & WizardFormStep2;

const JobCardWizard: FC<{
    onFormStateChange: (fs: {valid: boolean, value: any}) => void;
    initialValue: Partial<WizardForm>;
    subtitle?: string;
} & ModalBaseProps
> = ({onFormStateChange, initialValue, subtitle, ...modalProps}) => {

    const [newCompany, setNewCompany] = useState<{} | null>(null)

    // We do not fetch employee; use cookies for ID and full name
    const employeeIdFromCookie = useMemo(() => Storage.getCookie(Enums.Cookie.employeeID) || '', [])
    const employeeFullNameFromCookie = useMemo(() => Storage.getCookie(Enums.Cookie.servFullName) || '', [])
    const [currentEmployee, setCurrentEmployee] = useState<{
        ID: string,
        FullName: string,
        DisplayColor?: string
    } | null>(null)

    // Customer candidate found/created from step 1
    const [customerCandidate, setCustomerCandidate] = useState<{
        id: string | null; // real ID if exists
        name: string; // name to use if creating
        exists: boolean; // true if id is real
    } | null>(null)

    const formStep1 = useForm<WizardFormStep1>({
        initialValues: {
            // Hardcode industry for now; later will come from tenant profile
            description: initialValue?.description || getIndustryDefaultDescription(DEFAULT_SELECTED_INDUSTRY),
            employeeId: initialValue?.employeeId || employeeIdFromCookie || '',
            customerId: initialValue?.customerId ?? null,
        },
        validate: {
            description: (v) => (v && v.trim().length > 0 ? null : '  ' /*'Please enter a description'*/),
            employeeId: (v) => (v && v.trim().length > 0 ? null : 'Employee is required'),
            // customer optional for now
        }
    });

    const formStep2 = useForm<WizardFormStep2>({
        initialValues: {
            // Pre-populate with a few defaults for the selected industry
            inventory: initialValue?.inventory || (getIndustryDefaultMaterials(DEFAULT_SELECTED_INDUSTRY) as any[])
        },
        validate: {
            inventory: (v) => v.length > 0 ? null : 'Please select at least one item to add to the job card',
        }
    });

    useEffect(() => {
        console.log('formStep2.values.inventory', formStep2.values.inventory)
    }, [formStep2.values.inventory]);

    // Bootstrap employee info from cookies and seed form values
    useEffect(() => {
        const empId = employeeIdFromCookie
        const fullName = employeeFullNameFromCookie
        if (empId || fullName) {
            setCurrentEmployee({ ID: empId, FullName: fullName })
        }
        if (empId) {
            formStep1.setFieldValue('employeeId', empId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // React Query: search customer by user's full name (from cookie)
    const fullNameForCustomerSearch = employeeFullNameFromCookie?.trim()

    const customerSearch = useQuery(['wizardCustomerByName', fullNameForCustomerSearch], async () => {
        if (!fullNameForCustomerSearch) return null as any
        // Match expected signature: (searchPhrase, pageSize, currentPage, sortExpression, sortDirection, activeFilterIds, ancillaryFilters, populatedList, toast, context)
        return await CustomerService.getCustomerList(fullNameForCustomerSearch, 5, 1, null, null, null, null, false, null, null)
    }, {
        enabled: !!fullNameForCustomerSearch,
        staleTime: 5 * 60 * 1000
    })

    // When customer search returns, set candidate into state/form
    useEffect(() => {
        const list = customerSearch.data
        if (list && Array.isArray(list?.Results)) {
            const first = list.Results[0]
            if (first?.ID) {
                setCustomerCandidate({ id: first.ID, name: first.CustomerName || fullNameForCustomerSearch, exists: true })
                formStep1.setFieldValue('customerId', first.ID)
            } else if (fullNameForCustomerSearch) {
                setCustomerCandidate({ id: null, name: fullNameForCustomerSearch, exists: false })
                formStep1.setFieldValue('customerId', null)
            }
        } else if (fullNameForCustomerSearch) {
            setCustomerCandidate({ id: null, name: fullNameForCustomerSearch, exists: false })
            formStep1.setFieldValue('customerId', null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerSearch.data])

    // Propagate validity and values upwards whenever form changes (both steps)
    useEffect(() => {
        const v1 = !formStep1.validate().hasErrors
        const v2 = !formStep2.validate().hasErrors
        onFormStateChange({
            valid: v1 && v2,
            value: { ...formStep1.getValues(), ...formStep2.getValues() }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formStep1.values.description,
        formStep1.values.employeeId,
        formStep1.values.customerId,
        formStep2.values.inventory
    ])


    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const [direction, setDirection] = useState<1 | -1>(1)


    useEffect(() => {
        // When modal closes, reset as requested
        if (!modalProps.opened) {
            // Always return to step 1
            if (currentStep !== 1) setCurrentStep(1)

            // Clear created job, and if it existed, reset forms to defaults
            const hadCreated = !!createdJob
            setCreatedJob(null)

            // Restore company
            setNewCompany(null)

            if (hadCreated) {
                // Reset Step 1 defaults
                formStep1.setFieldValue('description', getIndustryDefaultDescription(DEFAULT_SELECTED_INDUSTRY))
                formStep1.setFieldValue('employeeId', employeeIdFromCookie || '')
                formStep1.setFieldValue('customerId', null)
                // Reset Step 2 defaults
                formStep2.setFieldValue('inventory', getIndustryDefaultMaterials(DEFAULT_SELECTED_INDUSTRY) as any[])
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalProps.opened])

    const onNext = () => {
        setDirection(1)
        setCurrentStep(step => (step === 1 ? 2 : 1))
    }

    const onBack = () => {
        setDirection(-1)
        setCurrentStep(1)
    }


    // Creation/progress state for step 3 (progress slide)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [createMessage, setCreateMessage] = useState<string>('')
    const [createdJob, setCreatedJob] = useState<{ id: string; jobCardNumber: string | null } | null>(null)

    // Persist previously created/resolved entities across retries (idempotency)
    const [persistedCustomerId, setPersistedCustomerId] = useState<string | null>(null)
    const [persistedInventoryMap, setPersistedInventoryMap] = useState<Record<string, string>>({})

    const canSubmit = useMemo(() => {
        // Step 2 must be valid (at least one material)
        const { hasErrors } = formStep2.validate();
        return !hasErrors;
    }, [formStep2.values.inventory])

    // Mutation to handle the full creation flow
    const createJobCardMutation = useMutation(async () => {

        if(newCompany) {
            setCreateMessage('Uploading company logo...')
            try {
                await CompanyService.saveCompany(newCompany)
                    .finally( () => {
                        setNewCompany(null)
                    }) // clear company to avoid duplicate uploads
            } catch (e) {
                console.error('Failed to upload company logo', e)
            }
        }


        // 1) Ensure customer exists (idempotent)
        setCreateMessage('Checking customer...')
        let customerID: string | null = formStep1.getValues().customerId || persistedCustomerId || null
        const candidate = customerCandidate || (employeeFullNameFromCookie ? { id: null, name: employeeFullNameFromCookie, exists: false } : null)

        const tryFindCustomerByName = async (name: string) => {
            const res = await CustomerService.getCustomerList(name, 5, 1, null, null, null, null, false, null, null)
            const list = res?.Results || []
            const match = list.find((c: any) => (c?.CustomerName || '').trim().toLowerCase() === name.trim().toLowerCase())
            return match?.ID || null
        }

        if (!customerID) {
            // Re-check server for existing by name
            if (candidate?.name) {
                setCreateMessage('Searching for existing customer...')
                const existingId = await tryFindCustomerByName(candidate.name)
                if (existingId) {
                    customerID = existingId
                }
            }
        }

        if (!customerID) {
            // Create new customer since none found
            setCreateMessage('Creating customer...')
            const full = (candidate?.name || employeeFullNameFromCookie || 'New Customer').trim()
            const nameParts = full.split(' ').filter(Boolean)
            const firstName = nameParts[0] || full || 'User'
            const lastName = nameParts.slice(1).join(' ') || ''

            let employeeData: Employee | null = null;
            if (employeeIdFromCookie) {
                try {
                    employeeData = await EmployeeService.getEmployee(employeeIdFromCookie);
                } catch (e) {
                    console.error('Failed to fetch employee details', e);
                }
            }

            const primaryContact = {
                FirstName: firstName,
                LastName: lastName,
                EmailAddress: employeeData?.EmailAddress || '',
                MobileNumber: employeeData?.MobileNumber || '',
                Designation: '',
                IsActive: true,
            }

            const payload: any = {
                CustomerName: full,
                IsActive: true,
                IsCompany: false,
                Contacts: [primaryContact],
                Locations: []
            }
            const cRes = await Fetch.post({ url: '/Customer', params: payload } as any)
            if (!cRes?.ID) throw new Error(cRes?.serverMessage || cRes?.message || 'Failed to create customer')
            customerID = cRes.ID
            setCustomerCandidate({ id: cRes.ID, name: payload.CustomerName, exists: true })
            formStep1.setFieldValue('customerId', cRes.ID)
            setPersistedCustomerId(cRes.ID)
        }

        if (!customerID) throw new Error('Customer could not be resolved')

        // 2) Ensure inventory exists for each selected material (idempotent per item by Description)
        setCreateMessage('Preparing materials...')
        const materials = formStep2.getValues().inventory || []
        const createdInventoryMap: Record<string, string> = { ...persistedInventoryMap }

        const tryFindInventoryByDescription = async (desc: string) => {
            // search and attempt exact case-insensitive match
            const res = await InventoryService.getInventoryList(desc, 10, 1, null, null, null, null, null as any, null as any)
            const list = res?.Results || []
            const match = list.find((i: any) => (i?.Description || '').trim().toLowerCase() === desc.trim().toLowerCase())
            return match?.ID || null
        }

        for (const m of materials) {
            // Skip existing inventory items
            if (!m.isNew) continue
            if (!m.description) continue

            // Already mapped from a previous attempt
            if (createdInventoryMap[m.key]) continue

            // If inventoryId somehow present, map and continue
            if (m.inventoryId) {
                createdInventoryMap[m.key] = m.inventoryId
                continue
            }

            setCreateMessage(`Checking inventory: ${m.description}`)
            const existingId = await tryFindInventoryByDescription(m.description)
            if (existingId) {
                createdInventoryMap[m.key] = existingId
                continue
            }

            setCreateMessage(`Creating inventory: ${m.description}`)
            const invPayload: any = {
                Description: m.description,
                IsActive: true,
                IsQuantityTracked: false,
                StockItemType: 1 // Service by default
            }
            const iRes = await Fetch.post({ url: '/Inventory', params: invPayload } as any)
            if (!iRes?.ID) throw new Error(iRes?.serverMessage || iRes?.message || `Failed to create inventory: ${m.description}`)
            createdInventoryMap[m.key] = iRes.ID
        }

        // Persist for safe retry
        setPersistedInventoryMap(createdInventoryMap)

        // 3) Create job with JobInventory items and assign employee from cookie
        setCreateMessage('Creating job card...')

        const jobInventoryLines = materials.map((m, idx) => {
            const invId = m.inventoryId || createdInventoryMap[m.key]
            const inventoryObj = m.inventory || null
            return {
                ID: Helper.newGuid(),
                LineNumber: idx + 1,
                IsActive: true,
                UnitAmount: 0,
                InventoryID: invId,
                InventoryCode: inventoryObj?.Code ?? null,
                InventoryDescription: m.description,
                Inventory: inventoryObj,
                Description: m.description,
                QuantityAllocated: 0,
                QuantityUsed: 0,
                QuantityOutstanding: 0,
                QuantityReturned: 0,
                QuantityReturnPending: 0,
                QuantityRequested: m.quantity,
                StockItemStatus: Enums.StockItemStatus.ItemUsed,
                Billable: false,
                InventorySectionID: null,
                InventorySectionName: null,
                HideLineItems: false,
                DisplaySubtotal: false,
                WarehouseID: null,
                Warehouse: null,
                UnitCostPrice: 0,
                UnitPriceExclusive: 0,
                LineDiscountPercentage: 0,
            }
        })

        // Validate all InventoryIDs resolved
        const unresolved = jobInventoryLines.filter(l => !l.InventoryID)
        if (unresolved.length > 0) {
            throw new Error('Some materials could not be resolved. Please try again.')
        }

        // Resolve Store, Workflow, and Customer Contact/Location before building final payload
        setCreateMessage('Resolving store and workflow...')

        // 3a) Resolve Store (pick first active or only store for employee)
        let resolvedStoreID: string | null = null
        try {
            if (employeeIdFromCookie) {
                const storesRes = await Fetch.get({
                    url: `/Store/GetEmployeeStores?employeeID=${employeeIdFromCookie}&searchPhrase=`
                } as any)
                const storeResults = storesRes?.Results || []
                if (Array.isArray(storeResults) && storeResults.length > 0) {
                    const firstActive = storeResults.find((s: any) => s?.IsActive) || storeResults[0]
                    resolvedStoreID = firstActive?.ID || null
                }
            }
        } catch (e) {
            // Non-fatal: allow StoreID to be null if fetch fails
        }

        // 3b) Resolve WorkflowID using first job status (no job type in wizard)
        let resolvedWorkflowID: string | null = null
        try {
            const jsFirst = await Fetch.get({ url: `/JobStatus/First?jobTypeID=${null}` } as any)
            if (jsFirst?.WorkflowID) resolvedWorkflowID = jsFirst.WorkflowID
        } catch (e) {
            // Non-fatal: allow WorkflowID to be null if fetch fails
        }

        // 3c) Fetch full Customer for Contact and Location
        setCreateMessage('Resolving contact and location...')
        const customerFull = await Fetch.get({ url: `/Customer/${customerID}` } as any)
        const resolvedContact = (customerFull?.Contacts || []).find((c: any) => c?.IsActive) || (customerFull?.Contacts || [])[0] || null
        const resolvedLocation = (customerFull?.Locations || []).find((l: any) => l?.IsPrimary) || (customerFull?.Locations || [])[0] || null

        // Build envelope to match job create page structure
        const now = Time.now();
        const jobObject: any = {
            CustomerID: customerID,
            Description: formStep1.getValues().description,
            StartDate: Time.toISOString(now),
            JobInventory: jobInventoryLines,
            Employees: employeeIdFromCookie ? [{ ID: employeeIdFromCookie }] : [],
            JobCardWarehouses: [],
            // Newly added fields to align with standard job-create payload
            StoreID: resolvedStoreID,
            WorkflowID: resolvedWorkflowID,
            CustomerContactID: resolvedContact?.ID ?? null,
            LocationID: resolvedLocation?.ID ?? null,
            Contact: resolvedContact ?? null,
            Location: resolvedLocation ?? null,
            Customer: customerFull ?? null,
        }

        const jobEnvelope = {
            Job: jobObject,
            InventorySections: [],
            ContactSendList: [],
            EmailSendList: [],
            SMSSendList: [],
            UsedTriggers: [] as string[]
        }

        const jRes = await Fetch.post({ url: '/Job', params: jobEnvelope } as any)
        if (!jRes?.ID) throw new Error(jRes?.serverMessage || jRes?.message || 'Failed to create job card')
        return jRes
    }, {
        onSuccess: (data: any) => {
            setCreatedJob({ id: data.ID, jobCardNumber: data?.JobCardNumber ?? null })
            setCreateMessage('Job card created successfully')
        },
        onError: (err: any) => {
            const msg = err?.message || 'An error occurred while creating the job card'
            setCreateError(msg)
        },
        onSettled: () => {
            setIsCreating(false)
        }
    })

    const goToCreateStep = async () => {
        setCreateError(null)
        setCreatedJob(null)
        setIsCreating(true)
        setDirection(1)
        setCurrentStep(3)
        createJobCardMutation.mutate()
    }

    const handlePrint = async () => {
        if (!createdJob?.id) return
        // Navigate to job page where full print options exist
        Helper.nextRouter(Router.push, '/job/[id]', `/job/${createdJob.id}`)
    }


    return <BasicModal
        styles={{
            body: {paddingBottom: 0}
        }}
        closeOnClickOutside={false}
        {...modalProps}
    >

        {/*<SCModal
        open={modalProps.opened}
        onClose={modalProps.onClose}
        modalProps={modalProps}
        size={800}
    >*/}
            <AnimatePresence mode={'wait'}>
                {createdJob ? (
                    <motion.div
                        key={'wizard-complete'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <JobCardCompleteCard
                            modalProps={modalProps}
                            jobId={createdJob.id}
                            jobNumber={createdJob.jobCardNumber || undefined}
                            onClose={modalProps.onClose}
                        />
                    </motion.div>
                ) : (

        <Box w={750} maw={{base: '85vw', sm: '80vw'}} className={styles.container} p={{ base:'32px 40px 32px', sm:'32px 40px 32px'}} pos={'relative'}>

            <CloseButton onClick={modalProps.onClose} pos={'absolute'} right={10} top={15} style={{zIndex: 5}} />

                    <motion.div
                        key={'wizard-create'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <>
                    <Box style={{
                        borderBottom: '1px solid var(--mantine-color-gray-4)',
                        paddingBottom: 'var(--mantine-spacing-xs)'
                    }}>
                        <Title
                            c={'dark.7'}
                            order={4}
                        >
                            See what your job card will look like
                        </Title>
                        <Text c={'gray.7'} style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} mt={'xs'}>{subtitle ?? 'Fill in a few details to craft your very first job card.'}</Text>
                    </Box>

                    {/* Step content with directional slide transitions */}
                    <Box pos={'relative'} style={{ overflow: 'hidden', minHeight: 280 }}>
                        <AnimatePresence initial={false} custom={direction} mode={'popLayout'}>
                            {currentStep === 1 && (
                                <motion.div
                                    key={'step-1'}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={slideTransition}
                                >
                                    <Flex w={'100%'} direction={{base: 'column-reverse', xs: 'row'}} justify={'space-between'} mt={'xl'} align={'stretch'} gap={'lg'} className={styles.topRow}>
                                        <Box flex={2} className={styles.leftCol}>
                                            <Title order={5} fw={600} >About this job</Title>
                                            <Text c={'dark.6'} mt={4} fw={400} style={{ fontSize: 'max(14px,var(--mantine-font-size-sm))' }}>
                                                We&apos;ve added your name as for the sample details to get you started.
                                           </Text>

                                            <Flex direction={'column'} gap={24} mt={24} w={'100%'}>
                                                <Flex align={'center'} gap={'md'}>
                                                    <Box className={styles.label}><Text c={'dark.7'} style={{ fontSize: 'max(14px,var(--mantine-font-size-sm))' }} fw={380}>Customer name:</Text></Box>
                                                    <Box className={styles.value}>
                                                        {currentEmployee && (
                                                            <Flex className={styles.pill} align={'center'} gap={'xs'}>
                                                                <EmployeeAvatar name={currentEmployee.FullName || ''} color={currentEmployee.DisplayColor} />
                                                                <Text size={'sm'} fw={600}>{currentEmployee.FullName}</Text>
                                                            </Flex>
                                                        )}
                                                    </Box>
                                                </Flex>

                                                <Flex align={'center'} gap={'md'}>
                                                    <Box className={styles.label}><Text c={'dark.7'} style={{ fontSize: 'max(14px,var(--mantine-font-size-sm))' }} fw={380} >Assigned employee:</Text></Box>
                                                    <Box className={styles.value}>
                                                        {currentEmployee && (
                                                            <Flex className={styles.pill} align={'center'} gap={'xs'}>
                                                                <EmployeeAvatar name={currentEmployee.FullName || ''} color={currentEmployee.DisplayColor} />
                                                                <Text size={'sm'} fw={600}>{currentEmployee.FullName}</Text>
                                                            </Flex>
                                                        )}
                                                    </Box>
                                                </Flex>
                                            </Flex>

                                        </Box>

                                        <Flex direction={'column'} align={'center'} gap={8}>
                                            <JobCardWizardUploadZone
                                                newCompany={newCompany}
                                                setNewCompany={setNewCompany}
                                            />
                                        </Flex>
                                    </Flex>

                                    <Box>
                                        <Flex direction={'column'} gap={'md'} my={'lg'}>
                                            <Box mt={'sm'}>
                                                <Text mb={6} style={{ fontSize:'max(12px, var(--mantine-font-size-sm))'}} fw={300}>Description <span style={{ color: 'red' }}>*</span></Text>
                                                <Textarea
                                                    maw={'60%'}
                                                    placeholder={'What is this job all about?'}
                                                    radius={'md'}
                                                    style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}}
                                                    autosize
                                                    minRows={2}
                                                    className={styles.description}
                                                    {...formStep1.getInputProps('description')}
                                                    // value={form.values.description}
                                                    // onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
                                                    // error={form.errors.description}
                                                />
                                            </Box>
                                        </Flex>
                                    </Box>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key={'step-2'}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={slideTransition}
                                >
                                    <Box>
                                        <Title order={5} fw={600} mt={'xl'}>Add materials for this job.</Title>
                                        <Text c={'dark.6'} style={{ fontSize:'max(14px, var(--mantine-font-size-sm))'}} mt={4} fw={300}> 
                                           Easily modify materials and quantities directly on the job card at any time. 
                                        </Text>
                                        <Box mt={'lg'}>
                                            <MaterialsManager
                                                initialItems={formStep2.getValues().inventory as any[]}
                                                onChange={(items) => {
                                                    formStep2.setFieldValue('inventory', items as any);
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key={'step-3'}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={slideTransition}
                                >
                                    <Flex direction={'column'} align={'center'} justify={'center'} style={{ minHeight: 260 }} gap={'sm'}>
                                        <AnimatePresence mode={'wait'}>
                                            {createError ? (
                                                <motion.div
                                                    key={'create-error'}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Title order={4} c={'yellow.7'}>Could not complete creation</Title>
                                                    <Text c={'dark.6'} ta={'center'}>{createError}</Text>
                                                    <Flex gap={'sm'} mt={'md'}>
                                                        <Button variant={'subtle'} color={'dark.7'} onClick={() => setCurrentStep(2)}>Back</Button>
                                                        <Button onClick={goToCreateStep}>Retry</Button>
                                                    </Flex>
                                                </motion.div>
                                            ) : (
                                                isCreating && (
                                                    <motion.div
                                                        key={'create-progress'}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Flex gap={16} direction={'column'} align={'center'} justify={'center'} h={'100%'} w={'100%'}>
                                                            <Loader color={'scBlue'} size={22} />
                                                            {/*<Text c={'dark.6'}>{createMessage || 'Creating job card...'}</Text>*/}
                                                        </Flex>
                                                    </motion.div>
                                                )
                                            )}
                                        </AnimatePresence>
                                    </Flex>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>


                    <Flex w={'100%'} align={'center'} pt={'sm'} mt={20} gap={'sm'}
                    style={{ borderTop: '1px solid var(--mantine-color-gray-4)' }} >

                        <Text c={'dark.6'} style={{ fontSize:'max(12px, var(--mantine-font-size-sm))'}} mr={'auto'}>Step {Math.min(+currentStep as any, 2)} of 2</Text>

                        {/* Swap Cancel/Back with fade using AnimatePresence popLayout */}
                        <AnimatePresence mode={'wait'}>
                            {currentStep === 1 ? (
                                <motion.div
                                    key={'cancel-btn'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button variant={'subtle'} color={'dark.7'} ml={'center'} onClick={modalProps.onClose}>
                                        Cancel
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={'back-btn'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button variant={'subtle'} color={'dark.7'} ml={'center'} onClick={onBack}>
                                        Back
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence mode={'wait'}>
                            {currentStep === 1 && (
                                <motion.div
                                    key={'next-btn'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button onClick={onNext} disabled={!formStep1.isValid()}>
                                        Next
                                    </Button>
                                </motion.div>
                            )}
                            {currentStep === 2 && (
                                <motion.div
                                    key={'create-btn'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button onClick={goToCreateStep} disabled={!canSubmit}>
                                        Create Job Card
                                    </Button>
                                </motion.div>
                            )}
                            {currentStep === 3 && (
                                <motion.div
                                    key={'creating-placeholder'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Button disabled>
                                        {isCreating ? 'Working...' : 'Done'}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </Flex>

                        </>
                    </motion.div>
               </Box> )}
            </AnimatePresence>

    </BasicModal>


}

export default JobCardWizard;

