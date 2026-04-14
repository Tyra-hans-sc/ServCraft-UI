import React, { useState} from 'react';
import { colors, layout } from '../../../theme';
import Legacy from '../../button';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import TaskItemTemplateListOptions from "./TaskItemTemplateReorderListDnDKit";
import SCModal from "@/PageComponents/Modal/SCModal";
import {Box, Button, Flex, Title} from "@mantine/core";

const ManageTaskItemTemplate = ({ taskItemTemplate, saveTaskItemTemplate, isNew }) => {

    const [description, setDescription] = useState(isNew ? '' : taskItemTemplate.Description);
    const [dataType, setDataType] = useState(isNew ? null : taskItemTemplate.DataType);
    const [dataOption, setDataOption] = useState(isNew ? null : taskItemTemplate.DataOption);
    const [dataTypeChecked, setDataTypeChecked] = useState(isNew ? null : !Helper.isNullOrWhitespace(taskItemTemplate.DataType));

    const handleDescriptionChange = (e) => {
        setDescription(e.value);
    };

    const [inputErrors, setInputErrors] = useState({});

    const [saving, setSaving] = useState(false);

  const saveItem = async () => {
    setSaving(true);

    let inputs = [
      { key: 'Description', value: description, required: true, type: Enums.ControlType.Text }
    ];

    if (dataTypeChecked) {
      inputs.push({ key: 'DataType', value: dataType, required: true, type: Enums.ControlType.Select });
    }

    if (showDataOption()) {
      inputs.push({ key: 'DataOption', value: dataOption, required: true, type: Enums.ControlType.Text });
    }

    const { isValid, errors } = Helper.validateInputs(inputs);
    if (!isValid) {
      setInputErrors(errors);
      setSaving(false);
    } else {
      let item = {
        Description: description,
        IsActive: true,
        DataType: dataType,
        DataOption: showDataOption() ? dataOption : null
      };

      saveTaskItemTemplate(item);
    }

    if (!isNew) {
      setSaving(false);
    }
  };

    const dataTypeChanged = (option) => {
        setDataType(option ? option.ID : null);
    };

    const showDataOption = () => {
        return dataType === "Select" || dataType === "MultiSelect";
    };

    const getDataTypeOptions = () => {
        const keys = Object.keys(Enums.TaskTemplateDataTypes);
        return keys.map(key => {
            return {
                ID: key,
                Description: Enums.TaskTemplateDataTypes[key]
            };
        });
    };

    const getDataTypeValue = () => {
        return dataType ? {
            ID: dataType,
            Description: Enums.TaskTemplateDataTypes[dataType]
        } : null;
    };

  const handleDataTypeCheckedChange = (checked) => {
    setDataTypeChecked(checked);
    if (!checked) {
      dataTypeChanged(null);
    }
  }

  return (

      <SCModal
          open
          size={showDataOption() ? 'xl' : 'md'}
          withCloseButton
          onClose={() => saveTaskItemTemplate(null)}
          modalProps={{keepMounted: true}}
      >

          <Title order={3} c={'scBlue'}>
              {isNew ?
                  <>Adding Task Item Template</> :
                  <>Editing Task Item Template</>
              }
          </Title>

          <Flex gap={'sm'} mb={'xl'} >
              <Box style={{flexGrow: 1}}>
                  <SCTextArea
                      // maw={'100%'}
                      label="Description"
                      onChange={handleDescriptionChange}
                      required={true}
                      value={description}
                      error={inputErrors.Description}
                      cypress="data-cy-description"
                  />

                  <SCSwitch checked={dataTypeChecked} onToggle={(checked) => handleDataTypeCheckedChange(checked)}
                            label='Add input to task'/>

                  {dataTypeChecked &&
                      <SCComboBox
                          name="DataType"
                          dataItemKey="ID"
                          textField="Description"
                          label="Type"
                          error={inputErrors.DataType}
                          options={getDataTypeOptions()}
                          onChange={(option => dataTypeChanged(option))}
                          value={getDataTypeValue()}
                      />
                  }

              </Box>
              {showDataOption() &&
                  <Box  style={{flexGrow: 1}}>
                      <>
                          <h4>List Options</h4>
                          <TaskItemTemplateListOptions dataOption={dataOption} setDataOption={(c) => {
                              setDataOption(c)
                          }} error={inputErrors.DataOption}/>
                      </>
                  </Box>
              }
          </Flex>

          {/*<ReactSwitch checked={dataTypeChecked} handleChange={(checked) => handleDataTypeCheckedChange(checked)} label='Add input to task' />*/}


          <Flex gap={5} justify={'end'}  mt={25} >
              <Button
                  variant={'outline'}
                  onClick={() => saveTaskItemTemplate(null)}
              >
                  Cancel
              </Button>
              <Button
                  onClick={saveItem} disabled={saving}
              >
                  Save
              </Button>
          </Flex>
          {/*<div className="row align-end">
              <Legacy text="Cancel" extraClasses="auto hollow" onClick={() => saveTaskItemTemplate(null)}/>
              <Legacy text="Save" extraClasses="auto left-margin" onClick={saveItem} disabled={saving}/>
          </div>*/}
         {/* <style jsx>{`
              .container {
                  background-color: ${colors.white};
                  border-radius: ${layout.cardRadius};
                  padding: 2rem 3rem;
                  width: 38rem;
                  display: flex;
                  flex-direction: column;
                  max-height: 80%;
                  overflow: auto;
              }

              .title {
                  color: ${colors.bluePrimary};
                  font-size: 1.125rem;
                  font-weight: bold;
              }

              .row {
                  display: flex;
                  justify-content: space-between;
              }

              .column {
                  display: flex;
                  flex-direction: column;
                  width: ${layout.inputWidth};
              }

              .column + .column {
                  margin-left: 1.25rem;
              }

              .align-end {
                  justify-content: flex-end;
                  align-items: flex-end;
              }

              .inventory-item-container {
                  display: flex;
                  flex-direction: row;
                  width: 100%;
              }

              .description-container {

              }

              .integration-message {
                  display: flex;
                  flex-direction: row-reverse;
              }

              .pending {
                  color: ${colors.labelGrey};
              }

              .error {
                  color: ${colors.warningRed};
              }

              .synced {
                  color: ${colors.green};
              }

              .total-row {
                  font-weight: bold;
                  margin-top: 1rem;
              }

              .end {
                  align-items: flex-end;
              }

              .left-padding {
                  padding-left: 0.5em;
              }

              .right-padding {
                  padding-right: 0.5em;
              }
          `}</style>*/}

      </SCModal>
    /*<div className="overlay" onClick={(e) => e.stopPropagation()}>
        <div className="modal-container">

        </div>

    </div>*/
)
    ;
};

export default ManageTaskItemTemplate;
