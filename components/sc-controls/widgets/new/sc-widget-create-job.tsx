import { FC, useEffect, useState } from 'react';
import { Box, Button, Flex, Text, Title } from '@mantine/core';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import SCWidgetCard from './sc-widget-card';
import { IconPlus } from '@tabler/icons';
import { modals } from '@mantine/modals';
import JobCardWizardIntro from '@/PageComponents/Dashboard/JobCardWizard/JobCardWizardIntro';
import JobCardWizard from '@/PageComponents/Dashboard/JobCardWizard/JobCardWizard';
import modalStyles from '@/styles/Misc.module.css';
import { useAtom } from 'jotai';
import { justCompletedSetupAtom } from '@/utils/atoms';

const SCWidgetCreateJob: FC<{ key: string; onDismiss: (() => void) | undefined; widget: WidgetConfig }>
    = ({ key, onDismiss, widget }) => {

    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardTitle, setWizardTitle] = useState('Fill in a few details to craft your very first job card.');
    const [formState, setFormState] = useState<{ valid: boolean; value: any }>({ valid: false, value: {} });


    const [justCompletedSetup, setJustCompletedSetup] = useAtom(justCompletedSetupAtom);

    useEffect(() => {
        if (justCompletedSetup) {
            setWizardTitle('Fill in a few details to craft your very first job card.');
            modals.openConfirmModal({
                children: (<JobCardWizardIntro />),
                classNames: { body: modalStyles.noPadding },
                labels: { confirm: "Let's Do it", cancel: 'Skip for now' },
                onCancel: () => {},
                cancelProps: {
                    size: 'md',
                    variant: 'subtle',
                    color: 'dark.6',
                },
                confirmProps: {
                    size: 'md',
                    styles: { root: { paddingLeft: 60, paddingRight: 60 } },
                },
                onConfirm: () => setWizardOpen(true),
            });
            setJustCompletedSetup(false);
        }
    }, [justCompletedSetup]);

    const onAddJob = () => {
        setWizardTitle('Fill in a few details to craft a new job card.');
        modals.openConfirmModal({
            children: (<JobCardWizardIntro />),
            classNames: { body: modalStyles.noPadding },
            labels: { confirm: "Let's Do it", cancel: 'Skip for now' },
            onCancel: () => {},
            cancelProps: {
                size: 'sm',
                variant: 'subtle',
                color: 'dark.6',
            },
            confirmProps: {
                size: 'sm',
                styles: { root: { paddingLeft: 20, paddingRight: 20 } },
            },
            onConfirm: () => setWizardOpen(true),
        });
    };

    return (<>
        <SCWidgetCard height={widget.heightPX} onDismiss={onDismiss}>
            <Flex h={'100%'} align={'start'} justify={'space-between'} style={{ gap: 'var(--mantine-spacing-md)' }} wrap={'wrap-reverse'}>
                <Box flex={1}>
                    <Title c={'dark.7'} order={3}>
                        See what your job card will look like.
                    </Title>
                    <Text mt="sm" size="sm">
                        Follow the steps to create your first job card.
                    </Text>
                    <Button mt={50} color={'scBlue'} rightSection={<IconPlus size={16} />} onClick={onAddJob}>
                        Create job
                    </Button>
                </Box>
                <Flex justify={'center'} flex={1} mx={'auto'} miw={100} >
                    <img src="/sc-icons/job-wizard-card.svg" style={{ maxWidth: '100%', height: 'auto' }} />
                </Flex>
            </Flex>
        </SCWidgetCard>

        {/* Job Card Wizard Modal */}
        <JobCardWizard
            opened={wizardOpen}
            onClose={() => setWizardOpen(false)}
            onFormStateChange={setFormState}
            initialValue={formState.value}
            subtitle={wizardTitle}
        />
    </>);
};

export default SCWidgetCreateJob;
