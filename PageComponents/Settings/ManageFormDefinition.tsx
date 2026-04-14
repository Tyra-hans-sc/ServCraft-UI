import {Button, Text, Title, Flex, Box, Anchor, LoadingOverlay, Tooltip, ActionIcon, Checkbox} from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import Router, {useRouter} from 'next/router';
import {showNotification, updateNotification} from '@mantine/notifications';
import * as Enums from "@/utils/enums";
import Fetch from '@/utils/Fetch';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import moment from 'moment';
import Helper from "@/utils/helper";
import Link from "next/link";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import ScTextAreaControl from "@/components/sc-controls/form-controls/v2/ScTextAreaControl";
import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";
import SCMultiSelect from "@/components/sc-controls/form-controls/sc-multiselect";
import SCSwitch from "@/components/sc-controls/form-controls/sc-switch";
import MinuteSelector from "@/components/selectors/minute-selector";
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import ManageFormDefinitionField from '@/components/modals/form-definition/manage-form-definition-field';
import {IconEdit, IconPlus, IconInfoCircle} from "@tabler/icons-react";
import {IconTrash} from "@tabler/icons";
import FormDefinitionFields from "@/components/form-definition/items";
import DownloadService from "@/utils/download-service";
import ConfirmAction from "@/components/modals/confirm-action";
import ManageSection from "@/components/modals/section/manage-section";

// Supporting Types for nested objects

interface JobType {
    ID: string;
    Name: string;
}

interface Section {
    ID: string; // Section ID
    ItemID: string; // Unique identifier for the item
    DisplayOrder: number; // Order of display within the form
    Heading: string; // Heading of the section
    Description?: string; // Optional description
    IsActive: boolean; // Indicates if the section is active
    ParentSectionID?: string | null; // Parent section ID, if applicable
    Repeatable: boolean; // Indicates if the section is repeatable
    Module: number; // Module ID associated with the section
    CreatedBy: string; // User who created the section
    CreatedDate: string; // Creation timestamp
    ModifiedBy: string; // User who last modified the section
    ModifiedDate: string; // Last modification timestamp
    RowVersion: string; // Concurrency tracking row version
}

interface FormDefinitionField {
    ID: string; // Unique identifier for the field
    MasterID: string; // Master identifier
    Description: string; // Description of the field
    DataType: string; // Data type of the field (e.g., Text, Table, etc.)
    DisplayOrder: number; // The display order of the field
    Required: boolean; // Indicates if the field is required
    SectionID?: string | null; // ID of the section this field belongs to
    DataOption?: string; // Data option configuration (if applicable)
    Section?: Section; // Optional reference to the section
    // this is added for compatibility with sectionTable
    SectionHeading: string,
    LineNumber: number, // used by sectionTable
}

interface FormDefinition {
    ID?: string; // Unique identifier of the form (optional for new form)
    Name: string; // Name of the form
    Description?: string; // Description of the form
    Module?: string | null; // Selected module (optional, can be null)
    FormRule?: number; // Rule that determines form classification
    ExpireTimespan?: number; // Time span (in minutes) until the form expires
    NonExpiring?: boolean; // Indicates if the form does not expire
    StructureLocked?: boolean; // Determines if the structure is locked and uneditable
    IsActive: boolean; // Active status of the form
    JobTypes: Array<JobType>; // Job types linked to the form
    Sections: Array<Section>; // Sections within the form
    FormDefinitionFields?: Array<FormDefinitionField>; // Fields that make up the form
    Version: number; // Version number of the form
    CreatedDate?: string; // Creation date
    CreatedBy?: string; // Created by user information
    ModifiedDate?: string; // Last modified date
    ModifiedBy?: string; // Modified by user information
    FormDefinitionStatus?: number; // Status of the form (Confirmed, Draft, etc.)
    MasterID: string; // Master ID for linking related records
    RowVersion?: string; // Row version for concurrency tracking
    MultiUse?: boolean; // Indicates if the form can be reused (on mobile)
}

// Define types
interface ManageFormDefinitionProps {
    formDefinition: FormDefinition; // Replace `any` with a more specific type if available
    // setFormDefinition: (data: any) => void; // Replace `any` with specific type
    isNew: boolean;
    accessStatus: any;
}


// Enforce sensible caps to avoid rendering/printing issues
const DESCRIPTION_MAX = 400;
const NAME_MAX = 125;

const reorderSectionsToBottom: (input: FormDefinitionField[]) => FormDefinitionField[] = (input) => {
    const reorganized = input.sort((a, b) => {
        if (!a.SectionID && b.SectionID) {
            return -1; // Place items without SectionID at the top
        } else if (a.SectionID && !b.SectionID) {
            return 1; // Place items with SectionID at the bottom
        } else {
            // Both items either have or don't have SectionID, sort by DisplayOrder
            return a.LineNumber - b.LineNumber;
        }
    }).map((x, i) => ({...x, DisplayOrder: i, LineNumber: i + 1}));
    return reorganized
}

