import { useEffect, useState } from 'react';
import SCInlineInput from '../../sc-controls/form-controls/sc-inline-input';
import Reorder, { reorder } from 'react-reorder';
import Helper from '../../../utils/helper';
import Button from '../../button';
import { colors } from '../../../theme';

const FormDefinitionFieldListOptionsReactReorder = ({ dataOption, setDataOption, error, disabled }) => {

    const [options, setOptions] = useState([""]);
    const [disableReorder, setReorderToDisabled] = useState(true);
    const [focusKey, setFocusKey] = useState(-1);

    useEffect(() => {
        setOptions(parseOptions());
    }, []);

    const parseOptions = () => {
        let opts = [""];

        if (dataOption && dataOption.length > 0) {
            opts = Helper.deserializeCustomCSV(dataOption);
        }

        return opts;
    };

    const updateOption = (e, key) => {
        let newVal = e.value;
        let tempOpts = [...options];
        tempOpts[key] = newVal;
        setOptions(tempOpts);
    };

    const removeOption = (key) => {
        let tempOpts = [...options];
        tempOpts.splice(key, 1);
        setOptions(tempOpts);
    };

    const serializeOptions = () => {
        let dataOptionString = "";
        let optionsFiltered = options.filter(x => !Helper.isNullOrWhitespace(x));
        if (optionsFiltered.length > 0) {
            dataOptionString = Helper.serializeCustomCSV(optionsFiltered);
        }
        return dataOptionString;
    };

    useEffect(() => {
        // parse the options and persist back up
        setDataOption(serializeOptions());
    }, [options]);

    const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

        let tempOptions = [...options];
        let opt = tempOptions.splice(previousIndex, 1);
        tempOptions.splice(nextIndex, 0, opt);

        setOptions(tempOptions);

    };

    const keyPress = (e, key) => {
        let enterPressed = e.key === "Enter";

        let currentValue = options[key];
        let anyEmpty = options.filter(x => Helper.isNullOrWhitespace(x)).length > 0;
        if (!Helper.isNullOrWhitespace(currentValue) && enterPressed && !anyEmpty) {
            let tempOptions = [...options];
            tempOptions.splice(key + 1, 0, "");
            setOptions(tempOptions);
            setFocusKey(key + 1);
        }
    };

    const checkIfFocused = (key) => {
        if (key === focusKey) {
            return true;
        }
        return false;
    };

    const addOption = () => {
        let anyEmpty = options.filter(x => Helper.isNullOrWhitespace(x)).length > 0;
        if (!anyEmpty) {
            let key = options.length;
            let tempOptions = [...options];
            tempOptions.splice(key, 0, "");
            setOptions(tempOptions);
            setFocusKey(key);
        }
    }

    return (<div className={`${error ? "error" : ""}`}>
        <table >
            <Reorder reorderId="form-definition-field-list-options" onReorder={onReorder} lock='horizontal' component='tbody'
                placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder}>
                {
                    options.map((option, key) => {
                        return (<tr key={key}>
                            <td className="body-item-move" title="Click and drag to reorder"
                                onMouseEnter={() => setReorderToDisabled(false && !disabled)} onMouseLeave={() => setReorderToDisabled(true)}>
                                <img src="/icons/menu-light.svg" alt="move" />
                            </td>
                            <td>
                                <SCInlineInput
                                    autoFocus={checkIfFocused(key)}
                                    label={`Option ${key + 1}`}
                                    onChange={(e) => updateOption(e, key)}
                                    type={"text"}
                                    value={option}
                                    onKeyPress={(e, f) => keyPress(e, key)}
                                    readOnly={disabled}
                                />
                            </td>
                            <td>
                                {options.length > 1 && !disabled ?
                                    <img src="/icons/trash-bluegrey.svg" alt="move" onClick={() => removeOption(key)} /> : ""
                                }
                            </td>
                        </tr>);
                    })
                }
            </Reorder>

        </table>

        {disabled ? "" :
            <div className="row">
                <Button text="Add Option" icon="plus-circle-blue" extraClasses="hollow small-margin" onClick={() => addOption()} />
            </div>
        }

        {error ? <p className="error-text">At least one option is required</p> : ""}

        <style jsx>{`
        .error {
            border: 1px solid ${colors.warningRed};
            border-radius: 3px;
            padding: 8px;
        }

        .error-text {
            color: ${colors.warningRed};
            font-size: 0.8rem;
        }

        .reorder-placeholder {

        }

        .reorder-dragged {
          width: 100%;
          height: 4rem !important;
        }

        .reorder-dragged td {
          font-size: 12px;
          min-width: 6rem;
          padding-right: 1rem;
        }

        .row {
            display: flex;
            justify-content: space-between;
          }
        `}</style>
    </div>);
};

export default FormDefinitionFieldListOptionsReactReorder;