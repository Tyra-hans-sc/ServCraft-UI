import React, {FC} from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import CreateOrEditPaymentForm, {PaymentProps} from "@/PageComponents/Payments/CreateOrEditPaymentForm";
import {Payment} from "@/PageComponents/Payments/payments";
import {PaymentModalProps} from "@/PageComponents/Payments/CreateOrEditPaymentModal";
import {Button, Group, Loader, Title} from "@mantine/core";

const CreateOrEditPaymentModal: FC<{deletePaymentItem: Payment | null; onClose: () => void;  onDelete: () => void; } & PaymentModalProps> = (props) => {

    return (
        <>
            <SCModal
                open={!!props.deletePaymentItem}
                onClose={props.onClose}
                size={'md'}
            >

                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={'md'}
                    fw={600}
                >
                    {'Deleting Payment'}
                </Title>
                This payment will be removed permanently.  <br/> Are you sure you wish to continue?

                <Group mt={'var(--mantine-spacing-md)'} justify={'right'} gap={'xs'}>
                    <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                        !!props.onClose && props.onClose()
                    }}>
                        Cancel
                    </Button>

                    <Button type={'button'} variant={'outline'} color={'yellow.7'} onClick={() => {
                        !!props.onDelete && props.onDelete()
                    }}>
                        Delete Payment
                    </Button>
                </Group>
            </SCModal>
        </>
    )

}

export default CreateOrEditPaymentModal;
