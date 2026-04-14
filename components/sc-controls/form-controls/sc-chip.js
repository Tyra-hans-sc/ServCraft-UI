import React, { useState } from 'react';
import NoSSR from '../../../utils/no-ssr';
import { Chip } from '@progress/kendo-react-buttons';

function SCChip({text, value, disabled = false}) {

    return (
        <div>
            <NoSSR>
                <Chip
                    text={text}
                    value={value}
                    disabled={disabled ? disabled : false}
                />
            </NoSSR>            
        </div>
    );
}

export default SCChip;
