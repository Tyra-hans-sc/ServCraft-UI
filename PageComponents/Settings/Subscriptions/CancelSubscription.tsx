import React, { useState } from 'react';
import {Anchor, Button, Flex, Text, Title} from '@mantine/core';
import CancelSubscriptionModal from "@/PageComponents/Settings/Subscriptions/CancelSubscriptionModal";
import {IconCloudCancel} from "@tabler/icons-react";

interface CancelSubscriptionProps {
    onCancelCompleted: (cancelledRes: any) => void;
    isCancelled: boolean;
}


const CancelSubscription: React.FC<CancelSubscriptionProps> = ({ isCancelled, ...props }) => {
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

    return (

        <>

            <Title order={5} mt={2} mb={12}>Your subscription</Title>

            <Flex w={'100%'} align={'center'} justify={'space-between'} gap={'sm'} >
                <Text size='sm' ta={'end'}>
                    Any queries? &nbsp;Please contact&nbsp;<Anchor href="mailto:support@servcraft.co.za">support@servcraft.co.za</Anchor>
                </Text>

                {!isCancelled &&
                    <Button
                        onClick={
                            () => setShowCancelModal(true)
                        }
                        variant='light'
                        color='yellow.7'
                        type={'button'}
                        rightSection={<IconCloudCancel />}
                    >
                        Cancel Subscription
                    </Button>
                }
            </Flex>

            <CancelSubscriptionModal onClose={() => setShowCancelModal(false)} open={showCancelModal} {...props} />
        </>
    )
}

export default CancelSubscription;