import {FC} from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import LinkPaymentsComponent from "@/PageComponents/Payments/LinkPaymentsComponent";
// import {PaymentModalProps} from "@/PageComponents/Payments/CreateOrEditPaymentModal";
// import { LinkPaymentsComponentProps } from "@/PageComponents/Payments/LinkPaymentsComponent";

const LinkPaymentsModal: FC<any> = (props) => {

    return (
        <>
            <SCModal
                size={'lg'}
                open={typeof props.show === 'undefined' || props.show}
                onClose={props.onClose}
            >
                <LinkPaymentsComponent {...props}/>
            </SCModal>
        </>
    )

}

export default LinkPaymentsModal;
