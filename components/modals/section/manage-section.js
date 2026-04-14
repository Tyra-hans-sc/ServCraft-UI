import React, { useState, useEffect, useContext } from 'react';
import {Box, Button as MantineButton, Flex, Title} from '@mantine/core';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import Helper from '../../../utils/helper';
import { Tooltip as MantineTooltip } from '@mantine/core';
import ScModal from '../../../PageComponents/Modal/SCModal';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';

function ManageSection({ module, onSave, sectionID, newSection, itemID, displayOrder = 0, dontSubmit }) {

    const [loaded, setLoaded] = useState(false);

    const isNew = Helper.isNullOrWhitespace(sectionID);

    const toast = useContext(ToastContext);

    const [inputs, setInputs] = useState(isNew ? {
        Heading: "",
        Repeatable: false,
        Module: module,
        Description: "",
        ItemID: itemID,
        DisplayOrder: displayOrder
    } : {});

    const [inputErrors, setInputErrors] = useState({});

    const loadSection = async () => {
        let data = await Fetch.get({
            url: `/Section?id=${sectionID}`
        });
        if (!data && newSection) {
            setInputs(newSection);
        } else {
            setInputs(data);
        }
        setLoaded(true);
    };

    const handleInputChange = (e) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
    };

    useEffect(() => {
        if (!isNew) {
            loadSection();
        } else {
            setLoaded(true);
        }
    }, []);

    const [saving, setSaving] = useState(false);

    const validate = () => {
        const { isValid, errors } = Helper.validateInputs([
            { key: "Heading", value: inputs.Heading, type: Enums.ControlType.Text, required: true }
        ])

        return { isValid, errors };
    };

    const save = async () => {

        const { isValid, errors } = validate();
        setInputErrors(errors);

        if (isValid && dontSubmit) {
            let section = { ...inputs };
            section.ID = section.ID ? section.ID : Helper.newGuid();
            onSave(section);
            return;
        }

        setSaving(true);


        if (isValid) {

            let params = inputs;

            let response = {};
            if (isNew) {
                response = await Fetch.post({
                    url: `/Section`,
                    params: {
                        Section: params
                    },
                    toastCtx: toast
                });
            } else {
                response = await Fetch.put({
                    url: `/Section`,
                    params: {
                        Section: params
                    },
                    toastCtx: toast
                });
            }

            if (response.ID) {
                toast.setToast({
                    message: `Section saved successfully`,
                    show: true,
                    type: 'success'
                });
                onSave(response);
            } else {
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
        }

        if (!isNew) {
            setSaving(false);
        }
    };

    /*if (!loaded) {
        return <></>
    }*/

    return (
        <ScModal open={loaded} onClose={() => onSave(null)} withCloseButton size={550}>
        {/*<ScModal isOpen={loaded} onClose={() => onSave(null)} onClick={(e) => e.stopPropagation()}>*/}
            <Box>
                <Title order={5} c={'scBlue'} pb={0} mb={0}>
                    {isNew ?
                        <h1>Creating a Section</h1> :
                        <h1>Editing a Section</h1>
                    }
                </Title>
                <Box mb={'sm'} mt={0} pt={0} px={'sm'}>
                    <div>
                        <div>
                            <SCInput
                                label="Heading"
                                name="Heading"
                                onChange={handleInputChange}
                                required={true}
                                value={inputs.Heading}
                                error={inputErrors.Heading}
                            />
                        </div>
                    </div>
                    <div>
                        <div>
                            <SCTextArea
                                label="Description"
                                name="Description"
                                onChange={handleInputChange}
                                required={false}
                                value={inputs.Description}
                                error={inputErrors.Description}
                            />
                        </div>
                    </div>
                    {module === Enums.Module.FormDefinition ?
                        <MantineTooltip label="Allows you to capture the item multiple times within the section" color={'scBlue'} openDelay={800}>
                            <Flex>
                                <SCSwitch label="Repeatable" checked={inputs.Repeatable}
                                          onToggle={() => handleInputChange({ name: "Repeatable", value: !inputs.Repeatable })}
                                />
                            </Flex>
                        </MantineTooltip> : ""}
                </Box>

                <Flex gap={'sm'} justify={'end'}>
                    <MantineButton variant="outline" className="hollow auto" onClick={() => onSave(null)}>Cancel</MantineButton>
                    <MantineButton className="auto left-margin" onClick={save} disabled={saving}>{isNew ? `Create` : `Save`}</MantineButton>
                </Flex>
            </Box>

            <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: ${layout.inputWidth};
          margin-left: 0.5rem;
        }
        .align-end {
            justify-content: flex-end;
            align-items: flex-end;
          }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
        }
        .small-title {
          color: ${colors.darkPrimary};
          font-size: 0.875rem;
          font-weight: bold;
          margin-top: 2rem;
        }
        .color-block {
          border-radius: ${layout.cardRadius};
          background-color: #4F4F4F;
          cursor: pointer;
          height: 2rem;
          margin-right: 1rem;
          margin-top: 1rem;
          position: relative;
          width: 2rem;
          z-index: 1;
        }
        .add-color {
          align-items: center;
          background: none;
          border: 1px solid ${colors.darkPrimary};
          color: ${colors.darkPrimary};
          display: flex;
          justify-content: center;
        }
       
        .color-picker {
          position: relative;
        }
        .color-picker :global(.sketch-picker) {
          left: 0;
          position: absolute;
          top: calc(100% + 0.5rem);
          z-index: 99;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
      `}</style>
    </ScModal>
    );
}

export default ManageSection;
