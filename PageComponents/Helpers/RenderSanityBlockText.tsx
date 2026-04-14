import {
    Blockquote, Box, Card,
    Group,
    List,
    Text, TextProps,
    Title,
    TitleOrder
} from "@mantine/core";
import {FC, ReactNode} from "react";
import Image from "next/image";

export interface BlockTextContent {
    style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote'
    _key: string
    markDefs: any[]
    children: [
        BlockTextContentLineItem
    ]
    _type: 'block' | 'image'
    listItem?: 'bullet'
    level?: number
    asset?: {
        _ref: string
        _type: 'reference',
    }
    imageUrl?: string
}

interface BlockTextContentLineItem {
    text: string
    _key: string
    _type: string
    marks: any[]
}

const getRenderedTextOutput = (x: BlockTextContent, y: BlockTextContentLineItem, textProps?: TextProps) => {
    switch (x.style) {
        case 'normal':
            return <Text key={y._key}
                         // lh={1.5}
                         color={'gray.8'}
                         // align={'justify'}
                         fw={y.marks.includes('strong') && 'bold' || 'normal'}
                         // italic={y.marks.includes('em')}
                         {...textProps}
            >
                {y.text}
            </Text>
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            return (
                <Title
                    color={'gray.8'}
                    key={y._key}
                    order={+x.style.replace('h', '') as TitleOrder}
                    // align={'justify'}
                    fw={y.marks.includes('strong') && 'bold' || 'normal'}
                    // italic={y.marks.includes('em')}
                    {...textProps as any}
                >
                    {y.text}
                </Title>
            )
        case 'blockquote':
            return <Group key={y._key} align={'center'}>
                <Blockquote mx={'auto'} color={'scBlue.3'}>
                    {y.text}
                </Blockquote>
            </Group>
    }
}

const RenderSanityBlockText: FC<{blockContent: BlockTextContent[]; rightSection?: ReactNode; leftSection?: ReactNode, textColor: string}> =
    ({blockContent, rightSection, leftSection, textColor = 'gray.8'}) => {

    return <>

        {
            rightSection && (
                <Card radius={'lg'} className={'float-md-end border border-light ms-md-4 mb-4 mt-md-5 mt-4'} bg={'gray.1'} miw={250} p={'var(--mantine-spacing-lg)'}>
                    {rightSection}
                </Card>
            )
        }

        {
            leftSection && (
                <Card radius={'lg'} className={'float-md-start border border-light me-md-4 mb-4 mt-md-1 mt-4'} bg={'gray.1'} miw={250} p={'var(--mantine-spacing-lg)'}>
                    {leftSection}
                </Card>
            )
        }

        {
            blockContent.map(
            (x, i) => {
                switch (x._type) {
                    case "block": {
                        return x.children.map(y => {
                            if(x.listItem) {
                                const isStartOfList = !blockContent[i - 1]?.listItem
                                if (isStartOfList) {
                                    const endOfList = blockContent.findIndex((c, idx) => !c.listItem && idx > i)
                                    const listItems = blockContent.slice(i, endOfList).map(
                                            li => <li key={'li' + li._key}>
                                                {li.children.map(lix => getRenderedTextOutput(li, lix, {my: 0, color: textColor}))}
                                            </li>
                                        )
                                    return <ul key={y._key}
                                               style={{
                                                   marginTop: 5,
                                                   marginBottom: 5,
                                                   color: textColor,
                                                   fontSize: 12
                                               }}
                                    >
                                        {listItems}
                                    </ul>
                                }


                            } else {
                                return getRenderedTextOutput(x, y, {
                                    mt: 0,
                                    mb: blockContent[i + 1]?.listItem ? 0 : 0,
                                    color: textColor,
                                    size: 'sm'
                                })
                            }
                        })
                    }
                    case "image": {
                        return !!x.imageUrl &&
                            <div className={'position-relative float-end m-2'}>
                                <Image
                                    src={x.imageUrl}
                                    placeholder={'blur'}
                                    blurDataURL={x.imageUrl}
                                    alt={''}
                                    width={300}
                                    height={300}
                                    style={{
                                        objectFit: 'contain',
                                        objectPosition: 'center'
                                    }}
                                />
                            </div>
                    }
                    default: return <></>
                }
            }
        )}

    </>
}

export default RenderSanityBlockText