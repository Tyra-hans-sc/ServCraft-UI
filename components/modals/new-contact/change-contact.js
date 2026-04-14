import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Button from '../../button';
import Search from '../../search';
import CreateContact from './create-contact';
import EditContact from './edit-contact';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import PS from '../../../services/permission/permission-service';

function ChangeContact({ contacts, setContacts, changedContact, changeContact, customer, setCustomer }) {

  const [showCreateContact, setShowCreateContact] = useState(null);
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
  };

  const createContactClick = () => {
    setShowCreateContact(true);
  };

  const [editContact, setEditContact] = useState(null);

  function updateContact(updatedContact) {
    let newContacts = customer.Contacts.filter(contact => contact.ID != updatedContact.ID);
    newContacts.push(updatedContact);
    if (setCustomer) {
      const updatedCustomer = {
        ...customer,
        Contacts: newContacts
      }
      setCustomer(updatedCustomer);
    }
    editContactPropogation = true;
    onContactClick(updatedContact);
  }

  const [canDeactivate, setCanDeactivate] = useState(true);

  const onEditContactClick = (contact) => {
    if (contact.ID == changedContact.ID) {
      setCanDeactivate(false);
    } else {
      setCanDeactivate(true);
    }
    setEditContact(contact);
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
      <div className="container">

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

        {showCreateContact ?
          <CreateContact
            module={Enums.Module.Customer}
            moduleData={customer}
            setCreateContact={setShowCreateContact}
            createContact={createContact}
          />
          : ''
        }

        {editContact ?
          <EditContact
            module={Enums.Module.Customer}
            contact={editContact}
            setEditContact={setEditContact}
            updateContact={updateContact}
            canDeactivate={canDeactivate}
          />
          : ''
        }

        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => changeContact(changedContact)} />
          </div>
          {editCustomerPermission ?
            <div className="create justify-end">
              <Button text="Add new contact" icon="plus-circle" extraClasses="fit-content" onClick={createContactClick} />
            </div>
            : ""}
        </div>
      </div>

      <style jsx>{`
        .overlay {
          align-items: center;
          background-color: rgba(19, 106, 205, 0.9);
          bottom: 0;
          display: flex;
          justify-content: center;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 110;
        }
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 1rem 2rem;
          width: 38rem;
          height: 80%;
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
