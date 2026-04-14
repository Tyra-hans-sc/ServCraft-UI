import { FC, useState } from 'react';
import SCModal from '../Modal/SCModal';
import { Button, Flex, Title } from '@mantine/core';
import { Warehouse } from '@/interfaces/api/models';
import WarehouseSelector from '@/components/selectors/warehouse/warehouse-selector';

const QuickGRVModal: FC<{
    storeID: string | null
    onConfirm: (warehouseID: string | null) => void
    onClose: () => void
    hasVanStock: boolean
}> = ({ storeID, onConfirm, onClose, hasVanStock }) => {

    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    return (<>

        <SCModal
            open={true}
            onClose={onClose}
            withCloseButton={true}
            size={'lg'}
        >
            <Title size={'lg'}>Confirm Quick Receive (GRV)</Title>
            <p>ServCraft will automatically create and complete a GRV for all outstanding materials in this purchase order</p>

            {hasVanStock &&
                <WarehouseSelector
                    label='Warehouse/Van'
                    selectedWarehouse={selectedWarehouse}
                    setSelectedWarehouse={setSelectedWarehouse}
                    required={false}
                    canClear={true}
                    filterByEmployee={false}
                    storeID={storeID ?? undefined}
                    onSuppressSave={(suppress) => { }}
                />}



            <Flex justify={'flex-end'} gap={'md'} mt={'md'}>
                <Button
                    variant={"outline"}
                    onClick={() => {
                        onClose();
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        onConfirm(selectedWarehouse?.ID ?? null); // Assuming null for warehouseID, adjust as needed
                        onClose();
                    }}
                >
                    Confirm
                </Button>
            </Flex>

        </SCModal>

        <style jsx>{`
            
        `}</style>
    </>);
};

export default QuickGRVModal;