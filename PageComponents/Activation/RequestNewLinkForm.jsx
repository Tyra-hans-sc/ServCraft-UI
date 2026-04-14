import {
    Text,
    Button, Flex, Title, Space, Loader
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { requestActivationLink } from "../Login/LoginRequests";
import Link from "next/link";
import { showNotification, updateNotification } from "@mantine/notifications";
import { IconArrowRight, IconMail } from "@tabler/icons";

// Masks email for display: john.doe@email.com -> j*******@e****.com
const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;

    const [domainName, ...tld] = domain.split('.');
    const maskedLocal = local.length > 1
        ? local[0] + '*'.repeat(Math.min(local.length - 1, 7))
        : local;
    const maskedDomain = domainName.length > 1
        ? domainName[0] + '*'.repeat(Math.min(domainName.length - 1, 4))
        : domainName;

    return `${maskedLocal}@${maskedDomain}.${tld.join('.')}`;
};

const RequestNewLinkForm = ({ email }) => {
    const requestLinkMutation = useMutation(['activation', 'requestLink'], requestActivationLink,
        {
            onError: (error) => {
                updateNotification({
                    id: 'requestActivationLink',
                    color: 'yellow.7',
                    message: error.message || 'Failed to send activation link',
                    loading: false
                });
                console.error(error);
            },
            onSuccess: () => {
                updateNotification({
                    id: 'requestActivationLink',
                    color: 'green',
                    message: 'A new activation link has been sent.',
                    loading: false
                });
            }
        }
    );

    const handleResend = () => {
        if (!email) return;
        showNotification({
            id: 'requestActivationLink',
            color: 'scBlue',
            loading: true,
            message: 'Sending activation link...'
        });
        requestLinkMutation.mutate({ email });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title size="h2" fw="bolder">
                Link Expired
            </Title>

            <Text className="subheading" size="sm" c="dimmed">
                Send a new link to your email address.
            </Text>

            <Space my="var(--mantine-spacing-md)" />

            {!requestLinkMutation.isSuccess ? (
                <>
                    <Flex align="center" gap="sm" mb="md" p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
                        <IconMail size={20} color="var(--mantine-color-dimmed)" />
                        <Text size="sm" c="dimmed">
                            A new link will be sent to: <Text span fw={500}>{maskEmail(email)}</Text>
                        </Text>
                    </Flex>
                </>
            ) : (
                <>
                    <Text>A new activation link has been sent to your email address.</Text>
                    <Text c="dimmed" mt="sm">Please check your inbox and click the link to activate your account.</Text>
                </>
            )}

            <Flex mt="xl">
                <Link href="/login">
                    <Button type="button" mt="lg" color="scBlue" variant="outline">
                        Back to Login
                    </Button>
                </Link>
                {!requestLinkMutation.isSuccess && (
                    <Button
                        type="button"
                        mt="lg"
                        ml="auto"
                        color="scBlue"
                        onClick={handleResend}
                        rightSection={requestLinkMutation.isLoading ? (
                            <Loader variant="oval" size={18} color="white" />
                        ) : (
                            <IconArrowRight />
                        )}
                        disabled={requestLinkMutation.isLoading || !email}
                    >
                        Send New Link
                    </Button>
                )}
            </Flex>
        </div>
    );
};

export default RequestNewLinkForm;
