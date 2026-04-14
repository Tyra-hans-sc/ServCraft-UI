import SCInput from "../../sc-controls/form-controls/sc-input";
import { useState } from "react";
import {Button, Flex} from "@mantine/core";
import {Title} from "@mantine/core";
import SCModal from "@/PageComponents/Modal/SCModal";

export default function ManageTableHeading({ definition, setDefinition, onDismiss }) {

    const [def, setDef] = useState(definition);

    const updateDef = ({ name, value }) => {
        setDef({
            ...def,
            [name]: value
        });
    };

    const onUpdate = () => {
        setDefinition && setDefinition(def);
        onDismiss && onDismiss();
    };

    return (<>

        {/*<SCModal title="Edit Heading" onDismiss={onDismiss}>*/}

        <SCModal
            open={true}
            onClose={onDismiss}
            withCloseButton
            size={550}
        >

            <Title
                c={'scBlue'}
                order={4}
                // mb={-20}
            >
                {def.label ? 'Create Heading' : 'Edit Heading'}
            </Title>


            <SCInput
                name={"Label"}
                // label={"Label"}
                value={def.Label}
                onChange={updateDef}
                autoFocus={true}
            />

            <Flex justify={'end'} gap={5} mt={'xl'}>
                <Button variant="outline" onClick={onDismiss} >Cancel</Button>
                <Button onClick={onUpdate} >Update</Button>
            </Flex>
        </SCModal>

        <style jsx>{`
        
        .row {
            display: flex;
        }

        .row.align-right {
            justify-content: flex-end;
        }

        `}</style>
    </>);
}