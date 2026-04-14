import {FC} from "react";
import {WhatsNewDetail} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import {
    ActionIcon,
    Alert,
    Box,
    Button,
    ColorSwatch,
    Flex,
    List,
    Text,
    Tooltip
} from "@mantine/core";
import Link from "next/link";
import {IconExternalLink, IconInfoCircle} from "@tabler/icons";
import Image from "next/image";

const WhatsNewMiniContentRendering: FC<{data: WhatsNewDetail | undefined}> = ({data}) => {


    return <Box
        // pos={'relative'}
        maw={'95%'}
    >
        <Flex direction={'column'} gap={5} key={'whatsnew'}>
            {
                data?.sections?.[0]?.minorDetail?.map(
                    (z, j) => (
                        <Box key={'whatsNew' + /*i +*/ '-' + j}>
                            {
                                z.type === 'heading' ? (
                                        z.items.map(
                                            (item, k) => (
                                                <Text size={'lg'} c={'scBlue.0'}
                                                      key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                      style={{...item.style}}
                                                >
                                                    {item.text}
                                                </Text>
                                            )
                                        )
                                    ) :
                                    z.type === 'list' ? (
                                            <List>
                                                {
                                                    z.items.map(
                                                        (item, k) => (
                                                            <List.Item
                                                                key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                                icon={<ColorSwatch color={'white'} size={6} />}
                                                            >
                                                                <Flex align={'center'}>
                                                                    <Text size={'sm'} c={'scBlue.0'}
                                                                          key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                                          style={{...item.style}}
                                                                    >
                                                                        {item.text}
                                                                    </Text>
                                                                    {
                                                                        item.href &&
                                                                        <Link href={item.href} >
                                                                            <Tooltip color={'scBlue.3'} label={<Text size={'sm'}>Take me there</Text>}
                                                                                     events={{ hover: true, focus: true, touch: true }}
                                                                            >
                                                                                <ActionIcon variant={'subtle'} color={'white'} size={'xs'} ml={5}>
                                                                                    <IconExternalLink size={14} />
                                                                                </ActionIcon>
                                                                            </Tooltip>
                                                                        </Link>
                                                                    }
                                                                </Flex>
                                                            </List.Item>
                                                        )
                                                    )
                                                }
                                            </List>
                                        ) :
                                        z.type === 'image' ? (
                                                z.items.map(
                                                    (item, k) => (
                                                        item.src &&
                                                        <Flex
                                                            h={150}
                                                            key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                            pos={'relative'}
                                                            mt={'sm'}
                                                            // justify={'center'}
                                                        >
                                                            <Image
                                                                quality={20}
                                                                alt={''}
                                                                src={item.src}
                                                                fill
                                                                style={{objectFit: 'contain', objectPosition: 'left'}}
                                                            />
                                                        </Flex>
                                                    )
                                                )
                                            ) :
                                            z.type === 'paragraph' ? (
                                                    z.items.map(
                                                        (item, k) => (
                                                            <Text size={'md'} c={'scBlue.0'}
                                                                  key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                                  style={{...item.style}}
                                                            >
                                                                {item.text}
                                                            </Text>
                                                        )
                                                    )
                                                ) :
                                                z.type === 'info' ? <>
                                                        <Alert variant={'light'} color={'teal'} icon={<IconInfoCircle />}>
                                                            {
                                                                z.items.map(
                                                                    (item, k) => (
                                                                        <Flex
                                                                            align={'center'}
                                                                            key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                                        >
                                                                            <Text size={'sm'} c={'scBlue.0'}
                                                                                  key={'whatsNew' + /*i +*/ '-' + j + '-' + k}
                                                                                  style={{...item.style}}
                                                                            >
                                                                                {item.text}
                                                                            </Text>
                                                                            {
                                                                                item.href &&
                                                                                <Link href={item.href} >
                                                                                    <Tooltip color={'scBlue.3'} label={<Text size={'sm'}>Take me there</Text>}
                                                                                             events={{ hover: true, focus: true, touch: true }}
                                                                                    >
                                                                                        <ActionIcon variant={'subtle'} size={'xs'} ml={5} color={'white'}>
                                                                                            <IconExternalLink size={14} />
                                                                                        </ActionIcon>
                                                                                    </Tooltip>
                                                                                </Link>
                                                                            }
                                                                        </Flex>
                                                                    )
                                                                )
                                                            }
                                                        </Alert>
                                                    </> :
                                                    <></>
                            }
                        </Box>
                    )
                )
            }
            {
                data?.sections?.[0]?.link &&
                <Link href={data?.sections?.[0]?.link}>
                    <Button
                        style={{float: 'right'}}
                        variant={'subtle'}
                    >
                        View Feature
                    </Button>
                </Link>
            }
        </Flex>
        {
            /*data?.sections.map((y, i) => (
            ))*/
        }
    </Box>

}

export default WhatsNewMiniContentRendering
