import {FC, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {
    ActionIcon,
    Avatar, Button,
    Card,
    Center,
    CheckIcon, CloseButton,
    ColorSwatch,
    Flex,
    Group,
    Progress,
    Skeleton,
    Stack,
    Text,
    useMantineTheme
} from "@mantine/core";
import Link from "next/link";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";

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
        <Skeleton height={14} width={x*30} radius="xl" />
    </Flex>
)


// todo need to update titles, descriptions on api
const ChecklistWidgetV2: FC<{key: string, widget: string, onDismiss: () => void}> = ({key, widget, onDismiss}) => {

    const theme = useMantineTheme();
    const checklistItemsResponse = async () => await Fetch.get({
        url: '/Dashboard/GetChecklistForWidget'
    } as any);

    const {isFetching, isLoading, data} = useQuery<Data>(['widgetCheckList'], checklistItemsResponse);
    const [percentageComplete, setPercentageComplete] = useState(0);

    useEffect(() => {
        let complete = 0;
        const shown = data && data.Results.filter(x => x.Show) || [];
        shown.forEach(x => {
            if (x.Complete) complete++
        });
        setPercentageComplete(Math.round(complete / shown.length * 100));
    }, [data]);

    const sendMixPanelEvent = (item: CheckListItem) => {
        Helper.mixpanelTrack(constants.mixPanelEvents.checklist, {
            name: item.Name,
            label: item.Label,
            alreadyComplete: item.Complete
        } as any)
    }

    return <>
        <Card shadow="sm" padding="var(--mantine-spacing-lg)" radius="md" mx={0} withBorder>
            <CloseButton style={{
                            position: 'absolute',
                            right: 20,
                            top: 20
                            }}
                         hidden={percentageComplete < 100}
                         onClick={onDismiss}
            />
            <Group grow>
                {/*<div style={{minWidth: '50%'}}>*/}
                <div>
                    <Group color={'scBlue'} mb={'var(--mantine-spacing-lg)'} gap={'xs'}>
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.8901 0.753806L15.2482 1.11189C15.4464 1.30368 15.5369 1.58123 15.4896 1.85303L14.6569 6.43314C14.4992 7.20758 14.0639 7.89766 13.4328 8.37344L11.1428 10.1722C11.521 11.2275 11.1499 12.4055 10.2352 13.0535L6.90427 15.4018C6.71751 15.5306 6.46201 15.4862 6.3297 15.3019L6.08821 14.9605C5.70798 14.4173 5.55927 13.7452 5.67485 13.0923C5.79044 12.4394 6.16082 11.8592 6.70442 11.4796L7.44554 10.955L5.02232 8.53166L4.49771 9.2728C4.11808 9.81642 3.53792 10.1868 2.88504 10.3024C2.23215 10.418 1.5601 10.2693 1.01693 9.88904L0.67551 9.64754C0.491226 9.51522 0.446792 9.25972 0.575583 9.07294L2.92386 5.74196C3.57185 4.82721 4.7498 4.45611 5.80508 4.83426L7.60376 2.51923C8.0941 1.90168 8.79284 1.4842 9.56899 1.34506L14.149 0.512309C14.4208 0.465075 14.6983 0.555513 14.8901 0.753806ZM8.74459 3.44358L5.76345 7.23257L8.76957 10.2388L12.5668 7.24923C12.8983 6.97609 13.1249 6.59645 13.208 6.17499L13.4411 4.90088L11.1012 2.56087L9.82713 2.79403C9.40176 2.87814 9.01898 3.10782 8.74459 3.44358ZM9.19426 5.04245C8.73567 5.53462 8.7492 6.30158 9.22487 6.77726C9.70054 7.25295 10.4675 7.26648 10.9596 6.80787C11.4182 6.3157 11.4047 5.54874 10.929 5.07306C10.4534 4.59737 9.68642 4.58384 9.19426 5.04245ZM3.63584 11.3647C3.74686 11.3647 3.85328 11.4091 3.93146 11.4879L4.51436 12.0708C4.59318 12.149 4.63752 12.2554 4.63752 12.3665C4.63752 12.4775 4.59318 12.5839 4.51436 12.6621L1.79969 15.3768C1.72151 15.4557 1.61509 15.5 1.50407 15.5C1.39305 15.5 1.28663 15.4557 1.20845 15.3768L0.625547 14.7939C0.546725 14.7157 0.502388 14.6093 0.502388 14.4983C0.502388 14.3873 0.546725 14.2808 0.625547 14.2027L3.34022 11.4879C3.4184 11.4091 3.52482 11.3647 3.63584 11.3647Z"
                                  fill={theme.colors.scBlue[5]}
                            />
                        </svg>
                        <Text size={'xl'} c={'scBlue'} fw={'bolder'}>
                            Get Setup
                        </Text>
                    </Group>
                    {
                        isLoading && <Skeleton height={10} radius={'xl'} />
                        || <>
                            <Progress my={'var(--mantine-spacing-lg)'} radius={'xl'} value={percentageComplete} color={'scBlue'} />
                        </>
                    }

                    {
                        isLoading && skeletons ||
                        <Stack gap={'xs'}>
                            {
                                data?.Results?.sort((a, b) =>
                                    a.DisplayOrder - b.DisplayOrder
                                ).map(
                                    (x, i) =>
                                        x.Show &&
                                        <Link key={'checkItem' + i} href={x.Link} style={{cursor: 'pointer', textDecoration: 'none'}}>
                                            <Flex align="center" gap="xs" onClick={() => sendMixPanelEvent(x)}>
                                                <ColorSwatch
                                                    color={x.Complete ? theme.colors.scBlue[5] : '#fff'}
                                                    size={16}
                                                    style={{color: '#fff'}}
                                                >
                                                    {x.Complete && <CheckIcon width={8}/>}
                                                </ColorSwatch>
                                                <Text color={'initial'} fw={500}>{x.Label}</Text>
                                            </Flex>
                                        </Link>
                                )
                            }
                        </Stack>
                    }
                </div>


                <Center>
                    <Avatar color={'blue'} radius={100}  size={120}>
                        <svg width="81" height="88" viewBox="0 0 81 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M64.0369 0.835449H24.6348C20.2867 0.835449 16.762 4.36698 16.762 8.72338V71.0912C16.762 75.4476 20.2867 78.9792 24.6348 78.9792H72.6266C76.9745 78.9792 80.4993 75.4476 80.4993 71.0912V17.3295L64.0369 0.835449Z" fill="white"/>
                            <path d="M80.4475 17.3425H67.8869C65.732 17.3425 63.9854 15.5924 63.9854 13.4334V0.835449L80.4475 17.3425Z" fill="#F0F0F0"/>
                            <path d="M57.0993 20.9713H30.1205C29.0156 20.9713 28.12 20.0757 28.12 18.9708V18.9671C28.12 17.8621 29.0156 16.9666 30.1205 16.9666H57.0993C58.2042 16.9666 59.0998 17.8621 59.0998 18.9671V18.9708C59.0998 20.0757 58.2042 20.9713 57.0993 20.9713Z" fill="#F0F0F0"/>
                            <path d="M67.1406 34.9303H30.1203C29.0156 34.9303 28.12 34.0347 28.12 32.9298V32.9261C28.12 31.8214 29.0156 30.9258 30.1203 30.9258H67.1406C68.2455 30.9258 69.1411 31.8214 69.1411 32.9261V32.9298C69.1411 34.0347 68.2455 34.9303 67.1406 34.9303Z" fill="#F0F0F0"/>
                            <path d="M67.1406 48.8888H30.1203C29.0156 48.8888 28.12 47.9932 28.12 46.8885V46.8846C28.12 45.7799 29.0156 44.8843 30.1203 44.8843H67.1406C68.2455 44.8843 69.1411 45.7799 69.1411 46.8846V46.8885C69.1411 47.9932 68.2455 48.8888 67.1406 48.8888Z" fill="#F0F0F0"/>
                            <path d="M67.1406 62.848H30.1203C29.0156 62.848 28.12 61.9524 28.12 60.8475V60.8438C28.12 59.7389 29.0156 58.8433 30.1203 58.8433H67.1406C68.2455 58.8433 69.1411 59.7389 69.1411 60.8438V60.8475C69.1411 61.9524 68.2455 62.848 67.1406 62.848Z" fill="#F0F0F0"/>
                            <path d="M19.892 81.0528C13.8504 78.372 9.48246 74.6352 6.55859 69.653C5.44563 67.7578 4.78031 65.5302 4.46386 62.6424C4.11609 59.4644 4.20062 56.2631 4.28975 52.874C4.32479 51.5398 4.36115 50.1599 4.36859 48.785C4.371 48.2318 4.39093 47.671 4.41174 47.0778C9.07512 45.8104 14.0738 44.4465 19.8911 42.854C25.3567 44.3485 30.3816 45.7216 35.3575 47.0691C35.3757 48.1503 35.4114 49.2113 35.4462 50.2508C35.5007 51.8661 35.5524 53.3922 35.5211 54.6775L35.5202 54.7842L35.5224 55.059C35.5528 59.1158 35.5769 62.3198 34.8768 65.3552C33.969 69.2845 31.6218 72.836 27.701 76.2122C25.4745 78.1308 22.9124 79.7197 19.892 81.0528Z" fill="#003ED0"/>
                            <path d="M16.8837 68.3163C16.4519 68.3163 16.02 68.1513 15.6906 67.8217L11.9746 64.102C11.3152 63.4422 11.3152 62.3724 11.9742 61.7127C12.6334 61.0529 13.7018 61.0531 14.361 61.7125L16.8837 64.2374L26.5844 54.5268C27.243 53.8667 28.3123 53.8667 28.9709 54.5268C29.6303 55.1864 29.6303 56.2562 28.9709 56.9159L18.077 67.8213C17.7476 68.1513 17.3157 68.3163 16.8837 68.3163Z" fill="white"/>
                        </svg>
                    </Avatar>
                </Center>



            </Group>

            <Group justify={'right'} mt={'var(--mantine-spacing-sm)'} hidden={percentageComplete < 100}>
                <Button color={'gray.9'} variant={'subtle'} onClick={onDismiss}>Dismiss</Button>
            </Group>
        </Card>
    </>
}

export default ChecklistWidgetV2
