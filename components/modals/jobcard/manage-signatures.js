import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, layout } from '../../../theme';
import LegacyButton from '../../button';
import {Box, Button, Flex} from '@mantine/core';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import SignatureCanvas from 'react-signature-canvas';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCModal from "../../../PageComponents/Modal/SCModal";

function ManageSignatures({ job, setJob, saveJob, setShowModal, accessStatus }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  const [technicianSignatureAttachment, setTechnicianSignatureAttachment] = useState();
  const [customerSignatureAttachment, setCustomerSignatureAttachment] = useState();
  const [hasTechnicianSignatureAttachment, setHasTechnicianSignatureAttachment] = useState(false);
  const [hasCustomerSignatureAttachment, setHasCustomerSignatureAttachment] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getAttachments = async () => {
    const attachmentRes = await Fetch.get({
      url: `/Attachment/GetItemAttachments?itemID=${job.ID}&excludeSignatures=false`,
    });
    if (attachmentRes) {
      let results = attachmentRes.Results;
      if (results && results.length > 0) {
        let techSig = results.find(x => x.AttachmentType == Enums.AttachmentType.TechnicianSignature);
        if (techSig) {
          setTechnicianSignatureAttachment(techSig);
          setHasTechnicianSignatureAttachment(true);
          setShowTechnicianSignaturePad(false);
          setShowTechnicianSignature(true);
        } else {

        }
        let customerSig = results.find(x => x.AttachmentType == Enums.AttachmentType.CustomerSignature);
        if (customerSig) {
          setCustomerSignatureAttachment(customerSig);
          setHasCustomerSignatureAttachment(true);
          setShowCustomerSignaturePad(false);
          setShowCustomerSignature(true);
        } else {

        }
      } else {

      }
    }
  }

  const deleteOldSignature = async (isTechnician) => {
    if ((isTechnician && hasTechnicianSignatureAttachment) || (!isTechnician && hasCustomerSignatureAttachment)) {
      const attachmentRes = await Fetch.destroy({
        url: `/Attachment?id=${isTechnician ? technicianSignatureAttachment.ID : customerSignatureAttachment.ID}`,
      });
    }
  }

  const technicians = job.Employees;
  const totalTechnicians = job.Employees ? job.Employees.length : 0;
  const [selectedTechnician, setSelectedTechnician] = useState();

  const [technicanSearch, setTechnicianSearch] = useState('');
  const handleTechnicianChange = (e) => {
    setTechnicianSearch(e.target.value);
  }

  useEffect(() => {
    if (job.SignatureTechnicianName) {
      setTechnicianSearch(job.SignatureTechnicianName);
      if (technicians) {
        let temp = technicians.find(x => x.FullName == job.SignatureTechnicianName);
        if (temp) {
          setSelectedTechnician(temp);
        }
      }
    }
    getAttachments();
  }, []);

  useEffect(() => {
    if (selectedTechnician) {
      if (!technicianSignatureAttachment) {
        setShowTechnicianSignaturePad(true);
      }
    }
  }, [selectedTechnician]);

  const [signatureName, setSignatureName] = useState(job.SignatureName ? job.SignatureName : '');
  const handleSignatureNameChange = (e) => {
    setSignatureName(e.target.value);
    if (Helper.isNullOrWhitespace(e.target.value)) {
      setShowCustomerSignaturePad(false);
    }
  }

  const handleSignatureNameChangeSC = (e) => {
    setSignatureName(e.value);
    if (Helper.isNullOrWhitespace(e.value)) {
      setShowCustomerSignaturePad(false);
    }
  }

  const signatureNameFocus = (e) => {
    setSignatureName(job.SignatureName ? job.SignatureName : job.Contact ? `${job.Contact.FirstName} ${job.Contact.LastName}` : '');
    if (!customerSignatureAttachment && (job.Signaturename || job.Contact)) {
      setShowCustomerSignaturePad(true);
    }
  }

  const [technicianSignature, setTechnicianSignature] = useState(null);
  const [showTechnicianSignaturePad, setShowTechnicianSignaturePad] = useState(false);
  const [showTechnicianSignature, setShowTechnicianSignature] = useState(false);
  const technicianSignatureRef = useRef();

  const clearTechnicianSignature = () => {
    technicianSignatureRef.current.clear();
    setTechnicianSignature(null);
  }

  const technicianSignatureCallback = (e) => {
    let temp = technicianSignatureRef.current.toDataURL().replace("data:image/png;base64,", "");
    setTechnicianSignature(temp);
  }

  const resignTechnicianSignature = () => {
    setShowTechnicianSignature(false);
    setShowTechnicianSignaturePad(true);
  }

  const cancelTechnicianResign = () => {
    setShowTechnicianSignature(true);
    setShowTechnicianSignaturePad(false);
  }

  const [customerSignature, setCustomerSignature] = useState(null);
  const [showCustomerSignaturePad, setShowCustomerSignaturePad] = useState(false);
  const [showCustomerSignature, setShowCustomerSignature] = useState(false);
  const customerSignatureRef = useRef();

  const clearCustomerSignature = () => {
    customerSignatureRef.current.clear();
    setCustomerSignature(null);
  }

  const customerSignatureCallback = () => {
    let temp = customerSignatureRef.current.toDataURL().replace("data:image/png;base64,", "");
    setCustomerSignature(temp);
  }

  const resignCustomerSignature = () => {
    setShowCustomerSignature(false);
    setShowCustomerSignaturePad(true);
  }

  const cancelCustomerResign = () => {
    setShowCustomerSignature(true);
    setShowCustomerSignaturePad(false);
  }

  const [readyToUpdate, setReadyToUpdate] = useState(false);
  useEffect(() => {
    if (readyToUpdate) {
      saveJob();
      setShowModal(false);
      setReadyToUpdate(false);
    }
  }, [readyToUpdate]);

  const saveAttachment = async (isTechnician) => {
    let id = Helper.newGuid();
    const attachmentRes = await Fetch.post({
      url: '/Attachment',
      params: {
        AttachmentType: isTechnician ? Enums.AttachmentType.TechnicianSignature : Enums.AttachmentType.CustomerSignature,
        Description: isTechnician ? 'Technician Signature' : 'Customer Signature',
        FileName: `${id}.png`,
        FileBase64: isTechnician ? technicianSignature : customerSignature,
        ItemID: job.ID,
        Module: Enums.Module.JobCard,
        UserType: Enums.UserType.Employee,
        ContentType: 'image/png',
      },
      toastCtx: toast
    });
  }

  const validate = () => {

    let validationItems = [];

    // Tech selected but no signature
    if (selectedTechnician && !technicianSignatureAttachment) {
      validationItems = [...validationItems,
      { key: "technicianSignature", value: technicianSignature, required: true, type: Enums.ControlType.Custom }
      ];
    }

    // Customer name but no signature
    if (!Helper.isNullOrWhitespace(signatureName) && !customerSignatureAttachment) {
      validationItems = [...validationItems,
      { key: "customerSignature", value: customerSignature, required: true, type: Enums.ControlType.Custom }
      ];
    }

    // No Customer name with signature
    if (Helper.isNullOrWhitespace(signatureName) && customerSignatureAttachment) {
      validationItems = [...validationItems,
      { key: "signatureName", value: signatureName, required: true, type: Enums.ControlType.Text },
      ];
    }

    // No Tech selected and no Customer name
    if (!selectedTechnician && Helper.isNullOrWhitespace(signatureName)) {
      validationItems = [...validationItems,
      { key: "technician", value: selectedTechnician, required: true, type: Enums.ControlType.Select },
      { key: "signatureName", value: signatureName, required: true, type: Enums.ControlType.Text },
      ];
    }

    const { isValid, errors } = Helper.validateInputs(validationItems);

    setInputErrors(errors);
    return isValid;
  };


  const updateSignatures = async () => {

    let isValid = validate();
    if (isValid) {

      setUpdating(true);

      if (technicianSignature) {
        await deleteOldSignature(true);
        await saveAttachment(true);
      }

      if (customerSignature) {
        await deleteOldSignature(false);
        await saveAttachment(false);
      }

      setUpdating(false);

      setJob({
        ...job,
        'SignatureTechnicianName': selectedTechnician ? selectedTechnician.FullName : null,
        'SignatureName': signatureName,
      });

      setReadyToUpdate(true);
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  }

  return (
    // <div className="overlay" onClick={(e) => e.stopPropagation()}>
    <>
      {/*<div className="modal-container"></div>*/}
      <SCModal open>

        <Box style={{overflowX: 'clip'}}>
          <div className="row">
            <div className="title">
              Signatures for {job.JobCardNumber}
            </div>
          </div>

          <div className="row">
            <div className="column">
              {/* <h3>Technician</h3> */}
              <SCDropdownList
                  error={inputErrors.technician}
                  label="Technician"
                  options={technicians}
                  placeholder="No Signature"
                  required={false}
                  onChange={setSelectedTechnician}
                  value={selectedTechnician}
                  dataItemKey="ID"
                  textField='FullName'
              />
              {/* <SelectInput
              changeHandler={handleTechnicianChange}
              error={inputErrors.technician}
              label="Technician"
              options={technicians}
              placeholder="No Signature"
              required={false}
              setSelected={setSelectedTechnician}
              totalOptions={totalTechnicians}
              type="employee"
              value={technicanSearch}
            /> */}
            </div>
          </div>

          {showTechnicianSignaturePad ?
              <>
                <div className={`signature-pad ${inputErrors.technicianSignature ? 'error' : ''}`}>
                  {/* Fix Signature Pad */}
                  {/*<SignaturePad minWidth={1.5} ref={technicianSignatureRef} onEnd={technicianSignatureCallback} />*/}
                  {/*TODO: fix add new signature pad*/}
                  <div className="m-signature-pad">
                    <SignatureCanvas minWidth={1.5} ref={technicianSignatureRef} onEnd={technicianSignatureCallback}/>
                  </div>
                  {/*  */}
                  {technicianSignatureAttachment ?
                      <div className="cancel-button">
                        {/*<LegacyButton text="Cancel signature" extraClasses="hollow" onClick={cancelTechnicianResign}/>*/}
                        <Button variant={'outline'} onClick={cancelTechnicianResign} top={15} right={-25}>
                          Cancel signature
                        </Button>
                      </div> : ''
                  }

                </div>

                <div className="row">
                  <div className="clear-button">
                    {/*<LegacyButton text="Clear" extraClasses="hollow" onClick={clearTechnicianSignature}/>*/}
                    <Button variant={'outline'} mt='sm' onClick={clearTechnicianSignature}>
                      Clear
                    </Button>
                  </div>
                </div>
              </> : ''
          }

          {showTechnicianSignature && technicianSignatureAttachment ?
              <div className="current-signature">
                <img src={technicianSignatureAttachment.Url} className="thumb"/>
                <div className="resign-button">
                  <LegacyButton
                      disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                      text="Re-sign" icon="pen-tool" onClick={resignTechnicianSignature}/>
                </div>
              </div> : ''
          }

          <div className="row">
            <div className="column">
              {/* <h3>Customer</h3> */}
              <SCInput
                  label="Customer"
                  name="SignatureName"
                  placeholder="No Signature"
                  onChange={handleSignatureNameChangeSC}
                  value={signatureName}
                  error={inputErrors.signatureName}
                  onFocus={signatureNameFocus}
              />
              {/* <TextInput
              type="text"
              name="SignatureName"
              placeholder="No Signature"
              changeHandler={handleSignatureNameChange}
              value={signatureName}
              error={inputErrors.signatureName}
              setInputFocus={signatureNameFocus}
            /> */}
            </div>
          </div>

          {showCustomerSignaturePad ?
              <>
                <div className={`signature-pad ${inputErrors.customerSignature ? 'error' : ''}`}>

                  <div className="m-signature-pad">
                    <SignatureCanvas minWidth={1.5} ref={customerSignatureRef} onEnd={customerSignatureCallback}/>
                  </div>
                  {/*<SignaturePad minWidth={1.5} ref={customerSignatureRef} onEnd={customerSignatureCallback} />*/}

                  {customerSignatureAttachment ?
                      <div className="cancel-button">
                        {/*<LegacyButton text="Cancel signature" extraClasses="hollow" onClick={cancelCustomerResign}/>*/}
                        <Button variant={'outline'} onClick={cancelCustomerResign} top={15} right={-25}>
                          Cancel signature
                        </Button>
                      </div> : ''
                  }

                </div>

                <div className="row">
                  <div className="clear-button">
                    {/*<LegacyButton text="Clear" extraClasses="hollow" onClick={clearCustomerSignature}/>*/}
                    <Button variant={'outline'} mt={'sm'} onClick={clearCustomerSignature}>
                        Clear
                    </Button>
                  </div>
                </div>
              </> : ''
          }

          {showCustomerSignature && customerSignatureAttachment ?
              <div className="current-signature">
                <img src={customerSignatureAttachment.Url} className="thumb"/>
                <div className="resign-button">
                  <LegacyButton
                      disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                      text="Re-sign" icon="pen-tool" onClick={resignCustomerSignature}/>
                </div>
              </div> : ''
          }

          <Flex justify={'space-between'} mt={'lg'} mb={-12}>
            <div className="cancel">
              {/*<LegacyButton text="Cancel" extraClasses="hollow" onClick={() => setShowModal(false)}/>*/}
              <Button variant={'outline'} onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
            <div className="save">
              {/*<LegacyButton
                  disabled={updating || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                  text={updating ? "Updating..." : "Update"} onClick={updateSignatures}/>*/}
              <Button
                  disabled={updating || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                  onClick={updateSignatures}
              >
                {updating ? "Updating..." : "Update"}
              </Button>
            </div>
          </Flex>
        </Box>

      </SCModal>
      <style jsx>{`
        .align-end {
          align-items: flex-end;
        }

        h3 {
          color: ${colors.darkPrimary};
          font-size: 16px;
        }

        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .label {
          display: flex;
          margin-top: 1rem;
          align-items: center;
          padding: 0 0.5rem;
          white-space: nowrap;
        }

        .current-signature {
          align-items: center;
          border: 1px solid ${colors.borderGrey};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 14rem;
          justify-content: center;
          object-fit: contain;
          overflow: hidden;
          position: relative;
          margin-top: 1rem;
          margin-left: 0.5rem;
        }

        .current-signature img {
          height: auto;
          max-width: 100%;
        }

        .resign-button {
          position: absolute;
          top: -1rem;
          right: 0.5rem;
          width: 8rem;
        }

        .cancel-button {
          position: absolute;
          top: 1.75rem;
          right: 2rem;
          width: 10rem;
        }

        .arrow {
          padding: 0.25rem 1rem;
        }

        .clear-button {
          width: 6rem;
        }

        .signature-button {
          width: 6rem;
        }

        .cancel {
          width: 6rem;
        }

        .update {
          width: 14rem;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }
      `}</style>
    </>
  );
}

export default ManageSignatures;
