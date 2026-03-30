import { useState } from "react";
import { colors } from "../../../theme";
import helper from "../../../utils/helper";
import SCCheckbox from "../../sc-controls/form-controls/sc-checkbox";
import ManageTableHeading from "./manage-table-heading";
import {Button, Flex, Title} from "@mantine/core";
import * as Enums from '../../../utils/enums';
import SCInput from "../../sc-controls/form-controls/sc-input";
import ManageFormDefinitionField from "./manage-form-definition-field";
import SCModal from "@/PageComponents/Modal/SCModal";

export default function ManageFormDefinitionTable({ onDismiss, definition, setDefinition }) {

    const [selectedRowDefinition, setSelectedRowDefinition] = useState(null);
    const [selectedFormDefinitionField, setSelectedFormDefinitionField] = useState(null);
    const [hoverColumnIndex, setHoverColumnIndex] = useState(null);

    const newRowDefinition = ({ name = helper.newGuid(), label = "New Row" }) => {
        let def = {
            Name: name,
            Label: label
        };
        return def;
    };

    const newColumnDefinition = ({ name = helper.newGuid(), label = "", dataType = "String", dataOption = null, required = false }) => {
        let def = {
            Name: name,
            Label: label,
            DataType: dataType,
            DataOption: dataOption,
            Required: required
        };
        return def;
    };

    const newDefinition = ({ limitRows = false, maximumRows = 1, labelRows = false, rowDefinitions = [], columnDefinitions = [newColumnDefinition({})] }) => {
        let def = {
            LimitRows: limitRows,
            MaximumRows: maximumRows,
            LabelRows: labelRows,
            RowDefinitions: rowDefinitions,
            ColumnDefinitions: columnDefinitions
        };
        return def;
    }

    const removeColumn = (def) => {
        let designTemp = { ...design };
        let idx = designTemp.ColumnDefinitions.findIndex(x => x.Name === def.Name);
        if (idx > -1) {
            designTemp.ColumnDefinitions.splice(idx, 1);
            setDesign(designTemp);
        }
    };

    const removeRow = (def) => {
        let designTemp = { ...design };
        let idx = designTemp.RowDefinitions.findIndex(x => x.Name === def.Name);
        if (idx > -1) {
            designTemp.RowDefinitions.splice(idx, 1);
            setDesign(designTemp);
        }
    };

    const updateDesign = ({ value, name }) => {
        let designTemp = { ...design };
        designTemp[name] = value;
        setDesign(designTemp);
    };

    const updateLabelRows = ({ value, name }) => {
        let designTemp = { ...design };
        designTemp[name] = value;
        if (value) {
            if (designTemp.RowDefinitions.length === 0) {
                designTemp.RowDefinitions.push(newRowDefinition({}));
            }
        }
        setDesign(designTemp);
    };

    const updateRowDefinition = (def) => {
        let designTemp = { ...design };
        let idx = designTemp.RowDefinitions.findIndex(x => x.Name === def.Name);
        if (idx > -1) {
            designTemp.RowDefinitions[idx] = def;
        } else {
            // assuming it is new
            designTemp.RowDefinitions.push(def);
        }
        setDesign(designTemp);
    }

    const updateColumnDefinition = (def) => {
        let designTemp = { ...design };
        let idx = designTemp.ColumnDefinitions.findIndex(x => x.Name === def.Name);
        if (idx > -1) {
            designTemp.ColumnDefinitions[idx] = def;
        } else {
            // assuming it is new
            designTemp.ColumnDefinitions.push(def);
        }
        setDesign(designTemp);
    }

    const editColumnTemplate = (def) => {
        setSelectedFormDefinitionField({
            Name: def.Name,
            Definition: {
                Description: def.Label,
                DataType: def.DataType,
                Required: def.Required,
                DataOption: def.DataOption
            }
        });
    };

    const updateColumnTemplate = (template) => {
        if (template != null) {
            let designTemp = { ...design };
            let idx = designTemp.ColumnDefinitions.findIndex(x => x.Name === selectedFormDefinitionField.Name);
            if (idx > -1) {
                designTemp.ColumnDefinitions[idx].Label = template.Description;
                designTemp.ColumnDefinitions[idx].DataType = template.DataType;
                designTemp.ColumnDefinitions[idx].DataOption = template.DataOption;
                designTemp.ColumnDefinitions[idx].Required = template.Required;
            } else {
                let def = newColumnDefinition({
                    dataOption: template.DataOption,
                    dataType: template.DataType,
                    label: template.Description,
                    name: selectedFormDefinitionField.Name,
                    required: template.Required
                });
                designTemp.ColumnDefinitions.push(def)
            }
            setDesign(designTemp);
        }
        setSelectedFormDefinitionField(null);
    };

    const [design, setDesign] = useState(definition ? definition : newDefinition({}));

    const onUpdate = () => {

        let designTemp = { ...design };
        if (designTemp.LabelRows) {
            designTemp.RowLimit = null;
        } else {
            designTemp.RowDefinitions = [];
        }

        console.log(designTemp);
        setDefinition && setDefinition(designTemp);
        onDismiss && onDismiss();
    }

    return (<>

        <SCModal
            open={!selectedRowDefinition && !selectedFormDefinitionField}
            keepMounted
            modalProps={{closeOnEscape: false, closeOnClickOutside: false}}
            withCloseButton
            onClose={onDismiss}
            size={design.ColumnDefinitions.length > 3 ? 'auto' : 550}
        >
            <Title
                c={'scBlue'}
                order={3}
                mb={-20}
            >
                Edit Table
            </Title>

            <div className="row">
                <div className="column">
                    <div className="checkbox-height">
                        <SCCheckbox
                            label={"Label Rows"}
                            name={"LabelRows"}
                            value={design.LabelRows}
                            onChangeFull={updateLabelRows}
                        />
                    </div>
                </div>

                {!design.LabelRows ? <>
                    <div className="column">
                        <div className="checkbox-height">
                            <SCCheckbox
                                label={"Limit Rows"}
                                name={"LimitRows"}
                                value={design.LimitRows}
                                onChangeFull={updateDesign}
                            />
                        </div>
                    </div>
                    <div className="column" >
                        <div style={{ display: design.LimitRows ? "block" : "none" }}>
                            <SCInput
                                label={"Maximum Rows"}
                                value={design.MaximumRows}
                                name={"MaximumRows"}
                                type={"number"}
                                disabled={!design.LimitRows}
                                onChange={updateDesign}
                            />
                        </div>
                    </div>
                </> : ""}
            </div>



            <div className="row">
                <table className="definition-table">
                    <thead>
                        <tr>
                            {design.LabelRows ? <>
                                <td>
                                </td>
                                <td >
                                </td>
                            </> : ""}

                            {design.ColumnDefinitions.map((def, key) => {
                                return (<td key={key} style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                                    {design.ColumnDefinitions.length > 1 ?
                                        <img src="/icons/x-circle-red.svg" style={{ cursor: "pointer" }} onClick={() => removeColumn(def)} title="Remove column" />
                                        : ""}
                                </td>);
                            })}
                        </tr>
                        <tr>
                            {design.LabelRows ? <>
                                <th className="blank-th"></th>
                                <th className="blank-th"></th>
                            </> : ""}

                            {design.ColumnDefinitions.map((def, key) => {
                                return (<th onMouseEnter={() => setHoverColumnIndex(key)} onMouseLeave={() => setHoverColumnIndex(null)} className="heading-th" key={key} onClick={() => editColumnTemplate(def)}>{def.Label}</th>);
                            })}
                            <th style={{ verticalAlign: "top", paddingTop: "1rem", paddingLeft: "0.5rem" }}>
                                <img src="/icons/plus-circle-blue.svg" style={{ cursor: "pointer" }} onClick={() => editColumnTemplate(newColumnDefinition({}))} title="Add column" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {design.LabelRows ? <>
                            {design.RowDefinitions.map((rowDef, rowKey) => {
                                return (<tr key={rowKey + 'row'}>
                                    <td style={{ textAlign: "center", paddingTop: "0.5rem", paddingLeft: "0.5rem" }}>
                                        {design.RowDefinitions.length > 1 ?
                                            <img src="/icons/x-circle-red.svg" style={{ cursor: "pointer", paddingRight: "0.5rem" }} onClick={() => removeRow(rowDef)} title="Remove row" />
                                            : ""}
                                    </td>
                                    <td className="heading-th" key={rowKey} onClick={() => setSelectedRowDefinition(rowDef)}>
                                        {rowDef.Label}
                                    </td>
                                    {design.ColumnDefinitions.map((def, key) => {
                                        return (<td className={`data-td${(hoverColumnIndex === key ? " hover" : "")}`} key={`${rowKey}_${key}`} onClick={() => editColumnTemplate(def)}
                                            onMouseEnter={() => setHoverColumnIndex(key)} onMouseLeave={() => setHoverColumnIndex(null)}>{Enums.FormDefinitionFieldTypes[def.DataType]}{def.Required ? " *" : ""}</td>);
                                    })}
                                </tr>);
                            })}

                        </> : <tr>
                            {design.ColumnDefinitions.map((def, key) => {
                                return (<td className={`data-td${(hoverColumnIndex === key ? " hover" : "")}`} key={key} onClick={() => editColumnTemplate(def)}
                                    onMouseEnter={() => setHoverColumnIndex(key)} onMouseLeave={() => setHoverColumnIndex(null)}>{Enums.FormDefinitionFieldTypes[def.DataType]}{def.Required ? " *" : ""}</td>);
                            })}
                        </tr>}
                        {design.LabelRows ? <tr>
                            <td></td>
                            <td style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                                <img src="/icons/plus-circle-blue.svg" style={{ cursor: "pointer" }} onClick={() => setSelectedRowDefinition(newRowDefinition({}))} title="Add row" />
                            </td>
                            {design.ColumnDefinitions.map((def, key) => {
                                return (<td key={key}>
                                </td>);
                            })}
                        </tr> : ""}
                    </tbody>
                </table>
            </div>

            <Flex justify={'end'} gap={5} mt={'xl'}>
                <Button text="Cancel" variant="outline" onClick={onDismiss} >Cancel</Button>
                <Button onClick={onUpdate}>Update</Button>
            </Flex>

        </SCModal>

        {selectedRowDefinition ?
            <ManageTableHeading definition={selectedRowDefinition} setDefinition={updateRowDefinition} onDismiss={() => setSelectedRowDefinition(null)} />
            : ""}

        {selectedFormDefinitionField ?
            <ManageFormDefinitionField isNew={false} formDefinitionField={selectedFormDefinitionField.Definition} structureLocked={false} isTableColumn={true} saveFormDefinitionField={updateColumnTemplate} />
            : ""}

        <style jsx>{`
        
            .definition-table {
                width: 100%;
            }

            .heading-th {
                padding: 1rem;
                background: ${colors.blueGreyLight};
                font-weight: bold;
                text-align: center;
                cursor: pointer;
            }

            .data-td {
                padding: 1rem;
                background: ${colors.blueGreyLight}44;
                text-align: center;
                cursor: pointer;
            }

            .data-td.hover {
                // font-weight: bold;
                background: ${colors.blueGreyLight}88;
            }

            .row {
                display: flex;
            }
    
            .row.align-right {
                justify-content: flex-end;
            }

            .column {
                display: flex;
                flex-direction: column;
                width: 100%;
            }

            .checkbox-height {
                margin-top: 1.5rem;
                margin-bottom: 1.5rem;
            }

        `}</style>
    </>);
}