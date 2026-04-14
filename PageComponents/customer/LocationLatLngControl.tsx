import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Loader, Text, Anchor } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import ScTextControl from '@/components/sc-controls/form-controls/v2/sc-text-control';
import LocationPickerActionIcon from '@/PageComponents/Map/LocationPickerActionIcon';

// Lightweight coordinate selector with optional auto-geocoding.
// - Shows a toggle to enable/disable latitude/longitude inputs
// - Emits debounced onChange when coordinates change
// - If address changes and there are no user-entered coordinates, performs a forward geocoding lookup

export type LatLng = { latitude: number | null; longitude: number | null };

type Props = {
  addressText: string; // Multiline physical address text
  countryName?: string | null; // Selected country display name
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  disabled?: boolean;
  useCoords: boolean; // Controlled by parent: whether to use/show coordinates
  onChange?: (coords: LatLng) => void; // Debounced coordinate emission
};

const MIN_ADDRESS_LENGTH_FOR_GEOCODE = 6;

function parseNumberOrNull(v: any): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function hasMinDecimals(s: string, min: number): boolean {
  const str = (s ?? '').toString().trim();
  const parts = str.split('.');
  return parts.length === 2 && parts[1].length >= min;
}

function validateLatitude(val: string, requireWhenUsing: boolean): string | null {
  const v = (val ?? '').toString().trim();
  if (!v) {
    return requireWhenUsing ? 'Please enter latitude' : null;
  }
  const num = Number(v);
  if (!Number.isFinite(num)) return 'Latitude must be a number';
  if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
  if (!hasMinDecimals(v, 3)) return 'Please provide at least 3 decimal places for accuracy';
  return null;
}

function validateLongitude(val: string, requireWhenUsing: boolean): string | null {
  const v = (val ?? '').toString().trim();
  if (!v) {
    return requireWhenUsing ? 'Please enter longitude' : null;
  }
  const num = Number(v);
  if (!Number.isFinite(num)) return 'Longitude must be a number';
  if (num < -180 || num > 180) return 'Longitude must be between -180 and 180';
  if (!hasMinDecimals(v, 3)) return 'Please provide at least 3 decimal places for accuracy';
  return null;
}

async function geocodeAddress(fullQuery: string): Promise<{ lat: number | null; lon: number | null } | null> {
  if (!fullQuery || !fullQuery.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(fullQuery)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  const data: any[] = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const item = data[0];
    const lat = item?.lat ? Number(item.lat) : null;
    const lon = item?.lon ? Number(item.lon) : null;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
  }
  return null;
}

