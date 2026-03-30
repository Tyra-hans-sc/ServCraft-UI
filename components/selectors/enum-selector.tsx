import { FC, useMemo } from 'react';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import * as Enums from '@/utils/enums';

const EnumSelector: FC<{
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
    theEnum: any
}> = ({ theEnum, value, name, error, optionFilter, required = false, disabled = false, readOnly = false, label, onChange, canClear = false, optionProcessor }) => {

    const options = useMemo(() => {
        let opts = Enums.getEnumItemsVD(theEnum, true, true);
        if (optionFilter) {
            opts = opts.filter(x => optionFilter(x.value));
        }
        if (optionProcessor) {
            opts.forEach(x => {
                x.description = optionProcessor(x.value, x.description);
            });
        }
        return opts;
    }, [optionFilter]);

    const valueChanged = (e: any) => {
        onChange && onChange(e?.value || null);
    };

    const selectedValue = useMemo(() => {
        return options.find(x => x.value === value);
    }, [value]);

    return (<>

        <SCDropdownList
            value={selectedValue}
            name={name}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            options={options}
            dataItemKey='value'
            textField='description'
            label={label}
            onChange={valueChanged}
            canClear={canClear}
            error={error}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default EnumSelector;