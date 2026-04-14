import {FC} from "react";
import {Title, LoadingOverlay} from "@mantine/core";
import SCModal from "@/PageComponents/Modal/SCModal";
import StocktakeTemplateForm from "@/PageComponents/Stock Take/Stocktake Template/StocktakeTemplateForm";
import {StocktakeTemplateDto} from "@/PageComponents/Stock Take/StockTake.model";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import StockService from "@/services/stock/stock-service";
import {notifications} from "@mantine/notifications";
import helper from "@/utils/helper";
import {useMediaQuery} from "@mantine/hooks";

interface CreateStocktakeTemplateModalProps {
    show: boolean;
    onClose: () => void;
    onTemplateCreated: (template: StocktakeTemplateDto) => void;
}

const CreateStocktakeTemplateModal: FC<CreateStocktakeTemplateModalProps> = ({
    show,
    onClose,
    onTemplateCreated
}) => {
    const tooSmall = useMediaQuery('(max-width: 768px)');
    const queryClient = useQueryClient();

    const templateMutation = useMutation({
        mutationFn: StockService.postTemplate,
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['stocktakeTemplate'] });
            
            notifications.show({
                message: "Stock take template has been created successfully",
                color: "scBlue"
            });
            
            // Notify parent component
            onTemplateCreated(data);
            
            // Close the modal
            onClose();
        },
        onError: (error: Error) => {
            notifications.show({
                title: "Error",
                message: error.message || "Failed to create template",
                color: "yellow"
            });
        }
    });

    const handleSubmit = (values: Partial<StocktakeTemplateDto>) => {
        templateMutation.mutate(values);
    };

    return (
        <SCModal 
            open={show}
            onClose={onClose}
            withCloseButton
            size={1000}
            modalProps={{
                fullScreen: tooSmall,
            }}
        >
            <LoadingOverlay visible={templateMutation.isLoading} />
            <Title order={3} c={'scBlue.7'} mb="md">Create Stock Take Template</Title>
            <StocktakeTemplateForm
                isNestedForm={true}
                // initialValues={initialValues}
                onSubmit={handleSubmit}
                submitting={templateMutation.isLoading}
                onCancel={onClose}
            />
        </SCModal>
    );
};

export default CreateStocktakeTemplateModal;