import {Text, Flex, Box, Title} from '@mantine/core'
import React from "react";


const JobCardWizardIntro = () => {
    return <Box w={{base: '100vw', xs: '80vw'}} maw={660}>
        <Flex w={'100%'} bg="#F1F8FF" p={'sm'} justify={'space-between'} wrap={'wrap-reverse'}>
                <Box flex={3} h={180} miw={150}>
                    <Flex direction="column" p="sm" h={200} justify="center">
                        <Title order={3}>
                            See what your job card will look like
                        </Title>
                        <Text mt="sm">You can close this job later.</Text>
                    </Flex>
                </Box>
                <Box flex={1} mx={'auto'}>
                    <img src="/sc-icons/job-wizard-card.svg"/>
                </Box>
            </Flex>
        <Box maw={'80vw'} px={'sm'}>
            <Text mt="md" p="sm" size="md">
                Completing the demo helps you create jobs faster on ServCraft.
            </Text>
        </Box>
    </Box>;
}

export default JobCardWizardIntro;
