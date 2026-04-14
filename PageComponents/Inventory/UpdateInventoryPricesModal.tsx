import React, { FC, useState, useEffect } from 'react';
import SCModal from '@/PageComponents/Modal/SCModal';
import {Button, Checkbox, Flex, Text, Title, Loader, Stack, Box, Table, Alert, Space, Center, Badge} from '@mantine/core';
import { IconInfoCircle, IconCircleCheck, IconCircleX, IconExclamationCircle } from '@tabler/icons-react';
import Helper from '@/utils/helper';
import Fetch from '@/utils/Fetch';
import * as Enums from '@/utils/enums';
import styles from './UpdateInventoryPricesModal.module.css';

export interface InventoryUpdateVariant {
    id: string;
    newCost: number;
    newPrice: number;
    costDiffersFromInventory: boolean;
    priceDiffersFromInventory: boolean;
    count: number;
}

export interface InventoryUpdateItem {
    inventoryId: string;
    materialName: string;
    originalCost: number;
    originalPrice: number;
    variants: InventoryUpdateVariant[];
    isConflicting: boolean;
    // For UI state management
    updateCost?: boolean;
    updatePrice?: boolean;
}

export interface InventoryPriceDetectionResult {
    items: InventoryUpdateItem[];
    serviceExcludedCount: number;
    bundledExcludedCount: number;
}

export const detectInventoryPriceChanges = (
    currentItems: any[],
    module: 'Quote' | 'PurchaseOrder',
    hasCostingPermission: boolean = true
): InventoryPriceDetectionResult => {
    const isPO = module === 'PurchaseOrder';

    // 1. Group all items by InventoryID and their price pair to count occurrences
    const groups: Record<string, Record<string, { item: any; count: number }>> = {};
    let serviceExcludedCount = 0;
    let bundledExcludedCount = 0;

    currentItems.forEach((item) => {
        const invId = item.InventoryID;
        if (!invId || !item.Inventory) return;
        
        // Inventory check based on module
        const isInventory = (item.QuoteItemType === Enums.QuoteItemType.Inventory || item.ItemType === Enums.ItemType.Inventory);
        if (!isInventory) {
            console.log(`Item ${item.Description} is not an inventory item, skipping...`);
            return
        };

        // Check if there is a price change relative to inventory before counting as excluded
        const inventoryCost = Helper.roundToTwo(item.Inventory.CostPrice || 0);
        const inventoryPrice = Helper.roundToTwo(item.Inventory.ListPrice || 0);

        const cost = isPO ? Helper.roundToTwo(item.UnitPriceExclusive || 0) : Helper.roundToTwo(item.UnitCostPrice || 0);
        const price = isPO ? inventoryPrice : Helper.roundToTwo(item.UnitPriceExclusive || 0);

        const costChanged = hasCostingPermission && (cost !== inventoryCost);
        const priceChanged = !isPO && (price !== inventoryPrice);

        if (!costChanged && !priceChanged) {
            return
        };

        // Exclude services and bundled items but count them
        if (item.FromBundleID) {
            // if item price list discount is null the item is not seen as a bundle item, in some cases the item has
            // from bundle id even though it is no longer in a section and usePriceList = null
            const isRelevant = item.UsePriceList === null || item.BundleDiscountedPercentage === null || (item.BundleDiscountedPercentage === 0 && item.UsePriceList);
            if (!isRelevant) {
                console.log(`Item ${item.Description} is part of a bundle, excluding...`, item);
                bundledExcludedCount++;
                return;
            }
        }
        if (item.Inventory.StockItemType === Enums.StockItemType.Service) {
            console.log(`Item ${item.Description} is a service, excluding...`);
            serviceExcludedCount++;
            return;
        }

        const key = `${cost}_${price}`;

        if (!groups[invId]) groups[invId] = {};
        if (!groups[invId][key]) {
            groups[invId][key] = { item, count: 0 };
        }
        groups[invId][key].count++;
    });

    const result: InventoryUpdateItem[] = [];

    console.log('Groups:', groups);

    Object.entries(groups).forEach(([invId, variants]) => {
        const allVariants: InventoryUpdateVariant[] = [];
        let hasChangesToPrompt = false;
        let inventoryDetails: { materialName: string; originalCost: number; originalPrice: number } | null = null;

        const variantKeys = Object.keys(variants);
        const isConflicting = variantKeys.length > 1;

        for (const [key, { item, count }] of Object.entries(variants)) {
            const inventory = item.Inventory;

            if (!inventoryDetails) {
                const originalCost = Helper.roundToTwo(inventory.CostPrice || 0);
                const originalPrice = Helper.roundToTwo(inventory.ListPrice || 0);
                inventoryDetails = {
                    materialName: inventory?.Description || item.InventoryDescription || item.Description,
                    originalCost,
                    originalPrice
                };
            }

            const inventoryCost = inventoryDetails.originalCost;
            const inventoryPrice = inventoryDetails.originalPrice;

            const currentCost = isPO ? Helper.roundToTwo(item.UnitPriceExclusive || 0) : Helper.roundToTwo(item.UnitCostPrice || 0);
            const currentPrice = isPO ? inventoryPrice : Helper.roundToTwo(item.UnitPriceExclusive || 0);

            const hasCost = hasCostingPermission && (isPO ? item.UnitPriceExclusive != null : item.UnitCostPrice != null);
            const hasPrice = !isPO && item.UnitPriceExclusive != null;

            const costDiffersFromInventory = hasCost && currentCost !== inventoryCost;
            const priceDiffersFromInventory = hasPrice && currentPrice !== inventoryPrice;

            const variant: InventoryUpdateVariant = {
                id: key,
                newCost: currentCost,
                newPrice: currentPrice,
                costDiffersFromInventory,
                priceDiffersFromInventory,
                count
            };

            allVariants.push(variant);

            // Check if this variant warrants a prompt
            if (costDiffersFromInventory || priceDiffersFromInventory) {
                hasChangesToPrompt = true;
            }
        }

        if (hasChangesToPrompt && inventoryDetails) {
            result.push({
                inventoryId: invId,
                materialName: inventoryDetails.materialName,
                originalCost: inventoryDetails.originalCost,
                originalPrice: inventoryDetails.originalPrice,
                variants: allVariants,
                isConflicting,
                updateCost: !isConflicting && allVariants[0]?.costDiffersFromInventory,
                updatePrice: !isConflicting && allVariants[0]?.priceDiffersFromInventory
            });
        }
    });


    console.log('Result:', {
        items: result,
        serviceExcludedCount,
        bundledExcludedCount
    });

    return {
        items: result,
        serviceExcludedCount,
        bundledExcludedCount
    };
};

