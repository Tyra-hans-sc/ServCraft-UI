'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { Box, Center, CloseButton, Flex,Grid,ScrollArea, SimpleGrid, Text } from '@mantine/core';
import MaterialsInventorySelector, { InventoryLike, NewInventoryStub } from './MaterialsInventorySelector';
import styles from './MaterialsManager.module.css';
import { IconBox } from '@tabler/icons-react';

export type MaterialItem = {
  key: string; // ID or tempId
  quantity: number;
  description: string;
  isNew: boolean;
  inventoryId?: string;
  tempId?: string;
  inventory?: any; // full DTO for existing inventory
};

export interface MaterialsManagerProps {
  initialItems?: MaterialItem[];
  onChange?: (items: MaterialItem[]) => void; // non-controlled emitter
}

const makeKey = (item: InventoryLike) => ('ID' in item && item.ID) ? item.ID : (item as NewInventoryStub).tempId;

const MaterialsManager: FC<MaterialsManagerProps> = ({ initialItems = [], onChange }) => {
  const [items, setItems] = useState<MaterialItem[]>(initialItems);

  useEffect(() => {
    // Emit whenever internal state changes, but skip if items is just the initialItems
    if (items !== initialItems) {
      onChange?.(items);
    }
  }, [items, onChange, initialItems]);

  const drafts: NewInventoryStub[] = useMemo(() => {
    return items.filter(i => i.isNew && i.tempId && i.description).map(i => ({ tempId: i.tempId!, Description: i.description, isNew: true }));
  }, [items]);

  const excludedIds = useMemo(() => items.filter(x => !x.tempId).map(i => i.key), [items]);

  const handleAdd = (inv: InventoryLike, qty: number) => {
    const key = makeKey(inv);
    const description = inv.Description;
    const isNew = !('ID' in inv && inv.ID);
    const next = [...items];
    const found = next.find(i => i.key === key || i.description.trim().toLowerCase() === description.trim().toLowerCase());
    if (found) {
      found.quantity += qty;
      setItems([...next]);
    } else {
      next.push({
        key,
        quantity: qty,
        description,
        isNew,
        inventoryId: 'ID' in inv ? inv.ID : undefined,
        tempId: 'ID' in inv ? undefined : (inv as NewInventoryStub).tempId,
        inventory: 'ID' in inv ? inv : undefined,
      });
      setItems(next);
    }
  };

  const handleRemove = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  return (
    <Box className={styles.container}>
      <div className={styles.controlsRow}>
        <MaterialsInventorySelector drafts={drafts}
                                    // excludedIds={excludedIds}
                                    onAdd={handleAdd} />
      </div>
        <ScrollArea
          mt={'md'}
          miw={260}
          maw={558}
          h="100%"
          type="scroll"
          className={styles.cards}>
      <Flex
          wrap={'wrap'}
          gap={'sm'}
          mih={100}
          mah={150}
          style={{alignContent:'flex-start'}} 
          >

        {items.length === 0 ? (
          <Flex w={'100%'} mih={100} mah={150} gap={'md'} justify={'center'} align={'center'} direction={"column"}>
           <IconBox size={18} color={'var(--mantine-color-scBlue-6)'} />
            <Text c={'gray.6'} size={'sm'}>Add some of your commonly used materials.</Text>
          </Flex>
        ) : (
          items.map((it) => (
            <Box
                key={it.key}
                className={styles.card}
            >
              <div className={styles.cardHeader}>
                <Text fw={550} size={'sm'} c={'scBlue.9'}>
                  {it.description}
                </Text>
                <CloseButton size={'sm'} onClick={() => handleRemove(it.key)} aria-label={'Remove'} />
              </div>
              <Text size={'sm'} className={styles.qtyText} mt={0}>
                Quantity: {it.quantity}
              </Text>
            </Box>
          ))
        )}
      </Flex>
      </ScrollArea>
    </Box>
  );
};

export default MaterialsManager;
