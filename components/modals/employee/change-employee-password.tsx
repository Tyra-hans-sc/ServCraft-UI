import SCModal from '@/PageComponents/Modal/SCModal';
import SCPasswordInput from '@/components/sc-controls/form-controls/sc-password-input';
import helper from '@/utils/helper';
import {Alert, Button, Flex, Text, Title} from '@mantine/core';
import { FC, useContext, useState } from 'react';
import * as Enums from '@/utils/enums';
import ToastContext from '@/utils/toast-context';
import Fetch from '@/utils/Fetch';
import { logout } from '@/utils/auth';
import {IconInfoCircle} from "@tabler/icons-react";
import { showNotification } from '@mantine/notifications';
import Storage from '@/utils/storage';

type ChangeEmployeePasswordProps = {
    employeeID: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    userwords: string[];
    title?: string;
    message?: string;
    enforced?: boolean;
}

const ChangeEmployeePassword: FC<ChangeEmployeePasswordProps> = ({ employeeID, isOpen, setIsOpen, userwords, title, message, enforced }) => {

    const toast = useContext(ToastContext);

    const [inputs, setInputs] = useState({
        ownerPassword: "",
        confirmOwnerPassword: ""
    });

    const [inputErrors, setInputErrors] = useState<any>({
    });

    const [saving, setSaving] = useState(false);

    // Build a consistent set of user/company words for password strength checks (fallback if prop is missing/empty)
    const cookieUserwords = [
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servUserName) : undefined,
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servFullName) : undefined,
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servCompanyName) : undefined,
    ].filter(Boolean) as string[];
    const combinedUserwords: string[] = ((userwords && userwords.length > 0) ? userwords : []).concat(cookieUserwords)
        .filter(Boolean)
        // de-dupe while preserving order
        .filter((v, i, a) => a.indexOf(v) === i);

    const handleInputChange = (e) => {
        let setter = {
            ...inputs,
            [e.name]: e.value
        };
        setInputs(setter);
    };

    const updateOwnerPassword = async () => {
        setSaving(true);
        let validationItems = [
            { key: 'ownerPassword', value: inputs.ownerPassword, required: true, type: Enums.ControlType.Text },
            { key: 'confirmOwnerPassword', value: inputs.confirmOwnerPassword, required: true, type: Enums.ControlType.Text, equalsPassword: inputs.ownerPassword }
        ];

        let { isValid, errors } = helper.validateInputs(validationItems);

        // Reusable password strength validation
        const strengthError = helper.getPasswordStrengthError(inputs.ownerPassword, { userwords: combinedUserwords });
        if (strengthError) {
            isValid = false;
            errors.ownerPassword = strengthError;
        }

        if (inputs.ownerPassword.length > 100) {
            isValid = false;
            errors.ownerPassword = 'Please use a password of 100 characters or less';
        }

        setInputErrors(errors);

        if (isValid) {
            let result = await Fetch.post({
                url: `/Employee/OwnerChangePassword`,
                params: {
                    employeeID: employeeID,
                    newPassword: inputs.ownerPassword
                },
                // toastCtx: toast
            } as any);

            // Updated contract: prioritize HttpStatusCode; only treat Message as error when no 200 code
            const r: any = result as any;
            if (typeof r?.HttpStatusCode === 'number') {
                if (r.HttpStatusCode === 200) {
                    (toast as any).setToast({
                        message: r.Message || 'Password updated',
                        show: true,
                        type: Enums.ToastType.success
                    });
                    setInputs({
                        ...inputs,
                        ownerPassword: "",
                        confirmOwnerPassword: ""
                    });
                    setIsOpen(false);
                } else if (r?.Message) {
                    setInputErrors({ ...errors, ownerPassword: r.Message });
                } else if (r?.message || r?.serverMessage) {
                    const msg = r.message || r.serverMessage;
                    showNotification({ color: 'yellow.7', message: msg, autoClose: 4000 });
                } else {
                    showNotification({ color: 'yellow.7', message: 'Something went wrong', autoClose: 4000 });
                }
            } else if (r?.Message) {
                setInputErrors({ ...errors, ownerPassword: r.Message });
            } else if (r?.message || r?.serverMessage) {
                const msg = r.message || r.serverMessage;
                showNotification({ color: 'yellow.7', message: msg, autoClose: 4000 });
            } else {
                showNotification({ color: 'yellow.7', message: 'Something went wrong', autoClose: 4000 });
            }
        }

        setSaving(false);
    }

    return (<>

        <SCModal
            open={isOpen}
            size='md'
            onClose={() => { if (!enforced) setIsOpen(false); }}
            modalProps={enforced ? { closeOnClickOutside: false, closeOnEscape: false } : undefined}
        >

            <Title order={3} mb={'md'}>{title ?? 'Update Password for Employee'}</Title>

            {message && (
                <Alert my={'sm'} color={'teal'} icon={<IconInfoCircle size={16} />} style={{ marginBottom: 'var(--mantine-spacing-md)' }}>
                    {message}
                </Alert>
            )}

            <div className="row">
                <div className="column">
                    <SCPasswordInput
                        onChange={handleInputChange}
                        error={inputErrors.ownerPassword}
                        label={"New password"}
                        name="ownerPassword"
                        required={true}
                        value={inputs.ownerPassword}
                        userwords={combinedUserwords}
                    />
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <SCPasswordInput
                        onChange={handleInputChange}
                        error={inputErrors.confirmOwnerPassword}
                        label={"Confirm new password"}
                        name="confirmOwnerPassword"
                        required={true}
                        value={inputs.confirmOwnerPassword}
                        userwords={combinedUserwords}
                    />
                    <Text size="sm" c="dimmed" mt="sm">
                        Choose a strong password with at least 10 characters, including uppercase, lowercase, and a number. Skip common phrases like 'password', 'qwerty', '1234', or your name.
                    </Text>
                </div>
            </div>

            <Flex justify={"space-between"} mt={30}>
                <div></div>
                <div>
                {enforced ? (
                    <Button onClick={() => logout()} variant='subtle' mr={'xs'}>
                        Logout
                    </Button>
                ) : (
                    <Button onClick={() => setIsOpen(false)} variant='subtle' mr={'xs'}>
                        {message ? 'Not Now' : 'Cancel'}
                    </Button>
                )}

                <Button onClick={saving ? undefined : updateOwnerPassword} disabled={saving}>
                    {saving ? "Updating" : 'Update Password'}
                </Button>
                </div>
            </Flex>
        </SCModal>

        <style jsx>{`
            
        `}</style>
    </>);
};

export default ChangeEmployeePassword;