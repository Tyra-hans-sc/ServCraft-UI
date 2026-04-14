import { FC, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {
    Button,
    Flex,
    Group, lighten, Menu,
    Progress,
    Skeleton,
    Stack,
    Text,
    useMantineTheme
} from "@mantine/core";
import Link from "next/link";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import {IconCheck, IconPlus} from "@tabler/icons";
import SCWidgetCard from "./sc-widget-card";
import SCWidgetTitle from "./sc-widget-title";
import {IconPhoneFilled} from "@tabler/icons-react";
import {useRouter } from "next/router";

interface CheckListItem {
    Complete: boolean;
    Description: string;
    DisplayOrder: number;
    Label: string;
    Link: string;
    Name: string;
    Show: true
}

interface Data {
    Results: CheckListItem[]
}

const skeletons = [6, 4, 8, 7].map(
    (x) => <Flex key={'skeleton' + x} gap={'xs'} my={'var(--mantine-spacing-md)'}>
        <Skeleton height={16} circle />
        <Skeleton height={14} width={x * 30} radius="xl" />
    </Flex>
)


// todo need to update titles, descriptions on api
const SCWidgetChecklist: FC<{ key: string, onDismiss: (() => void) | undefined, widget: WidgetConfig }> = ({ key, onDismiss, widget }) => {

    const theme = useMantineTheme();
    const checklistItemsResponse = async () => await Fetch.get({
        url: '/Dashboard/GetChecklistForWidget'
    } as any);

    const { isFetching, isLoading, data } = useQuery<Data>(['widgetCheckList'], checklistItemsResponse);
    const [percentageComplete, setPercentageComplete] = useState(0);

    const router = useRouter()

    useEffect(() => {
        let complete = 0;
        const shown = data && data.Results.filter(x => x.Show) || [];
        shown.forEach(x => {
            if (x.Complete) complete++
        });
        setPercentageComplete(Math.round(complete / shown.length * 100));
    }, [data]);

    const sendMixPanelEvent = (item: CheckListItem) => {
        // event.preventDefault()
        Helper.mixpanelTrack(constants.mixPanelEvents.checklist, {
            name: item.Name,
            label: item.Label,
            alreadyComplete: item.Complete
        } as any)
    }



    const [showContactSales, setShowContactSales] = useState(false)

    return <>
        <SCWidgetCard height={widget.heightPX} dismissHidden={percentageComplete < 100} onDismiss={onDismiss}>
            <Group grow>
                <div>

                    <Flex justify={'space-between'} align={'center'}>
                        <SCWidgetTitle title="Get Started"/>

                        <Menu closeOnItemClick={false}>
                            <Menu.Target>
                                <Button
                                    rightSection={<IconPhoneFilled size={15}/>}
                                    size={'xs'}
                                    variant={'subtle'}
                                    color={'dark.6'}
                                >
                                    Speak to a real person
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label c={'dark.6'}>
                                    Call us on:
                                </Menu.Label>
                                <Menu.Item color={'dark.6'}
                                >
                                    +27 10 500 3305
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>

                    </Flex>


                    {
                        !isLoading && !isNaN(percentageComplete) &&
                        <Text size={'sm'} color={'scBlue'}>{percentageComplete}% complete</Text> ||
                        <Skeleton mb={7} height={10} width={90} radius={'lg'}/>
                    }
                    {
                        isLoading && <Skeleton height={10} radius={'xl'} mb={'var(--mantine-spacing-lg)'}/>
                        || <>
                            <Progress mb={'var(--mantine-spacing-lg)'} radius={'xl'} value={percentageComplete}
                                      color={'scBlue'}/>
                        </>
                    }

                    {
                        isLoading && skeletons ||
                        <Stack gap={'xs'}>
                            {
                                data?.Results?.sort((a, b) =>
                                    a.DisplayOrder - b.DisplayOrder
                                ).filter(x => x.Show).map(
                                    (x, i) =>
                                        <Flex key={'checkItem' + i} align="center" gap="xs">
                                            <Flex
                                                // color={'scBlue'}
                                                align={'center'}
                                                justify={'center'}
                                                style={(t) => ({
                                                    height: 35,
                                                    width: 35,
                                                    borderRadius: '50%',
                                                    backgroundColor: lighten(t.colors.scBlue[5], .9),
                                                    fontWeight: 700,
                                                    color: t.colors.scBlue[5]
                                                })}
                                            >
                                                {x.Complete ? <IconCheck stroke={4} size={15}/> :
                                                    <Text mr={2}>{i + 1}</Text>}
                                            </Flex>
                                            <Text c={'initial'} size={'md'} fw={500}
                                                  td={x.Complete ? 'line-through' : ''}
                                            >{x.Label}</Text>
                                            <Link
                                                href={'/' + x.Link}
                                                style={{textDecoration: 'none', marginLeft: 'auto'}}
                                                onClick={e => {
                                                    sendMixPanelEvent(x)
                                                }}
                                            >
                                                <Button
                                                    /*styles={t => ({
                                                        root: {
                                                            '&:hover': {
                                                                backgroundColor: t.fn.lighten(t.colors.scBlue[5], .8)
                                                            },
                                                            display: 'block',
                                                            justifyItems: 'end',
                                                            justifyContent: 'end',
                                                            textAlign: 'right'
                                                            // justifyContent: 'right',
                                                            // minWidth: 120
                                                        },
                                                        label: {
                                                            // justifySelf: 'end',
                                                            // width: 80,
                                                            textAlign: 'right',
                                                            // marginLeft: 'auto'
                                                        }
                                                    })}*/
                                                    ml={'auto'}
                                                    rightSection={<IconPlus size={15}/>}
                                                    size={'xs'}
                                                    variant={'subtle'}
                                                    color={'scBlue'}
                                                >
                                                    Add {x.Name.endsWith('s') ? x.Name.slice(0, x.Name.length - 1) : x.Name}
                                                </Button>
                                            </Link>

                                        </Flex>
                                )
                            }
                        </Stack>
                    }
                </div>

            </Group>
        </SCWidgetCard>
    </>;
}

export default SCWidgetChecklist
