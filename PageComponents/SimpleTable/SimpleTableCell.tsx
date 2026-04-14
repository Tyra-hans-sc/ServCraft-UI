import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import {
    Anchor,
    Box,
    Checkbox,
    CheckboxProps,
    Flex,
    Loader,
    NumberInput, NumberInputProps,
    Text,
    TextInput,
    Textarea, Select,
    Tooltip
} from "@mantine/core";
import styles from "./SimpleTable.module.css"
import { useDebouncedValue } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";
import * as Enums from '@/utils/enums';
import StockItemTypeIcon from "../Inventory/StockItemTypeIcon";

const SimpleTableCell: FC<{
    data: any,
    type?: 'status' | 'numberInput' | 'textInput' | 'textArea' | 'checkInput' | 'selectInput' | 'stockItemType',
    min?: number
    onActionLinkClick?: () => void,
    canEdit?: boolean
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean
    }
    onValueChange?: (newVal: number | '') => void
    onConfirmInputUpdate?: () => void
    linkHref?: string
    color?: string
    inputProps?: {
        disabled?: boolean,
        disabledFunction?: (item: any) => boolean | undefined,
        loading?: boolean,
        error?: string | null,
        readOnly?: boolean,
        max?: number,
        width?: number
    },
    inverseDepictedValue?: boolean
    maxLength?: number
    placeholder?: string,
    hintIcon?: any // {icon: ReactNode; text: string}
    item?: any
    numberInputProps?: NumberInputProps
    customNumberProps?: {
        focusOnSelect?: boolean;
    }
    currencyValue?: boolean
    alignRight?: boolean
    shown?: boolean,
    selectOptions?: { value: string; label: string }[]
    lineClamp?: number
    required?: boolean
    // Custom validation hook; should return a message string if invalid, otherwise null
    validationFunction?: (value: any, item: any) => string | null
}> = (props) => {

    // handle input change on debounce - instantly update on blur
    const [inputVal, setInputVal] = useState(props.type === 'numberInput' || props.type === 'textInput' || props.type === 'checkInput' || props.type === 'selectInput' || props.type === 'textArea' ? props.data : props.data)
    const [debouncedVal, cancel] = useDebouncedValue(inputVal, props.type === 'checkInput' ? 50 : 800)
    const errorMessage = useMemo(() => {
        // 1) Custom validator takes precedence
        if (props.validationFunction) {
            try {
                const msg = props.validationFunction(inputVal, props.item);
                if (typeof msg === 'string' && msg.length > 0) return msg;
            } catch (e) {
                // Fail open on validator errors
            }
        }
        // 2) Exclusive minimum: invalid when value <= min
        if (typeof props.min !== 'undefined') {
            if ((inputVal as any) <= props.min) {
                return 'must be greater than ' + props.min;
            }
        }
        // 3) Required check (blank to keep UI minimal)
        if (props.required && inputVal === '') return ' ';
        return null;
    }, [props.validationFunction, props.item, props.min, inputVal, props.required])
    const handleInputChange = useCallback(() => {
        errorMessage === null && props.onValueChange && props.onValueChange(debouncedVal)
    }, [props.data, debouncedVal, props.onValueChange])
    const handleInputBlur = useCallback(() => {
        cancel()
        errorMessage === null && inputVal !== props.data && props.onValueChange && props.onValueChange(inputVal)
    }, [inputVal, props.data, props.onValueChange])
    useEffect(() => {
        if (props.type === 'numberInput' || props.type === 'textInput' || props.type === 'textArea' || props.type === 'checkInput' || props.type === 'selectInput') {
            setInputVal(props.data)
            cancel()
        }
    }, [props.data]);
    useEffect(() => {
        if (props.type === 'checkInput') { // only update checkboxes on value change to prevent updating while typing on text input
            if (errorMessage === null && inputVal === debouncedVal && debouncedVal !== props.data) {
                handleInputChange()
                // console.log('value updated, setting new value (debounced)')
            }
        }
    }, [debouncedVal]);

    const inputRef = useRef<HTMLInputElement | null>(null)

    const isDisabled = () => props.inputProps?.disabled || (props.inputProps?.disabledFunction && props.inputProps.disabledFunction(props.item ?? {}));

    switch (props.type) {
        case ('status'): {
            if (props.data && typeof props.data === 'object') {
                return (
                    <Box maw={250}>
                        <ScStatusData value={props.data.value as string} color={props.data.color || props.color || ''} shrink
                            showTooltipDelay={1000} onActionLinkClick={props.onActionLinkClick} />
                    </Box>
                )
            } else {
                return props.shown ? <>
                    <ScStatusData value={props.data} color={props.color || ''} shrink
                        showTooltipDelay={1000} onActionLinkClick={props.onActionLinkClick} />
                    {/*props.hintIcon && <Box pos={'absolute'} ml={'auto'} style={{float: 'inline-end'}}>
                        <Tooltip label={props.hintIcon?.text}>
                            {props.hintIcon && props.hintIcon?.icon}
                        </Tooltip>
                    </Box>*/}
                </> : <></>
            }
        }
        case ('stockItemType'): {
            let shown = true;
            let value: string = "";
            let stockItemType: number = -1;

            if (props.data && typeof props.data === 'object') {
                value = props.data.value;
            } else {
                value = props.data;
                shown = props.shown ?? true;
            }

            if (value === Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Part) || +value === Enums.StockItemType.Part) {
                stockItemType = Enums.StockItemType.Part;
            }
            else if (value === Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Product) || +value === Enums.StockItemType.Product) {
                stockItemType = Enums.StockItemType.Product;
            }
            else if (value === Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service) || +value === Enums.StockItemType.Service) {
                stockItemType = Enums.StockItemType.Service;
            }
            else {
                return shown ? <span>{value}</span> : <></>
            }

            return shown ? <Flex>
                <StockItemTypeIcon stockItemType={stockItemType} /> <span style={{marginLeft: "0.25rem"}}>{Enums.getEnumStringValue(Enums.StockItemType, stockItemType)}</span>
            </Flex> : <></>
        }
        case 'numberInput': {
            return <>
                <NumberInput
                    ref={inputRef}
                    variant="unstyled"
                    placeholder={props.placeholder}
                    value={inputVal + ''} // has to be converted to string as it is causing an exception
                    disabled={isDisabled()}
                    readOnly={!props.canEdit}
                    hideControls
                    min={props.min}
                    max={props.inputProps?.max}
                    // unstyled
                    styles={(theme, inputProps) => ({
                        // control: {padding: 0},
                        input: {
                            // background: 'transparent',
                            // padding: '0px !important',
                            width: props.inputProps?.width || 250,
                            borderColor: inputProps.error ? theme.colors.yellow[7] : (isDisabled() || !props.canEdit) ? 'transparent' : '#cdd3d980',
                            backgroundColor: inputProps.error ? 'white' : '',
                            maxWidth: 90,
                            color: props.stylingProps?.darkerText ? '' : 'gray',
                            textAlign: (props.alignRight || props.currencyValue) ? 'end' : undefined,
                            marginLeft: (props.alignRight || props.currencyValue) ? 'auto' : undefined,
                        }
                    })}
                    classNames={{
                        input: styles.dataInput
                    }}
                    onChange={e => props.required !== false && e === '' ? setInputVal(+e) : setInputVal(e)}
                    onBlur={handleInputBlur}
                    size={'xs'}
                    error={errorMessage ?? props.inputProps?.error}
                    decimalScale={props.currencyValue ? 2 : undefined}
                    thousandSeparator={props.currencyValue ? ' ' : undefined}
                    fixedDecimalScale={props.currencyValue}
                    onFocus={() => { props.customNumberProps?.focusOnSelect && inputRef.current?.select() }}
                    {...props.numberInputProps}
                />
                {/* PHIL COMMENTED THIS OUT */}
                {/* {
                    ogVal !== inputVal &&
                    <>
                        <Tooltip label={'Restore'} color={'scBlue'}>
                            <ActionIcon
                                variant={'transparent'}
                                size={'xs'}
                                mt={5}
                            >
                                <IconArrowBackUp />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={'Confirm new value'} color={'scBlue'}>
                            <ActionIcon
                                variant={'transparent'}
                                size={'xs'}
                                mt={5}
                                onClick={props.onConfirmInputUpdate}
                            >
                                <IconDeviceFloppy />
                            </ActionIcon>
                        </Tooltip>
                    </>
                } */}
            </>
        }
        case 'selectInput': {
            return <>
                <Select
                    allowDeselect={false}
                    ref={inputRef}
                    variant="unstyled"
                    // placeholder={props.data}
                    value={inputVal + ''}
                    data={[...(props.selectOptions || []), ...(!props.selectOptions?.some(x => x.value + '' === inputVal + '') ? [{ label: inputVal + '', value: inputVal + '' }] : [])]}
                    disabled={isDisabled()}
                    readOnly={!props.canEdit}
                    withCheckIcon={false}
                    // unstyled
                    styles={(theme, inputProps) => ({
                        // control: {padding: 0},
                        input: {
                            // background: 'transparent',
                            // padding: '0px !important',
                            // width: 250,
                            borderColor: inputProps.error ? theme.colors.yellow[7] : (isDisabled() || !props.canEdit) ? 'transparent' : '#cdd3d980',
                            backgroundColor: inputProps.error ? 'white' : '',
                            maxWidth: 120,
                            color: props.stylingProps?.darkerText ? '' : 'gray',
                            textAlign: (props.alignRight || props.currencyValue) ? 'end' : undefined,
                            marginLeft: (props.alignRight || props.currencyValue) ? 'auto' : undefined,                        }
                    })}
                    classNames={{
                        input: styles.dataInput
                    }}
                    onChange={e => setInputVal(e)}
                    onBlur={handleInputBlur}
                    size={'xs'}
                    error={errorMessage ?? props.inputProps?.error}
                />
            </>
        }
        case 'textInput': {
            return <>
                <TextInput
                    variant="unstyled"
                    // placeholder={props.data}
                    value={inputVal}
                    disabled={isDisabled()}
                    readOnly={props.inputProps?.readOnly || props.inputProps?.loading || !props.canEdit}
                    styles={(theme, inputProps) => ({
                        /*root: {
                            width: '-moz-available'
                        },*/
                        // control: {padding: 0},
                        input: {
                            // background: 'transparent',
                            // padding: '0px !important',
                            width: '100%',
                            textOverflow: 'ellipsis',
                            borderColor: inputProps.error ? theme.colors.yellow[7] : (isDisabled() || !props.canEdit) ? 'transparent' : '#cdd3d980',
                            backgroundColor: inputProps.error ? 'white' : '',
                            // maxWidth: 90,
                            maxWidth: '100%',
                            color: props.stylingProps?.darkerText ? '' : 'gray',
                            cursor: isDisabled() || props.inputProps?.readOnly ? 'not-allowed' : props.inputProps?.loading ? 'progress' : ''
                        }
                    })}
                    placeholder={props.placeholder}
                    maxLength={props.maxLength}
                    classNames={{
                        input: styles.dataInput
                    }}
                    onKeyPress={e => {
                        // console.log(e.code)
                        e.code === 'Enter' && handleInputBlur()
                    }}
                    onChange={e => {
                        setInputVal(e.currentTarget.value)
                    }}
                    onBlur={handleInputBlur}
                    size={'xs'}
                    error={errorMessage ?? props.inputProps?.error}
                    rightSection={props.inputProps?.loading ? <Loader type={'oval'} size={10} /> : undefined}
                    w={"100%"}
                    maw={"100%"}
                />
            </>
        }
        case 'textArea': {
            return <>
                <Textarea
                    ml={1}
                    variant="unstyled"
                    // placeholder={props.data}
                    value={inputVal}
                    disabled={isDisabled()}
                    readOnly={props.inputProps?.readOnly || props.inputProps?.loading || !props.canEdit}
                    styles={(theme, inputProps) => ({
                        /*root: {
                            width: '-moz-available'
                        },*/
                        // control: {padding: 0},
                        input: {
                            // background: 'transparent',
                            // padding: '0px !important',
                            // width: 250,
                            textOverflow: 'ellipsis',
                            borderColor: inputProps.error ? theme.colors.yellow[7] : (isDisabled() || !props.canEdit) ? 'transparent' : '#cdd3d980',
                            backgroundColor: inputProps.error ? 'white' : '',
                            // maxWidth: 90,
                            maxWidth: '100%',
                            width: '100%',
                            color: props.stylingProps?.darkerText ? '' : 'gray',
                            cursor: isDisabled() || props.inputProps?.readOnly ? 'not-allowed' : props.inputProps?.loading ? 'progress' : ''
                        }
                    })}
                    autosize
                    // maxRows={5}
                    // resize={'vertical'}
                    placeholder={props.placeholder}
                    maxLength={props.maxLength}
                    classNames={{
                        input: styles.dataInput
                    }}
                    /*onKeyPress={e => {
                        // console.log(e.code)
                        e.code === 'Enter' && handleInputBlur()
                    }}*/
                    onChange={e => {
                        setInputVal(e.currentTarget.value)
                    }}
                    onBlur={handleInputBlur}
                    size={'xs'}
                    error={errorMessage ?? props.inputProps?.error}
                    rightSection={props.inputProps?.loading ? <Loader type={'oval'} size={10} /> : undefined}
                    w={"100%"}
                    maw={"100%"}
                />
            </>
        }
        case 'checkInput': {
            const CheckboxIcon: CheckboxProps['icon'] = ({ indeterminate, ...others }) =>
                indeterminate ? <Loader {...others} size={10} stroke={'2.5px'} color={'white'} /> : <IconCheck {...others} size={12} stroke={4} />;

            return <Flex >
                <Checkbox
                    // variant="unstyled"
                    // placeholder={props.data}
                    // value={inputVal}
                    checked={props.inverseDepictedValue ? !inputVal : inputVal}
                    disabled={isDisabled() || props.inputProps?.loading || props.inputProps?.readOnly}
                    indeterminate={props.inputProps?.loading}
                    // readOnly={props.inputProps?.loading}
                    styles={{
                        input: {
                            cursor: isDisabled() || props.inputProps?.readOnly ? 'not-allowed' : props.inputProps?.loading ? 'progress' : '',
                            backgroundColor: props.inputProps?.loading ? 'var(--mantine-color-scBlue-6)' : '',
                            borderColor: props.inputProps?.loading ? 'var(--mantine-color-scBlue-8)' : ''
                        },
                    }}
                    icon={CheckboxIcon}
                    // hideControls
                    // min={0}
                    // unstyled
                    /* styles={(theme, inputProps) => ({
                         // control: {padding: 0},
                         input: {
                             // background: 'transparent',
                             // padding: '0px !important',
                             borderColor: inputProps.error ? theme.colors.yellow[7] : '',
                             backgroundColor: inputProps.error ? 'white' : '',
                             maxWidth: 90,
                             color: props.stylingProps?.darkerText ? '' : 'gray'
                         }
                     })}*/
                    /*classNames={{
                        input: styles.dataInput
                    }}*/
                    onChange={e => setInputVal(props.inverseDepictedValue ? !e.currentTarget.checked : e.currentTarget.checked)}
                    onBlur={handleInputBlur}
                    size={'xs'}
                />
            </Flex>
        }
        default: {
            if (!!props.onActionLinkClick || props.linkHref) {
                const a = <Anchor  underline={'never'} fw={'bolder'} onClick={props.onActionLinkClick} size={props.stylingProps?.compact ? 'sm' : 'md'}
                    style={{ cursor: props.canEdit ? 'pointer' : 'default' }}
                                   lineClamp={2}
                                   maw={150}
                >
                    {props.data as string}
                </Anchor>
                if (props.linkHref) {
                    return <Link href={props.linkHref} style={{ textDecoration: 'none' }}>
                        {a}
                    </Link>
                } else {
                    return a
                }
            }
            return props.shown && <Text
                c={props.color ?? (props.stylingProps?.darkerText ? 'gray.8' : 'dimmed')}
                size={props.stylingProps?.compact ? 'sm' : 'md'}
                lineClamp={props.lineClamp ?? 2}
                maw={'100%'}
                ta={props.alignRight ? 'right' : undefined}
            >
                {
                    props.currencyValue ? (+props.data === 0 ? '0.00' : (
                        typeof props.data === 'string' && !isNaN(+props.data.replace(/\s/g, ''))) ? Helper.getCurrencyValue(+props.data.replace(/\s/g, '')) :
                        typeof props.data === 'number' ? Helper.getCurrencyValue(props.data) :
                            props.data
                    ) :
                        props.data
                }
            </Text> || <></>
        }
    }
}

export default SimpleTableCell
