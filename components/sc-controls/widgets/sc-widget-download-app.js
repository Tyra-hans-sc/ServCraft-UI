import { useEffect, useRef, useState } from "react";
import Fetch from "../../../utils/Fetch";
import Button from "../../button";
import SCWidgetCard from "../layout/sc-widget-card";
import Helper from "../../../utils/helper";
import constants from "../../../utils/constants";

export default function SCWidgetDownloadApp({ onDismiss = null, widget, padding = "1rem 1rem 1rem 1rem", limitByUserAgent = false }) {



    const hasMobileLoginRef = useRef(false);

    const [isIOS, setIsIOS] = useState(null);


    const getHasMobileLogin = async () => {
        const hasMobileLogin = await Fetch.get({
            url: '/Dashboard/GetAuthUserHasMobileLogin'
        });

        hasMobileLoginRef.current = hasMobileLogin;
        if (hasMobileLogin === true) {
            onDismiss && onDismiss();
        }
    };

    function iOS() {

        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }

    useEffect(() => {
        getHasMobileLogin();

        if (limitByUserAgent) {
            setIsIOS(iOS());
        }
    }, []);

    const visit = (url, storeName) => {

        Helper.mixpanelTrack(constants.mixPanelEvents.downloadAppLinkClicked, {
            storeName: storeName,
            url: url,
            hasMobileLogin: hasMobileLoginRef.current
        });

        window.open(url, "_blank");
    };

    return (<>
        <SCWidgetCard>
            <div className="learning-center-container" >
                <h2>Download our App</h2>

                {isIOS === true || isIOS === null ?
                    <img src="/download-ios.png" style={{ height: "70px", cursor: "pointer" }} onClick={() => visit("https://apps.apple.com/ae/app/servcraft/id1498625938")} />
                    : ""}
                {isIOS === false || isIOS === null ? <>
                    <img src="/download-android.png" style={{ height: "73px", maxWidth: 250, cursor: "pointer" }} onClick={() => visit("https://play.google.com/store/apps/details?id=za.co.servcraft.mobile")} />
                    <img src="/download-huawei.png" style={{ height: "73px", maxWidth: 250, cursor: "pointer" }} onClick={() => visit("https://appgallery.huawei.com/app/C103988705")} />
                </> : ""}


            </div>
        </SCWidgetCard>

        <style jsx>{`
    
        .learning-center-container {
            height: 100%;
            padding: ${padding};
            text-align: center;
        }

        .learning-center-container h2 {
            margin-top: 0;
        }


    `}</style>
    </>)
}