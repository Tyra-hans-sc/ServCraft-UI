import {useEffect, useState} from "react";
import {useRouter} from "next/router";

import Image from 'next/legacy/image'
import LoginForm from "./LoginForm";
import SCModal from "../Modal/SCModal";
import constants from "../../utils/constants";

const LoginComponent = () => {

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
            <LoginForm params={query}  />
        </SCModal>
        {/*<LoginModal open={showLoginModal} >
            <LoginForm params={query}  />
        </LoginModal>*/}
        <div style={{position: "fixed", bottom: 8, left: 16, fontSize: "0.6rem", color: "white"}}>{constants.appVersion()}</div>
    </>

}

export default LoginComponent
