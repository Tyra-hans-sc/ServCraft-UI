import {FC} from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import CreateOrEditPaymentForm, {PaymentProps} from "@/PageComponents/Payments/CreateOrEditPaymentForm";

export interface PaymentModalProps {
    show?: boolean,
    onClose?: () => void
}

const CreateOrEditPaymentModal: FC<PaymentProps & PaymentModalProps> = (props) => {

    return (
        <>
            <SCModal
                open={typeof props.show === 'undefined' || props.show}
                onClose={props.onClose}
                size={'xl'}
            >
                <CreateOrEditPaymentForm {...props}/>
            </SCModal>
        </>
    )

}

export default CreateOrEditPaymentModal;
