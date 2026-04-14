import SCModal from "@/PageComponents/Modal/SCModal";
import {FC, useState} from "react";
import {Box, Button, Flex, Textarea, Title} from "@mantine/core";


const ScRichTextEditorRawHtmlEditor: FC<{html: string, onUpdate: (newHtml: string) => void, open: boolean}> = ({html: incomingHtml, ...props}) => {

    const [html, setHtml] = useState(incomingHtml)

    return <>

        <SCModal
            size={1000}
            open={props.open}
            withCloseButton={true}
            onClose={() => props.onUpdate(incomingHtml)}
        >
            <Box>
                <Title order={4} c={'scBlue'}>Raw HTML</Title>
                <Textarea
                    value={html}
                    onChange={(e) => setHtml(e.currentTarget.value)}
                    autosize
                    maxRows={20}
                    rows={10}
                    styles={{
                        'input': {
                            overflowX: 'hidden'
                        }
                    }}
                    maw={'100%'}
                />
                <Flex mt={'xl'}>
                    <Button
                        ml={'auto'}
                        onClick={() => props.onUpdate(html)}
                    >
                        Update
                    </Button>
                </Flex>
            </Box>

        </SCModal>

    </>;
}


export default ScRichTextEditorRawHtmlEditor