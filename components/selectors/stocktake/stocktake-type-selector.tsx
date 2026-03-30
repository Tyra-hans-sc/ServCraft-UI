import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import { FC, useCallback } from 'react';
import * as Enums from '@/utils/enums';
import ScDynamicSelect from '@/components/sc-controls/form-controls/ScDynamicSelect';

type StocktakeTypeSelectorProps = {
    error?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    selectedStocktakeType: number | undefined
    setSelectedStocktakeType: (stocktakeType: number | undefined) => void
    label?: string;
    placeholder?: string;
}


const stocktakeTypes = Enums.getEnumItemsVD(Enums.StocktakeType, true).map(x => ({description: x.description, value: x.value.toString()}));

const StocktakeTypeSelector: FC<StocktakeTypeSelectorProps> = ({ label = "Type", placeholder = "Select stocktake type", ...props }) => {

    const handleChange = useCallback((value: string | undefined) => {
        props.setSelectedStocktakeType(value ? parseInt(value) : undefined);
    }, []);

    const getStockItemTypes = useCallback(async (searchphrase: string = '') => {
        return stocktakeTypes.filter(x => x.description.toLowerCase().includes(searchphrase.toLowerCase()));
    }, [])

    return (<>


        <ScDynamicSelect
            label={label}
            queryKey={'stocktakeTypeSelector'}
            queryFn={getStockItemTypes}
            placeholder={placeholder}
            multiSelect={false}
            autoselect1Item
            required={props.required}
            labelProp={'description'}
            renderOption={({ option }: { option: { value: any, description: string } }) => <>
                <span>{option.description}</span>
            </>}
            value={props.selectedStocktakeType?.toString() ?? ''}
            onChange={(x, emp: { value: string, description: string } | undefined) => {
                props.setSelectedStocktakeType && props.setSelectedStocktakeType(parseInt(emp?.value ?? ''));
            }}
            error={props.error}
        />

        {/* <SCComboBox
            dataItemKey="value"
            textField="description"
            error={props.error}
            options={stocktakeTypes}
            label={label}
            name="StocktakeTypeSelector"
            onChange={handleChange}
            value={props.selectedStocktakeType}
            required={props.required}
            forceBlurOnChange
            canClear={true}
            disabled={props.disabled}
            readOnly={props.readOnly}
        /> */}

        <style jsx>{`

        `}</style>
    </>);
};

export default StocktakeTypeSelector;