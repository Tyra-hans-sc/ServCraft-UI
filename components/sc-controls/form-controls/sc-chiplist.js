import React, { useState } from 'react';
import NoSSR from '../../../utils/no-ssr';
import { ChipList } from '@progress/kendo-react-buttons';

function SCChipList({options, textField, valueField, handleChange, disabled = false, extraClasses, cypress}) {

    const onDataChange = (e) => {
        handleChange(e.target.value);
    };

    return (
        <div className={`chiplist-container ${extraClasses}`}>
            <NoSSR>
                <ChipList
                    selection="multiple"
                    data={options}
                    onDataChange={onDataChange}
                    textField={textField}
                    valueField={valueField}
                    disabled={disabled ? disabled : false}
                />
            </NoSSR>
        </div>
    );
}

export default SCChipList;
