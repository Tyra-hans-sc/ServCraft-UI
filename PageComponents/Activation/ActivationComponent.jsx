import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/legacy/image';
import SCModal from "../Modal/SCModal";
import SetPasswordForm from "./SetPasswordForm";
import RequestNewLinkForm from "./RequestNewLinkForm";
import { validateActivationToken } from "../Login/LoginRequests";
import { Text, Title, Space, Button, Loader, Flex } from "@mantine/core";
import Link from "next/link";
import { ActivationStatus } from "../../utils/enums";

const ActivationComponent = () => {
    const { query, isReady } = useRouter();
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(true);
    const [tokenStatus, setTokenStatus] = useState(null);
    const [email, setEmail] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!isReady) return;

        const token = query.token;
        if (!token) {
            setTokenStatus(ActivationStatus.Invalid);
            setMessage('No activation token provided');
            setLoading(false);
            return;
        }

        // Validate the token
        validateActivationToken(token)
            .then((result) => {
                setTokenStatus(result.status);
                setEmail(result.email);
                setMessage(result.message);
            })
            .catch((error) => {
                setTokenStatus(ActivationStatus.Invalid);
                setMessage(error.message || 'Failed to validate activation link');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isReady, query.token]);

    const renderContent = () => {
        if (loading) {
            return (
                <Flex direction="column" align="center" justify="center" style={{ minHeight: 200 }}>
                    <Loader size="lg" color="scBlue" />
                    <Text mt="md" c="dimmed">Validating activation link...</Text>
                </Flex>
            );
        }

        switch (tokenStatus) {
            case ActivationStatus.Valid:
                return <SetPasswordForm token={query.token} />;

            case ActivationStatus.Expired:
                return <RequestNewLinkForm email={email} />;

            case ActivationStatus.AlreadyActivated:
                return (
                    <div style={{ textAlign: 'center' }}>
                        <Title size="h2" fw="bolder">Account Already Activated</Title>
                        <Space my="var(--mantine-spacing-md)" />
                        <Text c="dimmed">
                            This account has already been activated. You can log in with your existing password.
                        </Text>
                        <Space my="var(--mantine-spacing-lg)" />
                        <Link href="/login">
                            <Button color="scBlue">Go to Login</Button>
                        </Link>
                    </div>
                );

            case ActivationStatus.Invalid:
            default:
                return (
                    <div style={{ textAlign: 'left' }}>
                        <Title size="h2" fw="bolder">Invalid Link</Title>
                        <Space my="var(--mantine-spacing-md)" />
                        <Text c="dimmed">
                            This link is invalid or no longer exists.
                        </Text>
                        <Text c="dimmed" mt="sm">
                            Trying to create a password? Click reset password.
                        </Text>
                        <Space my="var(--mantine-spacing-lg)" />
                        <Flex gap="sm">
                            <Link href="/login">
                                <Button color="scBlue" variant="outline">Back to login</Button>
                            </Link>
                            <Link href="/reset-password">
                                <Button color="scBlue">Reset password</Button>
                            </Link>
                        </Flex>
                    </div>
                );
        }
    };

    return (
        <>
            <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
                <Image
                    src="/background/1366x768-blur6.png"
                    quality={10}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="left"
                />
            </div>
            <SCModal open={showModal} decor="ServCraft">
                {renderContent()}
            </SCModal>
        </>
    );
};

export default ActivationComponent;