// Convert React component to TypeScript
const ManageFormDefinition: React.FC<ManageFormDefinitionProps> = ({ formDefinition: initialFormDefinition, isNew, accessStatus }) => {

    const [formDefinition, setFormDefinition] = useState(initialFormDefinition);

    const formDefinitionQuery = useQuery(['refetchFormDefinition', formDefinition.ID], () => Fetch.get({ url: `/FormDefinition/${formDefinition.ID}` }), {
        refetchOnWindowFocus: true,
        // refetchOnReconnect: true,
        refetchOnMount: false,
        enabled: !!formDefinition.ID && !isNew,
        onError: (error) => {
            console.log(error);
        }
    })

    // Update form definition when query data changes
    useEffect(() => {
        if (formDefinitionQuery.data) {
            setFormDefinition(formDefinitionQuery.data);
        }
    }, [formDefinitionQuery.data])

    // Querying Job Types
    /*const { data: jobTypeData, isLoading: jobTypeLoading, isError: jobTypeError } = useQuery(['jobTypes'], () =>
        Fetch.get({ url: '/JobType' }).then(response => response.Results.sort((a, b) => (a.Name > b.Name ? 1 : -1))), {
            onSuccess: () => {
                // console.log(jobTypeData);
            },
            onError: () => {
                showNotification({
                    title: 'Error',
                    message: 'Error fetching job types.',
                    color: 'red',
                });
            }
        }
    );*/

    const router = useRouter();

    const {mutate: mutateFormDefinition, isLoading: submitting} = useMutation(async (params: any) => {
        const requestConfig = isNew
            ? {
                method: 'post',
                url: '/FormDefinition',
            }
            : {
                method: 'put',
                url: `/FormDefinition`,
            };

        const res = await Fetch[requestConfig.method]({
            url: requestConfig.url,
            params
        })

        if(res.ID) {
            return res
        } else {
            throw new Error(res.serverMessage || res.message || 'something went wrong')
        }
    }, {
        onSuccess: async (result) => {
            if (result.ID) {
                // formDefinitionFields.some(x => !x.ID) && result.FormDefinitionFields.every(x => !!x.ID) &&
                const fieldsWithSectionData = result.FormDefinitionFields?.map((x: any) => ({'SectionHeading': x?.SectionHeading ?? (x.Section?.Heading || null), LineNumber: x.DisplayOrder + 1, ...x}))
                setFormDefinitionFields(reorderSectionsToBottom(fieldsWithSectionData))
                // setRefreshTableTrigger(p => p + 1)
                setFormDefinition(result);
                showNotification({
                    message: 'Form saved successfully',
                    color: 'scBlue',
                    autoClose: 1000
                });
                form.setValues({
                    ...result,
                    FormRule: Enums.getEnumItemsVD(Enums.FormRule).find(x => x.value === result.FormRule)
                })
                form.resetDirty()
                form.resetTouched()
                if (isNew || formDefinition.ID !== result.ID) {
                    const restoreRef = allowNavRef.current;
                    allowNavigation();
                    await Helper.waitABit()
                    await router.replace(`/settings/form/${result.ID}`, undefined, { shallow: !isNew });
                    await Helper.waitABit()
                    allowNavRef.current = restoreRef;
                }
            }
            setConfirming(false);
        },
        onError: (error: Error, variables) => {
            showNotification({
                message: error.message || 'Failed to save form definition',
                color: 'yellow.7',
            });
            setConfirming(false);
            // formDefinitionQuery.refetch();
        }
    });

    // Initialize Mantine Form
    const form = useForm({
        initialValues: {
            Name: isNew ? '' : formDefinition.Name,
            Description: isNew ? '' : formDefinition.Description,
            FormRule: isNew ? null : Enums.getEnumItemsVD(Enums.FormRule).find(x => x.value === formDefinition.FormRule),
            JobTypes: isNew ? [] : formDefinition.JobTypes,
            formExpires: isNew ? false : (!!formDefinition.ExpireTimespan && (formDefinition.ExpireTimespan > 0)),
            FormExpiresTimespan: isNew ? 0 : formDefinition.ExpireTimespan,
            IsActive: isNew ? true : formDefinition.IsActive,
            // Default to multi-use on create. For legacy records, fallback: MultiUse = !SingleUse
            MultiUse: isNew ? true : (formDefinition.MultiUse ?? !((formDefinition as any).SingleUse ?? false)),
            // Add other form fields as necessary
        },
        validate: {
            Name: (value) => {
                if ((value?.length ?? 0) < 1) return 'Name is required';
                return (value?.length ?? 0) > NAME_MAX ? `Name must be ${NAME_MAX} characters or fewer` : null;
            },
            Description: (value) => {
                const len = (value?.length ?? 0);
                return len > DESCRIPTION_MAX ? `  ` : null;
            },
            // Add other validation rules as necessary
        },
        // Surface validation feedback before submission so users do not lose content
        validateInputOnBlur: true,
        validateInputOnChange: true,
        transformValues: (values) => ({
            ...values,
            module: isNew ? null : formDefinition.Module,
            FormRule: values.FormRule?.value,
            // formDefinitionStatus: structureChanged ? Enums.FormDefinitionStatus.Draft : formDefinition.FormDefinitionStatus
            // form.values.formDefinitionStatus || Enums.FormDefinitionStatus.Draft, // Ensure status
        })
    });

    // If an existing record has an overlong Description or Name, surface the error immediately on mount
    useEffect(() => {
        const nameLen = form.values?.Name?.length ?? 0;
        if (nameLen > NAME_MAX) {
            form.setFieldError('Name', `Name must be ${NAME_MAX} characters or fewer`);
        }
        const len = form.values?.Description?.length ?? 0;
        if (len > DESCRIPTION_MAX) {
            form.setFieldError('Description', ` `);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*useEffect(() => {
        console.log('form values changed', form.values)
        // Fetch additional data if needed
    }, [form.values]);*/

    // const [nextQueuedPayload, setNextQueuedPayload] = useState<any>(null)

    const submit = (values: typeof form.values, formEvent?: any, updatedFormDefinitionFields?: any[], status = formDefinition.FormDefinitionStatus) => {
        // Form Validation
        // const { isValid, errors } = form.validate();

        const formDefFieldsUnorganizedSections: FormDefinitionField[] = updatedFormDefinitionFields || formDefinitionFields

        const formDefFields: FormDefinitionField[] = reorderSectionsToBottom(formDefFieldsUnorganizedSections)

        setFormDefinitionFields(formDefFields);

        if (!form.isValid()) {
            form.validate()
            showNotification({
                title: 'Validation Error',
                message: 'There are errors in the form. Please fix them before submitting.',
                color: 'yellow.7',
            });
            return;
        }

        // Ensure FormDefinitionFields exist
        /*if (!isNew && formDefFields.length === 0) {
            showNotification({
                title: 'Missing Fields',
                message: 'Please add at least one field to the form definition.',
                color: 'yellow',
            });
            return;
        }*/

        if (!isNew && formDefFields.some((field) => !field.Description.trim())) {
            showNotification({
                title: 'Field Error',
                message: 'All form fields must have a description.',
                color: 'yellow',
            });
            return;
        }

        // Ensure expireTimespan is properly set
        const expireTimespan = values.formExpires ? values.FormExpiresTimespan : 0;

        /**
         * Function to map nested DataOption structures
         */
        const mapDataOptionTableToFormDefinitionFields = (dataOption: string) => {
            const tableStructure = JSON.parse(dataOption);
            return tableStructure.ColumnDefinitions.map((col: any) => ({
                ID: col.Name,
                MasterID: col.Name,
                Description: col.Label,
                DataType: col.DataType,
                DisplayOrder: 0,
                Required: col.Required,
                SectionID: null,
                DataOption: col.DataOption,
            }));
        };

        /**
         * Recursive function to process data options for fields like Tables, MultiSelect, etc.
         */
        const getDataOptions = (items: Array<any>) => {
            const options: Array<any> = [];

            items.forEach((item) => {
                if (Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.Table) {
                    const tableStructure = mapDataOptionTableToFormDefinitionFields(item.DataOption);
                    options.push(...getDataOptions(tableStructure));
                } else if (
                    [Enums.FormDefinitionFieldTypes.MultiSelect, Enums.FormDefinitionFieldTypes.Select].includes(
                        Enums.FormDefinitionFieldTypes[item.DataType]
                    )
                ) {
                    options.push({
                        FormDefinitionMasterID: formDefinition.MasterID,
                        ItemMasterID: item.MasterID,
                        DataOption: item.DataOption,
                    });
                }
            });

            return options;
        };

        // Gather data options
        const dataOptions = getDataOptions(formDefFields);

        const checkForItemStructureChanges = (items, originalItems = formDefinition.FormDefinitionFields || []) => {
            if (!items || !Array.isArray(items) || items.length !== originalItems.length) {
                return true; // Invalid or length mismatch
            }

            return items.some((item) => {
                const match = originalItems.find(x => x.ID === item.ID);

                if (!match) return true; // No matching item found

                // Check table data recursively if DataType is 'Table'
                if (
                    Enums.FormDefinitionFieldTypes[match.DataType] === Enums.FormDefinitionFieldTypes.Table &&
                    Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.Table
                ) {
                    const tableStructure = mapDataOptionTableToFormDefinitionFields(item.DataOption);
                    const originalTableStructure = mapDataOptionTableToFormDefinitionFields(match.DataOption as string);

                    return checkForItemStructureChanges(tableStructure, originalTableStructure);
                }

                // Compare item properties
                return (
                    item.Description !== match.Description ||
                    item.DataType !== match.DataType ||
                    item.DisplayOrder !== match.DisplayOrder ||
                    item.Required !== match.Required ||
                    item.SectionID !== match.SectionID ||
                    item.Section?.DisplayOrder !== match.Section?.DisplayOrder
                );
            });
        };
        const structureChanged = checkForItemStructureChanges(formDefFields);
        // console.log('structure changed', structureChanged);

        const newStatus = formDefinition.StructureLocked ? Enums.FormDefinitionStatus.Confirmed : structureChanged ? Enums.FormDefinitionStatus.Draft : status
        setConfirming(newStatus === Enums.FormDefinitionStatus.Confirmed);

        const sections = formDefinition.Sections?.sort(
                (a, b) =>
                    (formDefFields.find(
                        x => x.SectionID === a.ID)?.DisplayOrder || 0) - (formDefFields.find(x => x.SectionID === b.ID)?.DisplayOrder || 0)
            )
            .map((x, i) => ({...x, DisplayOrder: i})) ?? [];
        /*const sections = formDefFields.filter(x => !!x.SectionID)
            .map((x, i) => ({...x.Section, DisplayOrder: i}));*/

        // formDefinition.Sections.forEach(x => sections.some(y => y.ID === x.ID) || sections.push(x));

        // Sanitize/limit long text fields before submission
        const sanitizedValues = {
            ...values,
            Name: (values?.Name || '').slice(0, NAME_MAX),
            Description: (values?.Description || '').slice(0, DESCRIPTION_MAX),
        };

        // Prepare the Form Definition object for submission
        const formDefinitionToSave: any = {
            ...formDefinition,
            // ID: formDefinition.ID,
            ...sanitizedValues,
            ExpireTimespan: expireTimespan,
            FormDefinitionFields: formDefFields.map(x => x.SectionID ?  ({...x, Section: sections.find(y => y.ID === x.SectionID)}) : x), // map in new sections with new displayOrders
            FormDefinitionStatus: newStatus,
            Sections: sections, // updated sections with correct display orders
            // Sections: formDefFields.filter(x => !!x.Section && x.SectionID).map(x => x.Section),
            // RowVersion: formDefinition.RowVersion,
            // FormDefinitionStatus: form.values.formDefinitionStatus || Enums.FormDefinitionStatus.Draft, // Ensure status

        };

        const payload = {
            FormDefinition: formDefinitionToSave,
            FormDefinitionFields: formDefFields,
            JobTypes: sanitizedValues.JobTypes,
            FormDataOptions: dataOptions,
        } as any

        mutateFormDefinition(payload);

        /*if (submitting) {
            setNextQueuedPayload(payload)
        } else {
            // Trigger mutation
            mutateFormDefinition(payload);
        }*/
    };

    /*useEffect(() => {
        if(nextQueuedPayload && !submitting) {
            Helper.waitABit(500)
            mutateFormDefinition({
                ...nextQueuedPayload,
                FormDefinition: {
                    ...nextQueuedPayload.FormDefinition,
                    RowVersion: formDefinition.RowVersion,
                },
            });
            setNextQueuedPayload(null)
        }
    }, [submitting, nextQueuedPayload]);*/

    const {data: jobTypes, isLoading: jobTypesLoading, isError: jobTypesError} = useQuery(['jobTypes'],
        () => Fetch.get({
            url: "/JobType"
        }).then(jobTypeResponse => {
            return jobTypeResponse.Results.sort((a, b) => {
                return a.Name > b.Name ? 1 : -1;
            });
        })
    )

    const [confirming, setConfirming] = useState(false)
    const isConfirmed = useMemo(() => formDefinition.FormDefinitionStatus === Enums.FormDefinitionStatus.Confirmed, [formDefinition.FormDefinitionStatus]);

    const [formDefinitionFields, setFormDefinitionFields] = useState<FormDefinitionField[]>(
        formDefinition.FormDefinitionFields
        ?.sort((a, b) => {
            const sectionA = a.Section?.DisplayOrder ?? -1
            const sectionB = b.Section?.DisplayOrder ?? -1

            if(sectionA > sectionB) {
                return 1
            } else if (sectionA < sectionB) {
                return -1
            }
            return a.DisplayOrder > b.DisplayOrder ? 1 : -1
        })
        ?.map((x, i) => (
            {   ...x,
                'SectionHeading': x?.SectionHeading ?? (x.Section?.Heading || null),
                DisplayOrder: i,
                LineNumber: i + 1, // remember to map line number as it is used for ordering on the section table

            })) || [])

    // console.log('form definition fields', formDefinitionFields)

    const [manageFormDefItem, setManageFormDefItem] = useState(null)
    const [createNewFormDefItem, setCreateNewFromDefItem] = useState(false)

    /*useEffect(() => {
        console.log('form definition fields changed', formDefinitionFields)
    }, [formDefinitionFields]);*/

    const handleItemAction = (action: string, item: any) => {
        if (action === "delete") {
            // Extract ID of the item to be deleted
            const { ID } = item;
            // Remove the item from the formDefinitionFields
            !submitting && setFormDefinitionFields((prevFields) => {
                const updatedFields = reorderSectionsToBottom(
                    prevFields.filter((field) => field.ID !== ID)
                    );

                // Synchronize with formDefinition after removing the item
                setFormDefinition({
                    ...formDefinition,
                    FormDefinitionFields: updatedFields,
                });

                submit(form.getTransformedValues(), undefined, updatedFields);

                return updatedFields;
            });
            // Notify the user
            /*showNotification({
                title: "Item Deleted",
                message: `The item with ID ${ID} has been successfully deleted.`,
                color: "green",
            });*/
        } else if (action === 'edit') {
            !submitting && setManageFormDefItem(item);
        } else {
            console.warn(`Action "${action}" is not supported.`);
            return;
        }

    };

    const [editingSection, setEditingSection] = useState<Section | null>(null)

    const handleSectionItemAction = (action: string, tableGroup: any) => {

        // console.log(action, sectionItem);

        if (action === 'delete') {
            const { id } = tableGroup;
            // Confirm deletion
            const confirmDelete = true

            if (confirmDelete) {
                // Remove item from form definition fields
                setFormDefinitionFields((prevFields) => {
                    const filtered = reorderSectionsToBottom(prevFields.filter((field) => field.SectionID !== id))

                    setFormDefinition({
                        ...formDefinition,
                        FormDefinitionFields: filtered,
                    });

                    submit(form.getTransformedValues(), undefined, filtered);
                    return filtered;
                });



               /* showNotification({
                    title: 'Success',
                    message: 'Section item deleted successfully!',
                    color: 'green',
                });*/
            }
        } else if (action === 'edit') {
            const { id } = tableGroup;
            setEditingSection(formDefinitionFields.find(x => x.SectionID === id)?.Section || null);
        } else {
            console.warn(`Action ${action} is not handled.`);
        }
    };

    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    const allowNavRef = useRef(false);
    const allowNavigation = () => {
        allowNavRef.current = true;
    };
    const checkConfirmNavigation = () => {
        return () => !isNew && !isConfirmed && !form.isDirty() && form.values.IsActive && !allowNavRef.current;
    };
    Helper.preventRouteChange(form.isDirty(), () => form.resetDirty(), setConfirmOptions, () => submit(form.getTransformedValues()));
    Helper.preventRouteChangeGeneric(checkConfirmNavigation(), allowNavigation,
        "Form is not confirmed",
        "Are you sure you want to navigate away? A draft form will not be visible to users in its current version.",
        (x) => setConfirmOptions(x)
    );

    const [printing, setPrinting] = useState(false)
    const preview = async () => {
        setPrinting(true);
        await DownloadService.downloadFile('POST', '/FormDefinition/Preview', {
            formDefinitionID: formDefinition.ID
        }, true, undefined, "", "", null, false, (() => {
            setPrinting(false);
        }) as any);
    }

    const confirmFormDefinition = async () => {
        setConfirming(true);
        setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            display: true,
            confirmButtonText: "Publish",
            heading: "Publish form?",
            text: "Publishing will make this form available to users for jobs and customers.",
            onCancel: () => setConfirming(false),
            onConfirm: () => {
                submit(form.getTransformedValues(), undefined, undefined, Enums.FormDefinitionStatus.Confirmed)
            }
        })
    };

    const onTableInputChange = (name: string, item: any, value: any) => {
        // Update the individual field in formDefinitionFields
        if (name === 'Description') {
            setFormDefinitionFields(prevFields => {
                const updatedFields = reorderSectionsToBottom(
                    prevFields.map((field, index) =>
                    (field.ID === item.ID) ? {...field, ...item, Description: value} : field
                ))

                console.log('updated fields', updatedFields, formDefinition)

                // Reflect the change in the parent form definition too
                setFormDefinition({
                    ...formDefinition,
                    FormDefinitionFields: updatedFields,
                });

                submit(form.getTransformedValues(), undefined, updatedFields);

                return updatedFields;
            });
        }
        // Optionally trigger form submission or validation
    };

    return (
        <>
            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <form onSubmit={form.onSubmit(submit)}>

                <LoadingOverlay
                    visible={formDefinitionQuery.isFetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}
                />

                <Flex align={'center'} justify={'space-between'} mt={'sm'} wrap={'wrap-reverse'}>
                    <Flex align={'center'} gap={'sm'} justify={'space-between'} wrap={'nowrap'} style={{flexGrow: 1}}>
                        <Title order={3} c={'scBlue'}>
                            {
                                isNew ? 'Create Form' :
                                    `Editing ${form.values.Name} `
                            // [${formDefinition.FormDefinitionStatus === Enums.FormDefinitionStatus.Confirmed ? "Live" : "Draft"}]
                            }
                        </Title>

                        {
                            /*formDefinition.Version !== 0 &&
                            <Text c={'dark.6'} w={50} ml={'auto'} size={'xl'} fw={600}>
                                v{formDefinition.Version}
                            </Text>*/
                        }

                    </Flex>

                    {
                        !isNew &&
                        <Flex justify="flex-end" direction={"row"} gap={8} align="center" wrap={'wrap'} mb={'sm'} ml={'auto'}>
                            <>
                                {/* Top-right actions: Preview and Deactivate/Reactivate only */}
                                <Button
                                    loading={printing}
                                    onClick={() => preview()}
                                    disabled={submitting}
                                    variant="outline"
                                    color={'scBlue'}
                                    type={'button'}
                                >
                                    Preview
                                </Button>

                                <Button
                                    disabled={submitting || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                    onClick={() => !submitting && submit({...form.getTransformedValues(), IsActive: !form.values.IsActive}, undefined, undefined, Enums.FormDefinitionStatus.Draft)}
                                    variant="outline"
                                    color={form.values.IsActive ? 'red' : 'scBlue'}
                                    type={'button'}
                                    // ml={'md'}
                                >
                                    {form.values.IsActive ? "Deactivate" : 'Reactivate'}
                                </Button>
                            </>
                        </Flex>
                    }

                </Flex>
                {
                    !isNew && (
                        <Text c={'dark.6'} size={'sm'} mb={'sm'}>
                            {`Last Updated: ${moment(formDefinition.ModifiedDate || formDefinition.CreatedDate).format('DD MMM, h:mmA')} • Version ${formDefinition.Version ?? 0}`}
                        </Text>
                    )
                }
                {
                    isNew &&
                    <Text c={'dark.7'} size={'sm'} mt={'xs'} mb={'sm'}>
                        {
                            /*isConfirmed ? 'The form is confirmed and ready for use.' :
                                'The form is in draft status and will not be usable until confirmed.'*/
                        }

                        <div>
                            Create custom forms to collect customer information or capture on-site job details. <br/>
                            Build as many as you need — from onsite checklists to inspection guides — and tailor them
                            to different job types.
                        </div>

                        <br/>

                        {
                            /*isConfirmed ? 'Updates have been published.' :
                                'Updates have not been published yet.'*/
                        }

                    </Text>
                }
                <Flex wrap={'wrap'} gap={'sm'} direction={{base: 'column', md: 'row'}}>
                    <Box maw={500} style={{flexGrow: 1}}>
                        <ScTextControl
                            label="Name"
                            placeholder="Name of the form"
                            withAsterisk
                            maxLength={NAME_MAX}
                            {...form.getInputProps('Name')}
                        />
                    </Box>

                    <Box maw={500} style={{flexGrow: 1}}>
                        <ScTextAreaControl
                            autosize
                            maxRows={20}
                            label="Description"
                            placeholder="Description"
                            maxLength={DESCRIPTION_MAX}
                            {...form.getInputProps('Description')}
                        />
                        <Text
                            size={'xs'}
                            c={(form.values?.Description?.length || 0) > DESCRIPTION_MAX ? 'yellow.7' : 'dimmed'}
                        >
                            {(form.values?.Description?.length || 0)} / {DESCRIPTION_MAX}
                            {(form.values?.Description?.length || 0) > DESCRIPTION_MAX ? ' – please shorten' : ''}
                        </Text>
                    </Box>
                </Flex>
                <Flex wrap={'wrap'} gap={'sm'}>
                    <Box maw={500} style={{flexGrow: 1}}>
                        <Flex align={'center'} gap={'xs'} mt={'sm'}>
                            <Text fw={500} size={'sm'}>Link form to</Text>
                            <Tooltip label={"Link the form to a job or customer"} color={'scBlue'}>
                                <ActionIcon variant={'transparent'} color={'scBlue'} radius={'xl'}>
                                    <IconInfoCircle size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Flex>
                        <SCDropdownList
                            mt={0}
                            name="FormRule"
                            options={Enums.getEnumItemsVD(Enums.FormRule).filter(x => x.value !== 0)}
                            {...form.getInputProps('FormRule')}
                            onChange={(x) => form.setFieldValue('FormRule', x)}
                            required={true}
                            dataItemKey={"value"}
                            textField={"description"}
                            disabled={!isNew}
                            mantineComboboxProps={{ withinPortal: true }}
                        />

                        {
                            (!isNew && formDefinition.NonExpiring) || !form.values.FormRule || (form.values.FormRule.value !== Enums.FormRule.Customer) ? "" : <>
                                <Box maw={500} style={{alignSelf: 'end'}} mb={0}>
                                    <SCSwitch label="Form Expires"
                                              checked={form.values.formExpires}
                                              onToggle={(checked) => {
                                                  form.setFieldValue('formExpires', checked);
                                                  if (checked) {
                                                      form.setFieldValue('FormExpiresTimespan', 1 * 60 * 24 * 7); // 1 week default
                                                  } else {
                                                      form.setFieldValue('FormExpiresTimespan', 0);
                                                  }
                                              }}
                                    />
                                </Box>
                                {
                                    form.values.formExpires &&
                                    <Flex wrap={'wrap'} gap={0} maw={500}>
                                        <MinuteSelector
                                            {...{} as any}
                                            label="Form Expiration"
                                            // value={form.values.FormExpiresTimespan}
                                            name="ExpireTimespan"
                                            required={true}
                                            // error={inputErrors.ExpireTimespan}
                                            defaultUnit="Month"
                                            readOnly={formDefinition.StructureLocked}
                                            {...form.getInputProps('FormExpiresTimespan')}
                                            // onChange={(e) => console.log(e)}
                                        />
                                    </Flex>
                                }
                            </>
                        }

                    </Box>

                    <Box maw={500} style={{flexGrow: 1}}>
                        <Flex align={'center'} gap={'xs'} mt={'sm'}>
                            <Text fw={500} size={'sm'}>Job types</Text>
                            <Tooltip color={'scBlue'} label={"Specify which job types this form applies to"}>
                                <ActionIcon variant={'transparent'} color={'scBlue'} radius={'xl'}>
                                    <IconInfoCircle size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Flex>
                        <SCMultiSelect availableOptions={jobTypes} selectedOptions={form.values.JobTypes}
                                       mt={0 as any}
                                       textField={'Name'} dataItemKey={'ID'}
                                       {...form.getInputProps('JobTypes')}
                        />

                        {/*{!isNew && !formDefinition.StructureLocked &&
                            <SCSwitch
                                label="Active"
                                checked={form.values.IsActive}
                                onToggle={(p) => form.setFieldValue('IsActive', p)}
                            />
                        }*/}
                    </Box>

                </Flex>


                {/* Single-use checkbox (create and edit) */}
                <Box mt={'xl'} mb={'md'}>
                    <Text c={'dark.7'} size={'sm'}>
                        Re-use forms up to 20 times per job, or restrict them to single-use only.
                    </Text>
                    <Flex align={'center'} gap={'xs'} mt={'xs'}>
                        <Checkbox
                            label="Single use only"
                            checked={!form.values.MultiUse}
                            disabled={!isNew && !!form.values.MultiUse}
                            onChange={(e) => {
                                const singleUse = e.currentTarget.checked;
                                if (isNew) {
                                    // On create, freely toggle between single and multi use
                                    form.setFieldValue('MultiUse', !singleUse);
                                } else {
                                    // On edit
                                    if (!singleUse) {
                                        // Switching from single-use to multi-use requires confirmation and is permanent
                                        setConfirmOptions({
                                            ...Helper.initialiseConfirmOptions(),
                                            display: true,
                                            heading: 'Change to multi-use?',
                                            text: 'Multi-use forms cannot be changed back to single-use once saved. Are you sure you want to proceed?',
                                            confirmButtonText: 'Make multi-use permanently',
                                            cancelButtonText: 'Cancel',
                                            onCancel: () => {
                                                // Revert visual state to single-use
                                                form.setFieldValue('MultiUse', false);
                                                setConfirming(false);
                                            },
                                            onConfirm: () => {
                                                // Do not auto-save. Mark form dirty and let user Save/Publish.
                                                form.setFieldValue('MultiUse', true);
                                                setFormDefinition({...formDefinition, FormDefinitionStatus: Enums.FormDefinitionStatus.Draft});
                                                /*showNotification({
                                                    message: 'Changed to multi-use. Publish to apply.',
                                                    color: 'scBlue',
                                                    autoClose: 2000
                                                });*/
                                            }
                                        });
                                    }
                                    // If trying to set singleUse=true on edit while already multi-use, control is disabled above
                                }
                            }}
                        />
                        <Tooltip
                            color={'scBlue'}
                            label={
                                isNew
                                    ? <>
                                        <Text size={'sm'} fw={600}>Leaving this unchecked makes the form multi-use</Text>
                                        <Text size={'sm'}>Multi-use forms cannot be changed back to single-use once saved</Text>
                                    </>
                                    : (!form.values.MultiUse
                                        ? 'Multi-use forms cannot be changed back to single-use once saved'
                                        : 'This form is multi-use and cannot be changed to single use')
                            }
                        >
                            <ActionIcon variant={'transparent'} color={'scBlue'} radius={'xl'}>
                                <IconInfoCircle size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Flex>
                </Box>


                {
                    isNew &&
                    <Flex justify={'end'} mt={'xl'} gap={5}>
                        <Link href={'/settings/form/list'}>
                            <Button variant={'outline'} color={'gray.7'} onClick={() => Helper.nextLinkClicked('/settings/form/list')} disabled={submitting}  >
                                Cancel
                            </Button>
                        </Link>
                        <Button variant={'scBlue'} type={'submit'} loading={submitting}>
                            Create
                        </Button>
                    </Flex>
                }


                {!isNew && <>

                    <div>

                        {
                            (manageFormDefItem || createNewFormDefItem) &&
                            <ManageFormDefinitionField
                                savingForm={submitting}
                                formDefinitionField={manageFormDefItem}
                                saveFormDefinitionField={(fieldToSave, andClose?: boolean) => {
                                    if (fieldToSave) {
                                        if (createNewFormDefItem) {
                                            setFormDefinitionFields(p => {
                                                const updatedFormDefinitionFields = reorderSectionsToBottom(p.concat({
                                                    ...fieldToSave,
                                                    SectionHeading: fieldToSave.Section?.Heading,
                                                    // DisplayOrder: fieldToSave.DisplayOrder || p.length,
                                                    DisplayOrder: p.length,
                                                    LineNumber: p.length + 1,
                                                    // ID: 'new' + Date.now(),
                                                }));
                                                setFormDefinition({
                                                    ...formDefinition,
                                                    FormDefinitionFields: updatedFormDefinitionFields
                                                });
                                                form.validate() && submit(form.getTransformedValues(), undefined, updatedFormDefinitionFields)
                                                return updatedFormDefinitionFields;
                                            });
                                        } else {
                                            setFormDefinitionFields(p => {
                                                const sectionIdChanged = fieldToSave.SectionID !== p.find(x => x.ID === fieldToSave.ID)
                                                let sectionItemLastIndex = -1
                                                sectionIdChanged && p.forEach(x => {
                                                    if (x.SectionID === fieldToSave.SectionID) {
                                                        sectionItemLastIndex = x.DisplayOrder + 1
                                                    }
                                                })
                                                const updatedFormDefinitionFields = reorderSectionsToBottom(p.map(x => x.ID === fieldToSave.ID ? ({
                                                    ...fieldToSave,
                                                    DisplayOrder: sectionIdChanged ? fieldToSave.SectionID ? sectionItemLastIndex : p.length + 1 : x.DisplayOrder,
                                                    LineNumber: sectionIdChanged ? fieldToSave.SectionID ? sectionItemLastIndex + 1 : p.length + 1 : x.LineNumber,
                                                    SectionHeading: fieldToSave.Section?.Heading,
                                                }) : x));
                                                setFormDefinition({
                                                    ...formDefinition,
                                                    FormDefinitionFields: updatedFormDefinitionFields
                                                });
                                                form.validate() && submit(form.getTransformedValues(), undefined, updatedFormDefinitionFields)
                                                return updatedFormDefinitionFields;
                                            });
                                        }
                                    }
                                    if(andClose !== false) {
                                        setCreateNewFromDefItem(false);
                                        setManageFormDefItem(null);
                                    }
                                }}
                                isNew={createNewFormDefItem}
                                formDefinition={formDefinition}
                                updateFormDefinition={(x) => console.log('update form definition', x, 'not implemented')}
                                structureLocked={formDefinition.StructureLocked}
                            />
                        }

                        {
                            editingSection && <>
                            <ManageSection
                                onSave={(saveItem: Section) => {
                                    if (saveItem) {
                                        setFormDefinitionFields(p => reorderSectionsToBottom(p.map(x => x.SectionID === saveItem.ID ? ({...x, Section: saveItem, SectionHeading: saveItem.Heading}) : x)));
                                    }
                                    setEditingSection(null);
                                    setEditingSection(null)
                                    formDefinitionQuery.refetch()
                                }}
                                module={Enums.Module.FormDefinition}
                                dontSubmit={!formDefinition || !formDefinition.ID}
                                itemID={formDefinition.ID ?? null}
                                sectionID={editingSection.ID}
                                newSection={false}
                                displayOrder={editingSection.DisplayOrder || formDefinition?.Sections?.length || 0}
                            />
                            {/*<ManageSection
                                onSave={console.log}
                                module={Enums.Module.FormDefinition}
                                dontSubmit={!formDefinition || !formDefinition.ID}
                                itemID={formDefinition && formDefinition.ID ? formDefinition.ID : null}
                                sectionID={editingSection ? editingSection.ID : null}
                                newSection={editingSection ? editingSection : null}
                                // newSection={null}
                                displayOrder={editingSection ? editingSection.DisplayOrder : formDefinition && formDefinition.Sections ? formDefinition.Sections.length : 0}
                            />*/}
                        </>
                        }

                        <Box maw={850}>
                            <SectionTable
                                sectionHeaderDisplayValueFunction={x => {
                                    // console.log(x)
                                    const section = formDefinition.Sections.find(y => y.ID === x.id);
                                    return <Flex align={'center'} justify={'space-between'} gap={5}>{section?.Heading} {section?.Repeatable && <Text size={'sm'} fs={'italic'}>( Repeatable )</Text>}</Flex>
                                }}
                                savingItem={submitting}
                                allowSections={false}
                                stylingProps={{
                                    compact: true,
                                    darkerText: true
                                }}
                                data={formDefinitionFields}
                                height={'100%'}
                                mapping={
                                // placeholder header when no fields are added
                                formDefinitionFields.length === 0 ? [
                                    {
                                        key: 'Description',
                                        type: 'textArea',
                                        label: 'Add fields to your form'
                                    },
                                    {
                                        key: 'spacer1',
                                        type: 'textArea',
                                        label: <>&nbsp;</>,
                                    },
                                    {
                                        key: 'spacer2',
                                        type: 'textArea',
                                        label: <>&nbsp;</>,
                                    },
                                    {
                                        key: 'spacer3',
                                        type: 'textArea',
                                        label: <>&nbsp;</>,
                                    },
                                ] :
                                [
                                    /*{
                                        key: 'InventoryCode',
                                        label: '',
                                        valueFunction: (item: any) => <Flex align={'center'}><Text>Edit</Text></Flex>,
                                        linkAction: 'edit'
                                    },*/
                                    {
                                        key: 'Description',
                                        type: 'textArea',
                                        label: 'Description',
                                        placeholderFunction: () => 'Enter Field Description *',
                                        maxLength: 42,
                                    },
                                    {
                                        key: 'DataType',
                                        // type: 'status',
                                        // columnWidth: 50,
                                        // type: 'selectInput',
                                        label: 'Type',
                                        valueFunction: (x) => Enums.FormDefinitionFieldTypes[x.DataType],
                                        linkAction: 'edit'
                                        // selectOptions: Enums.getEnumItemsVD(Enums.FormDefinitionFieldTypes, true, true).map(x => ({label: x.description, ...x}))
                                    }
                                ]}
                                onInputChange={onTableInputChange}
                                // onItemClicked={console.log}
                                onDataUpdate={(newItems) => {

                                    const updatedFields = reorderSectionsToBottom(newItems.map((x, i) => (
                                        {
                                            ...x,
                                            DisplayOrder: (x.LineNumber - 1) || i,
                                            Section: x.SectionID ?
                                                {
                                                    ...formDefinitionFields.find(y => y.SectionID === x.SectionID)?.Section,
                                                    Heading: x.SectionHeading,
                                                } : null
                                        }
                                    )));
                                    // console.log('onDataUpdate', newItems, formDefinitionFields, updatedFields);
                                    setFormDefinitionFields(updatedFields);
                                    submit(form.getTransformedValues(), undefined, updatedFields);
                                }}
                                onSectionItem={handleSectionItemAction}
                                onAction={handleItemAction}
                                sectionControls={
                                    [
                                        ...(!formDefinition.StructureLocked ?
                                            [
                                                {
                                                    name: 'edit',
                                                    icon: IconEdit,
                                                    color: 'scBlue',
                                                    label: 'Edit Section'
                                                },
                                                {
                                                    name: 'ungroup'
                                                },
                                                {
                                                    name: 'delete',
                                                    icon: IconTrash,
                                                    color: 'yellow.7',
                                                    label: 'Delete Section',
                                                }
                                            ] : [])
                                    ]}
                                showControlsOnHover={false}
                                controls={[
                                    ...(!formDefinition.StructureLocked ? [
                                        {
                                            name: 'edit',
                                            icon: <IconEdit/>,
                                            label: 'Edit',
                                            buttonProps: {disabled: submitting}
                                        },
                                        {
                                            name: 'delete',
                                            icon: <IconTrash/>,
                                            type: 'warning' as any,
                                            label: 'Remove',
                                            buttonProps: {ml: 20, disabled: submitting}
                                        },
                                    ] : [])
                                ]}
                                sectionTitleKey={'SectionHeading'}
                                sectionIdKey={'SectionID'}
                                module={Enums.Module.FormDefinition}
                                itemId={''}
                                canEdit={!formDefinition.StructureLocked && !submitting}
                                addButton={{
                                    customComponent: <Flex w={'100%'} gap={'md'}>
                                        {!formDefinition.StructureLocked && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && <>
                                            <Button c={'scBlue'}
                                                    onClick={
                                                        () => setCreateNewFromDefItem(true)
                                                    }
                                                    size={'compact-sm'}
                                                    variant={'transparent'}
                                                    type={'button'}
                                            >
                                                <IconPlus size={16}/>
                                                <Anchor size={'sm'}>
                                                    Add Field
                                                </Anchor>
                                            </Button>
                                        </>}
                                    </Flex>
                                }}
                            />
                        </Box>


                        {/*Legacy
                    <FormDefinitionFields key={1}
                                          formDefinitionFields={formDefinition.FormDefinitionFields}
                                          updateFormDefinitionFields={console.log}
                                          inputErrors={[]} accessStatus={accessStatus}
                                          formDefinition={formDefinition} updateFormDefinition={setFormDefinition}
                                          structureLocked={formDefinition.StructureLocked}
                    />*/}
                    </div>

                    <Flex justify={'flex-end'} mt={'xl'} gap={16} wrap={'wrap'}>
                        <Link href={'/settings/form/list'}>
                            <Button variant={'outline'} color={'gray.6'} onClick={() => Helper.nextLinkClicked('/settings/form/list')} disabled={submitting} type={'button'}>
                                Cancel
                            </Button>
                        </Link>
                        <Button color={'scBlue'} variant={'outline'} type={'submit'} loading={submitting} disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}>
                            {submitting && !confirming ? 'Saving' : 'Save'}
                        </Button>
                        <Button
                            color={'scBlue'}
                            variant={'filled'}
                            type={'button'}
                            onClick={() => !submitting && confirmFormDefinition()}
                            loading={confirming}
                            disabled={
                                formDefinitionFields.length === 0 || isConfirmed || submitting || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess
                            }
                        >
                            {submitting && confirming ? 'Publishing' : 'Publish'}
                        </Button>
                    </Flex>
                </>
                }

            </form>

        </>
    );
};

export default ManageFormDefinition;
