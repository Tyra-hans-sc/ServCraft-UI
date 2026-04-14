import React from 'react';
import { Box, Paper, Group, Stack, Text, ThemeIcon, Container, SimpleGrid } from '@mantine/core';
import { IconActivity, IconBox, IconClipboardCheck } from '@tabler/icons-react';

const StatCard = ({ icon, title, value, color }) => {
    return (
        <Paper shadow="xs" p="md" radius="md">
            <Group>
                <ThemeIcon size="lg" radius="xl" color={color} variant="light">
                    {icon}
                </ThemeIcon>
                <div>
                    <Text size="sm" c="dimmed">{title}</Text>
                    <Text size="xl" fw={700}>{value}</Text>
                </div>
            </Group>
        </Paper>
    );
};

const InventoryDashboard = () => {
    return (
        <Container>
            <SimpleGrid cols={3} spacing="md">
                <StatCard
                    icon={<IconActivity size={20} stroke={1.5} />}
                    title="Active Stock Takes"
                    value="1"
                    color="blue"
                />

                <StatCard
                    icon={<IconBox size={20} stroke={1.5} />}
                    title="Items Counted Today"
                    value="42"
                    color="yellow"
                />

                <StatCard
                    icon={<IconClipboardCheck size={20} stroke={1.5} />}
                    title="Completed This Month"
                    value="3"
                    color="teal"
                />
            </SimpleGrid>
        </Container>
    );
};

export default InventoryDashboard;