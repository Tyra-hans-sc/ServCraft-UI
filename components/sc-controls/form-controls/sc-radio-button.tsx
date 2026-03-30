import {Radio, RadioProps} from "@mantine/core";

const useLegacy = false;

export default function SCRadioButton({ disabled, label, key, value }) {

    const mantineRadioInputProps: RadioProps = {
        disabled,
        label,
        key,
        value
    }

    // const handleChange = (e: any) => {
    //     // todo verify behaviour...
    //     // console.log(e.currentTarget)
    //     onChange && onChange({name: fieldName, value: e.currentTarget.checked, target: e.currentTarget})
    // }

    // const handleChangeLegacy = (e) => {
    //     onChange && onChange({name: fieldName, value: e.value, target: e.target});
    // };

    return (
        !useLegacy
        &&
        <Radio mt={'0.5rem'}
               {...mantineRadioInputProps}
            //    onChange={handleChange}
               color={'scBlue'}
        />
        ||
        <>
            <div className="input-container">
                <Radio
                    disabled={disabled}
                    label={label}
                    key={key}
                    value={value}
                    // checked={checked}
                    // onChange={handleChangeLegacy}
                />
            </div>
            <style jsx>{`

              .input-container {
                margin-top: 0.5rem;
              }

            `}</style>
        </>);
}
