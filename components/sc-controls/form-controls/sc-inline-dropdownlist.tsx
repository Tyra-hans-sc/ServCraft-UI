import SCDropdownList from "./sc-dropdownlist";

export default function SCInlineDropDownList({ name, value, options, autoFocus, onBlur, onChange, width }) {

    return (<>

        <div className="input-container">
            <SCDropdownList
                name={name}
                value={value}
                options={options}
                autoFocus={autoFocus}
                onBlur={onBlur}
                onChange={onChange}
            />

        </div>

        <style jsx>{`
        .input-container {
            ${width ? `width: ${width};` : ""}
        }
        `}</style>

    </>);
};