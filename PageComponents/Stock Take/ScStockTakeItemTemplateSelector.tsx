import React, { FC, useState } from "react";
import ScDynamicSelect, { DynamicSelectProps } from "@/components/sc-controls/form-controls/ScDynamicSelect";
import { StocktakeTemplateDto } from "@/PageComponents/Stock Take/StockTake.model";
import stockService from "@/services/stock/stock-service";
import CreateStocktakeTemplateModal from "@/PageComponents/Stock Take/Stocktake Template/CreateStocktakeTemplateModal";

const getStockItemTemplates = async (searchphrase: string = '') => {
    const warehouseResults = await stockService.getTemplates(searchphrase);

    if(!warehouseResults.Results) {
        throw new Error((warehouseResults as any)?.serverMessage || (warehouseResults as any)?.message || 'Something went wrong')
    }

    return warehouseResults.Results;
};

type StockTakeItemTemplateSelectorProps = Omit<DynamicSelectProps<StocktakeTemplateDto>, 'queryFn' | 'queryKey'>;

const ScStockTakeItemTemplateSelector: FC<StockTakeItemTemplateSelectorProps> = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleTemplateCreated = (template: StocktakeTemplateDto) => {
        // If there's an onChange handler in props, call it with the new template ID
        if (props.onChange) {
            props.onChange(template.ID, template);
        }
    };

    return (
        <>
            <ScDynamicSelect
                labelProp={'Name'}
                autoselect1Item
                placeholder="Search item templates"
                multiSelect={false}
                queryKey="stocktakeTemplate"
                queryFn={getStockItemTemplates}
                showCreateButton={true}
                createButtonText="Add template"
                onCreateClick={() => setShowCreateModal(true)}
                {...props}
            />

            <CreateStocktakeTemplateModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTemplateCreated={handleTemplateCreated}
            />
        </>
    );
};

export default ScStockTakeItemTemplateSelector;