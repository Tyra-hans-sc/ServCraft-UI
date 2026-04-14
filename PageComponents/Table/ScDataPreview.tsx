import { FC, useMemo } from "react";
import { Box, Button, Flex, Group, Title, Text, Drawer } from "@mantine/core";
import { formatDate } from "@/PageComponents/Table/table-helper";
import { IconPencil } from "@tabler/icons";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";

export interface ScDataPreviewProps {
    label: string
    key: string
    type?: 'employee' | 'text' | 'date' | 'html'
}

const ScDataPreview: FC<{ data: any; onClose: () => void; onOpen: (() => void) | undefined; config: ScDataPreviewProps[] }> = (props) => {

    return useMemo(() => (
        <Drawer onClose={props.onClose} opened={!!props.data} position={'right'} >
            {!!props.data?.JobCardNumber &&
                <Title
                    my={'lg'}
                    size={24}
                    c={'gray.8'}
                >
                    Job {props.data?.JobCardNumber}
                </Title>
            }
            <Flex direction={'column'} gap={'sm'}>
                {
                    !!props.data &&
                    props.config.map(col => {
                        const value = () => {
                            switch (col.type) {
                                case 'employee': {
                                    return <Group gap={'xs'} mt={'xs'}>
                                        {
                                            props.data[col.key].length === 0 ?
                                                <Text size={'sm'} c={'gray.7'}>No Employees Assigned</Text> :
                                                props.data[col.key] && props.data[col.key].map(
                                                    e => (
                                                        <Flex gap={3} key={'empp' + e.ID}>
                                                            <EmployeeAvatar name={e.FullName}
                                                                color={e.DisplayColor} />
                                                            <Text size={'sm'} c={'gray.7'} lineClamp={1}>{e.FullName}</Text>
                                                        </Flex>
                                                    )
                                                )
                                        }
                                    </Group>
                                }
                                case 'date': {
                                    return <Text size={'sm'} color={'gray.7'}>{formatDate(props.data[col.key])}</Text>
                                }
                                case 'html': {
                                    return <div dangerouslySetInnerHTML={{
                                        __html: props.data[col.key]
                                    }}></div>
                                }
                                default: {
                                    return <Text size={'sm'} color={'gray.7'}>{props.data[col.key]}</Text>
                                }

                            }
                        }
                        return (
                            props.data[col.key] &&
                            <Box key={'preview' + col.key}>
                                <Text size={'md'} color={'scBlue.9'}>{col.label}</Text>
                                {value()}
                            </Box>
                        )
                    })
                }

            </Flex>

            <Group mt={'calc(100% - 7rem)'} justify={'left'} gap={'xs'}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => props.onClose()}>
                    Close
                </Button>
                {props.onOpen &&
                    <Button color={'scBlue'}
                        type={'button'}
                        leftSection={<IconPencil size={18} />}
                        onClick={props.onOpen}
                    >
                        Open
                    </Button>
                }
            </Group>
        </Drawer>
    ), [props.data])
}

export default ScDataPreview
