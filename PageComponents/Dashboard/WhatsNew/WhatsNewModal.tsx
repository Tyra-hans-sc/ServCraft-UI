// import SCModal from "@/PageComponents/Modal/SCModal";
import {FC, useState} from "react";
// import {useMediaQuery} from "@mantine/hooks";
// import WhatsNew from "@/PageComponents/Dashboard/WhatsNew/WhatsNew";


const WhatsNewModal: FC<{show: boolean; setShow: (show: boolean) => void, initiator: 'menu' | 'widget'}> = ({...props}) => {

    /*const isMobile = useMediaQuery('(max-width: 850px)');
    const [triggerCloseCounter, setTriggerCloseCounter] = useState(0)

    const [whatsNewItemClicked, setWhatsNewItemClicked] = useState<[number, number]>([-1, -1])*/

    return <>
        {/*<SCModal
            open={props.show}
            size={1200}
            decor={'WhatsNew'}
            modalProps={{
                fullScreen: isMobile,
                styles: {
                    content: {
                        backgroundColor: 'var(--mantine-color-gray-1)',
                    }
                },
            }}
            // headerSectionBackButtonText={'test'}
            onClose={() => setTriggerCloseCounter(p => p + 1)}
            showClose
            onWhatsNewIndexItemClicked={(i, j) => setWhatsNewItemClicked([i, j])}
        >
            <WhatsNew onClose={() => {
                props.setShow(false)
                setTriggerCloseCounter(0)
            }} triggerCloseCounter={triggerCloseCounter}
                      initiator={props.initiator}
                      indexItemClicked={whatsNewItemClicked}
            />
        </SCModal>*/}
    </>
}

export default WhatsNewModal
