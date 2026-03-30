import React, { useState, useEffect, useContext, useMemo } from 'react';
import { colors, shadows } from '../../../theme';
import LegacyButton from '../../button';
import Fetch from '../../../utils/Fetch';
import Time from '../../../utils/time';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import ConfirmAction from '../confirm-action';
import DownloadService from '../../../utils/download-service';
import BusyIndicatorContext from '../../../utils/busy-indicator-context';
import Constants from '../../../utils/constants';
import OptionService from '../../../services/option/option-service';
import { useRef } from 'react';
import formService from '../../../services/form/form-service';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';
import SCTimePicker from '../../sc-controls/form-controls/sc-timepicker';
import SCMultiSelect from '../../sc-controls/form-controls/sc-multiselect';
import PreviewAttachment from "../attachment/preview-attachment";
import Image from "next/image";
import SignatureModal from '../../../PageComponents/Signature/SignatureModal';
import useInitialTimeout from '../../../hooks/useInitialTimeout';
import helper from '../../../utils/helper';
import storage from '../../../utils/storage';
import SCModal from "@/PageComponents/Modal/SCModal";
import SCSpinner from "@/components/sc-controls/misc/sc-spinner";
import {Box, Button, Flex, Text, Title} from '@mantine/core';
import { IconCirclePlus } from "@tabler/icons-react";

