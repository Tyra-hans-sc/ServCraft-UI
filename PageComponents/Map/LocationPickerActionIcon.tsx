import React, { useEffect, useMemo, useState } from 'react';
import {ActionIcon, Box, Button, Flex, Text, Title, Tooltip} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {IconMap2, IconMapPin} from '@tabler/icons-react';
import SCModal from '@/PageComponents/Modal/SCModal';
import DynamicLocationPickerMap from '@/PageComponents/Map/LocationPickerMapDynamic';

export type PickerCoords = { latitude: number | null; longitude: number | null };

type Props = {
  value?: PickerCoords | null;
  disabled?: boolean;
  onSelect?: (coords: PickerCoords) => void;
  title?: string;
};

const LocationPickerActionIcon: React.FC<Props> = ({ value, disabled, onSelect, title }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = value?.latitude ?? null;
    const lng = value?.longitude ?? null;
    return lat != null && lng != null ? { lat, lng } : null;
  });

  // Ensure the map shows a marker when coordinates are set by the system (e.g., geocoding)
  useEffect(() => {
    if (!opened) return;
    const lat = value?.latitude ?? null;
    const lng = value?.longitude ?? null;
    setSelected(lat != null && lng != null ? { lat, lng } : null);
  }, [opened, value?.latitude, value?.longitude]);

  const initialCenter = useMemo(() => {
    const lat = value?.latitude ?? null;
    const lng = value?.longitude ?? null;
    return lat != null && lng != null ? { lat, lng } : null;
  }, [value?.latitude, value?.longitude]);

  const handleConfirm = () => {
    const lat = selected?.lat ?? null;
    const lng = selected?.lng ?? null;
    onSelect?.({ latitude: lat, longitude: lng });
    close();
  };

  return (
    <>
      <Tooltip label={title ?? 'Pick location on map'} color={'scBlue'} withArrow>
        <ActionIcon
          onClick={open}
          disabled={disabled}
          color={'scBlue'}
          variant="light"
          size="lg"
          aria-label="Pick location on map"
        >
          <IconMap2 size={20} />
        </ActionIcon>
      </Tooltip>

      <SCModal
        open={opened}
        onClose={close}
        modalProps={{ centered: true }}
        size={1200}
        p={0}
      >
          <Box pos={'relative'} mb={-14}>
              <Box
                  bg={'rgba(255, 255, 255, 0.7)'}
                  pos={'absolute'}
                  top={0}
                  left={0}
                  style={{
                      zIndex: 500,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(200, 200, 200, 0.2)',
                      borderBottomRightRadius: '5px'
                  }}
                  p={10}
              >
                  <Text ml={50} mt={5} size="sm" c="dimmed">Click on the map to place a pin, or drag the pin to adjust.</Text>
              </Box>
              <Flex direction="column" gap="xs">
                  <DynamicLocationPickerMap
                      initialCenter={initialCenter as any}
                      initialZoom={16}
                      value={selected as any}
                      onChange={(pos) => setSelected(pos)}
                  />
              </Flex>
              <Flex pos={'absolute'} bottom={30} right={20}
                    gap="sm"
                    justify="flex-end"
                    style={{
                        width: '100%',
                        zIndex: 400
              }}
              >
                  <Button variant="white" color={'gray.7'} onClick={close}>Cancel</Button>
                  <Button color={'scBlue'} onClick={handleConfirm} disabled={!selected}>Use this location</Button>
              </Flex>
          </Box>
      </SCModal>
    </>
  );
};

export default LocationPickerActionIcon;
