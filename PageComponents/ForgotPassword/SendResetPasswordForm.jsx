import {
    TextInput,
    Text,
    Button, Flex, Title, Space, Loader, Anchor, useMantineTheme
} from "@mantine/core";
// import {ArrowRightAltSharp} from "@material-ui/icons";
import {useMutation} from "@tanstack/react-query";
import {useForm} from "@mantine/form";

import {sendResetPasswordEmail} from "../Login/LoginRequests";
import Link from "next/link";
import {showNotification, updateNotification} from "@mantine/notifications";
import {IconArrowRight, IconArrowRightBar} from "@tabler/icons";
const SendResetPasswordForm = () => {
    const theme = useMantineTheme();

    const form = useForm({
        initialValues: {
            email: ''
        }
    });

    const sendResetPw = useMutation(['forgotPassword', 'sendMail'], sendResetPasswordEmail,
        {
            onError: (error) => {
                updateNotification({
                    id: 'sendPasswordResetEmail',
                    color: 'yellow.7',
                    message: error.message || 'Something went wrong',
                    loading: false
                })

                console.error(error)
            },
            onSuccess: () => {
                updateNotification({
                    id: 'sendPasswordResetEmail',
                    color: 'scBlue',
                    message: 'Password reset email successfully sent to ' + form.values.email,
                    loading: false
                })
            }
        }
    );

    const handleSubmit = ({email}) => {
        showNotification({
            id: 'sendPasswordResetEmail',
            color: 'scBlue',
            loading: true,
            message: 'Sending password reset email'
        })
        sendResetPw.mutate({email})
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
                    <TextInput
                        mb={15}
                        type={'email'}
                        placeholder="e.g. johndoe@email.com"
                        label="Email address"
                        variant="default"
                        required
                        {...form.getInputProps('email')}
                    />
                </>  || <Text>A reset password has been sent to your email address.</Text>
            }
            {/*<Link legacyBehavior={true} href={'/login'}>
                <Anchor mt={'var(--mantine-spacing-xl)'} align={'start'} fw={'bolder'} component="button" type="button" style={{color: 'var(--mantine-color-scBlue-7)'}}>
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
                            rightSection={(sendResetPw.isLoading) &&
                                <Loader variant={'oval'} size={18} color={'white'}/> || <IconArrowRight/>}
                            disabled={sendResetPw.isLoading}
                    >
                        Continue
                    </Button>
                }
            </Flex>

        </form>
    );
};

export default SendResetPasswordForm;
