import React, { useState, useEffect } from 'react'

function RadioInputGroup(props) {

    const [selectedValue, setSelectedValue] = useState(props.value);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        setOptions(props.options);
    }, [props.options]);

    return (
        <div className="row">
            <label>{props.label}</label>
            {options.map(function (option) {
                return (
                    <span className="margin-left16">
                        <input type="radio" id={option.key + "_" + option.value} name={props.name} value={option.value} 
                            onChange={(e) => { props.changeHandler(e.target.value); }} />
                        <label for={option.key + "_" + option.value}>{option.key}</label>
                    </span>
                )
            })}
            <style jsx>{`
        .margin-left16 {
            margin-left: 16px;
        }
            `}</style>
        </div>
    );
}

export default RadioInputGroup;
