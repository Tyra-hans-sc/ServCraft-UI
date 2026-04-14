import { useContext, useEffect, useRef } from "react";
import {
    Text,
    useMantineTheme,
    Group,
    Anchor,
    Button, Flex, Title, Space, Loader
} from "@mantine/core";
import Link from "next/link";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { loginComplete, preLogin } from "./LoginRequests";
import config from "../../utils/config";
import Helper from "../../utils/helper";
import * as Enums from "../../utils/enums";
import constants from "../../utils/constants";
import { clearCookie, login } from "../../utils/auth";
import CryptoJS from 'crypto-js';
import SCMessageBarContext from "../../utils/contexts/sc-message-bar-context";
import SubscriptionContext from '../../utils/subscription-context';
import PageContext from '../../utils/page-context';
import { showNotification } from "@mantine/notifications";
import { IconArrowRight } from "@tabler/icons";
import ScPasswordControl from "../../components/sc-controls/form-controls/v2/sc-password-control";
import ScTextControl from "../../components/sc-controls/form-controls/v2/sc-text-control";
import TimerContext from "../../utils/timer-context";
import {useWindowEvent} from "@mantine/hooks";
import Storage from "../../utils/storage";
import {useRouter} from "next/router";
import {useAtom} from "jotai";
import {passwordChangePromptAtom} from "../../utils/atoms";


const oneTimeLoginSecret = "1dwp3lp)*dTy";

