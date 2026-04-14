import SCInput from '@/components/sc-controls/form-controls/sc-input';
import { SignatureTemplate } from '@/interfaces/api/models';
import signatureService from '@/services/signature/signature-service';
import helper from '@/utils/helper';
import { Button, Flex, Title } from '@mantine/core';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import * as Enums from '@/utils/enums';
import SubscriptionContext from '@/utils/subscription-context';
import ModuleSelector from '@/components/selectors/module/module-selector';
import SignatureTypeSelector from '@/components/selectors/signature/signature-type-selector';
import SCCheckbox from '@/components/sc-controls/form-controls/sc-checkbox';
import SCTextArea from '@/components/sc-controls/form-controls/sc-textarea';
import SCSwitch from '@/components/sc-controls/form-controls/sc-switch';
import ToastContext from '@/utils/toast-context';
import { colors, layout } from '@/theme';
import { useRouter } from 'next/router';

const allowModules: number[] = [
    Enums.Module.FormHeader
];

const allowSignatureTypes: number[] = [
    Enums.SignatureType.Customer,
    Enums.SignatureType.Employee
];

const SignatureTemplateManageComponent: FC<{
    id?: string
    onChange?: (signatureTemplate: SignatureTemplate | null) => void
    dirtyChanged?: (isDirty: boolean) => void
    onCancel?: () => void
    onSave?: (signatureTemplate: SignatureTemplate) => void
    backButton?: { label: string }
}> = ({ id, onChange, dirtyChanged, onCancel, onSave, backButton }) => {

    const subscriptionContext = useContext(SubscriptionContext);
    const [signatureTemplate, setSignatureTemplate] = useState<SignatureTemplate | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [accessStatus, setAccessStatus] = useState((subscriptionContext as any)?.subscriptionInfo?.AccessStatus);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const toast = useContext(ToastContext);
    const [linkedItems, setLinkedItems] = useState<{ Module: string, Description: string, ExtraInfo?: string }[]>([]);
    const router = useRouter();

    const populateSignatureTemplate = async () => {
        let temp: SignatureTemplate | null = null;
        if (id) {
            temp = await signatureService.getSignatureTemplate(id);
        } else {
            temp = {
                IsActive: true,
                ID: helper.newGuid(),
                AllowResign: true,
                HideSignature: false,
                UseQRCode: true,
                Terms: "",
                UserInstruction: ""
            };
        }
        setSignatureTemplate(temp);
    }

    useEffect(() => {
        populateSignatureTemplate();
        getLinkedItems();
    }, []);

    const getLinkedItems = async () => {
        if (id) {
            let items = await signatureService.getLinkedItemsForSignatureTemplate(id);
            setLinkedItems(items);
        }
    };

    useEffect(() => {
        onChange && onChange(signatureTemplate);
    }, [signatureTemplate]);

    useEffect(() => {
        dirtyChanged && dirtyChanged(isDirty);
    }, [isDirty]);

    const disabled = useMemo(() => {
        return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithAccess;
    }, [accessStatus]);

    const inputChange = (e: any) => {
        inputChangeBulk([e]);
    }

    const inputChangeBulk = (es: any[]) => {
        let temp = { ...signatureTemplate };
        es.forEach(e => {
            temp[e.name] = e.value;
        });
        setSignatureTemplate(temp);
        setIsDirty(_ => true);
    }

    const validate: () => boolean = () => {

        let inputs = [
            { key: 'Name', value: signatureTemplate?.Name, required: true, type: Enums.ControlType.Text },
            { key: 'SignatureType', value: signatureTemplate?.SignatureType, required: true, type: Enums.ControlType.Select }
        ];

        const [isValid, errorsOut] = helper.validateInputsArrayOut(inputs);
        setErrors(errorsOut);

        return isValid as boolean;
    };

    const saveSignatureTemplate = async () => {
        if (!validate()) return false;

        setIsSubmitting(true);

        let temp = await signatureService.saveSignatureTemplate(signatureTemplate ?? {}, !id, toast)
        if (temp?.ID) {
            (toast as any).setToast({
                message: 'Signature Template saved successfully',
                show: true,
                type: Enums.ToastType.success
            });
            setIsDirty(false);
            setSignatureTemplate(temp);
            await helper.waitABit(50);
            onSave && onSave(temp);
        }

        setIsSubmitting(false);
        return !!(temp?.ID);
    };

    const signatureTypeChanged = (val) => {

        let isEmployee = val === Enums.SignatureType.Employee;
        let isCustomer = val === Enums.SignatureType.Customer;

        let hideSignature = isEmployee ? false : isCustomer ? true : (signatureTemplate?.HideSignature ?? false);
        let qrCode = isEmployee ? false : isCustomer ? true : (signatureTemplate?.UseQRCode ?? false);
        let reSign = isEmployee ? true : isCustomer ? false : (signatureTemplate?.AllowResign ?? false);

        inputChangeBulk([
            { name: "SignatureType", value: val },
            { name: "HideSignature", value: hideSignature },
            { name: "UseQRCode", value: qrCode },
            { name: "AllowResign", value: reSign }
        ]);
    }

    return (<>

        <div style={{ display: "flex", justifyContent: "space-between" }}>

            <div style={{ display: "flex", alignContent: "center" }}>


                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={16}
                    fw={600}
                    mt={"0.5rem"}
                >
                    {!!id ? 'Edit Signature Template' : 'Create Signature Template'}
                </Title>
            </div>
            {!!id && <div>
                {onCancel &&
                    <Button
                        onClick={onCancel}
                        disabled={disabled || isSubmitting}
                        size={'xs'}
                        mr={'xs'}
                        variant='outline'
                    >
                        {isDirty ? "Cancel" : "Close"}
                    </Button>
                }
                {backButton && <>
                    <Button
                        onClick={() => router.back()}
                        size='sm'
                        variant='subtle'
                        mr="1rem"
                    >
                        {backButton.label}
                    </Button>
                </>}
                <Button
                    onClick={saveSignatureTemplate}
                    disabled={disabled || isSubmitting || !isDirty}
                    size={'xs'}
                >
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>
            </div>
            }
            {!id && backButton && <>
                <Button
                    onClick={() => router.back()}
                    size='sm'
                    variant='subtle'
                    mr="1rem"
                >
                    {backButton.label}
                </Button>
            </>}
        </div>

        <SCInput
            label='Name'
            name={"Name"}
            error={errors.Name}
            value={signatureTemplate?.Name ?? ""}
            required={true}
            disabled={disabled}
            onChange={inputChange}
        />

        {/* <ModuleSelector
            name='Module'
            value={signatureTemplate?.Module ?? null}
            disabled={disabled}
            optionFilter={(x) => allowModules.includes(x)}
            optionProcessor={(value, description) => value === Enums.Module.FormHeader ? "Form" : description}
            label='Module'
            error={errors.Module}
            required={false}
            onChange={(val) => inputChange({ name: "Module", value: val })}
            canClear={true}
        /> */}

        <SignatureTypeSelector
            name='SignatureType'
            value={signatureTemplate?.SignatureType ?? null}
            disabled={disabled || !!id}
            optionFilter={(x) => allowSignatureTypes.includes(x)}
            label='Signature type'
            error={errors.SignatureType}
            required={true}
            onChange={signatureTypeChanged}
            canClear={!id}
        />

        <SCTextArea
            error={errors.Terms}
            name='Terms'
            label='Terms of acceptance'
            value={signatureTemplate?.Terms}
            maxLength={4000}
            required={false}
            disabled={disabled}
            onChange={inputChange}
        />

        {/* Hide this permanently unless we ever need it */}
        {false &&
            <SCTextArea
                error={errors.UserInstruction}
                name='UserInstruction'
                label='User instruction'
                value={signatureTemplate?.UserInstruction}
                maxLength={4000}
                required={false}
                disabled={disabled}
                onChange={inputChange}
            />
        }

        {signatureTemplate?.SignatureType === Enums.SignatureType.Customer &&
            <SCCheckbox
                disabled={disabled}
                name='UseQRCode'
                label='Use QR code'
                onChangeFull={inputChange}
                value={signatureTemplate?.UseQRCode as any}
            />
        }

        <SCCheckbox
            disabled={disabled}
            name='AllowResign'
            label='Allow re-sign'
            onChangeFull={inputChange}
            value={signatureTemplate?.AllowResign as any}
        />

        <SCCheckbox
            disabled={disabled}
            name='HideSignature'
            label='Do not display signature once signed'
            onChangeFull={inputChange}
            value={signatureTemplate?.HideSignature as any}
        />

        {!!id && (!linkedItems || linkedItems.length === 0) && <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div></div>
            <SCSwitch
                checked={signatureTemplate?.IsActive}
                disabled={disabled}
                name='IsActive'
                label='Active'
                onToggle={(val) => inputChange({ name: "IsActive", value: val })}
            />
        </div>}

        {!id && <div style={{ marginTop: "1rem" }}>
            {onCancel &&
                <Button
                    onClick={onCancel}
                    disabled={disabled || isSubmitting}
                    size={'xs'}
                    mr={'xs'}
                    variant='outline'
                >
                    Cancel
                </Button>
            }
            <Button
                onClick={saveSignatureTemplate}
                disabled={disabled || isSubmitting || !isDirty}
                size={'xs'}
            >
                {isSubmitting ? "Saving..." : "Create"}
            </Button>
        </div>}

        {!!id && <div className={"template-usage-table table-container"}>

            <Title
                my={'var(--mantine-spacing-lg)'}
                size={16}
                fw={600}
                mt={"0.5rem"}
                mb={"0rem"}
            >
                Linked to 
            </Title>

            {/* {signatureTemplate?.Module === Enums.Module.FormHeader ? "Forms" : Enums.getEnumStringValue(Enums.Module, signatureTemplate?.Module, true)} */}

            <table className="table">
                <thead>
                    <tr>
                        <th className="header-item-code">
                            Module
                        </th>
                        <th className="header-item-desc">
                            Description
                        </th>
                        <th className="header-item-type">
                            Extra Info
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {linkedItems?.map((item, index) => {
                        return <tr key={index}>
                            <td className="body-item-code" >
                                {item.Module}
                            </td>
                            <td className="body-item-desc">
                                {item.Description}
                            </td>
                            <td className="body-item-type">
                                {item.ExtraInfo ?? ""}
                            </td>
                        </tr>
                    })}
                    {!linkedItems || linkedItems.length === 0 && <tr>
                        <td style={{ fontStyle: "italic", textAlign: "center" }} colSpan={3}>
                            No items are currently linked to this template
                        </td>
                    </tr>}
                </tbody>
            </table>

        </div>}

        <style jsx>{`
            .template-usage-table {
                margin-top: 1rem;
            }

            .table-container {
                overflow-x: auto;
                max-width: 500px;
                display: flex;
                flex-direction: column;
            }
            .table {
                border-collapse: collapse;
                margin-top: 0.5rem;
                width: 100%;
            }
            .table thead tr {
                background-color: ${colors.backgroundGrey};
                height: 2rem;
                border-radius: ${layout.cardRadius};
                width: 100%;
            }
            .table th {
                color: ${colors.darkPrimary};
                font-size: 0.75rem;
                font-weight: normal;
                padding: 4px 1rem 4px 0; 
                position: relative;
                text-align: left;
                text-transform: uppercase;
                transform-style: preserve-3d;
                user-select: none;
                white-space: nowrap;
            }
            .table th.number-column {
                padding-right: 0;
                text-align: right;
            }
            .table th:last-child {
                padding-right: 1rem;
                text-align: right;
            }
            .table th:first-child {
                padding-left: 0.5rem;
                text-align: left;
            }
            .table .spacer {
             height: 0.75rem !important;
            }
            .table tr {
                height: 2rem;
                /* cursor: pointer; */
            }
            .table td {
                font-size: 12px;
                padding-right: 1rem;
            }
            .table td.number-column {
                padding-right: 0;
                text-align: right;
            }
            .table tr:nth-child(even) td {
                background-color: ${colors.backgroundGrey}55;
            }
            .table td:last-child {
                border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
                text-align: right;
            }
            .table td:last-child :global(div){
                margin-left: auto;
            }
            .table td:first-child {
                border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
                padding-left: 1rem;
                text-align: left;
            }
            .table td:first-child :global(div){
                margin-left: 0;
            }
        `}</style>
    </>);
};

export default SignatureTemplateManageComponent;