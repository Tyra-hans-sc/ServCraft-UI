import React, {FC, ReactNode, useRef} from 'react';
import NoSSR from "../../../utils/no-ssr";
import { Switch as LegacySwitch } from "@progress/kendo-react-inputs";
import { colors } from '@/theme';
import Helper from '../../../utils/helper';
import { Group, MantineColor, Switch, SwitchProps } from "@mantine/core";

const useLegacy = false;

function SCSwitch(
    { name, checked, label, onLabel, offLabel, title = "", disabled = false, onChange, flexRight = false, extraClasses, cypress, onToggle, mt = 'sm', color }:
        {
            name?: string; checked?: boolean; label?: string | ReactNode; onLabel?: string; offLabel?: string; title?: string,
            disabled?: boolean, onChange?: ({name, value}) => {}, flexRight?: boolean, extraClasses?: any,
            cypress?: any, onToggle?: (checked) => void,
            color?:MantineColor
        } & SwitchProps
) {

    const switchProps: SwitchProps = {
        name,
        checked: Helper.isNullOrUndefined(checked) ? false : checked,
        label: label || onLabel || offLabel,
        title,
        disabled,
        mt,
        color,
        // onLabel,
        // offLabel
    }

    // console.log(switchProps)

    const ref = useRef<HTMLInputElement>(null);

    const handleChange = (event) => {

        /*console.log('value vs checked', event.currentTarget.checked,
        event.currentTarget.value)*/
        onToggle && onToggle(event.currentTarget.checked)
        onChange && onChange({name, value: event.currentTarget.checked});
    };

    const handleChangeLegacy = (event) => {
        onChange && onChange({name: name, value: event.value});
    };

    const handleLabelClick = () => {
        //onChange({name: ref.current.props.name, value: ref.current.props.checked});
    };

    // const getLabel = () => {
    //     return (
    //         <span className="label" onClick={handleLabelClick}>

    //             {label ? label : Helper.isNullOrUndefined(value) ? false : value ? onLabel : offLabel}
    //             <style jsx>{`
    //                 .label {
    //                     margin-left: 0.5rem;
    //                     font-size: 16px;
    //                     color: ${colors.labelGrey};
    //                 }
    //             `}</style>
    //         </span>
    //     )
    // };

    return (
        // todo test title prop behaviour

        !useLegacy ?
            <NoSSR>
                <Group>
                    <Switch
                        {...switchProps}
                        ref={ref}
                        size={'sm'}
                        styles={{
                            trackLabel: {paddingInline: 0}
                        }}
                        color={ color || 'scBlue'}
                        onChange={handleChange}
                    />
                </Group>
            </NoSSR>
            :
            <div title={title} className={`switch-container ${extraClasses} ${flexRight ? 'reverse' : ''}`}>
                <NoSSR>
                    <LegacySwitch
                        ref={ref}
                        name={name}
                        onLabel={onLabel}
                        offLabel={offLabel}
                        onChange={handleChangeLegacy}
                        disabled={disabled}
                        className={cypress}
                    />
                </NoSSR>
                <style jsx>{`
                  .switch-container {
                    margin-top: 0.5rem;
                  }

                  .reverse {
                    display: flex;
                    flex-direction: row-reverse;
                  }
                `}</style>
            </div>
    );
}

export default SCSwitch;
