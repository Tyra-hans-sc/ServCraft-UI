import React, { useState, useEffect, useCallback } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import { RadioButton } from "@progress/kendo-react-inputs";

function KendoRadioButton({name, value, changeHandler}) {

    const [selectedValue, setSelectedValue] = useState();

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    // const handleChange = useCallback(
    //     (e) => {
    //         setSelectedValue(!e.value);
    //         changeHandler(!e.value);
    //     },
    //     [setSelectedValue]
    // );

    const handleChange = (e) => {
        setSelectedValue(!e.value);
        changeHandler(!e.value);
    };

    return (
        <div>
            <RadioButton
                name={name}
                value={value}
                checked={selectedValue}
                onChange={handleChange}
            />
        </div>
    )
}

export default KendoRadioButton;
