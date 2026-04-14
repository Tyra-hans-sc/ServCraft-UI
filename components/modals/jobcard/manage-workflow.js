import React, { useState, useEffect, useContext, useRef } from 'react';
import Button from '../../button';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCSwitch from '../../sc-controls/form-controls/sc-switch';
import ReactSwitch from '../../react-switch';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import constants from '../../../utils/constants';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import InfoTooltip from '../../info-tooltip';
import PremiumTooltip from "../../../PageComponents/Premium/PremiumTooltip";
import PremiumIcon from "../../../PageComponents/Premium/PremiumIcon";
import {Flex} from "@mantine/core";

function ManageWorkflow({ isNew, workflow, onWorkflowSave, accessStatus, isWorkflow }) {

    const toast = useContext(ToastContext);
    const [inputErrors, setInputErrors] = useState({});

    const [inputs, setInputs] = useState({
        Name: isNew ? '' : workflow.Name,
        Description: isNew ? '' : workflow.Description,
        IsDefault: isNew ? false : workflow.IsDefault,
        SingleItem: isNew ? false : workflow.SingleItem,
        FlowType: isNew ? Enums.FlowType.Flowless : workflow.FlowType,
        IsActive: isNew ? true : workflow.IsActive,
    });

    const handleInputChange = (e) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
    };

    const jobItemSelections = useRef(Enums.getEnumItemsVD(Enums.JobItemSelection, true, false).map(item => {
        let newDescription = item.description.replace("Inventory", "Non-serialised").replace("Asset", "Serialised");
        return {
            ...item,
            description: newDescription
        };
    }));

    useEffect(() => {
        if (!isNew) {
            if (workflow.JobItemSelection > 0) {
                setSelectedJobItemSelection(jobItemSelections.current.find(x => x.value === workflow.JobItemSelection));
                // setSelectedJobItemSelection(Enums.getEnumStringValue(Enums.JobItemSelection, workflow.JobItemSelection));
            }
            if (workflow.JobItemOrder > 0) {
                setSelectedJobItemOrder(Enums.getEnumStringValue(Enums.JobItemOrder, workflow.JobItemOrder));
            }
        }
        else {
            setSelectedJobItemSelection(jobItemSelections.current.find(x => x.value === Enums.JobItemSelection.Asset));
            // setSelectedJobItemSelection(Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Asset));
            setSelectedJobItemOrder(Enums.getEnumStringValue(Enums.JobItemOrder, Enums.JobItemOrder.Inventory));
        }
    }, []);

    const [selectedJobItemSelection, setSelectedJobItemSelection] = useState();

    const firstUpdate = useRef(true);
    useEffect(() => {
        if (selectedJobItemSelection) {

            if (firstUpdate.current) {
                firstUpdate.current = false;
                return;
            }

            //setShowJobItemOrder(selectedJobItemSelection == Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Both));

            // let order;
            // if (selectedJobItemSelection == Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Both) ||
            //     selectedJobItemSelection == Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Inventory)) {
            //     order = Enums.getEnumStringValue(Enums.JobItemOrder, Enums.JobItemOrder.Inventory);
            // } else if (selectedJobItemSelection == Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Asset)) {
            //     order = Enums.getEnumStringValue(Enums.JobItemOrder, Enums.JobItemOrder.Asset);
            // }

            //setSelectedJobItemOrder(order);
        }
    }, [selectedJobItemSelection]);

    const [showJobItemOrder, setShowJobItemOrder] = useState(false); // useState(isNew ? true : workflow.JobItemSelection == Enums.JobItemSelection.Both);
    const jobItemOrders = Enums.getEnumItems(Enums.JobItemOrder, false);
    const [selectedJobItemOrder, setSelectedJobItemOrder] = useState(Enums.getEnumStringValue(Enums.JobItemOrder, Enums.JobItemOrder.Inventory));

    const [saving, setSaving] = useState(false);

    const validate = () => {
        let validationItems = [
            { key: 'Name', value: inputs.Name, required: true, type: Enums.ControlType.Text },
            { key: 'JobItemSelection', value: selectedJobItemSelection?.value, required: true, type: Enums.ControlType.Select },
            { key: 'JobItemOrder', value: selectedJobItemOrder, required: true, type: Enums.ControlType.Select },
        ];
        let result = Helper.validateInputs(validationItems);
        console.log(result);
        return result;
    };

    const save = async () => {
        setSaving(true);

        let { isValid, errors } = validate();
        setInputErrors(errors);

        if (isValid) {
            let response;

            let workflowParams = {
                ...workflow,
                Name: inputs.Name,
                Description: inputs.Description,
                FlowType: inputs.FlowType,
                IsActive: inputs.IsActive,
                IsDefault: inputs.IsDefault,
                SingleItem: inputs.SingleItem,
                JobItemSelection: selectedJobItemSelection.value,
                JobItemOrder: Enums.JobItemOrder[selectedJobItemOrder],
            };

            if (isNew) {
                response = await Fetch.post({
                    url: `/Workflow`,
                    params: workflowParams,
                    toastCtx: toast
                });
            } else {
                response = await Fetch.put({
                    url: `/Workflow`,
                    params: workflowParams,
                    toastCtx: toast
                });
            }

            if (response.ID) {
                Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createWorkflow : constants.mixPanelEvents.editWorkflow, {
                    "workflowID": response.ID
                });
                toast.setToast({
                    message: `Workflow saved successfully`,
                    show: true,
                    type: 'success'
                });
                onWorkflowSave(response);
            } else {
                toast.setToast({
                    message: response.serverMessage,
                    show: true,
                    type: Enums.ToastType.error
                });
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: `Error saving workflow`,
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
        }

        if (!isNew) {
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
                <div className="title">
                    {isNew ?
                        <h1>Creating a Workflow</h1> :
                        <h1>Editing a Workflow</h1>
                    }
                </div>

                <div className="row">
                    <div className="column">
                        <SCInput
                            label="Name"
                            onChange={handleInputChange}
                            required={true}
                            name="Name"
                            value={inputs.Name}
                            error={inputErrors.Name}
                            cypress="data-cy-name"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <SCTextArea
                            name="Description"
                            label="Description"
                            onChange={handleInputChange}
                            value={inputs.Description}
                            error={inputErrors.Description}
                            cypress="data-cy-description"
                        />
                    </div>
                </div>

                <div>

                    <div className="row">
                        <div className="column">
                            <SCDropdownList
                                name="JobItemSelection"
                                label="Customer Asset Selection"
                                options={jobItemSelections.current}
                                onChange={setSelectedJobItemSelection}
                                value={selectedJobItemSelection}
                                required={true}
                                error={inputErrors.JobItemSelection}
                                cypress="data-cy-jobitemselection"
                                textField='description'
                                dataItemKey='value'
                            />
                        </div>
                        <div className="column" style={{ paddingTop: "2rem" }}>
                            <SCSwitch
                                label="Restrict To A Single Item"
                                // offLabel="Multi-item"
                                checked={inputs.SingleItem}
                                onToggle={(checked) => handleInputChange({ name: "SingleItem", value: checked })}
                                cypress="data-cy-singleitem"
                            />

                        </div>
                    </div>
                    {selectedJobItemSelection === Enums.getEnumStringValue(Enums.JobItemSelection, Enums.JobItemSelection.Disabled) ? <>
                        <div className="customer-asset-caption">
                            Disabling customer asset selection will block users from adding customer assets to jobs and block the configuration of customer assets within job statuses.
                        </div>
                    </> : ""}
                </div>

                {isWorkflow ? <div className="row top-margin">
                    <div className="column">
                        <PremiumTooltip>
                            <span>
                                <SCSwitch
                                    label={<Flex align={'center'} gap={5}>Enforced Workflow <PremiumIcon /> </Flex>}
                                    checked={inputs.FlowType === Enums.FlowType.WorkFlow}
                                    onToggle={() => handleInputChange({
                                        name: "FlowType",
                                        value: inputs.FlowType === Enums.FlowType.Flowless ? Enums.FlowType.WorkFlow : Enums.FlowType.Flowless
                                    })}
                                    cypress="data-cy-flowtype"
                                />
                            </span>
                        </PremiumTooltip>
                    </div>
                    <InfoTooltip title={"Only allow selection of job statuses that are linked to current job status"} />
                    <div className="column">
                    </div>
                </div> : ""}


                <div className="row top-margin">
                    <div className="column">
                        <SCSwitch
                            label="Default"
                            // offLabel="Non-Default"
                            checked={inputs.IsDefault}
                            onToggle={(checked) => handleInputChange({ name: "IsDefault", value: checked })}
                            disabled={!isNew && workflow.IsDefault}
                            cypress="data-cy-default"
                        />
                    </div>
                    <div className="column">

                    </div>
                </div>

                <div className="switch">
                    <SCSwitch
                        label="Active"
                        // offLabel="Disabled"
                        checked={inputs.IsActive}
                        onToggle={(checked) => handleInputChange({ name: "IsActive", value: checked })}
                        disabled={!isNew && workflow.IsDefault}
                        cypress="data-cy-active"
                    />
                    {/*<ReactSwitch
                        label="Active"
                        offLabel="Disabled"
                        checked={inputs.IsActive}
                        handleChange={(checked) => handleInputChange({name: "IsActive", value: checked})}
                        disabled={!isNew && workflow.IsDefault}
                        cypress="data-cy-active"
                    />*/}
                </div>

                <div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={() => onWorkflowSave(null)} />
                    <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || saving}
                        text={`${isNew ? `Create` : `Save`}`} extraClasses="auto left-margin" onClick={save} />
                </div>
            </div>

            <style jsx>{`

                .modal-container {
                    width: 32rem;
                }

                .row {
                display: flex;
                }
                .column {
                display: flex;
                flex-direction: column;
                width: ${layout.inputWidth};
                }
                .column :global(.textarea-container) {
                height: 100%;
                }
                .column + .column {
                margin-left: 1.25rem;
                }
                .title {
                color: ${colors.bluePrimary};
                font-size: 1.125rem;
                font-weight: bold;
                margin-bottom: 1rem;
                }
                .switch {
                flex-direction: row-reverse;
                display: flex;
                }
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                  }
                .top-margin {
                margin-top: 1rem;
                }

                .customer-asset-caption {
                    margin-top: 0.5rem;
                    opacity: 0.6;
                    font-size: 0.8rem;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}

export default ManageWorkflow;