interface UpdateInventoryPricesModalProps {
    opened: boolean;
    onClose: () => void;
    onContinue: (updatedInventories?: Record<string, { CostPrice: number; ListPrice: number }>) => void;
    detectionResult: InventoryPriceDetectionResult;
    module: 'Quote' | 'PurchaseOrder';
    hasCostPricePermission?: boolean;
}

const UpdateInventoryPricesModal: FC<UpdateInventoryPricesModalProps> = ({
    opened,
    onClose,
    onContinue,
    detectionResult,
    module,
    hasCostPricePermission = true,
}) => {
    const [items, setItems] = useState<InventoryUpdateItem[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            setItems(detectionResult?.items || []);
            setIsUpdating(false);
            setIsSuccess(false);
            setIsError(false);
            setError(null);
        }
    }, [opened, detectionResult]);

    useEffect(() => {
        console.log('bundledExcludedCount changed:', detectionResult?.bundledExcludedCount);
    }, [detectionResult?.bundledExcludedCount]);

    const visibleItems = items.filter(i => !i.isConflicting);
    const conflictingCount = items.filter(i => i.isConflicting).length;
    const serviceExcludedCount = detectionResult?.serviceExcludedCount || 0;
    const bundledExcludedCount = detectionResult?.bundledExcludedCount || 0;

    const handleUpdateChange = (inventoryId: string, field: 'updateCost' | 'updatePrice', value: boolean) => {
        setItems(prev => prev.map(item => 
            item.inventoryId === inventoryId ? { ...item, [field]: value } : item
        ));
    };

    const selectableCostItems = visibleItems.filter(i => i.variants[0]?.costDiffersFromInventory);
    const allCostSelected = selectableCostItems.length > 0 && selectableCostItems.every(i => i.updateCost);
    const someCostSelected = visibleItems.some(i => i.updateCost);

    const selectablePriceItems = visibleItems.filter(i => i.variants[0]?.priceDiffersFromInventory);
    const allPriceSelected = selectablePriceItems.length > 0 && selectablePriceItems.every(i => i.updatePrice);
    const somePriceSelected = visibleItems.some(i => i.updatePrice);

    const toggleAll = (field: 'updateCost' | 'updatePrice', value: boolean) => {
        setItems(prev => prev.map(item => {
            if (item.isConflicting) return item;
            const variant = item.variants[0];
            const canUpdate = field === 'updateCost' ? variant?.costDiffersFromInventory : variant?.priceDiffersFromInventory;
            if (!canUpdate) return item;
            return { ...item, [field]: value };
        }));
    };

    const handleUpdate = async () => {
        const toUpdate = items.filter(i => i.updateCost || i.updatePrice);
        if (toUpdate.length === 0) {
            onContinue();
            return;
        }

        setIsUpdating(true);
        setError(null);
        setIsError(false);
        setIsSuccess(false);

        const payload = toUpdate.map(group => {
            const variant = group.variants[0];
            const updateItem: any = {
                InventoryID: group.inventoryId,
                ListPrice: null,
                CostPrice: null,
            };
            if (group.updatePrice) updateItem.ListPrice = variant.newPrice;
            if (group.updateCost && hasCostPricePermission) updateItem.CostPrice = variant.newCost;

            return updateItem;
        });

        try {
            const response = await Fetch.post({
                url: `/Inventory/PriceUpdate`, // Placeholder endpoint
                params: payload
            });

            if (!response?.serverMessage && !response?.Message && !response?.message) {
                const updatedInventories: Record<string, { CostPrice: number; ListPrice: number }> = {};
                toUpdate.forEach(group => {
                    const variant = group.variants[0];
                    updatedInventories[group.inventoryId] = {
                        CostPrice: (group.updateCost && hasCostPricePermission) ? variant.newCost : group.originalCost,
                        ListPrice: group.updatePrice ? variant.newPrice : group.originalPrice,
                    };
                });

                setIsSuccess(true);
                setIsUpdating(false);
                setTimeout(() => {
                    onContinue(updatedInventories);
                }, 1000);
            } else {
                setError(response?.serverMessage || response?.Message || null);
                setIsError(true);
                setIsUpdating(false);
            }
        } catch (err: any) {
            console.error(`Failed to update inventory prices:`, err);
            setError(null);
            setIsError(true);
            setIsUpdating(false);
        }
    };

    const isPO = module === 'PurchaseOrder';
    const showCostColumn = hasCostPricePermission;
    const showListPriceColumn = !isPO;

    return (
        <SCModal
            open={opened}
            onClose={onClose}
            size={isUpdating || isSuccess || isError ? "md" : "auto"}
            withCloseButton={!(isUpdating || isSuccess)}
        >
            {isUpdating ? (
                <Center p="xl" w={400} maw={'100%'}>
                    <Stack align="center" gap="md">
                        <Loader size="24px" color="scBlue" />
                        <Title order={5} fw={700} ta={{base: 'center', xs: 'left'}}>Updating prices</Title>
                    </Stack>
                </Center>
            ) : isSuccess ? (
                <Center p="xl" w={400} maw={'100%'}>
                    <Stack align="center" gap="md">
                        <IconCircleCheck size={40} color="var(--mantine-color-scBlue-6)" />
                        <Title order={5} fw={700} ta={{base: 'center', xs: 'left'}}>Prices updated successfully</Title>
                    </Stack>
                </Center>
            ) : isError ? (
                <Center p="xl" w={400} maw={'100%'}>
                    <Stack align="center" gap="md">
                        <IconExclamationCircle size={40} color="var(--mantine-color-red-7)" />
                        <Title order={5} fw={700} c="red.7" ta={{base: 'center', xs: 'left'}}>Prices Update Failed</Title>
                        {error && <Text c="red.7" size="sm" ta="center">{error}</Text>}
                        <Button variant="subtle" color="red.7" onClick={handleUpdate} size="sm">
                            Please try again
                        </Button>
                    </Stack>
                </Center>
            ) : (
                <>
                    <Title mb={13} px={'sm'} order={5} ta={{base: 'center', xs: 'left'}}>Update inventory prices</Title>
                    <Stack gap={35} px={'sm'}>
                        <Text size="sm">
                            Please select the items you’d like to update in your inventory list as well.
                            {/*Please select what items to update in your inventory list as well.*/}
                        </Text>

                        <Box style={{ overflowX: 'auto' }}>
                            <Table
                                verticalSpacing={13}
                                withTableBorder
                                withColumnBorders
                                striped={'even'}
                                className={styles.table}
                                classNames={{
                                    th: styles.th,
                                    tr: styles.tr,
                                }}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th miw={'min(33vw, 240px)'}>
                                            <Flex align="center" gap="xs">
                                                <Text size="sm" fw={700} c={'gray.8'}>Material</Text>
                                                <TextBadge>{visibleItems.length}</TextBadge>
                                            </Flex>
                                        </Table.Th>
                                        {showCostColumn && (
                                            <Table.Th miw={'min(33vw, 240px)'}>
                                                <Flex align="center" gap="xs" justify="space-between">
                                                    <Text size="sm" fw={700} c={'gray.8'}>Cost price</Text>
                                                    <Checkbox
                                                        mr={5}
                                                        size="xs"
                                                        labelPosition={'left'}
                                                        fw={400}
                                                        styles={{
                                                            label: {
                                                                fontSize: 14
                                                            }
                                                        }}
                                                        label="Select all"
                                                        checked={allCostSelected}
                                                        indeterminate={someCostSelected && !allCostSelected}
                                                        onChange={(e) => toggleAll('updateCost', e.currentTarget.checked)}
                                                        disabled={selectableCostItems.length === 0}
                                                    />
                                                </Flex>
                                            </Table.Th>
                                        )}
                                        {showListPriceColumn && (
                                            <Table.Th miw={'min(33vw, 240px)'}>
                                                <Flex align="center" gap="xs" justify="space-between">
                                                    <Text size="sm" fw={700} c={'gray.8'}>List Price</Text>
                                                    <Checkbox
                                                        mr={5}
                                                        size="xs"
                                                        labelPosition={'left'}
                                                        fw={400}
                                                        styles={{
                                                            label: {
                                                                fontSize: 14
                                                            }
                                                        }}
                                                        label="Select all"
                                                        checked={allPriceSelected}
                                                        indeterminate={somePriceSelected && !allPriceSelected}
                                                        onChange={(e) => toggleAll('updatePrice', e.currentTarget.checked)}
                                                        disabled={selectablePriceItems.length === 0}
                                                    />
                                                </Flex>
                                            </Table.Th>
                                        )}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {visibleItems.length > 0 ? visibleItems.map((item) => {
                                        const variant = item.variants[0];
                                        return (
                                            <Table.Tr key={item.inventoryId}>
                                                <Table.Td maw={500}>
                                                    <Text size="sm"  c={'gray.8'}>{item.materialName}</Text>
                                                </Table.Td>
                                                {showCostColumn && (
                                                    <Table.Td>
                                                        <Flex align="center" justify="space-between" gap="sm">
                                                            <Text size="sm" mb={0} c={'gray.8'}>
                                                                {variant?.costDiffersFromInventory ? (
                                                                    <Flex align="center" gap={4} display="inline-flex">
                                                                        {Helper.getCurrencyValue(item.originalCost)} &rarr; <TextBadge>{Helper.getCurrencyValue(variant.newCost)}</TextBadge>
                                                                    </Flex>
                                                                ) : (
                                                                    Helper.getCurrencyValue(item.originalCost)
                                                                )}
                                                            </Text>
                                                            <Checkbox
                                                                mr={5}
                                                                size="xs"
                                                                disabled={!variant?.costDiffersFromInventory}
                                                                checked={!!item.updateCost}
                                                                onChange={(e) => handleUpdateChange(item.inventoryId, 'updateCost', e.currentTarget.checked)}
                                                            />
                                                        </Flex>
                                                    </Table.Td>
                                                )}
                                                {showListPriceColumn && (
                                                    <Table.Td>
                                                        <Flex align="center" justify="space-between" gap="sm">
                                                            <Text size="sm" mb={0} c={'gray.8'}>
                                                                {variant?.priceDiffersFromInventory ? (
                                                                    <Flex align="center" gap={4} display="inline-flex">
                                                                        {Helper.getCurrencyValue(item.originalPrice)} &rarr; <TextBadge>{Helper.getCurrencyValue(variant.newPrice)}</TextBadge>
                                                                    </Flex>
                                                                ) : (
                                                                    Helper.getCurrencyValue(item.originalPrice)
                                                                )}
                                                            </Text>
                                                            <Checkbox
                                                                mr={5}
                                                                size="xs"
                                                                disabled={!variant?.priceDiffersFromInventory}
                                                                checked={!!item.updatePrice}
                                                                onChange={(e) => handleUpdateChange(item.inventoryId, 'updatePrice', e.currentTarget.checked)}
                                                            />
                                                        </Flex>
                                                    </Table.Td>
                                                )}
                                            </Table.Tr>
                                        );
                                    }) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={1 + (showCostColumn ? 1 : 0) + (showListPriceColumn ? 1 : 0)}>
                                                <Text ta="center" size="sm" py="md" c="dimmed">
                                                    No item price discrepancies to show
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>

                        {(conflictingCount > 0 || serviceExcludedCount > 0 || bundledExcludedCount > 0) && (
                            <Alert style={{border: '1px solid var(--mantine-color-blue-2)'}} color="blue" icon={<IconInfoCircle size={16} />}>
                                <Stack gap="xs">
                                    <Text size="sm" fw={500} my={2} c={'blue.9'}>
                                        Prices from bundles, services and repeated items are not included.
                                    </Text>
                                </Stack>
                            </Alert>
                        )}
                    </Stack>

                    <Space h={40} />

                    <Flex px={'sm'} justify="flex-end" gap="md" w="100%">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            {items.some(i => i.updateCost || i.updatePrice) 
                                ? "Approve and update prices" 
                                : isPO ? "Approve Purchase Order" : "Approve Quote"}
                        </Button>
                    </Flex>
                </>
            )}
        </SCModal>
    );
};

const TextBadge = ({children}) => {
    return <Badge variant="light" color="scBlue" radius="sm" size="md" py={10} fw={700} styles={{label: {fontSize: 13}}}>{children}</Badge>

}

export default UpdateInventoryPricesModal;
