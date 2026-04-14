import { useState, useContext, useEffect } from 'react';
import ToastContext from '../../utils/toast-context';
import TextArea from '../../components/text-area';
import TextInput from '../../components/text-input';
import SelectInput from '../../components/select-input';
import Button from '../../components/button';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
//import fetch from 'isomorphic-unfetch';
import * as Enums from '../../utils/enums';
import Config from '../../utils/config';
import Storage from '../../utils/storage';
import useMobileView from '../../hooks/useMobileView';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import SCInput from '../sc-controls/form-controls/sc-input';

function MessagePost({ onMessagePost, module, itemID, commentType = Enums.CommentType.Help, customerZone = false,
  userName = '', tenantID = '', customerID = '', apiUrlOverride = null, title = "Submit a question or comment",
  cancelButtonText = "Cancel", sendButtonText = "Send" }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [mobileView] = useMobileView();

  const [name, setName] = useState(customerZone ? '' : userName);
  const handleNameChange = (e) => {
    setName(e.value);
  }

  const [message, setMessage] = useState('');
  const handleMessageChange = (e) => {
    setMessage(e.value);
  }

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState();

  const getContacts = async () => {
    const customer = await Fetch.get({
      url: `/CustomerZone/GetCustomer`,
      params: {
        customerID: customerID
      },
      tenantID: tenantID,
      customerID: customerID,
      apiUrlOverride: apiUrlOverride
    });
    if (customer && customer.Contacts && customer.Contacts.length > 0) {
      setContacts(customer.Contacts);
      if (customer.Contacts.length == 1) {
        setSelectedContact(customer.Contacts[0]);
      }
    }
  }

  useEffect(() => {
    if (!Helper.isNullOrWhitespace(customerID) && customerZone) {
      getContacts();
    }
  }, []);

  const validate = () => {

    let validationItems = [{ key: "Message", value: message, type: Enums.ControlType.Text, required: true }];
    if (customerZone) {
      validationItems = [...validationItems,
      { key: 'selectedContact', value: selectedContact, type: Enums.ControlType.Select, required: true }]
    } else {
      validationItems = [...validationItems,
      { key: "Name", value: name, type: Enums.ControlType.Text, required: true }];
    }

    const { isValid, errors } = Helper.validateInputs(validationItems);

    setInputErrors(errors);
    return isValid;
  }

  const submitMessage = async () => {
    let isValid = validate();

    if (isValid) {

      setSending(true);

      let messagePost;

      if (customerZone) {
        if (Helper.isNullOrUndefined(tenantID) && Helper.isNullOrUndefined(customerID)) {
          messagePost = await Fetch.post({
            url: `/CustomerZone/Message`,
            params: {
              message: message,
              module: module,
              itemID: itemID,
              customerContactID: selectedContact ? selectedContact.ID : '',
            },
            apiUrlOverride: apiUrlOverride
          });
        } else {
          messagePost = await Fetch.post({
            url: `/CustomerZone/Message`,
            params: {
              message: message,
              module: module,
              itemID: itemID,
              customerContactID: selectedContact ? selectedContact.ID : '',
            },
            tenantID: tenantID,
            customerID: customerID,
            apiUrlOverride: apiUrlOverride
          });
        }
      } else {
        let tenantID = Storage.getCookie(Enums.Cookie.tenantID);
        let userID = Storage.getCookie(Enums.Cookie.userID);
        messagePost = await fetch(Config.managerHost + '/Website/HelpRequest', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerID: tenantID,
            customerUserID: userID,
            message: message,
            CommentType: commentType
          })
        });
      }

      if (messagePost) {
        onMessagePost(true);
        toast.setToast({
          message: 'Your message was sent successfully',
          show: true,
          type: 'success'
        });
      } else {
        toast.setToast({
          message: 'There were errors when trying to send the message',
          show: true,
          type: Enums.ToastType.error
        });
      }

      setSending(false);
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="modal-title">
          {title}
        </div>
        <div className="">
          <div className="row">
            <div className="column">
              {customerZone ?
                <>
                  <SCDropdownList
                    options={contacts}
                    value={selectedContact}
                    error={inputErrors.selectedContact}
                    label="From"
                    placeholder="Select contact person"
                    required={true}
                    onChange={setSelectedContact}
                    dataItemKey='ID'
                    textField='FullName'
                  />
                </>
                :
                <>
                  <SCInput
                    label="Your name"
                    required={true}
                    type="text"
                    onChange={handleNameChange}
                    value={name}
                    error={inputErrors.Name}
                    readOnly={!customerZone}
                    autoFocus={customerZone}
                  />
                </>
              }
            </div>
          </div>
          <div className="row">
            <div className="column">
              <SCTextArea
                label="Your question or comment"
                required={true}
                type="text"
                onChange={handleMessageChange}
                value={message}
                error={inputErrors.Message}
                autoFocus={!customerZone}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="cancel">
            <Button text={cancelButtonText} extraClasses="hollow auto" onClick={() => onMessagePost(false)} />
          </div>
          <div className="send">
            <Button text={sending ? "Sending" : sendButtonText} onClick={() => !sending && submitMessage()} extraClasses="auto" />
          </div>
        </div>
      </div>

      <style jsx>{`

      .overlay {
        align-items: center;
        ${customerZone ? "background-color: rgba(0, 0, 0, 0.5);" : "background-color: rgba(19, 106, 205, 0.9);"}
        bottom: 0;
        display: flex;
        justify-content: center;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        ${customerZone ? "z-index: 299;" : "z-index: 9999;"}
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
        .column + .column {
          margin-left: 1.25rem;
        }

        .modal-container {
          ${mobileView ? "width: 85%;" : ""}
        }

       
      `}</style>
    </div>
  );
}

export default MessagePost;
