import {Modal, ModalProps} from "@mantine/core";
import {FC, PropsWithChildren} from "react";
import {useMediaQuery} from "@mantine/hooks";


const BasicModal: FC<PropsWithChildren<ModalProps>> = ({children, ...modalProps}) => {

    const mobile = useMediaQuery('(max-width: 468px)')

    return <Modal
        styles={{
            body: {paddingBottom: 0}
        }}
        {...modalProps}
        fullScreen={mobile}
    >
        {children}
    </Modal>
}

export default BasicModal;