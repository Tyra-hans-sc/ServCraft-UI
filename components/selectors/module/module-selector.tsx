import { FC } from 'react';
import * as Enums from '@/utils/enums';
import EnumSelector from '../enum-selector';

const ModuleSelector: FC<{
    value: number | null | undefined
    name: string
    error?: string
    optionFilter?: (x: number) => boolean
    optionProcessor?: (value: number, description: string) => string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    label: string
    onChange?: (val: number | null | undefined) => void
    canClear?: boolean
}> = ({ value, name, error, optionFilter, required = false, disabled = false, readOnly = false, label, onChange, canClear = false, optionProcessor }) => {

    return (<>

        <EnumSelector
            value={value}
            name={name}
            error={error}
            optionFilter={optionFilter}
            optionProcessor={optionProcessor}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            label={label}
            onChange={onChange}
            canClear={canClear}
            theEnum={Enums.Module}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default ModuleSelector;