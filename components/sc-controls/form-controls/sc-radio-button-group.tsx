import { Radio } from "@mantine/core";
import React, { useRef } from 'react';

function SCRadioButtonGroup({ children, name, label, hint, required, onChange, value, orientation, valueOutputConverter = (e) => e }) {

    const ref = useRef<any>();

    function innerOnChange(e) {
        if (e) {
            e = valueOutputConverter(e);
        }
        onChange && onChange({ name: name, value: e, target: ref.current })
    };

    return (
        <Radio.Group
            ref={ref}
            name={name}
            label={label}
            description={hint}
            withAsterisk={required}
            onChange={innerOnChange}
            value={value}
            // todo orientation={orientation}
            styles={{
                root: {gap: 0}
            }}
        >
            {children}
        </Radio.Group>
    );
}

export default SCRadioButtonGroup;