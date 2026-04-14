import {
    Text,
    Button, Flex, Title, Space, Loader, useMantineTheme, PasswordInput, Group
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { completeActivation } from "../Login/LoginRequests";
import Link from "next/link";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useMemo } from "react";
import Helper from "../../utils/helper";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons";

const SetPasswordForm = ({ token }) => {
    const theme = useMantineTheme();

    const form = useForm({
        initialValues: {
            password1: '',
            password2: '',
            visible: false,
        },
        validate: {
            password1: (password1, { password2 }) => {
                if (/\s/.test(password1)) return 'Password cannot contain spaces';

                const strengthError = Helper.getPasswordStrengthError(password1, {});
                if (strengthError) return strengthError;

                if ((password1 || '').length > 100) return 'Please use a password of 100 characters or less';

                return password1 !== password2 ? ' ' : null;
            },
            password2: (password2, { password1 }) => {
                if (/\s/.test(password2)) return 'Password cannot contain spaces';
                return password1 !== password2 ? 'Passwords do not match' : null;
            }
        }
    });

    const strengthError = useMemo(() => (
        Helper.getPasswordStrengthError(form.values.password1, { skipBaseChecks: true })
    ), [form.values.password1]);

    const activateMutation = useMutation(['activation', 'complete'], completeActivation,
        {
            onError: (error) => {
                try { form.setFieldError('password1', error?.message || 'Something went wrong'); } catch { }
                updateNotification({
                    id: 'activateAccount',
                    color: 'yellow.7',
                    message: error.message || 'Failed to activate account',
                    loading: false
                });
                console.error(error);
            },
            onSuccess: () => {
                updateNotification({
                    id: 'activateAccount',
                    color: 'green',
                    message: 'Your account has been activated successfully!',
                    loading: false
                });
            }
        }
    );

    const handleSubmit = ({ password1 }) => {
        if (form.isValid) {
            showNotification({
                id: 'activateAccount',
                color: 'scBlue',
                loading: true,
                message: 'Activating your account...'
            });
            activateMutation.mutate({ password: password1, token });
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Title size="h2" fw="bolder">
                {activateMutation.isSuccess ? 'Account Activated!' : 'Activate Your Account'}
            </Title>

            <Text className="subheading" size="sm" c="dimmed">
                {activateMutation.isSuccess
                    ? 'Your account is ready to use'
                    : 'Set your password to complete account activation'}
            </Text>

            <Space my="var(--mantine-spacing-md)" />

            {!activateMutation.isSuccess ? (
                <>
                    <PasswordInput
                        mb="var(--mantine-spacing-lg)"
                        placeholder="Enter your password"
                        label="Password"
                        visible={form.values.visible}
                        onVisibilityChange={(v) => form.setFieldValue('visible', v)}
                        minLength={10}
                        maxLength={100}
                        required
                        {...form.getInputProps('password1')}
                    />

                    <PasswordInput
                        mb={0}
                        placeholder="Confirm your password"
                        label="Confirm Password"
                        visible={form.values.visible}
                        onVisibilityChange={(v) => form.setFieldValue('visible', v)}
                        minLength={10}
                        maxLength={100}
                        required
                        {...form.getInputProps('password2')}
                    />

                    <Flex align="end" mt="sm" mb="xs" justify="center" px={5}>
                        <Text size="sm" c="dimmed" mt="xs" mb="md">
                            Choose a strong password with at least 10 characters, including uppercase, lowercase, and a number.
                        </Text>
                    </Flex>

                    <Flex gap={5} direction="column">
                        <Group gap={5}>
                            {form.values.password1.length < 10 ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">At least 10 characters</Text>
                        </Group>

                        <Group gap={5}>
                            {!/[A-Z]/.test(form.values.password1) ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">Contains uppercase letter</Text>
                        </Group>

                        <Group gap={5}>
                            {!/[a-z]/.test(form.values.password1) ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">Contains lowercase letter</Text>
                        </Group>

                        <Group gap={5}>
                            {!/\d/.test(form.values.password1) ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">Contains number</Text>
                        </Group>

                        <Group gap={5}>
                            {/\s/.test(form.values.password1) ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">No spaces</Text>
                        </Group>

                        <Group gap={5}>
                            {strengthError != null ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">
                                {strengthError || 'Avoids common patterns'}
                            </Text>
                        </Group>

                        <Group gap={5}>
                            {form.values.password1 === '' || form.values.password1 !== form.values.password2 ? (
                                <IconX size={18} color={theme.colors.yellow[7]} />
                            ) : (
                                <IconCheck size={18} color={theme.colors.scBlue[8]} />
                            )}
                            <Text size="sm" c="dimmed">Passwords match</Text>
                        </Group>
                    </Flex>
                </>
            ) : (
                <Flex direction="column" align="center" py="lg">
                    <IconCheck size={48} color={theme.colors.green[6]} />
                    <Text mt="md" ta="center">Your account has been activated successfully!</Text>
                    <Text c="dimmed" mt="sm" ta="center">You can now log in with your new password.</Text>
                </Flex>
            )}

            <Flex mt="xl" justify={activateMutation.isSuccess ? "center" : "space-between"}>
                {!activateMutation.isSuccess && (
                    <Link href="/login">
                        <Button type="button" mt="lg" color="scBlue" variant="outline">
                            Back to Login
                        </Button>
                    </Link>
                )}
                {activateMutation.isSuccess ? (
                    <Link href="/login">
                        <Button mt="lg" color="scBlue" size="md">
                            Go to Login
                        </Button>
                    </Link>
                ) : (
                    <Button
                        type="submit"
                        mt="lg"
                        color="scBlue"
                        rightSection={activateMutation.isLoading ? (
                            <Loader variant="oval" size={18} color="white" />
                        ) : (
                            <IconArrowRight />
                        )}
                        disabled={activateMutation.isLoading || !form.isValid}
                    >
                        Activate Account
                    </Button>
                )}
            </Flex>
        </form>
    );
};

export default SetPasswordForm;
