import {FC, useState} from "react";
import {Card, CloseButton} from "@mantine/core";
import {useDidUpdate, useIdle} from "@mantine/hooks";
import {useAtom} from "jotai";
import {
    // hasLoggedInAtom,
    passwordChangePromptAtom,
    // showWhatsNewAtom,
    // whatsNewContentNotViewedYetAtom
} from "@/utils/atoms";
import WhatsNewPopupMiniContentRendering from "@/PageComponents/Dashboard/WhatsNew/WhatsNewPopupMiniContentRendering";
import {AnimatePresence, motion} from "framer-motion";

const WhatsNewPopup: FC = () => {

    // const [hasLoggedIn] = useAtom(hasLoggedInAtom);
    // please note: idle can be confusing on a dev server as it still briefly returns true after the specified timeout - perhaps to do with strict-mode
    /*const idle = useIdle(8000, {
        initialState: hasLoggedIn
    });*/
    // const [whatsNewContentNotViewed, setWhatsNewContentNotViewed] = useAtom(whatsNewContentNotViewedYetAtom)

    // const [whatsNewOpened] = useAtom(showWhatsNewAtom);

    const [showPopup, setShowPopup] = useState(false);

    const [showChangePassword] = useAtom(passwordChangePromptAtom);

    /*useDidUpdate(() => {
        if(!whatsNewOpened && whatsNewContentNotViewed.length !== 0 && (idle || hasLoggedIn) && !showChangePassword.open) {
            setShowPopup(true)
        }

        if(showPopup && whatsNewOpened) {
            setShowPopup(false)
        }
    }, [idle, whatsNewContentNotViewed, hasLoggedIn, whatsNewOpened, showChangePassword.open]);*/

    /*const onClose = () => {
        setShowPopup(false)
        setWhatsNewContentNotViewed([])
    }*/

    return <>

        <AnimatePresence>
            {
                showPopup &&
                <motion.div
                    style={{
                        position: 'sticky',
                        bottom: 30,
                        // right: 20,
                        width: 350,
                        left: 'calc(100% - 380px)',
                        zIndex: 2000,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                        x: 200,
                        opacity: 0,
                        skew: 5,
                        rotate: 5,
                        transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            mass: 0.8,
                            velocity: 5
                        }
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 270,
                        damping: 20,
                        duration: .7
                    }}
                >
                    <Card
                        p={0}
                        radius={5}
                        shadow={'lg'}
                        withBorder
                        mt={'calc(-100% - 70px)'}
                        // bg={'scBlue'}
                        w={350}
                        maw={'80vw'}
                    >

                        {/*<WhatsNewPopupMiniContentRendering
                            data={whatsNewContentNotViewed}
                            onClose={onClose}
                        />*/}
                    </Card>
                </motion.div>
            }
        </AnimatePresence>
    </>
}

export default WhatsNewPopup;
