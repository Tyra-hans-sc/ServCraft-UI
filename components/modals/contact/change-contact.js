import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Button from '../../button';
import Search from '../../search';
import ManageContact from './manage-contact';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import PS from '../../../services/permission/permission-service';

function ChangeContact({ contacts, setContacts, changedContact, changeContact, module, moduleData, setModuleData, accessStatus }) {

  const [isNew, setIsNew] = useState(false);
  const [showManageContact, setShowManageContact] = useState(false);

  const [localChangedContact, setLocalChangedContact] = useState(changedContact);
  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
  const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer));
  let editContactPropogation = true;

  const onContactClick = (contact) => {
    if (editContactPropogation) {
      setLocalChangedContact(contact);
      setTimeout(() => {
        changeContact(contact);
      }, 200);
    }
  };

  const createContact = (contact) => {
    setContacts([...contacts, contact]);
    setLocalChangedContact(contact);
    changeContact(contact);

    setShowManageContact(false);
  };

  const createContactClick = () => {
    setIsNew(true);
    setShowManageContact(true);
  };

  const [editContact, setEditContact] = useState(null);

  function updateContact(updatedContact) {
    let newContacts = moduleData.Contacts.filter(contact => contact.ID != updatedContact.ID);
    newContacts.push(updatedContact);
    if (setModuleData) {
      const updatedModuleData = {
        ...moduleData,
        Contacts: newContacts
      }
      setModuleData(updatedModuleData);
    }
    editContactPropogation = true;
    onContactClick(updatedContact);

    setShowManageContact(false);
  }

  const [canDeactivate, setCanDeactivate] = useState(true);

  const onEditContactClick = (contact) => {
    if (contact.ID == changedContact.ID) {
      setCanDeactivate(false);
    } else {
      setCanDeactivate(true);
    }
    setEditContact(contact);
    setIsNew(false);
    setShowManageContact(true);
    editContactPropogation = false;
  };

  const [searchVal, setSearchVal] = useState('');
  const [searching, setSearching] = useState(false);

  const [localContacts, setLocalContacts] = useState(contacts);

  const searchContacts = async () => {

    setSearching(true);

    let contactList = [...contacts];
    if (!Helper.isNullOrWhitespace(searchVal)) {
      let searcher = searchVal.toLowerCase().trim();
      contactList = contactList.filter(x =>
        x.FirstName.toLowerCase().includes(searcher)
        || (x.LastName && x.LastName.toLowerCase().includes(searcher))
        || (x.EmailAddress && x.EmailAddress.toLowerCase().includes(searcher))
        || (x.MobileNumber && x.MobileNumber.toLowerCase().includes(searcher))
        || (x.HomeNumber && x.HomeNumber.toLowerCase().includes(searcher))
        || (x.IDNumber && x.IDNumber.toLowerCase().includes(searcher))
      );
    }

    setLocalContacts(contactList);
    setSearching(false);
  };

  useEffect(() => {
    searchContacts();
  }, [localChangedContact]);

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">

        <div className="row">
          <div className="search-container">
            <Search
              placeholder="Search Contacts"
              resultsNum={localContacts.length}
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              searchFunc={searchContacts}
            />
          </div>
        </div>

        <div className="change-contacts-container">
          {localContacts && localContacts.map(function (contact, index) {
            return (
              <div key={index} className={`change-contact-container ${localChangedContact.ID == contact.ID ? 'change-selected-contact' : ''}`} onClick={() => onContactClick(contact)}>

                {editCustomerPermission ? <div className="edit-contact-container" title="Edit contact" onClick={() => onEditContactClick(contact)}>
                  <img src="/icons/edit.svg" alt="edit" className="edit" />
                </div> : ""}

                {contact.IsPrimary ?
                  <div className="primary-contact">
                    Primary Contact
                  </div>
                  : ''
                }
                <div className="name">
                  {contact.FirstName + ' ' + contact.LastName}
                </div>
                <div className="email">
                  {contact.EmailAddress}
                </div>
                <div className="number">
                  {contact.MobileNumber}
                </div>
              </div>
            )
          })}
        </div>

        {showManageContact ? 
          <ManageContact isNew={isNew} contact={isNew ? null : editContact} module={module} moduleData={moduleData} 
            onSave={isNew ? createContact : updateContact} onCancel={() => setShowManageContact(false)} 
            canDeactivate={canDeactivate} accessStatus={accessStatus}
          /> 
          : ''
        }

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => changeContact(null)} />         
            {editCustomerPermission ?
                <Button text="Add new contact" icon="plus-circle" extraClasses="auto left-margin" onClick={createContactClick} />           
              : ""}
        </div>
      </div>

      <style jsx>{`
        
        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }
        
        .change-contacts-container {
          height: 70%;
          overflow-y: auto;
          padding: 0 1rem;
        }
        .search-container {
          margin-left: 1rem;
          margin-bottom: 1rem;
          width: 100%;          
        }
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
        }
        .justify-end {
          display: flex;
          justify-content: flex-end;
        }
        .change-contact-container {
          background-color: ${colors.white};
          box-shadow: 0px 8px 16px rgba(51, 51, 51, 0.1);
          box-sizing: border-box;
          border-radius: 3px;
          margin: 0.5rem 0 0;
          padding: 1.5rem 1rem;
          cursor: pointer;
          position: relative;
        }
        .change-contact-container:last-child {
          margin-bottom: 1rem;
        }
        .change-contact-container:hover {
          box-shadow: 0px 8px 16px rgba(51, 51, 51, 0.3);
        }
        .edit-contact-container {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }
        .change-selected-contact {
          border: 2px solid ${colors.bluePrimary};
        }
        .primary-contact {
          color: ${colors.bluePrimary};
        }
        .name {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .email, .number {
          color: ${colors.labelGrey}
        }
        .cancel {
          width: 6rem;
          margin-left: 1rem;
        }
        .create {
          width: 22rem;
        }
      `}</style>
    </div>
  );
}

export default ChangeContact
