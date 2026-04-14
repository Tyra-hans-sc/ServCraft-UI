import SCSwitch from "@/components/sc-controls/form-controls/sc-switch";
import SCModal from "@/PageComponents/Modal/SCModal";
import helper from "@/utils/helper";
import { Button, Flex } from "@mantine/core";
import { FC, useState } from 'react';

const EditUserConfigMetaDataModal: FC<{
    metaData: any
    onChange: (newMetaData: any) => void
}> = (props) => {

    const [metaData, setMetaData] = useState(JSON.parse(JSON.stringify(props.metaData)));


    const updateMetaDataValue = (key, value) => {
        let metaTemp = JSON.parse(JSON.stringify(metaData)) as any;
        metaTemp.values[key] = value;
        setMetaData(metaTemp);
    }

    return (<>

        <SCModal
            open={true}
            withCloseButton={true}
            onClose={() => props.onChange(null)}
            headerSection={<h3 style={{ marginLeft: "1rem", marginBottom: 0 }}>Edit preferences</h3>}

        >

            {metaData && metaData.values && Object.keys(metaData.values).map((key, idx) => {
                const type = metaData.types[key];
                return <div key={idx}>
                    {type === "switch" ? <><SCSwitch
                        checked={metaData.values[key] === true}
                        label={helper.splitWords(metaData.labels[key])}
                        onToggle={(newVal) => {
                            updateMetaDataValue(key, newVal);
                        }}
                    />
                        {metaData.titles[key] && <div style={{ fontSize: "0.7rem", marginTop: "0.5rem", opacity: 0.7 }}>{metaData.titles[key]}</div>}
                    </> :
                        "Not supported type"}
                </div>
            })}

            <Flex mt={32} justify={"right"}>
                <Button
                    mr="sm"
                    variant="light"
                    onClick={() => props.onChange(null)}>Cancel</Button>
                <Button
                    onClick={() => props.onChange(metaData.values)}>Save Preferences</Button>
            </Flex>

        </SCModal>
        <style jsx>{`
            
        `}</style>
    </>);
};

export default EditUserConfigMetaDataModal;