import {
    Text,
    Button, Flex, Title, Space, Loader, Anchor, useMantineTheme, PasswordInput, Group
} from "@mantine/core";
// import {ArrowRightAltSharp, CheckOutlined, CloseOutlined} from "@material-ui/icons";
import {useMutation} from "@tanstack/react-query";
import {useForm} from "@mantine/form";

import {completeResetPassword} from "../Login/LoginRequests";
import Link from "next/link";
import {showNotification, updateNotification} from "@mantine/notifications";
import {useMemo, useState} from "react";
import Helper from "../../utils/helper";
import constants from "../../utils/constants";
import {IconArrowRight, IconArrowRightBar, IconCheck, IconX} from "@tabler/icons";
import Storage from "../../utils/storage";
import * as Enums from "../../utils/enums";

const CompleteResetPasswordForm = ({token}) => {

    const theme = useMantineTheme();

    const [visible, setVisible] = useState(false);

    // Build a consistent set of user/company words for password strength checks (best-effort for reset flow)
    const userwords = [
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servUserName) : undefined,
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servFullName) : undefined,
        Storage?.getCookie ? Storage.getCookie(Enums.Cookie?.servCompanyName) : undefined,
    ].filter(Boolean);

    const form = useForm({
        initialValues: {
            password1: '',
            password2: '',
        },
        validate: {
            password1: (password1, {password2}) => {
                // Disallow whitespace anywhere (align with other password forms)
                if (/\s/.test(password1)) return 'Password cannot contain spaces';

                // Enforce global password rules (length/composition + common patterns)
                const strengthError = Helper.getPasswordStrengthError(password1, { userwords });
                if (strengthError) return strengthError;

                // Hard cap for extremely long passwords
                if ((password1 || '').length > 100) return 'Please use a password of 100 characters or less';

                // While typing, keep the form invalid if passwords don't match yet
                return password1 !== password2 ? ' ' : null;
            },
            password2: (password2, {password1}) => {
                if (/\s/.test(password2)) return 'Password cannot contain spaces';
                return password1 !== password2 ? 'Passwords do not match' : null;
            }
        }
    });

    // Memoize the strength error to avoid repeated helper calls in render
    const strengthError = useMemo(() => (
        // For the checklist display, show only the advanced/common-patterns error
        // (base checks like length/composition are already shown as separate items)
        Helper.getPasswordStrengthError(form.values.password1, { skipBaseChecks: true })
    ), [form.values.password1]);



    const sendResetPw = useMutation(['forgotPassword', 'completeReset'], completeResetPassword,
        {
            onError: (error) => {
                try { form.setFieldError('password1', error?.message || 'Something went wrong'); } catch {}
                updateNotification({
                    id: 'completePasswordReset',
                    color: 'yellow.7',
                    message: error.message || 'Something went wrong',
                    loading: false
                })
                console.error(error)
            },
            onSuccess: (data) => {
                updateNotification({
                    id: 'completePasswordReset',
                    color: 'scBlue',
                    message: 'Your password has been successfully updated!',
                    loading: false
                })
                // console.log(data)
                if(data.User) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.resetPassword);
                }
            }
        }
    );

    const handleSubmit = ({password1}) => {

        if(form.isValid) {
            showNotification({
                id: 'completePasswordReset',
                color: 'scBlue',
                loading: true,
                message: 'Resetting password...'
            })
            sendResetPw.mutate({password: password1, token})
        }
    };


    return (
        <form onSubmit={form.onSubmit(handleSubmit)}
              style={{height: '100%', display: 'flex', flexDirection: 'column'}}
        >

            <Title size={'h2'} transform={'capitalize'} fw={'bolder'}>
                Forgot Password
            </Title>

            <Text className="subheading" size={'sm'} c={'dimmed'}>
                Reset password in two quick steps
            </Text>

            <Space my={'var(--mantine-spacing-md)'} />

            {
                !sendResetPw.isSuccess && <>
                    <PasswordInput
                        mb={'var(--mantine-spacing-lg)'}
                        placeholder="e.g. &!(sdawJ&fds"
                        label="New Password"
                        // toggleTabIndex={0}
                        visible={visible}
                        onVisibilityChange={setVisible}
                        minLength={10}
                        maxLength={100}
                        required
                        {...form.getInputProps('password1')}
                    />

                    <PasswordInput
                        mb={0}
                        placeholder="e.g. &!(sdawJ&fds"
                        label="Confirm Password"
                        visible={visible}
                        onVisibilityChange={setVisible}
                        minLength={10}
                        maxLength={100}
                        required
                        {...form.getInputProps('password2')}
                    />
                    <Flex align={'end'} mt={'sm'} mb={'xs'} justify={'center'} px={5}>
                        <Text size={'sm'} c={'dimmed'} mt={'xs'} mb={'md'}>
                            Choose a strong password with at least 10 characters, including uppercase, lowercase, and a number. Skip common phrases like 'password', 'qwerty', '1234', or your name.
                        </Text>
                    </Flex>

                <Flex gap={5} direction={'column'}>
                    {
                        <Group gap={5}>
                            {
                                form.values.password1.length < 10 && form.values.password2.length < 10 &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>At least 10 characters</Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                !(/[A-Z]/.test(form.values.password1)) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>Contains uppercase letter</Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                !(/[a-z]/.test(form.values.password1)) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>Contains lowercase letter</Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                !(/\d/.test(form.values.password1)) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>Contains number</Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                (/\s/.test(form.values.password1)) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>No spaces</Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                (strengthError != null) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>
                                {strengthError ? strengthError : 'Avoids common patterns'}
                            </Text>
                        </Group>
                    }

                    {
                        <Group gap={5}>
                            {
                                (form.values.password1 === '' || form.values.password1 !== form.values.password2) &&
                                <IconX size={18} color={theme.colors.yellow[7]} /> ||
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            }
                            <Text size={'sm'} c={'dimmed'}>Passwords match</Text>
                        </Group>
                    }
                </Flex>

                </>  || <Text>Password successfully updated!</Text>
            }
            {/*<Link legacyBehavior={true} href={'/login'}>
                <Anchor mt={'var(--mantine-spacing-xl)'} align={'start'} fw={'bolder'} component="button" type="button"
                        style={{color: 'var(--mantine-color-scBlue-7)'}}
                >
                    Back to Login
                </Anchor>
            </Link>*/}
            <Flex mt={'xl'}>
                <Link href={'/login'}>
                    <Button type={'button'}
                            mt={'lg'}
                            color={'scBlue'}
                            variant={'outline'}
                    >
                        Back to Login
                    </Button>
                </Link>
                {
                    !sendResetPw.isSuccess &&
                    <Button type={'submit'}
                            mt={'lg'}
                            ml={'auto'}
                            color={'scBlue'}
                            rightSection={(sendResetPw.isLoading) && <Loader variant={'oval'} size={18} color={'white'} /> || <IconArrowRight />}
                            disabled={sendResetPw.isLoading || !form.isValid}
                    >
                        Continue
                    </Button>
                }
            </Flex>

        </form>
    );
};

export default CompleteResetPasswordForm;
