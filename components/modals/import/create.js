import React, { useState, useEffect, useContext } from 'react';
import TextInput from '../../text-input';
import SelectInput from '../../select-input';
import Button from '../../button';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
//import fetch from 'isomorphic-unfetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Download from '../../download';
import ToastContext from '../../../utils/toast-context';
import Storage from '../../../utils/storage';
import { getApiHost } from '../../../utils/auth';
import BusyIndicatorContext from '../../../utils/busy-indicator-context';
import constants from '../../../utils/constants';

function CreateImport({ setShowModal, importType = null }) {

  const busyIndicator = useContext(BusyIndicatorContext);

  const toast = useContext(ToastContext);
  const [enableImport, setEnableImport] = useState(!Helper.isNullOrWhitespace(importType));
  const [enableImportTypeChange, setEnableImportTypeChange] = useState(Helper.isNullOrWhitespace(importType));

  const importTypes = Enums.getEnumItems(Enums.ImportType);
  const [importTypeText, setImportTypeText] = useState('');
  const [selectedImportType, setSelectedImportType] = useState(importType);

  const handleImportTypeChange = (e) => {
    setImportTypeText(e.target.value);
  };

  const [url, setUrl] = useState(Helper.isNullOrWhitespace(importType) ? '' : `/Import?importType=${importType}`);

  useEffect(() => {
    if (selectedImportType) {
      setUrl(`/Import?importType=${selectedImportType}`);
      setEnableImport(true);
    } else {
      setEnableImport(false);
    }
  }, [selectedImportType]);

  const [uploading, setUploading] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);

  const [file, setFile] = useState();
  useEffect(() => {
    if (file) {
      setFileName(file.name);
      setFileChosen(true);
    }
  }, [file]);

  const [fileName, setFileName] = useState('');

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  function chooseFile() {
    document.getElementById('js-input').click();
  }

  async function handleFileChange(e) {
    let file = e.target.files[0];
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      setFile(file);
    } else {
      toast.setToast({
        message: 'Please select a valid file',
        show: true,
        type: 'error'
      });
    }
  }

  async function submitImport() {

    setUploading(true);
    busyIndicator.setText("Uploading...");

    if (fileChosen) {

      const token = Storage.getCookie(Enums.Cookie.token);
      const deviceid = Storage.getCookie(Enums.Cookie.fingerPrint);

      let reader = new FileReader();

      const apiHost = getApiHost();

      reader.onloadend = async function () {
        // Remove Data URI from B64 String
        var b64 = reader.result.replace(/^data:.+;base64,/, '');
        const res = await fetch(apiHost + '/Import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'deviceid': deviceid,
            'tenantid': Storage.getCookie(Enums.Cookie.tenantID)
          },
          body: JSON.stringify({
            FileName: file.name,
            FileBase64: b64,
            ImportType: selectedImportType,
          })
        });

        if (res.status == 200) {
          toast.setToast({
            message: 'Import successfully uploaded for processing',
            show: true,
            type: 'success'
          });
          Helper.mixpanelTrack(constants.mixPanelEvents.createImport, {
            importType: selectedImportType
          });
          setShowModal(false);
        } else {
          toast.setToast({
            message: 'Import failed',
            show: true,
            type: Enums.ToastType.error,
          });
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast.setToast({
        message: 'Please choose a file to import',
        show: true,
        type: 'error'
      });
      setUploading(false);
    }
    busyIndicator.setText(null);
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="modal-title">
          {"Import for " + Enums.getEnumStringValue(Enums.ImportType, selectedImportType)}
        </div>

        {enableImportTypeChange ?
          <div className="row">
            <SelectInput
              changeHandler={handleImportTypeChange}
              label="Import Type"
              options={importTypes}
              placeholder="Select import type"
              required={true}
              noInput={true}
              setSelected={setSelectedImportType}
              type="enum"
              value={importTypeText}
            />
          </div> : ''
        }
        {enableImport ?
          <>
            <div className="row">
              <div className="column">
                <Download url={url} method='GET' label='Download Template' />
              </div>
            </div>
            <div className="row">
              <div className="column">
                <Download url={`/Import/DownloadTemplateWithData/?importType=${importType}`} method='GET' label='Download Template with Data' />
              </div>
            </div>
            <div className="row">
              <Button text="Choose File" onClick={() => chooseFile()} />
            </div>
          </>
          : ''
        }
        {fileChosen ?
          <>
            <div className="row">
              <TextInput label="File" readOnly={true} changeHandler={handleFileNameChange} value={fileName} />
            </div>
          </>
          : ''}

        <div className="no-items no-items-visible">
          <a href="/settings/import/list"><img src="/icons/external-link.svg" alt="external-link" /> Navigate to imports</a>
        </div>

        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setShowModal(false)} />
          </div>
          <div className="update">
            <Button text="Import File" onClick={submitImport} disabled={uploading} />
          </div>
        </div>

        <input type="file" id="js-input" className="hidden-file-input" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
      </div>

      <style jsx>{`
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
        .hidden-file-input {
          display: none;
        }
        a {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

export default CreateImport;