function ManageForm({ onSave, formHeaderToManage, isNew, onRenew }) {

  const toast = useContext(ToastContext);
  const busyIndicator = useContext(BusyIndicatorContext);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [formDefinitionFields, setFormDefinitionFields] = useState([]);

  const [formHeader, setFormHeader] = useState(formHeaderToManage);
  const [formItems, setFormItems] = useState(isNew ? [] : formHeaderToManage.FormItems);

  const [retrievedFields, setRetrievedFields] = useState(false);
  const [formItemsChanged, setFormItemsChanged] = useState(0);
  const [sectionsToRender, setSectionsToRender] = useState([]);
  const [formDataOptions, setFormDataOptions] = useState([]);
  const [imageUploadMessage, setImageUploadMessage] = useState({});
  const [isPrinting, setIsPrinting] = useState(false);

  const [signatureObject, setSignatureObject] = useState(null);

  const getFormDataOptions = async () => {
    const response = await formService.getFormDataOptions({
      formDefinitionMasterID: formHeader.FormDefinition.MasterID,
      toastCtx: toast
    });

    setFormDataOptions(response.Results);
  }

  const getFormDefinitionFields = async (formHeaderToRetrieve) => {
    const request = await Fetch.get({
      url: `/FormDefinition/GetFormDefinitionFields`,
      params: {
        formDefinitionID: formHeaderToRetrieve.FormDefinitionID,
        includeInactive: true
      },
    });

    let fields = request.Results;

    if (!isNew && formHeaderToRetrieve && formHeaderToRetrieve.FormItems) {
      formHeaderToRetrieve.FormItems.forEach(item => {
        let field = fields.find(x => x.ID === item.FormDefinitionFieldID);
        if (item.IsActive && field && !field.IsActive) {
          field.IsActive = true;
        }
      });
    }

    fields = fields.filter(x => x.IsActive);

    setFormDefinitionFields(fields);
    setRetrievedFields(true);
  };

  useEffect(() => {
    if (retrievedFields && isNew) {
      setEmptyFields();
    }
    getSectionsToRender();
  }, [retrievedFields]);

  useEffect(() => {
    getSectionsToRender();
  }, [formItemsChanged]);

  const [imageSrcs, setImageSrcs] = useState(0);
  const imageSrcRef = useRef({});

  const getImgSrc = (attachmentID) => {

    if (!attachmentID || attachmentID.length !== 36) {
      return "";
    }

    let src = imageSrcRef.current[attachmentID];
    if (src && src !== "PENDING") {
      return src;
    }

    if (src === "PENDING") {
      return "";
    }

    imageSrcRef.current[attachmentID] = "PENDING";

    Fetch.get({
      url: '/Attachment',
      params: {
        id: attachmentID
      }
    }).then(attachment => {
      if (attachment && attachment.Url) {
        imageSrcRef.current[attachmentID] = attachment.Url;
        setImageSrcs(x => x + 1);
      }
    });
  };

  const getBlankFormItemFromField = (field, defaultSectionGroup = 0) => {
    let item = {};
    item.ID = Helper.newGuid();
    item.FormDefinitionFieldID = field.ID;
    item.DisplayOrder = field.DisplayOrder;
    item.Section = field.Section;
    item.Description = field.Description;
    item.Line = null;
    item.SectionGroup = item.Section && item.Section.Repeatable === true ? defaultSectionGroup : null;
    item.DataType = field.DataType;
    item.Required = field.Required;
    item.SectionID = field.SectionID;
    item.SectionHeading = field.Section ? field.Section.Heading : null;
    item.SectionDescription = field.Section ? field.Section.Description : null;
    item.SectionRepeatable = field.Section ? field.Section.Repeatable : null;
    item.SectionDisplayOrder = field.Section ? field.Section.DisplayOrder : null;
    item.ParentSectionID = field.Section ? field.Section.ParentSectionID : null;
    item.ParentSectionGroup = 0;
    item.CreatedDate = Time.toISOString(Time.now());
    item.ModifiedDate = Time.toISOString(Time.now());
    item.CreatedBy = storage.getCookie(Enums.Cookie.servUserName);
    item.ModifiedBy = storage.getCookie(Enums.Cookie.servUserName);

    switch (field.DataType) {
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.LongText):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.String):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Number):
        item.DataResult = null;
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Checkbox):
        item.DataResult = 'false';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Date):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.DateTime):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Select):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.MultiSelect):
        item.DataResult = '';
        break;
      default:
        item.DataResult = '';
    }

    item.IsActive = true;
    return item;
  };

  const getBlankFormItemFromOtherItem = (originalItem, defaultSectionGroup = 0, defaultParentSectionGroup = 0) => {
    let item = {};
    item.ID = Helper.newGuid();
    item.FormDefinitionFieldID = originalItem.FormDefinitionFieldID;
    item.DisplayOrder = originalItem.DisplayOrder;
    item.Section = originalItem.Section;
    item.Description = originalItem.Description;
    item.Line = null;
    item.SectionGroup = originalItem.SectionRepeatable === true ? defaultSectionGroup : null;
    item.DataType = originalItem.DataType;
    item.Required = originalItem.Required;
    item.SectionID = originalItem.SectionID;
    item.SectionHeading = originalItem.SectionHeading;
    item.SectionDescription = originalItem.SectionDescription;
    item.SectionRepeatable = originalItem.SectionRepeatable;
    item.SectionDisplayOrder = originalItem.SectionDisplayOrder;
    item.ParentSectionID = originalItem.ParentSectionID;
    item.ParentSectionGroup = defaultParentSectionGroup;

    switch (item.DataType) {
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.LongText):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.String):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Number):
        item.DataResult = null;
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Checkbox):
        item.DataResult = 'false';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Date):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.DateTime):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Select):
        item.DataResult = '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.MultiSelect):
        item.DataResult = '';
        break;
      default:
        item.DataResult = '';
    }

    item.IsActive = true;
    return item;
  };


  const setEmptyFields = () => {

    let items = [];
    formDefinitionFields.forEach(x => {
      let item = getBlankFormItemFromField(x);
      items.push(item);
    });
    setFormItems(items);
    setFormItemsChanged(formItemsChanged + 1);
  };

  useEffect(() => {
    getFormDataOptions();
    getFormDefinitionFields(formHeaderToManage);
  }, []);

  useInitialTimeout(50, () => {
    ignoreFormHeaderToManageChanges.current = false;
  });

  const ignoreFormHeaderToManageChanges = useRef(true);

  useEffect(() => {
    if (ignoreFormHeaderToManageChanges.current) return;
    setFormHeader(formHeaderToManage);
    setFormItems(formHeaderToManage.FormItems);
  }, [formHeaderToManage]);

  const handleFormItemChange = (e, item) => {
    item.DataResult = e.target.value;
    let otherItems = formItems.filter(x => x.ID != item.ID);

    setFormItems([...otherItems, item]);
  };

  const handleFormItemChangeSC = (e, item) => {
    item.DataResult = e.value?.toString();
    let otherItems = formItems.filter(x => x.ID != item.ID);

    setFormItems([...otherItems, item]);
  };

  const handleCheckboxFormItemChange = (item) => {

    item.DataResult = !Helper.stringToBool(item.DataResult) ? "true" : "false";
    let otherItems = formItems.filter(x => x.ID != item.ID);

    setFormItems([...otherItems, item]);
  };

  const handleDateFormItemChangeSC = (e, item, setMethod = null) => {
    item.DataResult = Time.toISOString(e.value, false, true);

    if (setMethod) {
      setMethod(item.DataResult);
    } else {
      let otherItems = formItems.filter(x => x.ID != item.ID);
      setFormItems([...otherItems, item]);
    }
  };

  const handleDateFormItemChange = (e, item, setMethod = null) => {
    item.DataResult = Time.toISOString(e, false, true);

    if (setMethod) {
      setMethod(item.DataResult);
    } else {
      let otherItems = formItems.filter(x => x.ID != item.ID);
      setFormItems([...otherItems, item]);
    }
  };

  const handleAttachmentChange = (e, item, setMethod = null) => {
    busyIndicator.setText("Uploading...");

    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = async function () {

      let fileSizeSetting = await OptionService.getOption('System Settings', 'File Upload Size');
      let fileSizeUnit = fileSizeSetting ? fileSizeSetting.Unit : 'mb';
      let fileSizeValue = fileSizeSetting ? parseInt(fileSizeSetting.OptionValue) : 2;

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
      let scalingFactor = Constants.base64BitScalingFactor;
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
            ItemID: formHeaderToManage.ID,
            Module: Enums.Module.FormHeader,
          },
          toastCtx: toast
        });

        if (attachmentRes.ID) {
          // setImageUploadMessage({
          //   ...imageUploadMessage,
          //   [item.ID]: "✓"
          // });
          // toast.setToast({
          //   message: 'Attachment uploaded successfully',
          //   show: true,
          //   type: 'success'
          // });
          item.DataResult = attachmentRes.ID;

          if (setMethod) {
            setMethod(item.DataResult)
          } else {
            let otherItems = formItems.filter(x => x.ID != item.ID);
            setFormItems([...otherItems, item]);
          }
        }
      }

      busyIndicator.setText(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDateTimeFormItemChangeSC = (e, item, setMethod = null) => {
    if (!item.DataResult) {
      item.DataResult = Time.toISOString(new Date(), false, true);
    }
    let updatedDate = Time.updateTime(item.DataResult, e.value);
    item.DataResult = Time.toISOString(updatedDate, false, true);

    if (setMethod) {
      setMethod(item.DataResult)
    } else {
      let otherItems = formItems.filter(x => x.ID != item.ID);
      setFormItems([...otherItems, item]);
    }
  };

  const handleDateTimeFormItemChange = (e, item, setMethod = null) => {
    if (!item.DataResult) {
      item.DataResult = Time.toISOString(new Date(), false, true);
    }
    let updatedDate = Time.updateTime(item.DataResult, e);
    item.DataResult = Time.toISOString(updatedDate, false, true);

    if (setMethod) {
      setMethod(item.DataResult)
    } else {
      let otherItems = formItems.filter(x => x.ID != item.ID);
      setFormItems([...otherItems, item]);
    }
  };

  const timePickerDisabled = (item) => {
    return item ? Helper.isNullOrUndefined(item.DataResult) : true;
  };

  const getValueWithoutField = (item) => {
    let result;
    switch (item.DataType) {
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.String):
        result = item ? item.DataResult : '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.LongText):
        result = item ? item.DataResult : '';
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Number):
        result = item ? parseFloat(item.DataResult) : null;
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Checkbox):
        result = item ? Helper.stringToBool(item.DataResult) : false;
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Date):
        result = item ? item.DataResult : null;
        break;
      default:
        result = item ? item.DataResult : '';
    }

    return !Helper.isNullOrWhitespace(result) ? result : '';
  };

  const getDateTimeValue = (item, isDate = true) => {
    let result;

    if (isDate) {
      result = item ? !Helper.isNullOrWhitespace(item.DataResult) ? Time.toISOString(item.DataResult, false, false) : null : null;
    } else {
      if (item.DataResult === 'NaN-NaN-NaN NaN:NaN:NaN') {
        result = null
      } else {
        result = item ? !Helper.isNullOrWhitespace(item.DataResult) ? item.DataResult : null : null;
      }
    }

    return result;
  };

  const getValueMultiple = (item) => {
    let options = getSelectedDataOptions(item);
    return options ? options.join(", ") : '';
  };

  const setValue = (option, item) => {
    item.DataResult = option;

    let otherItems = formItems.filter(x => x.ID !== item.ID);
    setFormItems([...otherItems, item]);
  };

  const setValueMultipleSC = (options, item, setValueMethod = setValue) => {
    let vals = options;

    let val = "";
    if (vals.length > 0) {
      val = Helper.serializeCustomCSV(vals);
    }
    setValueMethod(val, item);
  };

  const setValueMultiple = (option, item, setValueMethod = setValue) => {
    let vals = getSelectedDataOptions(item);
    let idx = vals.indexOf(option);
    if (idx > -1) {
      vals.splice(idx, 1);
    } else {
      vals.push(option);
    }

    let val = "";
    if (vals.length > 0) {
      val = Helper.serializeCustomCSV(vals);
    }
    setValueMethod(val, item);
  };

  const getSelectedDataOptions = (item) => {
    return item ? Helper.deserializeCustomCSV(item.DataResult) : '';
  };

  const getDataOptions = (field) => {
    if (!field) return [];

    let dataOption = field.DataOption;
    if (formDataOptions) {
      const match = formDataOptions.find(x => x.ItemMasterID === field.MasterID);
      if (match) {
        dataOption = match.DataOption;
      }
    }
    return Helper.deserializeCustomCSV(dataOption);
  };

  const [inputErrors, setInputErrors] = useState({});

  const parseTableDataResultSafely = (dataResult) => {
    try {
      return JSON.parse(dataResult);
    } catch {
      return {
        Rows: []
      };
    }
  };

  const validate = () => {

    let validationItems = [];

    let formItemsToValidate = [...formItems];
    let tableItems = formItemsToValidate.filter(x => x.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Table));

    tableItems.forEach(item => {
      let field = formDefinitionFields.find(x => x.ID === item.FormDefinitionFieldID);
      let design = JSON.parse(field.DataOption);
      let values = parseTableDataResultSafely(item.DataResult);
      design.ColumnDefinitions.forEach((colDef, colIdx) => {
        if (colDef.Required && colDef.DataType !== Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Checkbox)) {
          values.Rows.forEach((row, rowIdx) => {
            let rowDef = design.RowDefinitions.find(x => x.Name === row.RowName);
            let col = row.Columns.find(x => x.ColumnName === colDef.Name);
            formItemsToValidate.push({
              ID: getTableCellID(colDef.Name, rowDef ? rowDef.Name : "", rowDef ? "" : rowIdx, item.SectionGroup),
              DataResult: col ? col.Value : null,
              Required: colDef.Required,
              DataType: colDef.DataType
            });
          });
        }
      });
    });

    for (let index in formItemsToValidate) {
      let item = formItemsToValidate[index];
      if (item.Required) {

        switch (item.DataType) {
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.String):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Text },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.LongText):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Text },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Number):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Number },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Date):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Date },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.DateTime):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Date },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Select):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Select },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.MultiSelect):
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.MultiSelect },
            );
            break;
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.InformationalText):
          case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.InformationalImage):
            break;
          default:
            validationItems.push(
              { key: item.ID, value: item.DataResult, required: true, type: Enums.ControlType.Text },
            );
        }
      }
    }

    let { isValid, errors } = Helper.validateInputs(validationItems);

    setInputErrors(errors);
    return isValid;
  };

  const [saving, setSaving] = useState(false);

  const save = async (ignoreOnSave = false, formHeaderOverride = null) => {

    if (!formHeaderOverride && formHeader.FormStatus === Enums.FormStatus.Completed) {
      if (!validate()) {
        return;
      }
    }

    let formHeaderToSave = formHeaderOverride ?? formHeader;
    let formItemsToSave = formHeaderOverride?.FormItems ?? formItems;

    setSaving(true);

    let result = {};
    if (isNew) {
      result = await Fetch.post({
        url: `/Form`,
        params: {
          FormHeader: formHeaderToSave,
          FormItems: formItemsToSave,
          IsNew: isNew
        },
        toastCtx: toast,
      });
    } else {
      result = await Fetch.put({
        url: `/Form`,
        params: {
          FormHeader: formHeaderToSave,
          FormItems: formItemsToSave,
          IsNew: isNew
        },
        toastCtx: toast,
      });
    }

    if (result.ID) {
      !ignoreOnSave && toast.setToast({
        message: 'Form captured successfully',
        show: true,
        type: 'success'
      });

      onSave(ignoreOnSave ? { ...result, _isNew: false } : null)
    }
    setSaving(false);
  };

  const completeCheck = () => {

    let isValid = validate();

    if (!isValid) return;

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Complete",
      display: true,
      heading: "Complete the form?",
      text: formHeaderToManage.FormDefinition.ExpireTimespan === 0 ? "" : "Form will not be editable once completed.",
      onConfirm: complete
    });
  };

  const complete = async () => {
    setSaving(true);

    let isValid = validate();

    if (isValid) {
      let result = {};

      let now = Time.now();

      if (isNew) {
        result = await Fetch.post({
          url: `/Form`,
          params: {
            FormHeader: { ...formHeader, FormStatus: Enums.FormStatus.Completed, CompletedDate: Time.toISOString(now) },
            FormItems: formItems,
            IsNew: isNew
          },
          toastCtx: toast,
        });
      } else {
        result = await Fetch.put({
          url: `/Form`,
          params: {
            FormHeader: { ...formHeader, FormStatus: Enums.FormStatus.Completed, CompletedDate: Time.toISOString(now) },
            FormItems: formItems,
            IsNew: isNew
          },
          toastCtx: toast,
        });
      }

      if (result.ID) {
        toast.setToast({
          message: 'Form completed successfully',
          show: true,
          type: 'success'
        });
        onSave(null);
      } else {
        setSaving(false);
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: 'error'
      });
      setSaving(false);
    }
  };

  const getTableCellID = (columnName, rowName, rowIndex, sectionGroup = 0) => {
    return `${columnName}_${rowName}_${rowIndex}_${sectionGroup}`;
  };

  const isExpired = () => {
    if (!formHeader || !formHeader.ExpireDate) {
      return false;
    }
    return Time.now().valueOf() > Time.parseDate(formHeader.ExpireDate).valueOf();
  };

  const willExpire = () => {
    if (!formHeader || !formHeader.ExpireDate) {
      return false;
    }
    return Time.now().valueOf() <= Time.parseDate(formHeader.ExpireDate).valueOf();
  };

  const disableField = () => {
    return formHeader.FormStatus === Enums.FormStatus.Completed && (formHeader.FormDefinition.ExpireTimespan !== 0 || formHeader.FormDefinition.FormRule !== Enums.FormRule.Customer);
  }

  const printFormHeader = async (formHeader) => {
    setIsPrinting(true);
    DownloadService.downloadFile("GET", `/Form/PrintForm?formHeaderID=${formHeader.ID}`, null, true, false, "", "", null, false, () => {
      setIsPrinting(false);
    });
  };

  const plotFormItemTable = (item, field) => {
    if (item.DataType !== Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Table) || !field) return <></>;
    let design = field.DataOption && field.DataOption.length > 0 ? JSON.parse(field.DataOption) : null;
    // console.log(design);
    if (design == null) return (<></>);
    let blockLoad = false;

    const labelRows = design.LabelRows;
    const limitRows = design.LimitRows;
    const maximumRows = design.MaximumRows;

    let values = item.DataResult && item.DataResult.length > 0 ? parseTableDataResultSafely(item.DataResult) : { Rows: [] }; // default to blank structure

    const updateItemValue = () => {
      handleFormItemChange({ target: { value: JSON.stringify(values) } }, item);
    }

    const addRow = (rowNames = null) => {
      if (Array.isArray(rowNames)) {
        rowNames.forEach(rowName => {
          values.Rows.push({
            RowName: rowName,
            Columns: []
          });
        });
      } else {
        values.Rows.push({
          RowName: null,
          Columns: []
        });
      }
      updateItemValue();
    };

    const removeRow = (idx) => {
      values.Rows.splice(idx, 1);
      updateItemValue();
    };

    if (!labelRows && values.Rows.length === 0) {
      addRow();
      blockLoad = true;
    } else if (labelRows) {
      let rowsToAdd = [];
      let idx = -1;
      design.RowDefinitions.forEach(rowDef => {
        idx = values.Rows.findIndex(x => x.RowName === rowDef.Name);
        if (idx < 0) {
          rowsToAdd.push(rowDef.Name);
        }
      });
      if (rowsToAdd.length > 0) {
        addRow(rowsToAdd);
        blockLoad = true;
      }
    }

    const canAddOrRemoveRowsCompletedCheck = () => {
      return formHeader.FormStatus !== Enums.FormStatus.Completed || (formHeader.FormDefinition.ExpireTimespan === 0 && formHeader.FormDefinition.FormRule === Enums.FormRule.Customer);
    }

    if (blockLoad) {
      return (<></>);
    }
    return (<div style={{ marginTop: "0.5rem" }}>
      {field.Description ? <b>{field.Description}</b> : ""}
      <table>
        <thead>
          <tr>
            {labelRows ? <th></th> : ""}
            {design.ColumnDefinitions.map((def, key) => {
              return (<th key={key} className="heading-cell">{def.Label} {def.Required ? <span style={{ color: "#fa5252" }}>*</span> : ""}</th>);
            })}
            {labelRows ? "" : <th></th>}
          </tr>
        </thead>
        <tbody>
          {labelRows ? <>
            {design.RowDefinitions.map((rowDef, rowKey) => {
              return (<tr key={`row_${rowKey}`}>
                <td key={rowKey} className="heading-cell">{rowDef.Label}</td>
                {design.ColumnDefinitions.map((def, key) => {
                  let row = values.Rows.find(x => x.RowName === rowDef.Name);
                  let column = row.Columns ? row.Columns.find(x => x.ColumnName === def.Name) : null;
                  let value = column ? column.Value : null;
                  return (<td className="input-cell" key={`${rowKey}_${key}`}>
                    {plotFormItemWithoutField({
                      DataResult: value,
                      DataType: def.DataType,
                      Description: "", //def.Label,
                      Required: def.Required,
                      ID: getTableCellID(def.Name, rowDef.Name, "", item.SectionGroup) // generate id for this field that is unique and can be referenced in validation
                    }, {
                      ColumnDefinition: def,
                      OnUpdate: (newValue) => {
                        if (!column) {
                          column = {
                            Value: null,
                            ColumnName: def.Name
                          };
                          row.Columns.push(column);
                        }
                        column.Value = newValue;
                        updateItemValue();
                      }
                    })}
                  </td>);
                })}
              </tr>);
            })}
          </> : <>
            {values.Rows.map((row, rowKey) => {
              return (<tr key={`row_${rowKey}`}>
                {design.ColumnDefinitions.map((def, key) => {
                  let column = row.Columns ? row.Columns.find(x => x.ColumnName === def.Name) : null;
                  let value = column ? column.Value : null;
                  return (<td className="input-cell" key={`${rowKey}_${key}`}>
                    {plotFormItemWithoutField({
                      DataResult: value,
                      DataType: def.DataType,
                      Description: "", //def.Label,
                      Required: def.Required,
                      ID: getTableCellID(def.Name, "", rowKey, item.SectionGroup) // generate id for this field that is unique and can be referenced in validation
                    }, {
                      ColumnDefinition: def,
                      OnUpdate: (newValue) => {
                        if (!column) {
                          column = {
                            Value: null,
                            ColumnName: def.Name
                          };
                          row.Columns.push(column);
                        }
                        column.Value = newValue;
                        updateItemValue();
                      }
                    })}
                  </td>);
                })}
                {canAddOrRemoveRowsCompletedCheck() && values.Rows.length > 1 ? <td>
                  <img src="/icons/x-circle-red.svg" className="remove-button input-cell blank-cell" onClick={() => removeRow(rowKey)} title="Remove row" />
                </td> : ""}
              </tr>);
            })}
            {canAddOrRemoveRowsCompletedCheck() && (!limitRows || maximumRows > values.Rows.length) ? <>
              <tr>
                <td className="input-cell blank-cell">
                  <img src="/icons/plus-circle-blue.svg" className="add-button" onClick={addRow} title="Add row" />
                </td>
                <td colSpan={design.ColumnDefinitions.length - 1}></td>
              </tr>
            </> : ""}
          </>}
        </tbody>
      </table>

      <style jsx>{`

        .heading-cell {
          padding: 0.75rem;
          background: ${colors.blueGreyLight}88;
          font-weight: bold;
          text-align: center;
        }

        .input-cell {
          padding: 0rem;
          background: ${colors.blueGreyLight}22;
          text-align: center;
          vertical-align: top;
        }

        .input-cell.blank-cell {
          background: none;
        }

        
        .add-button, .remove-button {
          cursor: pointer;
        }

`}</style>
    </div>);
  };

  const [previewAttatchmentItem, setPreviewAttatchmentItem] = useState(null)

  const attachmentPreviewModal = useMemo(() => {
    if (!previewAttatchmentItem) {
      return <></>
    }
    let attachmentID = previewAttatchmentItem.DataResult;
    if (previewAttatchmentItem.DataType === "InformationalImage") {
      attachmentID = previewAttatchmentItem.Description;
    }
    const itemSrc = getImgSrc(attachmentID)
    const attachmentObject = {
      "FileName": attachmentID + ".png",
      "Url": itemSrc,
      "IsActive": true,
    }
    return <PreviewAttachment attachment={attachmentObject}
      setShowAttachmentPreview={() => setPreviewAttatchmentItem(null)}
      overlay
    />
  }, [previewAttatchmentItem])

  const plotFormItemWithoutField = (item, tableItemSettings = null) => {
    const itemFromTable = tableItemSettings !== null && tableItemSettings !== undefined;
    let field = itemFromTable ? { ...tableItemSettings.ColumnDefinition, MasterID: tableItemSettings.ColumnDefinition.Name } : formDefinitionFields.find(x => x.ID === item.FormDefinitionFieldID);
    let itemValue = '';
    let onTableCellUpdate = itemFromTable ? tableItemSettings.OnUpdate : null;

    let itemID = Helper.newGuid();
    switch (item.DataType) {
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.DateTime):
        itemValue = getDateTimeValue(item, false);
        break;
      case Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.MultiSelect):
        itemValue = getValueMultiple(item);
        break;
      default:
        itemValue = getValueWithoutField(item);
        break;
    }

    return (
      item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.String) ?
        <div className="row">
          <div className="column">
            <SCInput
              label={item.Description}
              onChange={(e) => onTableCellUpdate ? onTableCellUpdate(e.value) : handleFormItemChangeSC(e, item)}
              required={item.Required}
              value={itemValue}
              error={inputErrors[item.ID]}
              readOnly={disableField()}
            />
          </div>
        </div> :
        item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.LongText) ?
          <div className="row">
            <div className="column">
              <SCTextArea
                label={item.Description}
                onChange={(e) => onTableCellUpdate ? onTableCellUpdate(e.value) : handleFormItemChangeSC(e, item)}
                required={item.Required}
                value={itemValue}
                error={inputErrors[item.ID]}
                readOnly={disableField()}
              />
            </div>
          </div> :
          item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Number) ?
            <div className="row">
              <div className="column">
                <SCNumericInput
                  label={item.Description}
                  onChange={(e) => onTableCellUpdate ? onTableCellUpdate(e.value?.toString()) : handleFormItemChangeSC(e, item)}
                  required={item.Required}
                  value={itemValue}
                  error={inputErrors[item.ID]}
                  readOnly={disableField()}
                />
              </div>
            </div> :
            item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Checkbox) ?
              <div className="row">
                <div className="column">
                  <SCCheckbox
                    label={item.Description}
                    onChange={() => onTableCellUpdate ? onTableCellUpdate(!Helper.stringToBool(itemValue) ? "true" : "false") : handleCheckboxFormItemChange(item)}
                    value={itemValue}
                    extraClasses="form"
                    disabled={disableField()}
                  />
                </div>
              </div> :
              item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Boolean) ?
                <div className="row">
                  <div className="column">
                    <SCDropdownList
                      label={item.Description}
                      options={["Yes", "No"]}
                      value={itemValue}
                      required={item.Required}
                      onChange={(option) => onTableCellUpdate ? onTableCellUpdate(option) : setValue(option, item)}
                      error={inputErrors[item.ID]}
                      disabled={disableField()}
                      canClear={true}
                    />
                  </div>
                </div> :
                item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Date) ?
                  <div className="row">
                    <div className="column">
                      <SCDatePicker
                        label={item.Description}
                        required={item.Required}
                        changeHandler={(e) => onTableCellUpdate ? handleDateFormItemChangeSC(e, item, onTableCellUpdate) : handleDateFormItemChangeSC(e, item)}
                        value={itemValue}
                        error={inputErrors[item.ID]}
                        disabled={disableField()}
                      />
                    </div>
                  </div> :
                  item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.DateTime) ?
                    <div className="row">
                      <div className="column">
                        <SCDatePicker
                          label={item.Description}
                          required={item.Required}
                          changeHandler={(e) => onTableCellUpdate ? handleDateFormItemChangeSC(e, item, onTableCellUpdate) : handleDateFormItemChangeSC(e, item)}
                          value={itemValue}
                          error={inputErrors[item.ID]}
                          disabled={disableField()}
                        />
                      </div>
                      <div className="column">
                        <SCTimePicker
                          changeHandler={(e) => onTableCellUpdate ? handleDateTimeFormItemChangeSC(e, item, onTableCellUpdate) : handleDateTimeFormItemChangeSC(e, item)}
                          label=""
                          required={item.Required}
                          disabled={disableField()}
                          value={itemValue}
                          error={inputErrors[item.ID]}
                          format="HH:mm:ss"
                        />
                      </div>
                    </div> :
                    item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Select) ?
                      <div className="row">
                        <div className="column">
                          <SCDropdownList
                            label={item.Description}
                            required={item.Required}
                            options={getDataOptions(field)}
                            onChange={(option) => onTableCellUpdate ? onTableCellUpdate(option) : setValue(option, item)}
                            value={itemValue}
                            error={inputErrors[item.ID]}
                            disabled={disableField()}
                          />
                        </div>
                      </div> :
                      item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.MultiSelect) ?
                        <div className="row">
                          <div className="column">
                            <SCMultiSelect
                              label={item.Description}
                              required={item.Required}
                              availableOptions={getDataOptions(field)}
                              onChange={(option) => onTableCellUpdate ? setValueMultipleSC(option, item, onTableCellUpdate) : setValueMultipleSC(option, item)}
                              selectedOptions={getSelectedDataOptions(item)}
                              error={inputErrors[item.ID]}
                              disabled={disableField()}
                            />
                          </div>
                        </div> :
                        item.DataType == Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Table) ?
                          <>{plotFormItemTable(item, field)}</>
                          :
                          item.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Image) ?
                            <>
                              {item.Description ? <div style={{ marginTop: "0.5rem" }}>
                                <span style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}>
                                  {item.Description} {item.Required ? <span style={{ color: "#fa5252" }}>*</span> : ""}
                                </span>
                              </div> : ""}


                              {!!item.DataResult ? <div style={{ marginTop: "0.5rem" }}>
                                <div style={{ width: "fit-content", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>

                                  <div
                                    style={{
                                      height: "150px", width: "150px", position: 'relative', cursor: 'zoom-in', '&:hover': {
                                        height: 50
                                      }
                                    }}
                                    onClick={() => setPreviewAttatchmentItem(item)}
                                  >
                                    <Image quality={40} src={getImgSrc(item.DataResult)} alt={''} fill style={{ objectPosition: 'center', objectFit: 'cover' }} />
                                  </div>

                                  {/*<img onClick={() => setPreviewAttatchmentItem(item)} src={getImgSrc(item.DataResult)}  />*/}

                                  {imageUploadMessage[item.ID] ? <span style={{ verticalAlign: "top", marginRight: "0.5rem", marginLeft: "0.5rem", fontStyle: "italic", opacity: 0.7 }}>{imageUploadMessage[item.ID]}</span> : ""}

                                  {!disableField() &&
                                    <div style={{ width: "auto", textAlign: "center" }}>
                                      <div style={{ marginRight: "0.5rem", display: "inline-block" }}>
                                        <img src="/icons/repeat-blue.svg" style={{ cursor: "pointer" }} title="Replace" onClick={() => {
                                          !disableField() && document.getElementById(`js-attachment-input-${itemID}`).click();
                                        }} />
                                        <input type="file" id={`js-attachment-input-${itemID}`} style={{ display: "none" }} onChange={(e) => handleAttachmentChange(e, item, onTableCellUpdate)} />
                                      </div>
                                      <img src="/icons/x-circle-red.svg" style={{ cursor: "pointer" }} title="Remove" onClick={() => {
                                        if (disableField()) {
                                          return;
                                        }
                                        setImageUploadMessage({
                                          ...imageUploadMessage,
                                          [item.ID]: undefined
                                        });
                                        onTableCellUpdate ? onTableCellUpdate(null) : handleFormItemChange({ target: { value: null } }, item);
                                      }} />

                                    </div>
                                  }
                                </div>


                              </div>
                                :
                                <div style={{ marginTop: "0.5rem" }}>
                                  <div style={{ fontSize: "0.75rem", textAlign: "right", margin: "0.2rem 0", color: (inputErrors[item.ID] ? "orange" : colors.labelGrey) }}>
                                    {inputErrors[item.ID] ? inputErrors[item.ID] : ""}
                                  </div>
                                  {/*<LegacyButton
                                    icon={"plus-circle-blue"}
                                    disabled={disableField()}
                                    extraClasses={`fit-content no-margin hollow`}
                                    text={`Add Image`}
                                    onClick={() => document.getElementById(`js-attachment-input-${itemID}`).click()}
                                  />*/}
                                  <Button
                                    disabled={disableField()}
                                    variant={'outline'}
                                    leftSection={<IconCirclePlus />}
                                    onClick={() => document.getElementById(`js-attachment-input-${itemID}`).click()}
                                  >
                                    Add Image
                                  </Button>

                                  <input type="file" id={`js-attachment-input-${itemID}`} style={{ display: "none" }} onChange={(e) => handleAttachmentChange(e, item, onTableCellUpdate)} />
                                </div>}

                            </>
                            :
                            item.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.InformationalText) ?
                              <><div style={{ marginBottom: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>{item.Description?.split("\n").map(text => {
                                return (<div key={'itemText' + text} style={{ marginTop: "0.5rem", minHeight: "0.5rem" }}>{text}</div>);
                              })}</div></> :
                              item.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.InformationalImage) ?
                                <>
                                  <div
                                    style={{
                                      minHeight: "300px", minWidth: "100%", position: 'relative', cursor: 'zoom-in', '&:hover': {
                                        height: 50
                                      }
                                    }}
                                    onClick={() => setPreviewAttatchmentItem(item)}
                                  >
                                    <Image quality={40} src={getImgSrc(item.Description)} alt={''} fill style={{ objectPosition: 'center', objectFit: 'contain' }} />
                                  </div>
                                </>
                                :
                                item.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Signature) ?
                                  <>
                                    <div style={{ marginTop: "0.5rem" }}>
                                      <div style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#212529",
                                        marginBottom: "0.25rem"
                                      }}>{item.Description}</div>
                                      <LegacyButton
                                        disabled={disableField()}
                                        extraClasses={`fit-content no-margin hollow`}
                                        text={item.DataResult ? `View Signature` : `Sign Here`}
                                        onClick={async () => {
                                          if (isNew || !formHeader.CompletedDate) {
                                            await save(true);
                                          }
                                          setSignatureObject({
                                            title: JSON.parse(field.DataOption).Title,
                                            id: item.DataResult ? item.DataResult : null,
                                            request: item.DataResult ? null : {
                                              ItemID: item.ID,
                                              SignatureKey: Constants.signatureKeys.FormSignature,
                                              SignatureTemplateID: JSON.parse(field.DataOption).SignatureTemplateID,
                                              Title: "",
                                              Module: Enums.Module.FormHeader
                                              // CustomerID?: string
                                              // SupplierID?: string
                                              // EmployeeID?: string
                                            },
                                            onUpdate: (signature) => {
                                              if (!!signature.AttachmentID) {
                                                onTableCellUpdate ? onTableCellUpdate(signature?.ID) : setValue(signature?.ID, item);
                                              }
                                            }
                                          });
                                        }} />
                                      <div style={{ fontSize: "0.75rem", textAlign: "left", margin: "0.2rem 0", color: (inputErrors[item.ID] ? colors.warningRed : colors.labelGrey) }}>
                                        {inputErrors[item.ID] ? inputErrors[item.ID] : ""}
                                      </div>
                                    </div>
                                  </>
                                  : ''
    );

  }

  const getSectionsToRender = () => {
    let sectionGroups = [];
    let deletableSectionIDs = [];
    let maxSectionGroups = {};

    if (!formItems) return;

    // assumption - form items are in order

    let items = [...formItems];

    let updateFormItems = false;

    // preprocess the formitems so they fit the correct data structure
    for (let item of items) {
      if (!item.DataType) {
        // item is missing retrospective info, prepopulating
        let formDefinitionField = formDefinitionFields.find(x => x.ID === item.FormDefinitionFieldID);
        if (!formDefinitionField) {
          continue;
        }

        let section = formDefinitionField.Section;
        item.DataType = formDefinitionField.DataType;
        item.Required = formDefinitionField.Required;
        item.SectionID = formDefinitionField.SectionID;
        item.SectionHeading = section ? section.Heading : null;
        item.SectionDescription = section ? section.Description : null;
        item.SectionRepeatable = section ? section.Repeatable : null;
        item.SectionDisplayOrder = section ? section.DisplayOrder : null;
        item.ParentSectionID = section ? section.ParentSectionID : null;
        item.ParentSectionGroup = 0;

        updateFormItems = true;
      }
    }

    if ((!formHeader.FormDefinitionDisplayName && !!formHeader.FormDefinition.Name) ||
      !formHeader.FormDefinitionDescription && !!formHeader.FormDefinition.Description) {
      let newFormHeader = { ...formHeader };
      newFormHeader.FormDefinitionDisplayName = formHeader.FormDefinition.Name;
      newFormHeader.FormDefinitionDescription = formHeader.FormDefinition.Description;
      setFormHeader(newFormHeader);
    }


    if (updateFormItems) {
      setFormItems(items);
      setFormItemsChanged((fic) => fic + 1);
      return;
    }

    items = items.sort((a, b) => {
      let sga = a.SectionGroup ? a.SectionGroup : 0;
      let sgb = b.SectionGroup ? b.SectionGroup : 0;
      let doa = a.DisplayOrder;
      let dob = b.DisplayOrder;
      if (sga > sgb) return 1;
      if (sga < sgb) return -1;
      if (doa > dob) return 1;
      if (doa < dob) return -1;
      return 0;
    });

    // process sectionsGroups now that they are in correct format, starting with parent sections only
    for (let item of items.filter(x => !x.ParentSectionID)) {
      let sectionID = item.SectionID;
      let parentSectionID = item.ParentSectionID;
      let heading = item.SectionHeading;
      let parentSectionGroup = item.ParentSectionGroup;
      let sectionFormItems = [item];
      let childSections = [];
      let isRepeatable = item.SectionRepeatable;
      let displayOrder = item.SectionDisplayOrder;
      let itemSectionGroup = item.SectionGroup ? item.SectionGroup : 0;

      maxSectionGroups[sectionID] = itemSectionGroup;

      if (itemSectionGroup > 0 && !deletableSectionIDs.includes(`${sectionID}_${parentSectionGroup}`)) {
        deletableSectionIDs.push(`${sectionID}_${parentSectionGroup}`);
      }

      let sectionGroup = sectionGroups.find(x => x.sectionID === sectionID && x.sectionGroup === itemSectionGroup);
      if (!!sectionGroup) {
        sectionGroup.formItems.push(item);
      } else {
        sectionGroup = {
          sectionID,
          parentSectionID,
          heading,
          parentSectionGroup,
          formItems: sectionFormItems,
          childSections,
          isRepeatable,
          displayOrder,
          sectionGroup: itemSectionGroup,
          isDeletable: false,
          isLast: false,
          parentSectionGroupReference: null
        };
        sectionGroups.push(sectionGroup);
      }
    }

    // assumption: there is only one level of nesting - this could change but not practical, otherwise will need a tree based approach to populating children
    for (let item of items.filter(x => !!x.ParentSectionID)) {
      let sectionID = item.SectionID;
      let parentSectionID = item.ParentSectionID;
      let heading = item.SectionHeading;
      let parentSectionGroup = item.ParentSectionGroup;
      let sectionFormItems = [item];
      let childSections = null; // assuming no grandchildren ever
      let isRepeatable = item.SectionRepeatable;
      let displayOrder = item.SectionDisplayOrder;
      let itemSectionGroup = item.SectionGroup ? item.SectionGroup : 0;

      maxSectionGroups[`${sectionID}_${parentSectionGroup}`] = itemSectionGroup;

      if (itemSectionGroup > 0 && !deletableSectionIDs.includes(`${sectionID}_${parentSectionGroup}`)) {
        deletableSectionIDs.push(`${sectionID}_${parentSectionGroup}`);
      }

      let sectionGroup = sectionGroups.find(x => x.sectionID === sectionID && x.parentSectionGroup === parentSectionGroup && x.sectionGroup === itemSectionGroup);
      if (!!sectionGroup) {
        sectionGroup.formItems.push(item);
      } else {
        let parent = sectionGroups.find(x => x.sectionID === parentSectionID && x.sectionGroup === parentSectionGroup);
        sectionGroup = {
          sectionID,
          parentSectionID,
          heading,
          parentSectionGroup,
          formItems: sectionFormItems,
          childSections,
          isRepeatable,
          displayOrder,
          sectionGroup: itemSectionGroup,
          isDeletable: false,
          isLast: false,
          parentSectionGroupReference: parent
        };
        sectionGroups.push(sectionGroup);
        parent.childSections.push(sectionGroup);
      }
    }

    sectionGroups.forEach(sg => {
      if (deletableSectionIDs.includes(`${sg.sectionID}_${sg.parentSectionGroup}`)) {
        sg.isDeletable = true;
      }

      let maxSG = maxSectionGroups[sg.sectionID];
      let maxSGChild = maxSectionGroups[`${sg.sectionID}_${sg.parentSectionGroup}`];
      if (maxSG === sg.sectionGroup || maxSGChild === sg.sectionGroup) {
        sg.isLast = true;
      }
    });

    sectionGroups = sectionGroups.filter(x => !x.parentSectionID).sort((a, b) => {
      let sia = a.sectionID !== null;
      let sib = b.sectionID !== null;
      let doa = a.displayOrder;
      let dob = b.displayOrder;
      let soa = a.sectionGroup;
      let sob = b.sectionGroup;
      if (sia && !sib) return 1;
      if (!sia && sib) return -1;
      if (doa > dob) return 1;
      if (doa < dob) return -1;
      if (soa > sob) return 1;
      if (soa < sob) return -1;
      return 0;
    });

    sectionGroups.forEach(sg => {
      sg.childSections = sg.childSections.sort((a, b) => {
        let doa = a.displayOrder;
        let dob = b.displayOrder;
        let soa = a.sectionGroup;
        let sob = b.sectionGroup;
        if (doa > dob) return 1;
        if (doa < dob) return -1;
        if (soa > sob) return 1;
        if (soa < sob) return -1;
        return 0;
      });
    });

    setSectionsToRender(sectionGroups);

  };

  const deleteSectionGroupItem2 = (sectionGroup) => {

    let formItemsDummy = [...formItems];

    let isParent = sectionGroup.childSections && sectionGroup.childSections.length > 0;

    let idsToDelete = sectionGroup.formItems.map(x => x.ID);
    if (isParent) {
      sectionGroup.childSections.forEach(cs => {
        idsToDelete.push(...cs.formItems.map(x => x.ID));
      });
    }

    formItemsDummy = formItemsDummy.filter(x => !idsToDelete.includes(x.ID));

    let isChild = !sectionsToRender.find(x => x.sectionID === sectionGroup.sectionID);

    let nextSectionGroups = [];

    if (isChild) {
      nextSectionGroups = sectionGroup.parentSectionGroupReference.childSections.filter(x => x.sectionID === sectionGroup.sectionID
        && x.sectionGroup > sectionGroup.sectionGroup);
    } else {
      nextSectionGroups = sectionsToRender.filter(x => x.sectionID === sectionGroup.sectionID
        && x.sectionGroup > sectionGroup.sectionGroup);
    }

    nextSectionGroups.forEach(sg => {
      sg.formItems.forEach(item => {
        let idx = formItemsDummy.findIndex(x => x.ID === item.ID);
        if (idx > -1) {
          formItemsDummy[idx].SectionGroup--;
        }
      });
      let sgIsParent = sg.childSections && sg.childSections.length > 0;
      if (sgIsParent) {
        sg.childSections.forEach(cs => {
          cs.formItems.forEach(item => {
            let idx = formItemsDummy.findIndex(x => x.ID === item.ID);
            if (idx > -1) {
              formItemsDummy[idx].ParentSectionGroup--;
            }
          });
        });
      }
    });

    setFormItems(formItemsDummy);
    setFormItemsChanged(formItemsChanged + 1);
  };

  const addNewSectionGroupItem2 = (sectionGroup) => {

    let newItems = [];
    let defaultSectionGroup = sectionGroup.sectionGroup ? sectionGroup.sectionGroup + 1 : 1;

    sectionGroup.formItems.forEach(formItemOriginal => {
      let defaultParentSectionGroup = formItemOriginal.ParentSectionGroup;
      let item = getBlankFormItemFromOtherItem(formItemOriginal, defaultSectionGroup, defaultParentSectionGroup);
      newItems.push(item);
    });

    if (sectionGroup.childSections && sectionGroup.childSections.length > 0) {
      sectionGroup.childSections.filter(x => x.sectionGroup === null || x.sectionGroup === 0).forEach(childSection => {
        childSection.formItems.forEach(formItemOriginal => {
          let item = getBlankFormItemFromOtherItem(formItemOriginal, 0, defaultSectionGroup);
          newItems.push(item);
        });
      });
    }

    let formItemsDummy = [...formItems];
    formItemsDummy.push(...newItems);

    setFormItems(formItemsDummy);
    setFormItemsChanged(formItemsChanged + 1);
  };


  const renderSections = (sectionsToRender) => {
    let canModify = !!formHeader && (formHeader.FormStatus === Enums.FormStatus.Draft ||
      (formHeader.FormStatus === Enums.FormStatus.Completed && formHeader.FormDefinition.ExpireTimespan === 0
        && formHeader.FormDefinition.FormRule === Enums.FormRule.Customer));

    return (<>
      {sectionsToRender.map((sectionGroup, groupKey) => {
        return (<>
          {!!previewAttatchmentItem && attachmentPreviewModal}

          {sectionGroup.heading && (sectionGroup.sectionGroup === null || sectionGroup.sectionGroup === 0) ? <h4 className="section-group">
            {sectionGroup.heading}
          </h4> : <></>}

          {sectionGroup.isRepeatable ? <>
            {/* repeatable code goes here */}

            <div className="section-group-item">

              <div className="row">
                <div className="column">
                  {sectionGroup.formItems.map((item, fieldKey) => {
                    return (<div key={groupKey * 1000 + fieldKey}>
                      {plotFormItemWithoutField(item)}
                    </div>)
                  })}
                </div>

                {sectionGroup.isDeletable && canModify ?
                  <div className="button-column">
                    <img alt="Delete" src="/icons/x-circle-blue.svg" height="24" onClick={() => deleteSectionGroupItem2(sectionGroup)} />
                  </div> : ""}

              </div>

              {!!sectionGroup.childSections && sectionGroup.childSections.length > 0 && renderSections(sectionGroup.childSections)}

            </div>

            {sectionGroup.isLast && canModify ? <LegacyButton text={`Add ${Helper.truncateText(sectionGroup.heading, 24)}`} extraClasses="no-margin fit-content" onClick={() => addNewSectionGroupItem2(sectionGroup)} icon="plus-circle" /> : ""}


          </> : <>
            {/* standard code goes here */}
            {sectionGroup.formItems.map((item, itemKey) => {
              return (<div key={groupKey * 1000 + itemKey}>
                {plotFormItemWithoutField(item)}
              </div>)
            })}
          </>}

        </>);
      })}



      <style jsx>{`
      
      .section-group {
        width: calc(100% - 1rem);
        // background: ${colors.lightGreyStatus};
        // padding: 4px 8px;
        // border-radius: 3px;
        // color: white;
        margin: 0;
        margin-top: 0.5rem;
      }

      .section-group-item {
        // box-shadow: ${shadows.cardSmallDark};
        border: 2px solid ${colors.borderGrey};
        border-radius: 3px;
        margin: 0.5rem 0;
        padding: 0 0.5rem 0.5rem 0.5rem;
      }

      .button-column {
        width: auto;
        padding: 0.5rem;
        text-align: -webkit-center;
      }

      .button-column img {
        cursor: pointer;
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

      `}</style>
    </>);
  };

  const canUpgrade = () => {
    return formHeader && formHeader.FormStatus === Enums.FormStatus.Draft && formHeader.LatestFormDefinitionID && formHeader.LatestFormDefinitionID !== formHeader.FormDefinitionID;
  }

  const onUpgrade = async () => {

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      display: true,
      confirmButtonText: "Upgrade Form",
      heading: "Confirm upgrade form?",
      text: "The form will take on the new structure",
      onConfirm: async () => {
        let payload = {
          ...formHeader,
          FormItems: formItems
        };

        let resultFormHeader = await Fetch.post({
          url: "/Form/Upgrade",
          params: payload
        });

        setFormItems(resultFormHeader.FormItems);
        setFormHeader(resultFormHeader);
        getFormDefinitionFields(resultFormHeader);
        setFormItemsChanged(formItemsChanged + 1);
      }
    })
  }

  const refreshFormSignatures = async () => {
    let resultFormHeader = await Fetch.get({
      url: `/Form?id=${formHeader.ID}`
    });

    // iterate through existing form items and check if they have linked signatures, if so, overwrite the refreshed values to retain for saving
    formItems?.filter(x => x.DataType === Enums.getEnumStringValue(Enums.FormDefinitionFieldTypes, Enums.FormDefinitionFieldTypes.Signature)).forEach(item => {
      let matchIdx = resultFormHeader.FormItems.findIndex(x => x.ID === item.ID);
      if (matchIdx > -1) {
        // don't overwrite refreshed data unless it is empty
        if (helper.isNullOrWhitespace(resultFormHeader.FormItems[matchIdx].DataResult)) {
          resultFormHeader.FormItems[matchIdx].DataResult = item.DataResult;
        }
      }
    });

    // onSave(resultFormHeader);
    save(true, resultFormHeader);
    // setFormItems(resultFormHeader.FormItems);
    // setFormHeader(resultFormHeader);
  };

  if (!retrievedFields) {
    return (<h4>Loading...</h4>)
  }

  return (
    <SCModal open={true} >
      {/*<div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container"></div>*/}

      <Box>

        <div>
          {formHeaderToManage.FormDefinition ? <>

              <Flex align={'start'} justify={'space-between'}>
                  <Title order={2}>{formHeader ? formHeader.FormDefinitionDisplayName : formHeaderToManage.FormDefinition.Name} {isExpired() ? "(EXPIRED)" : ""}</Title>
                  <Box ml={'auto'}>
                      <Text c={'gray.7'} mt={'xs'} size={'sm'} inline style={{whiteSpace: 'nowrap'}}>
                        Version {formHeader?.FormDefinition?.Version}
                      </Text>

                      {
                          formHeader && !formHeader._isNew ?
                          <span className="img-container">
                            {isPrinting ? <SCSpinner colour='dark' /> :
                                <img className="pointer" src="/icons/printer-blue.svg" alt="Print form" title="Print form"
                                     onClick={() => printFormHeader(formHeader)} />
                            }
                          </span> : ''
                      }

                      {
                          formHeader && formHeader.FormStatus === Enums.FormStatus.Completed && (isExpired() || willExpire()) ?
                              <>
                                  <span className="img-container">
                                    <img className="pointer" src="/icons/repeat-blue.svg" alt="renew"
                                         title={`Renew${isExpired() ? " expired" : ""} form`}
                                         onClick={() => onRenew(formHeaderToManage)} />
                                  </span>
                              </> : ""
                      }

                      {canUpgrade() ?
                          <>
                    <span className="img-container">
                      <img className="pointer" src="/icons/upload.svg" alt="upgrade" title="Upgrade form"
                           onClick={() => onUpgrade()} />
                    </span>
                          </>
                          :
                          ""}

              </Box>
              </Flex>
              <Text size={'sm'} c={'gray.7'} mt={'sm'}>
                  {formHeader ? formHeader.FormDefinitionDescription : formHeaderToManage.FormDefinition.Description}
              </Text>
          </> : ''
          }
        </div>

        {renderSections(sectionsToRender)}

        <Flex justify={'space-between'} align={'end'} mt={'md'} w={'100%'} wrap={'wrap'} gap={'sm'}>
          <div >
            {/*<LegacyButton text="Cancel" extraClasses="hollow" onClick={() => onSave(null)}/>*/}
            <Button variant={'outline'} onClick={() => onSave(null)}> Cancel</Button>
          </div>
          {formHeader ? <>
            {formHeader.FormStatus === Enums.FormStatus.Draft ? <Flex justify={'end'} align={'end'} gap={'xs'} direction={{ base: 'column', xs: 'row' }}>
              <div >
                {/*<LegacyButton text="Save Draft" extraClasses="hollow" onClick={() => save(false)} disabled={saving}/>*/}
                <Button variant={'outline'} onClick={() => save(false)} disabled={saving}>
                  Save Draft
                </Button>
              </div>
              <div >
                {/*<LegacyButton text="Complete" onClick={completeCheck} disabled={saving}/>*/}
                <Button onClick={completeCheck} disabled={saving}>
                  Complete
                </Button>
              </div>
            </Flex> : ""}
            {formHeader.FormStatus === Enums.FormStatus.Completed && formHeader.FormDefinition.ExpireTimespan === 0 && formHeader.FormDefinition.FormRule === Enums.FormRule.Customer ?
              <div>
                <div>
                  <LegacyButton text="Update" extraClasses="" onClick={() => save(false)} disabled={saving} />
                </div>
              </div> : ""}
          </> : ""
          }
        </Flex>
      </Box>

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      {signatureObject &&
        <SignatureModal
          title={"Signature"}
          request={signatureObject.request}
          id={signatureObject.id}
          onUpdate={signatureObject.onUpdate}
          onDismiss={() => {
            refreshFormSignatures();
            setSignatureObject(null);
          }}
        />
      }
      <style jsx>{`

        :global(.title) {
          position: relative;
        }

        :global(.modal-container) {
          width: max-content;
          max-width: 90%;
          min-width: 38rem;
        }

        .version {
          font-size: 0.8rem;
          opacity: 0.7;
          margin-right: 0.5rem;
          vertical-align: top;
        }

        .section-group {
          width: calc(100% - 1rem);
            // background: ${colors.lightGreyStatus};
          // padding: 4px 8px;
          // border-radius: 3px;
          // color: white;
          margin: 0;
          margin-top: 0.5rem;
        }

        .section-group-item {
            // box-shadow: ${shadows.cardSmallDark};
          border: 2px solid ${colors.borderGrey};
          border-radius: 3px;
          margin: 0.5rem 0;
          padding: 0 0.5rem 0.5rem 0.5rem;
        }

        .button-column {
          width: auto;
          padding: 0.5rem;
          text-align: -webkit-center;
        }

        .button-column img {
          cursor: pointer;
        }

        .float-right {
          position: absolute;
          right: 0;
        }

        .float-right img {
          cursor: pointer;
        }

        .img-container {
          margin-left: 0.25rem;
        }

        .inline-block {
          display: inline-block;
          margin-left: 1rem;
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

        .end {
          align-items: flex-end;
        }

        .header {
          font-weight: bold;
        }

        .button-widths {
          width: 6rem;
        }

        .left-padding {
          padding-left: 0.5em;
        }

        .right-padding {
          padding-right: 0.5em;
        }
      `}</style>
    </SCModal>
  );
}

export default ManageForm;