const LoginForm = (props) => {

    const theme = useMantineTheme();

    const { token_expired, message, bypassLockout } = props.params;

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            rememberMe: true
        },
        validate: {
            email: (val) => {
                const t = (val ?? '').trim();
                return t.toLowerCase().startsWith('admin:') || (t.indexOf('@') < t.lastIndexOf('.') && t.length > 4)
                    ? null
                    : 'Please use a valid email';
            }
        }
    });

    const timerContext = useContext(TimerContext);

    /* states used to store original form values during chained requests - avoiding need to disable inputs */
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const forcedRef = useRef(false);
    const deviceIdRef = useRef('');
    const apiHostRef = useRef('');
    const fingerPrint = useRef('');
    const mslcRef = useRef('');

    const messageBarContext = useContext(SCMessageBarContext);
    const subscriptionContext = useContext(SubscriptionContext);
    const pageContext = useContext(PageContext);

    // const [userHasLoggedIn, setUserHasLoggedIn] = useAtom(hasLoggedInAtom);
    const [, setPasswordChangePrompt] = useAtom(passwordChangePromptAtom);
    const cacheCleared = useRef(false);

    useEffect(() => {
        // Only clear once per page load to avoid loops
        // Don't clear if mslc or otl is present (admin login or one-time login)
        if (!cacheCleared.current && !props.params.mslc && !props.params.otl) {
            clearCookie(false);
            localStorage.clear();
            sessionStorage.clear();

            // Clear React Query cache to prevent old user data from showing
            try {
                import('../../pages/_app').then(({ queryClient }) => {
                    if (queryClient) {
                        queryClient.clear();
                        console.log('React Query cache cleared on login page mount');
                    }
                }).catch(err => {
                    console.warn('Failed to clear React Query cache on login:', err);
                });
            } catch (err) {
                console.warn('Error clearing cache on login page:', err);
            }

            cacheCleared.current = true;
        }

        messageBarContext.setIsActive(false);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Warning);
        messageBarContext.setMessage("");
        subscriptionContext.setSubscriptionInfo(null);
        pageContext.setTimeshiftMilliseconds(0);

        Helper.mixpanelInit();

        if (token_expired && message) {
            showNotification({
                id: 'tokenExpired',
                title: 'Session Expired',
                message,
                autoClose: true,
                color: 'yellow',
            })
        }

        // relocate to https
        /*if (window.location.href && window.location.href.indexOf("http:") > -1 && window.location.href.indexOf("localhost") < 0) {
            window.location = window.location.href.replace("http:", "https:");
        }*/

        Helper.getFingerPrint().then(hash => {
            fingerPrint.current = hash;
        }, e => {
            // console.log(e);
            fingerPrint.current = crypto.randomUUID();
        }).catch(e => {
            // console.log(e);
            fingerPrint.current = crypto.randomUUID();
        });

    }, []);

    const router = useRouter()
    useWindowEvent('focus', (event) => {
        if(!!Storage.getCookie(Enums.Cookie.token)) {
            console.log('already logged in')
            router.replace('/')
        }
    });

    useEffect(() => {
        const { mslc, otl } = props.params;
        
        // Store mslc in ref so it persists across re-renders
        if (mslc) {
            mslcRef.current = mslc;
        }
        
        if (mslc) {
            // Add small delay to ensure React Query and other initialization is complete
            setTimeout(() => {
                handleSubmit({ email: "admin@servcraft.co.za", password: "xxxxxxxx", force: true });
            }, 100);
        }
        if (otl) {

            try {
                let bytes = CryptoJS.AES.decrypt(decodeURIComponent(otl + ''), oneTimeLoginSecret);
                let data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                let now = Date.now();
                let then = data.now;
                // 10 minutes
                if (now - then < 60 * 10000) {
                    form.setFieldValue('email', data.username);
                    form.setFieldValue('password', data.password);
                    setTimeout(() => {
                        handleSubmit({
                            email: data.username,
                            password: data.password,
                            force: true
                        });
                    }, 1)
                }
            } catch (e) {
                showNotification({
                    id: 'otlparseerror',
                    message: 'Unable to parse sign-in information',
                    color: 'yellow.7'
                })
            }

        }
    }, [props.params]);

    const preQ = useMutation(
        ['login', 'preLogin',], preLogin, {
        onSuccess: (res) => {
            const tenant = res.Results[0]
            const api = config.isDebugging() ? config.apiHost : tenant.API
            apiHostRef.current = api

            deviceIdRef.current = fingerPrint.current;

            loginQ.mutate({
                api,
                email: emailRef.current,
                password: passwordRef.current,
                deviceId: deviceIdRef.current,
                managerServCraftLoginCredentials: mslcRef.current
            })
        },
        onError: (error) => {
            showNotification({
                id: 'login',
                color: 'yellow.7',
                message: error.message || 'Incorrect password or email'
            })
        }
    }
    );

    const loginQ = useMutation(
        ['login', 'completeLogin'], loginComplete, {
        onSuccess: async data => {

            const token = data['Token'];
            const userName = data['User']['UserName'];
            const fullName = data['User']['FullName'];
            const userID = data['User']['ID'];
            const employeeID = data['EmployeeID'];
            const supplierID = data['SupplierID'];
            const supplierContactID = data['SupplierContactID'];
            const tenantID = data['TenantID'];
            const companyName = data['CompanyName'];
            const permissions = data['Permissions'];
            const isOwner = data['Owner'];
            const duration = form.values.rememberMe ? 7 : 1;
            const subscriptionInfo = data['SubscriptionInfo'];
            const pageSize = data['PageSize'];

            try {
                Helper.mixpanelIdentify(userID);
            } catch (e) {
                console.error('mixpanel identify error');
            }

            // @ts-ignore

            let accessStatus = null;
            let customerStatus = null;
            let accessEndDate = null;
            let userCount = null;

            if (!!subscriptionInfo) {
                accessStatus = !isNaN(parseInt(subscriptionInfo.AccessStatus)) ? subscriptionInfo.AccessStatus : (Enums.AccessStatus[subscriptionInfo.AccessStatus] ?? null);
                customerStatus = subscriptionInfo.CustomerStatus;
                accessEndDate = subscriptionInfo.AccessEndDate;
                userCount = subscriptionInfo.UserCount;
            }

            Helper.mixpanelPeopleSet({
                "USER_ID": userID,
                "userName": userName,
                "tenantID": tenantID,
                "tenantName": companyName,
                "accessStatus": accessStatus,
                "customerStatus": customerStatus,
                "$name": fullName,
                "$email": userName
            });

            // Record password strength and trigger change prompt if weak
            if(!forcedRef.current) {
                try {
                    const userwords = [userName, fullName, companyName];
                    const { ok } = Helper.validatePasswordStrength(passwordRef.current, { userwords });
                    if (!ok) {
                        setPasswordChangePrompt({
                            open: true,
                            title: 'Update your password',
                            message: 'As part of our continual improvements, we\'ve strengthened our password requirements. Please create a new password to continue using ServCraft.'
                            // message: "Your password is not strong enough.  To keep your account secure, we highly recommend that you update your password soon."
                            // message: "We are improving our password policy and have detected that your password is not strong enough.  You will need to update your password soon to comply."
                        });
                    }
                } catch (e) {
                    // ignore validator errors; do not block login
                }
            }


            Helper.mixpanelTrack(constants.mixPanelEvents.login);

            timerContext.updateRunningTimers()

            // setUserHasLoggedIn(true);

            await login({
                token: token,
                tenantID: tenantID,
                userID: userID,
                employeeID: employeeID,
                duration: duration,
                userName: userName,
                fullName: fullName,
                companyName: companyName,
                permissions: permissions,
                isOwner: isOwner,
                subscriptionInfo: subscriptionInfo,
                apiHost: apiHostRef.current,
                fingerPrint: deviceIdRef.current,
                pageSize: pageSize,
                redirect: props.params.redirect ?? null,
                supplierID: supplierID,
                supplierContactID: supplierContactID,
                bypassLockout: bypassLockout === 'true' && !!mslcRef.current,
                isAdminLogin: !!mslcRef.current
            });
        },
        onError: (error) => {
            showNotification({
                id: 'login',
                color: 'yellow.7',
                message: error.message || 'Login attempt failed. Please try again later.'
            })
        }
    }
    )

    const handleSubmit = ({ email, password, force = false }) => {
        const trimmedEmail = (email ?? '').trim();
        if (form.isValid() || force) {
            emailRef.current = trimmedEmail;
            passwordRef.current = password;
            forcedRef.current = force;

            preQ.mutate(
                {
                    userName: trimmedEmail,
                    password,
                    managerServCraftLoginCredentials: props.params.mslc
                }
            )
        }
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >

            <Title size={'h2'} transform={'capitalize'} fw={'bolder'}>
                Welcome Back to ServCraft!
            </Title>

            <Text className="subheading" size={'sm'} color={'dimmed'}>
                Start managing your jobs.
            </Text>

            <Space my={'var(--mantine-spacing-md)'} />

            {/*<SCInput
                mb={15}
                placeholder="e.g. johndoe@email.com"
                label="Email address"
                variant="default"
                required
                {...form.getInputProps('email')}
             />*/}
            {/*<TextInput
                mb={15}
                placeholder="e.g. johndoe@email.com"
                label="Email address"
                variant="default"
                required
                {...form.getInputProps('email')}
            />*/}
            <ScTextControl
                style={{ maxWidth: '100%' }}
                mb={15}
                placeholder="e.g. johndoe@email.com"
                label="Email address"
                variant="default"
                required
                {...form.getInputProps('email')}
            />

            <ScPasswordControl
                style={{ maxWidth: '100%' }}
                mb={0}
                placeholder="e.g. &!(sdawJ&fds"
                label="Password"
                required
                {...form.getInputProps('password')}
            />

            <Group justify={'space-between'} align={'start'} mb={'lg'}>
                <Link legacyBehavior href={'/reset-password'} style={{ textDecoration: 'none' }}>
                    <Anchor size={'sm'} fw={600} c={'scBlue.9'} mt={4}>
                        Forgot password?
                    </Anchor>
                </Link>
            </Group>

            {/*<Checkbox
                label="Remember me"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                mb={'sm'}
                color={'scBlue'}
            />*/}

            <Group justify={'left'} gap={8}>
                <Text fw={400}>
                    Don&apos;t have an account?
                </Text>
                <Anchor href={'https://www.servcraft.co.za'} c={'scBlue'} fw={600}>Sign Up Here</Anchor>
            </Group>

            <Flex direction={'column'} justify={'end'} mt={'auto'}>
                <Button type={'submit'}
                    mt={'lg'}
                    ml={'auto'}
                    color={'scBlue'}
                    rightSection={(preQ.isLoading || loginQ.isLoading) && <Loader variant={'oval'} size={18} color={'white'} /> || <IconArrowRight size={16} />}
                    disabled={preQ.isLoading || loginQ.isLoading}
                >
                    Login
                </Button>
            </Flex>

        </form>
    );
};

export default LoginForm;
