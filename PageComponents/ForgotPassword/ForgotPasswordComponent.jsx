import {useEffect, useState} from "react";
import LoginModal from "../Login/LoginModal";
import {useRouter} from "next/router";

import Image from 'next/legacy/image'
import ForgotPasswordForm from "./SendResetPasswordForm";
import CompleteResetPasswordForm from "./CompleteResetPasswordForm";
import SCModal from "../Modal/SCModal";

const ForgotPasswordComponent = (props, context) => {

    const {query} = useRouter();

    const [showLoginModal, setShowLoginModal] = useState(true);

    useEffect(() => {
        setShowLoginModal(true)
    }, [])

    return <>
        <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
            <Image src={'/background/1366x768-blur6.png'} quality={10} layout={'fill'} objectFit={'cover'} objectPosition={'left'} />
        </div>
        <SCModal open={showLoginModal} decor={'ServCraft'}>
            {
                query.resetToken && <CompleteResetPasswordForm token={query.resetToken} /> || <ForgotPasswordForm />
            }
        </SCModal>
    </>

}

export default ForgotPasswordComponent
