import {
    ActionIcon,
    Alert,
    Button,
    Checkbox,
    Drawer,
    Flex,
    Group,
    NumberInput,
    Radio,
    Select,
    Space,
    Text,
    Title
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import {
    IconAdjustments, IconAdjustmentsHorizontal,
    IconAdjustmentsStar, IconArrowBackUp,
    IconCheckbox,
    IconColorSwatch, IconInfoCircle,
    IconTableExport,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Enums from "@/utils/enums";
import UserConfigService from "@/services/option/user-config-service";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { SchedulerConfig, defaultSchedulerConfig } from "@/interfaces/scheduler-config";
import ScSwitch from "@/components/sc-controls/form-controls/sc-switch";
import {TimeInput} from "@mantine/dates";
import ExportSchedulesModal from "./ExportSchedulesModal";

const CONFIG_KEY = 'schedulerConfig';
const LS_CONFIG_KEY = 'scheduler-config';

// Time validation and sanitization helpers
const isValidHHmm = (value?: string): boolean => {
    if (typeof value !== 'string') return false;
    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    return !!match;
};

// Convert HH:mm to minutes from midnight
const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map((x) => parseInt(x, 10));
    return h * 60 + m;
};

const sanitizeBusinessHours = (bh: Partial<SchedulerConfig['businessHours']> | undefined) => {
    const start = isValidHHmm(bh?.start) ? (bh!.start as string) : defaultSchedulerConfig.businessHours.start;
    const endRaw = isValidHHmm(bh?.end) ? (bh!.end as string) : defaultSchedulerConfig.businessHours.end;

    let end = endRaw;
    if (toMinutes(endRaw) < toMinutes(start)) {
        // Clamp end to start to avoid invalid ranges while users are editing
        end = start;
    }

    return { start, end };
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
// add additional config options as required to heal the scheduler config
const sanitizeSchedulerConfig = (cfg: SchedulerConfig): SchedulerConfig => {
    // Ensure defaultAppointmentLength is a number within [5, 1440]
    const rawLen: any = (cfg as any)?.defaultAppointmentLength;
    const parsed = typeof rawLen === 'number' ? rawLen : (rawLen == null ? NaN : Number(rawLen));
    const isValid = Number.isFinite(parsed);
    const clampedLen = isValid ? clamp(parsed as number, 5, 1440) : defaultSchedulerConfig.defaultAppointmentLength;

    return {
        ...cfg,
        defaultAppointmentLength: clampedLen,
        businessHours: sanitizeBusinessHours(cfg?.businessHours)
    };
};

const getLsConfig = (): SchedulerConfig | undefined => {
    try {
        const ls = localStorage.getItem(LS_CONFIG_KEY);
        const config = ls && JSON.parse(ls) || undefined;

        // Ensure businessHours is present in older configurations
        if (config && !config.businessHours) {
            config.businessHours = {
                start: "08:00",
                end: "17:00"
            };
        }
        // Ensure showHint0 defaults to true for older configurations
        if (config && typeof config.showHint0 === 'undefined') {
            config.showHint0 = true;
        }

        return config ? sanitizeSchedulerConfig(config as SchedulerConfig) : undefined;
    } catch (e) {
        return undefined;
    }
};

const setLsConfig = (config: SchedulerConfig) => {
    localStorage && localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(sanitizeSchedulerConfig(config)));
};

// Helper to check if two SchedulerConfig objects are equal
/*const equalsSchedulerConfig = (a: SchedulerConfig, b: SchedulerConfig): boolean => {
    if (!a || !b) return false;
    return (
        a.colorCodingType === b.colorCodingType &&
        a.showFullDay === b.showFullDay &&
        a.showAllDayColumn === b.showAllDayColumn &&
        a.defaultAppointmentLength === b.defaultAppointmentLength &&
        a.slotDuration === b.slotDuration &&
        a.defaultView === b.defaultView &&
        // businessHours
        a.businessHours?.start === b.businessHours?.start &&
        a.businessHours?.end === b.businessHours?.end &&
        // displayOptions
        a.displayOptions?.showJobNumber === b.displayOptions?.showJobNumber &&
        a.displayOptions?.showCustomerName === b.displayOptions?.showCustomerName &&
        a.displayOptions?.showLocation === b.displayOptions?.showLocation &&
        a.displayOptions?.showDescription === b.displayOptions?.showDescription &&
        a.displayOptions?.showEmployees === b.displayOptions?.showEmployees &&
        a.displayOptions?.showStatus === b.displayOptions?.showStatus
    );
};*/

interface SchedulerConfigMenuProps {
    onConfigChange?: (config: SchedulerConfig) => void;
    triggerNewSchedulerControlledValue?: SchedulerConfig;
}

const SchedulerConfigMenu: FC<SchedulerConfigMenuProps> = ({ onConfigChange, ...props }) => {
    const [opened, setOpened] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [userConfig, setUserConfig] = useState<any>();
    const [userConfigModified, setUserConfigModified] = useState(false);
    const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig>(
        getLsConfig() ?? defaultSchedulerConfig
    );
    // Local editing state for time inputs to avoid premature sanitization while typing
    const [localStart, setLocalStart] = useState<string>(
        (getLsConfig()?.businessHours?.start) || defaultSchedulerConfig.businessHours.start
    );
    const [localEnd, setLocalEnd] = useState<string>(
        (getLsConfig()?.businessHours?.end) || defaultSchedulerConfig.businessHours.end
    );

    useDidUpdate(
        () => {
            props.triggerNewSchedulerControlledValue && handleConfigChange(props?.triggerNewSchedulerControlledValue);
        }, [props.triggerNewSchedulerControlledValue]
    )

    useEffect(() => {
        if (schedulerConfig) {
            setLsConfig(schedulerConfig);
            onConfigChange && onConfigChange(schedulerConfig);
        }
    }, [schedulerConfig, onConfigChange]);

    // Keep local time inputs in sync when the saved config changes (e.g., load or external update)
    useEffect(() => {
        setLocalStart(schedulerConfig.businessHours?.start || defaultSchedulerConfig.businessHours.start);
        setLocalEnd(schedulerConfig.businessHours?.end || defaultSchedulerConfig.businessHours.end);
    }, [schedulerConfig.businessHours?.start, schedulerConfig.businessHours?.end]);

    // Load user configuration
    const authConfigQuery = useQuery(
        ['authConfig', Enums.ConfigurationSection.Appointment],
        () => UserConfigService.getSettings(Enums.ConfigurationSection.Appointment, Enums.ConfigurationType.CRUD),
        {
            onError: console.error
        }
    );

    // Update config when query data changes
    useEffect(() => {
        if (authConfigQuery.data) {
            setUserConfig(authConfigQuery.data);
            const savedConfig = UserConfigService.getMetaDataValue(authConfigQuery.data, CONFIG_KEY);
            if (savedConfig) {
                // Ensure businessHours is present in older configurations from user settings
                if (!savedConfig.businessHours) {
                    savedConfig.businessHours = {
                        start: "08:00",
                        end: "17:00"
                    };
                }
                // Ensure showHint0 defaults to true for older saved configurations
                if (typeof savedConfig.showHint0 === 'undefined') {
                    savedConfig.showHint0 = true;
                }
                setSchedulerConfig(sanitizeSchedulerConfig(savedConfig));
            }
        }
    }, [authConfigQuery.data])

    // Save user configuration
    const authConfigMutation = useMutation(['appointmentConfigMutation'], UserConfigService.saveConfig);
    const [debouncedUserConfig] = useDebouncedValue(userConfig, 600);

    useDidUpdate(() => {
        if (userConfigModified) {
            setUserConfigModified(false);
            debouncedUserConfig && authConfigMutation.mutate(debouncedUserConfig);
        }
    }, [debouncedUserConfig]);

    const handleConfigChange = (newConfig: SchedulerConfig) => {
        const sanitized = sanitizeSchedulerConfig(newConfig);
        setSchedulerConfig(sanitized);
        if (userConfig) {
            setUserConfig({
                ...userConfig,
                MetaData: JSON.stringify({
                    ...(JSON.parse(userConfig.MetaData || '{}')),
                    [CONFIG_KEY]: sanitized
                })
            });
            setUserConfigModified(true);
        }
    };

    const updateConfig = (key: keyof SchedulerConfig, value: any) => {
        handleConfigChange({
            ...schedulerConfig,
            [key]: value
        });
    };

    const updateDisplayOption = (key: keyof typeof schedulerConfig.displayOptions, value: boolean) => {
        handleConfigChange({
            ...schedulerConfig,
            displayOptions: {
                ...schedulerConfig.displayOptions,
                [key]: value
            }
        });
    };

    return (
        <>
            {/*<Button
                leftSection={<IconAdjustments />}
                onClick={() => setOpened(true)}
                variant="outline"
                size={'xs'}
                data-name={'scheduler-config-button'}
            >
                Configuration
            </Button>*/}
            <ActionIcon
                onClick={() => setOpened(true)}
                variant="outline"
                size={'md'}
                data-name={'scheduler-config-button'}
            >
                <IconAdjustmentsHorizontal />
            </ActionIcon>

            <Drawer
                opened={opened}
                onClose={() => setOpened(false)}
                position="right"
                title={
                    <Title order={3} c="scBlue.9">
                        <Flex align="center" gap={5}>
                            <IconAdjustmentsStar size={20} />
                            Scheduler Configuration
                        </Flex>
                    </Title>
                }
                overlayProps={{
                    color: 'var(--mantine-color-scBlue-5)',
                    blur: 10,
                    opacity: .15
                }}
                size="md"
            >
                <Flex direction="column" gap="xl">
                    {/* Color coding section */}
                    <div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconColorSwatch size={20} />
                                Color Coding
                            </Flex>
                        </Title>
                        <Radio.Group
                            value={schedulerConfig.colorCodingType}
                            onChange={(value) => updateConfig('colorCodingType', value)}
                            name="colorCodingType"
                        >
                            <Group mt="xs">
                                <Radio value="employee" label="Employee" />
                                <Radio value="status" label="Status" />
                            </Group>
                        </Radio.Group>
                    </div>


                    {/* Choice of view section */}
                    {/*<div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconCalendarStar size={20} />
                                Calendar View
                            </Flex>
                        </Title>
                        <Radio.Group
                            value={schedulerConfig.defaultView}
                            onChange={(value) => updateConfig('defaultView', value)}
                            name="defaultView"
                        >
                            <Flex direction="column" gap={'xs'} mt="xs">
                                <Radio value="day" label="Day" />
                                <Radio value="work-week" label="Work Week" />
                                <Radio value="week" label="Full Week" />
                                <Radio value="month" label="Month" />
                                <Radio value="timeline" label="Timeline" />
                            </Flex>
                        </Radio.Group>
                    </div>*/}



                    {/* Data display section */}
                    <div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconCheckbox size={20} />
                                Displayed Information
                            </Flex>
                        </Title>
                        <Flex direction="column" gap="xs">
                            <Checkbox
                                label="Show Linked Item"
                                checked={schedulerConfig.displayOptions.showJobNumber}
                                onChange={(event) => updateDisplayOption('showJobNumber', event.currentTarget.checked)}
                            />
                            <Checkbox
                                label="Show Customer Name"
                                checked={schedulerConfig.displayOptions.showCustomerName}
                                onChange={(event) => updateDisplayOption('showCustomerName', event.currentTarget.checked)}
                            />
                            <Checkbox
                                label="Show Location"
                                checked={schedulerConfig.displayOptions.showLocation}
                                onChange={(event) => updateDisplayOption('showLocation', event.currentTarget.checked)}
                            />
                            <Checkbox
                                label="Show Description"
                                checked={schedulerConfig.displayOptions.showDescription}
                                onChange={(event) => updateDisplayOption('showDescription', event.currentTarget.checked)}
                            />
                            <Checkbox
                                label="Show Employees"
                                checked={schedulerConfig.displayOptions.showEmployees}
                                onChange={(event) => updateDisplayOption('showEmployees', event.currentTarget.checked)}
                            />
                            <Checkbox
                                label="Show Status"
                                checked={schedulerConfig.displayOptions.showStatus}
                                onChange={(event) => updateDisplayOption('showStatus', event.currentTarget.checked)}
                            />
                        </Flex>
                    </div>



                    {/* Misc config section */}
                    <div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconAdjustments size={20} />
                                General Settings
                            </Flex>
                        </Title>
                        <Flex direction="column" gap={'xs'}>
                            <ScSwitch
                                label="Show Full Day (instead of Business Hours)"
                                checked={schedulerConfig.showFullDay}
                                onToggle={(checked) => updateConfig('showFullDay', checked)}
                                mt={0}
                            />
                            {/*<ScSwitch
                                mt={0}
                                label="Show Configuration Hint"
                                checked={schedulerConfig.showHint0}
                                onToggle={(checked) => updateConfig('showHint0', checked)}
                            />*/}
                            {/*<ScSwitch
                                label="Show All Day Column"
                                checked={schedulerConfig.showAllDayColumn}
                                onToggle={(checked) => updateConfig('showAllDayColumn', checked)}
                            />*/}
                            <Flex direction="column" gap="xs" mt={3}>
                                <Text size="sm" fw={500}>Business Hours</Text>
                                <Flex gap="md" align="center">
                                    <TimeInput
                                        disabled={schedulerConfig.showFullDay}
                                        label="Start Time"
                                        size={'xs'}
                                        value={localStart}
                                        onChange={(event) => {
                                            // Let the user type freely; commit on blur
                                            setLocalStart(event.currentTarget.value);
                                        }}
                                        onBlur={(event) => {
                                            const raw = event.currentTarget.value;
                                            // If invalid, revert the input without changing saved config
                                            if (!isValidHHmm(raw)) {
                                                setLocalStart(schedulerConfig.businessHours?.start || defaultSchedulerConfig.businessHours.start);
                                                return;
                                            }
                                            const newStart = raw;
                                            let newEnd = schedulerConfig.businessHours?.end || defaultSchedulerConfig.businessHours.end;
                                            if (isValidHHmm(newEnd) && toMinutes(newEnd) < toMinutes(newStart)) {
                                                newEnd = newStart; // keep range valid
                                            }
                                            handleConfigChange({
                                                ...schedulerConfig,
                                                businessHours: {
                                                    start: newStart,
                                                    end: newEnd
                                                }
                                            });
                                        }}
                                        mt={-5}
                                    />
                                    <TimeInput
                                        disabled={schedulerConfig.showFullDay}
                                        label="End Time"
                                        size={'xs'}
                                        value={localEnd}
                                        onChange={(event) => {
                                            // Allow free typing; do not sanitize/commit yet
                                            setLocalEnd(event.currentTarget.value);
                                        }}
                                        onBlur={(event) => {
                                            // Validate and commit only when user leaves the field
                                            const raw = event.currentTarget.value;
                                            if (!isValidHHmm(raw)) {
                                                // Revert input to last saved valid value
                                                setLocalEnd(schedulerConfig.businessHours?.end || defaultSchedulerConfig.businessHours.end);
                                                return;
                                            }
                                            const start = schedulerConfig.businessHours?.start || defaultSchedulerConfig.businessHours.start;
                                            const commitEnd = toMinutes(raw) < toMinutes(start) ? start : raw;
                                            handleConfigChange({
                                                ...schedulerConfig,
                                                businessHours: {
                                                    start,
                                                    end: commitEnd
                                                }
                                            });
                                        }}
                                        mt={-5}
                                    />
                                </Flex>
                            </Flex>
                            <NumberInput
                                label="Default Appointment Length (minutes)"
                                value={schedulerConfig.defaultAppointmentLength}
                                onChange={(value) => {
                                    // Mantine NumberInput can pass number | string | null
                                    const num = typeof value === 'number' ? value : (value == null || value === '' ? NaN : Number(value));
                                    const next = Number.isFinite(num) ? Math.min(Math.max(num as number, 5), 1440) : defaultSchedulerConfig.defaultAppointmentLength;
                                    updateConfig('defaultAppointmentLength', next);
                                }}
                                onBlur={(e) => {
                                    const v = schedulerConfig.defaultAppointmentLength;
                                    if (!Number.isFinite(v as any)) {
                                        updateConfig('defaultAppointmentLength', defaultSchedulerConfig.defaultAppointmentLength);
                                    }
                                }}
                                min={5}
                                max={1440}
                                step={5}
                            />
                            <div>
                                <Text size="sm" fw={500}>Time Division Size</Text>
                                <Radio.Group
                                    value={schedulerConfig.slotDuration.toString()}
                                    onChange={(value) => updateConfig('slotDuration', parseInt(value))}
                                    name="slotDuration"
                                >
                                    <Group mt="xs">
                                        <Radio value="5" label="5 minutes" />
                                        <Radio value="15" label="15 minutes" />
                                        <Radio value="30" label="30 minutes" />
                                        <Radio value="60" label="1 hour" />
                                    </Group>
                                </Radio.Group>
                            </div>
                        </Flex>
                    </div>

                    {/* Export section */}
                    <div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconTableExport size={20} />
                                Export
                            </Flex>
                        </Title>
                        <Button
                            fullWidth
                            variant="default"
                            leftSection={<IconTableExport size={16} />}
                            onClick={() => setExportModalOpen(true)}
                            styles={{
                                label: {textAlign: 'left', width: '100%'}
                            }}
                        >
                            Export to Excel
                        </Button>
                    </div>



                    {
                        schedulerConfig.showHint0 &&
                        <>
                            <Space
                                mt={-20}
                                h={'calc(100vh - 920px)'}
                            />
                            <Flex justify={'center'}>
                                <Alert
                                    // maw={350}
                                    icon={<IconInfoCircle />}
                                    color={'teal'}
                                    withCloseButton
                                    onClose={() => updateConfig('showHint0', false)}
                                >
                                    Settings will apply to relevant scheduler views for the current user only.
                                </Alert>
                            </Flex>
                        </>
                    }

                    <Space h={40} />

                    {/* Reset to defaults section */}
                    {/*{!equalsSchedulerConfig(schedulerConfig, defaultSchedulerConfig) && (
                    <div>
                        <Title order={5} c="scBlue.9" mb="xs">
                            <Flex align="center" gap={5}>
                                <IconArrowBackUp size={20} />
                                Reset to Defaults
                            </Flex>
                        </Title>
                        <Button
                            size="xs"
                            variant="outline"
                            color="yellow.7"
                            leftSection={<IconArrowBackUp size={16} />}
                            onClick={() => handleConfigChange(defaultSchedulerConfig)}
                        >
                            Restore Defaults
                        </Button>
                    </div>
                    )}*/}
                </Flex>
            </Drawer>

            <ExportSchedulesModal
                open={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
            />
        </>
    );
};

export default SchedulerConfigMenu;