const LocationLatLngControl: React.FC<Props> = ({
                                                  addressText,
                                                  countryName,
                                                  initialLatitude = null,
                                                  initialLongitude = null,
                                                  disabled,
                                                  useCoords,
                                                  onChange,
                                                }) => {

  // Local form for latitude/longitude with validation
  const form = useForm({
    initialValues: {
      Latitude: initialLatitude != null ? String(initialLatitude) : '',
      Longitude: initialLongitude != null ? String(initialLongitude) : '',
    },
    validateInputOnChange: true,
    validate: {
      Latitude: (val: string) => validateLatitude(val, useCoords),
      Longitude: (val: string) => validateLongitude(val, useCoords),
    },
  });

  // Debounce address BEFORE any effects that might read it
  const [debAddress] = useDebouncedValue(
    `${addressText || ''}${countryName ? `, ${countryName}` : ''}`,
    900
  );

  // Track if user has manually edited coordinates; if so, avoid clobbering with geocode results
  const [userEdited, setUserEdited] = useState<boolean>(false);
  // Track the address at the moment we became not-dirty (used to gate auto-geocode until address changes)
  const notDirtySinceAddressRef = useRef<string | null>(null);

  // Prevent redundant parent emissions to avoid feedback loops
  const lastEmittedRef = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  // If record has pre-existing coordinates (editing), treat as user-edited to prevent auto-overwrite
  useEffect(() => {
    const hadSavedCoords = initialLatitude != null || initialLongitude != null;
    if (hadSavedCoords) {
      setUserEdited(true);
    }
  }, [initialLatitude, initialLongitude]);

  // When either Latitude or Longitude is cleared/invalid, mark as not-dirty but do not auto-geocode until address changes
  useEffect(() => {
    const latStr = String(form.values.Latitude ?? '').trim();
    const lngStr = String(form.values.Longitude ?? '').trim();
    const latEmpty = !latStr;
    const lngEmpty = !lngStr;
    const latInvalid = !!validateLatitude(latStr as any, true);
    const lngInvalid = !!validateLongitude(lngStr as any, true);
    if (latEmpty || lngEmpty || latInvalid || lngInvalid) {
      setUserEdited(false);
      notDirtySinceAddressRef.current = debAddress;
    }
  }, [form.values.Latitude, form.values.Longitude, debAddress]);

  // Debounce input changes before emitting
  const [debLat] = useDebouncedValue(form.values.Latitude, 250);
  const [debLng] = useDebouncedValue(form.values.Longitude, 250);

  // Emit debounced changes (only when using coords and when values actually change)
  useEffect(() => {
    if (!onChange) return;

    if (!useCoords) {
      // Reset emitted state and only notify parent if not already nulls
      if (lastEmittedRef.current.lat !== null || lastEmittedRef.current.lng !== null) {
        lastEmittedRef.current = { lat: null, lng: null };
        onChange({ latitude: null, longitude: null });
      }
      return;
    }

    const latError = validateLatitude(debLat as any, true);
    const lngError = validateLongitude(debLng as any, true);
    if (latError || lngError) {
      if (lastEmittedRef.current.lat !== null || lastEmittedRef.current.lng !== null) {
        lastEmittedRef.current = { lat: null, lng: null };
        onChange({ latitude: null, longitude: null });
      }
      return;
    }

    const lat = Number((debLat ?? '').toString().trim());
    const lng = Number((debLng ?? '').toString().trim());

    if (lastEmittedRef.current.lat !== lat || lastEmittedRef.current.lng !== lng) {
      lastEmittedRef.current = { lat, lng };
      onChange({ latitude: lat, longitude: lng });
    }
  }, [debLat, debLng, useCoords, onChange]);

  const shouldAttemptGeocode = useMemo(() => {
    const longEnough = (debAddress || '').trim().length >= MIN_ADDRESS_LENGTH_FOR_GEOCODE;
    const addressChangedSinceNotDirty =
      notDirtySinceAddressRef.current == null || notDirtySinceAddressRef.current !== debAddress;
    return useCoords && !userEdited && longEnough && addressChangedSinceNotDirty;
  }, [debAddress, useCoords, userEdited]);

  // Use React Query to perform geocoding with retries and proper lifecycle
  const geocodeQuery = useQuery(['geocode', debAddress], () => geocodeAddress(debAddress), {
    enabled: shouldAttemptGeocode,
    refetchOnWindowFocus: false,
    retry: 2,
    onError: () => {
      // Swallow errors; user can still enter coordinates manually
    },
  });

  useEffect(() => {
    const result = geocodeQuery.data;
    if (!result) return;
    if (!userEdited) {
      const latStr = Number(result.lat).toFixed(6);
      const lonStr = Number(result.lon).toFixed(6);

      // Avoid redundant setFieldValue if values are already the same
      const sameLat = String(form.values.Latitude ?? '').trim() === latStr;
      const sameLon = String(form.values.Longitude ?? '').trim() === lonStr;
      if (!sameLat) form.setFieldValue('Latitude', latStr);
      if (!sameLon) form.setFieldValue('Longitude', lonStr);

      // Emit only if changed vs lastEmitted
      const latNum = Number(latStr);
      const lonNum = Number(lonStr);
      if (onChange && (lastEmittedRef.current.lat !== latNum || lastEmittedRef.current.lng !== lonNum)) {
        lastEmittedRef.current = { lat: latNum, lng: lonNum };
        onChange({ latitude: latNum, longitude: lonNum });
      }

      // After applying results, set the marker address so future updates wait for the next address change
      notDirtySinceAddressRef.current = debAddress;
    }
  }, [geocodeQuery.data, userEdited, form, onChange, debAddress]);

  const onLatChange = useCallback((v: any) => {
    setUserEdited(true);
    const val = typeof v === 'string' ? v : String(v ?? '');
    form.setFieldValue('Latitude', val);
  }, [form]);

  const onLngChange = useCallback((v: any) => {
    setUserEdited(true);
    const val = typeof v === 'string' ? v : String(v ?? '');
    form.setFieldValue('Longitude', val);
  }, [form]);

  return (
    <Box mt={'var(--mantine-spacing-md)'}>
      {useCoords && (
        <>
          <Flex w={'100%'} direction={'row-reverse'} justify={'start'} align={'start'} gap={5}>
            <Box mt={22}>
              <LocationPickerActionIcon
                disabled={disabled}
                title="Pick location from map"
                value={{
                  latitude: parseNumberOrNull(form.values.Latitude),
                  longitude: parseNumberOrNull(form.values.Longitude),
                }}
                onSelect={(coords) => {
                  setUserEdited(true);
                  const latStr = coords.latitude != null ? Number(coords.latitude).toFixed(6) : '';
                  const lonStr = coords.longitude != null ? Number(coords.longitude).toFixed(6) : '';
                  form.setFieldValue('Latitude', latStr);
                  form.setFieldValue('Longitude', lonStr);
                }}
              />
            </Box>

            <Flex direction={{base: 'column', md: 'row'}} gap={{base: 0, md: 'sm'}}
                  style={{marginTop: 'var(--mantine-spacing-sm)'}} w={'100%'}>
              <ScTextControl
                mt={-10}
                w={'100%'}
                label={'Latitude'}
                name={'Latitude'}
                {...form.getInputProps('Latitude')}
                onChange={(e: any) => onLatChange(e?.currentTarget?.value ?? e)}
                placeholder={'e.g., -26.1411'}
                disabled={disabled}
                rightSection={geocodeQuery.isFetching ? <Loader size={14}/> : undefined}
              />
              <ScTextControl
                mt={{ base: 'sm', md: - 10}}
                w={'100%'}
                label={'Longitude'}
                name={'Longitude'}
                {...form.getInputProps('Longitude')}
                onChange={(e: any) => onLngChange(e?.currentTarget?.value ?? e)}
                placeholder={'e.g., 28.0377'}
                disabled={disabled}
                rightSection={geocodeQuery.isFetching ? <Loader size={14}/> : undefined}
              />
            </Flex>
          </Flex>
          <Text size="xs" c="dimmed" style={{ marginTop: 'var(--mantine-spacing-xs)' }}>
            Geocoding by <Anchor href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">Nominatim</Anchor> — © <Anchor href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</Anchor>
          </Text>
        </>
      )}
    </Box>
  );
};

export default LocationLatLngControl;
