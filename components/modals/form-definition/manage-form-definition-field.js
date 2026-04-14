import React, { useState, useEffect, useContext, useMemo } from 'react';
import { colors, layout } from '../../../theme';
import {Box, Button, Flex, Text, Title} from '@mantine/core';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import FormDefinitionFieldListOptionsReactReorder from './form-definition-field-list-options-react-reorder';
import FormDefinitionFieldSignatureOptions from './form-definition-field-signature-options';
import ManageSection from '../section/manage-section';
import optionService from '../../../services/option/option-service';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import ManageFormDefinitionTable from './manage-form-definition-table';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import BusyIndicatorContext from '../../../utils/busy-indicator-context';
import ToastContext from '../../../utils/toast-context';
import constants from '../../../utils/constants';
import Fetch from '../../../utils/Fetch';
import SCModal from 'PageComponents/Modal/SCModal'
import FormDefinitionFieldListOptionsDndkit
  from "@/components/modals/form-definition/form-definition-field-list-options-dndkit";

const descriptionLengthLimit = 4000;

const ManageFormDefinitionField = ({ formDefinitionField, saveFormDefinitionField, isNew, formDefinition, updateFormDefinition, structureLocked, isTableColumn = false, savingForm }) => {

  const busyIndicator = useContext(BusyIndicatorContext);
  const toast = useContext(ToastContext);

  const formDefinitionIsNew = formDefinition && formDefinition.ID ? false : true;
  const [description, setDescription] = useState(isNew ? '' : formDefinitionField.Description);
  const [dataType, setDataType] = useState(isNew ? null : formDefinitionField.DataType);
  const [dataOption, setDataOption] = useState(isNew ? null : formDefinitionField.DataOption);
  const [isRequired, setIsRequired] = useState(isNew ? false : formDefinitionField.Required);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(isNew ? null : formDefinitionField.Section);
  const [designingtable, setDesigningTable] = useState(false);
  const [selectedSignatureTemplate, setSelectedSignatureTemplate] = useState(null);

  const handleDescriptionChange = (e) => {
    setDescription(e.value);
  };

  const [attachmentUrl, setAttachmentUrl] = useState("");

  useEffect(() => {
    if (!!description && description.length === 36 && isInformationalImage()) {
      Fetch.get({
        url: '/Attachment',
        params: {
          id: description
        }
      }).then(attachment => {
        if (attachment && attachment.Url) {
          setAttachmentUrl(attachment.Url);
        }
      });
    }

  }, [description])

  const [inputErrors, setInputErrors] = useState({});

  const [saving, setSaving] = useState(false);

  // const [typeText, setTypeText] = useState(isNew ? '' : Enums.FormDefinitionFieldTypes[formDefinitionField.DataType]);

  const handleIsRequiredChange = () => {
    setIsRequired(!isRequired);
  }

  // const handleTypeChange = (e) => {
  //   setTypeText(e.target.value);
  // };

  const saveItem = async (closeAfterSave = true) => {
    setSaving(true);

    let inputs = [
      { key: 'Description', value: description, required: true, type: Enums.ControlType.Text },
      { key: 'DataType', value: dataType, required: true, type: Enums.ControlType.Select }
    ];

    if (showDataOption() || isTable() || showSignatureOption()) {
      inputs.push({ key: 'DataOption', value: dataOption, required: true, type: Enums.ControlType.Text });
    }

    if (showSignatureOption()) {
      inputs.push({ key: 'DataOptionSignatureTemplateID', value: JSON.parse(dataOption)?.SignatureTemplateID, required: true, type: Enums.ControlType.Text });
    }

    const { isValid, errors } = Helper.validateInputs(inputs);
    if (!isValid) {
      setInputErrors(errors);
      setSaving(false);
    } else {
      let item = {
        ...formDefinitionField,
        Description: description,
        IsActive: true,
        DataType: dataType,
        DataOption: showDataOption() || isTable() || showSignatureOption() ? dataOption : null,
        Required: isRequired,
        Section: selectedSection,
        SectionID: selectedSection ? selectedSection.ID : null
      };
      saveFormDefinitionField(item, closeAfterSave);
    }

    if (!isNew) {
      setSaving(false);
    }
  };

  const dataTypeChanged = (option) => {
    setDataType(option ? option.ID : null);
  };

  // const cleanDataType = () => {
  //   let cdt = dataType;
  //   if (cdt && cdt.indexOf("Table") === 0) {
  //     cdt = Enums.FormDefinitionFieldTypes.Table;
  //   }
  //   return cdt;
  // };

  const showDataOption = () => {
    return dataType === "Select" || dataType === "MultiSelect";
  }

  const showSignatureOption = () => {
    return dataType === "Signature";
  }

  const isTable = () => {
    return dataType === "Table";
  };

  const isInformationalText = () => {
    return dataType === "InformationalText";
  };

  const isInformationalImage = () => {
    return dataType === "InformationalImage";
  };

  const designTable = () => {
    setDesigningTable(true);
  };

  const getTableDesignDefinition = () => {
    if (!isTable() || !dataOption) return null;
    // return dataOption.length > 0 ? JSON.parse(dataOption) : null;
    try {
      const parsed = JSON.parse(dataOption)
      return parsed.hasOwnProperty('LabelRows') ? JSON.parse(dataOption) : null;
    } catch (e) {
      return null
    }
  };

  const setTableDesignDefinition = (def) => {
    let tableDataType = JSON.stringify(def);
    setDataOption(tableDataType);
  };

  const getSignatureOptions = () => {
    if (!showSignatureOption() || !dataOption) return {};
    try {
      const parsed = JSON.parse(dataOption)
      return parsed.hasOwnProperty('SignatureTemplateID') ? JSON.parse(dataOption) : {};    } catch (e) {
      return {}
    }
    // return dataOption.length > 0 ? JSON.parse(dataOption) : {};
  };

  const setSignatureOptions = (def) => {
    let signOptions = JSON.stringify(def);
    setDataOption(signOptions);
  };

  const fieldTypesNotInTable = [Enums.FormDefinitionFieldTypes.Table, Enums.FormDefinitionFieldTypes.Signature, Enums.FormDefinitionFieldTypes.InformationalText, Enums.FormDefinitionFieldTypes.InformationalImage];

  const getDataTypeOptions = () => {
    const keys = Object.keys(Enums.FormDefinitionFieldTypes);
    return keys.filter(x => {
      return !isTableColumn || !fieldTypesNotInTable.includes(Enums.FormDefinitionFieldTypes[x]);
    })
      .map(key => {
        return {
          ID: key,
          Description: Enums.FormDefinitionFieldTypes[key]
        };
      });
  }

  const getSelectedDataTypeOption = () => {
    let options = getDataTypeOptions();

    return options.find(x => x.ID === dataType);
  };

  // const getDataTypeValue = () => {
  //   return dataType ? Enums.FormDefinitionFieldTypes[dataType] : null;
  // }

  // const handleDataTypeCheckedChange = (checked) => {
  //   setDataTypeChecked(checked);
  //   if (!checked) {
  //     dataTypeChanged(null);
  //   }
  // }

  const editingSectionOnSave = (section) => {
    setIsEditingSection(false);
    setEditingSection(null);

    if (section) {
      let formDefDummy = { ...formDefinition };
      setSelectedSection(section);

      if (!formDefDummy.Sections) {
        formDefDummy.Sections = [];
      }

      let idx = formDefDummy.Sections.findIndex(x => x.ID === section.ID);
      if (idx > -1) {
        formDefDummy.Sections[idx] = section;
      } else {
        formDefDummy.Sections.push(section);
      }

      updateFormDefinition(formDefDummy);
    }
  };

  // const sectionChanged = (section) => {
  //   setSelectedSection(section);
  // };

  const handleSectionChange = (option) => {
    setSelectedSection(option);
  };

  const descriptionHint = useMemo(() => {
    let extraText = "";

    if (isInformationalText()) {
      extraText = `${description?.length ?? 0} / ${descriptionLengthLimit} characters${((description?.length ?? 0) === descriptionLengthLimit ? ", end text may be missing" : "")}`;
    }

    return `${extraText}`;
  }, [description]);

  const handleAttachmentChange = (e) => {
    busyIndicator.setText("Uploading...");

    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = async function () {

      debugger;
      let fileSizeSetting = await optionService.getOption('System Settings', 'File Upload Size');
      let fileSizeUnit = fileSizeSetting ? fileSizeSetting.Unit : 'mb';
      let fileSizeValue = fileSizeSetting ? parseInt(fileSizeSetting.OptionValue) : 2;

      fileSizeUnit = 'mb'; // forcing to mb for now
      fileSizeValue = 0.5; // forcing to 0.5MB for now

      if (!reader.result.startsWith("data:image/")) {
        toast.setToast({
          message: `The attachment must be an image`,
          show: true,
          type: Enums.ToastType.error
        });
        busyIndicator.setText(null);
        return;
      }

      var b64 = reader.result.replace(/^data:.+;base64,/, '');
      let uploadLength = 2;

      if (fileSizeUnit == 'kb') {
        uploadLength = b64.length / 1024;
      } else if (fileSizeUnit == 'mb') {
        uploadLength = b64.length / 1024 / 1024;
      } else if (fileSizeUnit == 'gb') {
        uploadLength = b64.length / 1024 / 1024 / 1024;
      }

      // base64 converts 6bits to 8bits when encoding, so the actual file size is 3/4
      let scalingFactor = constants.base64BitScalingFactor;
      uploadLength *= scalingFactor;

      if (uploadLength > parseFloat(fileSizeValue)) {
        toast.setToast({
          message: `The attachment must be smaller than ${fileSizeValue}${fileSizeUnit}`,
          show: true,
          type: 'error'
        });
      } else {
        const attachmentRes = await Fetch.post({
          url: '/Attachment',
          params: {
            AttachmentType: Enums.AttachmentType.Image,
            Description: file.name,
            FileName: file.name,
            FileBase64: b64,
            ItemID: formDefinition.MasterID,
            Module: Enums.Module.FormDefinition,
          },
          toastCtx: toast
        });

        if (attachmentRes.ID) {

          toast.setToast({
            message: 'Attachment uploaded successfully',
            show: true,
            type: 'success'
          });
          setDescription(attachmentRes.ID);
        }
      }

      busyIndicator.setText(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
    <SCModal open={!isEditingSection && !designingtable}
             size={showDataOption() || showSignatureOption() || isTable() ? 'xxl' : 'lg'}
             withCloseButton
             onClose={() => saveFormDefinitionField(null)}
             modalProps={{keepMounted: true, closeOnClickOutside: false, closeOnEscape: false}}
    >
      <div>
        <Title order={3} c={'scBlue'} mb={'sm'}>
          {isNew ?
              <>Adding Form Item</> :
              <>Editing Form Item</>
          }
        </Title>
        <Text c={'gray.7'}>
          Give your form item a description and select what type of input you want.
          <br/>
          You can assign a section to the item in order to organise it into groups, as well as allow for those groups to
          be repeatable.
        </Text>

        <Flex gap={'md'} mt={'xs'}>
          <Box style={{flexGrow: 1}}>
            <SCDropdownList
                label="Type"
                name="DataType"
                error={inputErrors.DataType}
                options={getDataTypeOptions()}
                dataItemKey="ID"
                textField="Description"
                value={getSelectedDataTypeOption()}
                onChange={dataTypeChanged}
                required={true}
                disabled={structureLocked}
            />


            {!isInformationalText() && !isInformationalImage() && <div>
              <SCTextArea
                  label={"Label"}
                  hint={descriptionHint}
                  onChange={handleDescriptionChange}
                  required={true}
                  value={description}
                  error={inputErrors.Description}
                  readOnly={structureLocked} // || isTableColumn}
                  maxLength={descriptionLengthLimit}
                  placeholder={showSignatureOption() ? "Think of this as the label that will appear on your form. Use it to explain who should sign and why." : undefined}
              />


              {
                  !isTable() && !isInformationalText() && !isInformationalImage() &&
                  <SCCheckbox
                      onChange={handleIsRequiredChange}
                      value={isRequired}
                      label="Required"
                      extraClasses="form"
                      disabled={structureLocked || isTable() || isInformationalText() || isInformationalImage()}
                  />
              }

            </div>
            }
            {isInformationalImage() && <>

              <Button mt="sm"
                      w="fit-content"
                      onClick={() => {
                        document.getElementById(`js-attachment-input`).click();
                      }}
                      variant="default"
              >
                Upload Image
              </Button>
              {inputErrors.Description &&
                  <div style={{marginTop: "0.5rem", color: "orange", fontSize: "0.9rem"}}>Image is required</div>}
              <input type="file" id={`js-attachment-input`} style={{display: "none"}}
                     onChange={(e) => handleAttachmentChange(e)}/>

              <div style={{width: 500}}>
                <img src={attachmentUrl} style={{maxWidth: "100%"}}/>
              </div>

            </>}

            {
                isInformationalText() &&
                <Flex>
                  <Box w={'100%'} >
                    <SCTextArea
                        label={"Text"}
                        hint={descriptionHint}
                        onChange={handleDescriptionChange}
                        required={true}
                        value={description}
                        error={inputErrors.Description}
                        readOnly={structureLocked} // || isTableColumn}
                        maxLength={descriptionLengthLimit}
                    />
                  </Box>
                </Flex>
            }

            {
                !isTableColumn &&
                <Flex gap={'sm'}>
                  <SCComboBox
                      addOption={{
                        text: "Add new Section", action: () => {
                          setEditingSection(null);
                          setIsEditingSection(true);
                        }
                      }}
                      label="Section"
                      name="SectionID"
                      dataItemKey="ID"
                      textField="Heading"
                      error={inputErrors.SectionID}
                      options={formDefinition && formDefinition.Sections ? formDefinition.Sections : []}
                      onChange={handleSectionChange}
                      value={selectedSection}
                      disabled={structureLocked}
                  />
                  {selectedSection && !structureLocked ?
                      <div className="column" style={{width: "calc(24px)",}}>
                        <img className="img-btn" style={{width: "24px", marginTop: "2.25rem"}}
                             src="/specno-icons/edit.svg"
                             onClick={() => {
                               setEditingSection(selectedSection);
                               setIsEditingSection(true);
                             }}/>
                      </div>
                      : ""}
                </Flex>
            }

          </Box>
          {
            (showDataOption() ||
            showSignatureOption() ||
            isTable()) &&
              <Box style={{flexGrow: 1}}>
                {
                  showDataOption() ? <>
                        <h4 style={{margin: "0.5rem 0"}}>List Options</h4>
                        <FormDefinitionFieldListOptionsDndkit dataOption={dataOption} setDataOption={setDataOption}
                                                              error={inputErrors.DataOption}/>
                      </> :
                      showSignatureOption() ? <>
                            <FormDefinitionFieldSignatureOptions
                                settings={getSignatureOptions()}
                                updateSettings={setSignatureOptions}
                                disabled={structureLocked}
                                inputErrors={inputErrors}
                                onUpdate={setSelectedSignatureTemplate}
                            />
                          </>
                          :
                          isTable() ? <div>
                            <Button onClick={designTable} variant="outline" mt={31}>
                              Design Table
                            </Button>
                            {inputErrors.DataOption ? <p className="error">Table design required</p> : ""}
                            {designingtable ? <ManageFormDefinitionTable onDismiss={() => setDesigningTable(false)}
                                                                         definition={getTableDesignDefinition()}
                                                                         setDefinition={setTableDesignDefinition}/> : ""}
                          </div> : ""
                }
              </Box>
          }
        </Flex>


        <Flex
            mt={'2rem'}
            gap={'5'}
            justify={'end'}
        >
          <Button
              disabled={saving}
              onClick={() => saveFormDefinitionField(null)}
              // size="md"
              variant="outline"
          >
            Cancel
          </Button>
          {
              !isTableColumn && !isNew &&
              <Button
                  onClick={() => saveItem(false)}
                  disabled={savingForm}
                  loading={savingForm}
                  // size="md"
                  variant="outline"
              >
                {isTableColumn ? "Update" : "Save"}
              </Button>
          }
          <Button
              onClick={saveItem}
              disabled={savingForm}
              // loading={savingForm}
              // size="md"
              variant="filled"
          >
            {isTableColumn ? "Save" : "Save and Close"}
          </Button>
        </Flex>
      </div>

    </SCModal>


      {
          isEditingSection &&
          <ManageSection
              onSave={editingSectionOnSave}
              module={Enums.Module.FormDefinition}
              dontSubmit={formDefinitionIsNew}
              itemID={formDefinition && formDefinition.ID ? formDefinition.ID : null}
              sectionID={editingSection ? editingSection.ID : null}
              displayOrder={editingSection ? editingSection.DisplayOrder : formDefinition && formDefinition.Sections ? formDefinition.Sections.length : 0}
          buttonProps={{
            size: "md",
            variant: "filled"
          }}
      />
    }
    <style jsx>{`
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

      .row {
        display: flex;
        justify-content: space-between;
      }

      .column {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .column + .column {
        margin-left: 1.25rem;
      }

      .title {
        color: ${colors.bluePrimary};
        font-size: 1.125rem;
        font-weight: bold;
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
        color: ${colors.errorOrange};
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

      .cancel {
        width: 6rem;
      }

      .update {
        width: 14rem;
      }

      .left-padding {
        padding-left: 0.5em;
      }

      .right-padding {
        padding-right: 0.5em;
      }

      .img-btn {
        cursor: pointer;
      }

      .actions {
        display: flex;
        flex-direction: row-reverse;
      }

      .actions :global(.button) {
        margin-left: 0.5rem;
        margin-top: 1rem;
        padding: 0 1rem;
        white-space: nowrap;
      }
    `}</style>
    </>
  );
};

export default ManageFormDefinitionField;
