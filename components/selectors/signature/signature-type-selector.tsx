import { FC } from 'react';
import * as Enums from '@/utils/enums';
import EnumSelector from '../enum-selector';

const SignatureTypeSelector: FC<{
    value: number | null | undefined
    name: string
    error?: string
    optionFilter?: (x: number) => boolean
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    label: string
    onChange?: (val: number | null | undefined) => void
    canClear?: boolean
}> = ({ value, name, error, optionFilter, required = false, disabled = false, readOnly = false, label, onChange, canClear = false }) => {

    return (<>
        <EnumSelector
            value={value}
            name={name}
            error={error}
            optionFilter={optionFilter}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            label={label}
            onChange={onChange}
            canClear={canClear}
            theEnum={Enums.SignatureType}
        />
        <style jsx>{`
            
        `}</style>
    </>);
};

export default SignatureTypeSelector;