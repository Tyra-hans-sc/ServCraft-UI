import { SCPillInputProps, SCPillItem } from "./sc-control-interfaces/sc-pill-interfaces";
import {Group} from "@mantine/core";

export default function SCPill(inputProps: SCPillInputProps) {

    const {
        items = [],
        onChange,
        disabled = false
    } = inputProps;

    const onClick = (item: SCPillItem) => {
        let itemsTemp = [...items];
        let idx = itemsTemp.findIndex(x => x.label == item.label);
        if (idx > -1) {
            itemsTemp[idx].selected = !itemsTemp[idx].selected;
            onChange && onChange(itemsTemp);
        }
    }

    return (<>

        <Group  gap={'xs'}>
            {items.map((item, key) => {
                return (
                    <div className={`pill ${item.selected ? "selected" : ""}`} key={key} onClick={() => onClick(item)}>
                        {item.label}
                    </div>
                );
            })}
        </Group>

        <style jsx>{`
            
            /*.pill-container {
                display: flex;
            }*/

            .pill {
                padding: 12px 16px;
                color: #5D5F60;
                border: 1px solid #F0F0F0;
                border-radius: 6px;
                background: #FFFFFF;
                cursor: pointer;
                -webkit-user-select: none; /* Safari */
                user-select: none; /* Standard syntax */
            }

            .pill:hover {
                background: #FAFAFA;
            }

            /*.pill + .pill {
                margin-left: 1rem;
            }*/

            .pill.selected {
                border: 1px solid #003ED0;
                color: #003ED0;
                background: rgb(230, 236, 250);
            }

        `}</style>
    </>);
};
