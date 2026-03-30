import React, {useState, useEffect, useContext, useRef, useMemo, useCallback} from 'react';
import { colors, shadows } from '../../../theme';
import ToastContext from '../../../utils/toast-context';
import ChangeContact from '../../modals/contact/change-contact';
import ManageContact from '../../modals/contact/manage-contact';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import Helper from '../../../utils/helper';
import HelpDialog from '../../../components/help-dialog';
import Checkbox from '../../../components/checkbox';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import {Box, Combobox, Flex, Text, useCombobox} from '@mantine/core'
import ContactIcon from "@/PageComponents/Icons/ContactIcon";

function ContactSelector({ selectedContact, setSelectedContact, contactSearch, setContactSearch, canChangeContact,
  contacts, setContacts, contactTotalResults, setContactTotalResults,
  sendFromContact = false, canSendEmail = true, setCanSendEmail, sendEmail = true, setSendEmail,
  canSendSMS = true, setCanSendSMS, sendSMS = true, setSendSMS, hasSMSCreditsAvailable = false,
  selectedCustomer, showAddCustomer, inputErrors, accessStatus, customerPermission, editCustomerPermission, detailsView = false, canEdit = true,
  compactView = false,
  extraClasses, cypress, backButtonText, mode = 'edit',
                           iconMode = false, inline = false,
    canClear = true
}) {

  const selectedCustomerRef = useRef(selectedCustomer);

  const handleContactChangeSC = (e) => {
    if(setSelectedContact) {
      setSelectedContact(e);
      combobox.closeDropdown()
    }
  }

  useEffect(() => {
    if (sendFromContact && selectedContact) {
      setSendEmail(selectedContact.SendEmail);
      setCanSendEmail(selectedContact.SendEmail);
      setSendSMS(selectedContact.SendSMS);
      setCanSendSMS(selectedContact.SendSMS);
    }
    if(!!selectedContact) {
      combobox.closeDropdown()
    }
  }, [selectedContact]);

  useEffect(() => {
    selectedCustomerRef.current = selectedCustomer;
  }, [selectedCustomer]);

  const toast = useContext(ToastContext);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    defaultOpened: false,
    onDropdownOpen: () => combobox.selectOption(contacts.findIndex(x => x.ID === selectedContact.ID) + 1)
  });
  // const [fetchedContacts, setLatestContacts] = useState(contacts);
  const options = useMemo(() => (
      [
          editCustomerPermission && <Combobox.Option  value={'addNew'}> + Add New</Combobox.Option>,
          ...contacts.map((x, i) => (
          <Combobox.Option value={x.ID} key={x.ID}>
            {x.FullName}
          </Combobox.Option>
      ))])
  , [contacts])
  const handleSelectedOption = useCallback(
      (optionValue) => {
        if(optionValue === 'addNew') {
          if(editCustomerPermission) {
            createContactClick()
          }
        } else if(typeof optionValue === 'string') {
          setSelectedContact(contacts.find(x => (
              x.ID === optionValue
          )))
        }
      }, [contacts])
  // console.log('contacts', contacts )

  const searchContactsSC = async (skipIndex, take, filter) => {

    const contactList = await Fetch.post({
      url: `/Contact/GetContacts`,
      params: {
        pageSize: take,
        pageIndex: skipIndex,
        searchPhrase: filter,
        sortExpression: "",
        sortDirection: "",
        isActive: true,
        customerID: selectedCustomerRef.current?.ID ?? null,
      },
      toastCtx: toast
    });

   /* if(contactList.TotalResults?.Results) {
      setLatestContacts(contactList)
    }*/

    return { data: contactList.Results, total: contactList.TotalResults };
  };

  const searchContacts = async () => {

    const contactList = await Fetch.post({
      url: `/Contact/GetContacts`,
      params: {
        pageSize: 1000,
        pageIndex: 0,
        searchPhrase: contactSearch,
        sortExpression: "",
        sortDirection: "",
        isActive: true,
        customerID: selectedCustomer ? selectedCustomer.ID : null,
      },
      toastCtx: toast
    });

    setContacts(contactList.Results);
    setContactTotalResults(contactList.TotalResults);

  };

  useEffect(() => {
    !!selectedCustomer && searchContacts()
  }, [])

  // MANAGE CONTACT

  const [isNew, setIsNew] = useState(false);
  const [showManageContact, setShowManageContact] = useState(false);

  const [editContact, setEditContact] = useState();

  const editContactClick = (contact) => {
    setEditContact(contact);
    setIsNew(false);
    setShowManageContact(true);
  };

  const updateContacts = (contact) => {
    let newContacts = contacts.filter(x => x.ID !== contact.ID);
    newContacts.push(contact);
    setContacts(newContacts);

    if (!contact.IsActive && selectedContact.ID === contact.ID) {
      setSelectedContact(null);
    } else {
      setSelectedContact(contact);
    }

    if (sendFromContact) {
      setSendEmail(contact.SendEmail);
      setCanSendEmail(contact.SendEmail);
      setSendSMS(contact.SendSMS);
      setCanSendSMS(contact.SendSMS);
    }

    setShowManageContact(false);
  };

  const createContactClick = () => {
    setIsNew(true);
    setShowManageContact(true);
  };

  const onContactCreate = (contact) => {
    setContacts([...contacts, contact]);

    contact.IsActive && setSelectedContact(contact);

    setShowManageContact(false);
  };

  const clearSelection = () => {
    setContactSearch('');
    setSelectedContact(undefined);
    if (sendFromContact) {
      setSendEmail(false);
      setCanSendEmail(false);
      setSendSMS(false);
      setCanSendSMS(false);
    }
  };

  const [changedContact, setChangedContact] = useState(undefined);

  const changeCustomerContact = async () => {
    await searchContacts();
    if (selectedContact) {
      setChangedContact(selectedContact);
    }
  };

  const changeContact = (contact) => {

    if (contact && contact.IsActive) {
      setSelectedContact(contact);
    }

    setChangedContact(undefined);
  };

  if (detailsView) {
    return (
      <>
        {!showAddCustomer && selectedContact ?
          <>
            <div className="customer-container">
              <div>
                {selectedContact.FirstName + ' ' + selectedContact.LastName}

                {Helper.isNullOrWhitespace(selectedContact.EmailAddress) && Helper.isNullOrWhitespace(selectedContact.MobileNumber) && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && canEdit ? <>
                  <img src="/icons/edit.svg" alt="edit" title="Edit contact" onClick={changeCustomerContact} />
                </> : ''}

              </div>
              {selectedContact.MobileNumber && selectedContact.EmailAddress ?
                <>
                  <div>
                    {selectedContact.MobileNumber}
                  </div>
                  <div>
                    {selectedContact.EmailAddress}
                    {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && canEdit ? <>
                      <img src="/icons/edit.svg" alt="edit" title="Edit contact" onClick={changeCustomerContact} />
                    </> : ''}
                  </div>
                </>
                : ''
              }
              {selectedContact.MobileNumber && Helper.isNullOrWhitespace(selectedContact.EmailAddress) ?
                <div>
                  {selectedContact.MobileNumber}
                  {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && canEdit ? <>
                    <img src="/icons/edit.svg" alt="edit" title="Edit contact" onClick={changeCustomerContact} />
                  </> : ''}
                </div> : ''
              }
              {selectedContact.EmailAddress && Helper.isNullOrWhitespace(selectedContact.MobileNumber) ?
                <div>
                  {selectedContact.EmailAddress}
                  {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && canEdit ? <>
                    <img src="/icons/edit.svg" alt="edit" title="Edit contact" onClick={changeCustomerContact} />
                  </> : ''}
                </div> : ''
              }
            </div>
          </> : ''
        }

        {changedContact ?
          <ChangeContact
            contacts={contacts}
            setContacts={setContacts}
            changeContact={changeContact}
            changedContact={changedContact}
            module={Enums.Module.Customer}
            moduleData={selectedCustomer}
            accessStatus={accessStatus}
          /> : ''
        }

        <style jsx>{`
          .customer-container img {
            /*margin-top: -1rem;*/
            margin-left: 1rem;
            cursor: pointer;
            /* position: absolute; */
            margin-top: -8px;
            margin-bottom: -6px;
          }
        `}</style>
      </>
    );
  } else {
    return (
      <div className={compactView ? "" : "section"}>
        <div className="row">
          {!compactView ? <h3>Select Contact</h3> : ""}
          {isNew
            ? ""
            : selectedContact && !compactView
              ? <img src="/icons/x-circle-blue.svg" alt="edit" className="edit" title='Clear selection'
                onClick={clearSelection}
              />
              : ''
          }
        </div>
        {
          selectedContact ? (
                  <Combobox
                      store={combobox}
                      onOptionSubmit={(val) => {
                        handleSelectedOption(val);
                        combobox.closeDropdown();
                      }}
                      shadow={'sm'}

                  >
                    <Combobox.Target>
                      <Box mt={mode === 'edit' ? 'sm' : 2} maw={500}>
                        {
                            !iconMode &&
                            <Text size={'sm'} className={mode === 'view' ? 'customerViewLabel' : ''}>
                              Contact
                            </Text>
                        }

                        <div className={'selected-contact ' + (combobox.dropdownOpened ? 'active ' : '') + (compactView ? "compact " : "") + (mode === 'edit' ? 'edit-mode' : '')}>
                          {/*<span>Contact</span>*/}
                          {
                              iconMode &&
                              <ContactIcon size={23} style={{marginLeft: -3}} />
                          }
                          <Flex direction={'column'} style={{flexGrow: 1}} onClick={() => canChangeContact && combobox.openDropdown()}>
                            <p style={{maxWidth: 'calc(100% - 50px)'}}>{selectedContact.FirstName + " " + selectedContact.LastName}</p>
                            {selectedContact.EmailAddress
                                ? <>
                                  {/*Email*/}
                                  <div className="selected-contact-item">
                                    <p>
                                      {selectedContact.EmailAddress}
                                    </p>
                                    {sendFromContact ?
                                        <>
                                          {canSendEmail && false ?
                                              <div className="selected-contact-checkbox">
                                                <SCCheckbox
                                                    onChange={() => setSendEmail(!sendEmail)}
                                                    value={sendEmail}
                                                    label=""
                                                    // offwhite={true}
                                                />
                                              </div> : ''
                                          }
                                          {canSendEmail || true ? '' :
                                              <div className="selected-contact-help-dialog">
                                                <HelpDialog position="bottom" message="You cannot send an email to this contact since they are not marked to receive them." width={275} />
                                              </div>
                                          }
                                        </>
                                        :
                                        <>
                                          {selectedContact.SendEmail ? <div className="selected-contact-circle-tick"></div> : <div className="selected-contact-circle-cross"></div>}
                                        </>
                                    }
                                  </div>
                                </>
                                : ''
                            }
                            {selectedContact.MobileNumber
                                ? <>
                                  {/*Mobile Number*/}
                                  <div className="selected-contact-item">
                                    <p>{selectedContact.MobileNumber}</p>
                                    {sendFromContact ?
                                        <>
                                          {canSendSMS && hasSMSCreditsAvailable && false ?
                                              <div className="selected-contact-checkbox">
                                                <Checkbox
                                                    changeHandler={() => setSendSMS(!sendSMS)}
                                                    checked={sendSMS}
                                                    label=""
                                                    offwhite={true}
                                                />
                                              </div> : ''
                                          }

                                          {hasSMSCreditsAvailable || true ?
                                              canSendSMS ? '' :
                                                  <div className="selected-contact-help-dialog">
                                                    <HelpDialog position="bottom"
                                                                message="You cannot send an SMS to this contact since they are not marked to receive them." width={275} />
                                                  </div>
                                              : <div className="selected-contact-help-dialog">
                                                <HelpDialog position="bottom"
                                                            message="You do not have SMS credits available." width={150} />
                                              </div>
                                          }
                                        </>
                                        :
                                        <>
                                          {selectedContact.SendSMS ? <div className="selected-contact-circle-tick"></div> : <div className="selected-contact-circle-cross"></div>}
                                        </>
                                    }
                                  </div>
                                </>
                                : ''
                            }
                            <div className="selected-contact-edit">
                              {editCustomerPermission ? <img src="/specno-icons/edit.svg" alt="edit" className="edit" title='Edit contact'
                                                             onClick={(e) => {
                                                               e.stopPropagation();
                                                               combobox.closeDropdown();
                                                               editContactClick(selectedContact);
                                                             }} /> : ""}
                              {compactView && canClear ? <img src="/specno-icons/clear.svg" alt="edit" className="edit clear" title='Clear selection'
                                                  onClick={(e) => {
                                                    clearSelection()
                                                    e.stopPropagation()
                                                  }}
                                                  style={{ marginLeft: 8 }} /> : ""}
                            </div>
                          </Flex>
                        </div>

                      </Box>
                    </Combobox.Target>

                    <Combobox.Dropdown style={{boxShadow: shadows.combobox}}>
                      <Combobox.Options>
                        {options}
                      </Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>
            ) :
          <>
            <SCComboBox
              addOption={(editCustomerPermission ? { text: "Add new contact", action: () => createContactClick() } : null)}
              onChange={handleContactChangeSC}
              error={inputErrors.Contact}
              label={iconMode ? undefined : "Contact"}
              getOptions={searchContactsSC}
              placeholder={mode === 'view' ? 'No contact selected *' : iconMode ? 'Select Contact *' : "Select contact person"}
              required={true}
              value={selectedContact}
              disabled={!canChangeContact}
              dataItemKey="ID"
              textField="FullName"
              cascadeDependency={selectedCustomer}
              name="contact-selector"
              style={{maxWidth: '500px'}}
              hoverLabelMode={mode === 'view'}
              mt={mode === 'view' ? 2 : 'sm'}
              iconMantine={iconMode ? <ContactIcon color={'var(--mantine-color-gray-5)'} size={23} /> : undefined}
              canClear={canClear}
            />
          </>
        }

        {showManageContact ?
          <ManageContact isNew={isNew} contact={isNew ? null : editContact} module={Enums.Module.Customer} moduleData={selectedCustomer}
            onSave={isNew ? onContactCreate : updateContacts} onCancel={() => setShowManageContact(false)} accessStatus={accessStatus} backButtonText={backButtonText}
          />
          : ''
        }

        <style jsx>{`
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
          .edit {
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
}

export default ContactSelector;
