import React, { useState, useContext, useEffect, useRef } from 'react';
import Router from 'next/router';
import SCComboBox from '../../components/sc-controls/form-controls/sc-combobox';
import SCInput from '../../components/sc-controls/form-controls/sc-input';
import LegacyButton from '../../components/button';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';
import ConfirmAction from '../../components/modals/confirm-action';
import Storage from '../../utils/storage';
import { layout } from '../../theme';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import {Button, Flex} from "@mantine/core";

const CreateTemplateComponent = (props) => {
    const toast = useContext(ToastContext);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const getAccessStatus = () => {
        let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    }

    useEffect(() => {
        getAccessStatus();
    }, []);

    const modulesRef = useRef([]);

    useEffect(() => {

        let modules = Enums.getEnumItemsVD(Enums.Module, true).filter(x => x.value == Enums.Module.Appointment || x.value == Enums.Module.Collection 
            || x.value == Enums.Module.Customer || x.value == Enums.Module.Supplier || x.value == Enums.Module.Invoice || x.value == Enums.Module.JobCard || x.value == Enums.Module.Asset 
            || x.value == Enums.Module.Query || x.value == Enums.Module.Quote || x.value == Enums.Module.PurchaseOrder);

        if (props.allowedModules && props.allowedModules.length > 0) {            
            modules = props.allowedModules.map(x => { 
                return {'description': Enums.getEnumStringValue(Enums.Module, x, true), 'value': x}
            });
        }

        if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            Helper.nextRouter(Router.replace, "/");
        }

        let defaultModule = modules.length === 1 ? modules[0] : null; 

        if (defaultModule) {
            setSelectedModule(defaultModule);
        }

        modulesRef.current = modules;

    }, [accessStatus]);

    const [name, setName] = useState('');

    const handleNameChange = (e) => {
        setName(e.value);
        setFormIsDirty(true);
    };

    const [selectedModule, setSelectedModule] = useState();

    const handleModuleChange = (value) => {
        setSelectedModule(value);
        setFormIsDirty(true);
    };

    const [inputErrors, setInputErrors] = useState({});

    const validate = () => {

        let validationItems = [];
        validationItems = [
            { key: 'Name', value: name, required: true, type: Enums.ControlType.Text },
            { key: 'Module', value: selectedModule, required: true, type: Enums.ControlType.Select },
        ];

        const { isValid, errors } = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    }

    const [submitting, setSubmitting] = useState(false);

    async function submitTemplate() {
        let submitFinished = false;
        setSubmitting(true);

        let isValid = validate();
        if (isValid) {
            if (props.onSave) {
                props.onSave({Name: name, Module: selectedModule.value, TemplateType: Enums.TemplateType.User});
            }
            submitFinished = true;
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: 'error'
            });
        }

        setSubmitting(false);

        return submitFinished;
    }

    //Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, submitTemplate);

    return (
        <>
            <div className="row">
                <h3>Template Details</h3>
            </div>
            <div className="row">
                <div className="column">
                    <SCInput
                        label="Name of the template"
                        onChange={handleNameChange}
                        required={true}
                        value={name}
                        error={inputErrors.Name}
                        cypress="data-cy-name"
                    />
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <SCDropdownList
                        name="Module"
                        textField="description"
                        dataItemKey="value"
                        onChange={handleModuleChange}
                        label="Module"
                        options={modulesRef.current}
                        required={true}                    
                        value={selectedModule}
                        error={inputErrors.Module}
                    />
                </div>
            </div>
            <Flex justify={'start'} gap={5} mt={30} maw={500}>
                <Button variant={'outline'} onClick={() => props.onCancel()} >
                    Cancel
                </Button>
                {/*<LegacyButton text="Cancel" extraClasses="auto hollow" onClick={() => props.onCancel()} />*/}
                <Button onClick={submitTemplate} disabled={submitting} >
                    Create
                </Button>
                {/*<LegacyButton text="Create" extraClasses="auto left-margin" onClick={submitTemplate} disabled={submitting} />*/}
            </Flex>

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <style jsx>{`
          .row {
            display: flex;
            justify-content: space-between;
          }
          .column {
            display: flex;
            flex-direction: column;
            width: ${layout.inputWidth}
        }
        .column :global(.textarea-container) {
            height: 100%;
        }
        .column + .column {
            margin-left: 1.25rem;
        }
        .align-end {
            justify-content: flex-end;
            align-items: flex-end;
          }
        .actions {
            display: flex;
            flex-direction: row-reverse;
          }          
        .actions :global(.button){
            margin-left: 0.5rem;
            margin-top: 1rem;
            padding: 0 1rem;
            white-space: nowrap;
        }
        `}</style>
        </>
    );
};

export default CreateTemplateComponent;
