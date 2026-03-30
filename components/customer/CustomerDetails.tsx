import React, { useState, useEffect } from 'react';
import { colors } from '../../theme';
import Fetch from '../../utils/Fetch';
import ItemComments from '../shared-views/item-comments';
import * as Enums from '../../utils/enums';
import AuditLog from '../shared-views/audit-log';
import Button from '../button';
import FormDefinitionsForItem from '../modals/form-definition/form-definitions-for-item';
import constants from '../../utils/constants';
import CustomerForm from "@/components/customer/CustomerForm";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import {Space} from "@mantine/core";

function CustomerDetails(props) {

  const {
    customer,
    saveToggle,
    triggerSaveComment,
  } = props

  const customerLocations = customer.Locations || [];
  const primaryLocation = customerLocations.filter(location => location.IsPrimary)[0] || customerLocations[0];
  const primaryContact = customer.Contacts.filter(contact => contact.IsPrimary)[0];

  // const [customerType, setCustomerType] = useState(customer.IsCompany ? 'Company' : 'Individual');

  const [formDefinitions, setFormDefinitions] = useState([]);
  const [showFormsModal, setShowFormsModal] = useState(false);


  const formButtonClick = () => {
    setShowFormsModal(true);
  };

  const formsClose = () => {
    setShowFormsModal(false);
  };

  const getFormDefinitions = async () => {
    const request = await Fetch.post({
      url: `/FormDefinition/GetFormDefinitions`,
      params: {}
    } as any);
    let items = request.Results;
    if (items && items.length > 0) {
      setFormDefinitions(items.filter(x => x.FormRule === Enums.FormRule.Customer));
    }
  };

  useEffect(() => {
    getFormDefinitions();
  }, []);

  return (

      <div>
        <CustomerContactLocationSelector
            canClear={false}
            selectedCustomer={props.customer}
            canChangeCustomer={false}
            selectedContact={primaryContact}
            disableCustomerRouterLink
            setSelectedContact={
              (newContact) => {
                if (newContact) {
                    // console.log('new contact', newContact)
                    if(customer.Contacts.some(x => x.ID === newContact.ID)) {
                        props.updateCustomer(
                            {
                                ...customer,
                                Contacts: [...customer.Contacts.map(x => (x.ID === newContact.ID ? {...newContact, IsPrimary: true} : {...x, IsPrimary: /*newContact.isPrimary ? */false /*: x.IsPrimary*/} ))]
                            }
                        )
                    } else {
                        props.updateCustomer(
                            {
                                ...customer,
                                Contacts: [...customer.Contacts.map(x => ({...x, IsPrimary: newContact.IsPrimary ? false : x.IsPrimary})), newContact]
                            },
                            true
                        )
                    }
                }
              }
            }
            selectedLocation={primaryLocation}
            setSelectedLocation={
              (newLocation) => {
                  // console.log('new location', newLocation)
                if (newLocation) {

                    if(customer.Locations.some(x => x.ID === newLocation.ID)) {
                        props.updateCustomer(
                            {
                                ...customer,
                                Locations: [...customer.Locations.map(x => (x.ID === newLocation.ID ? {...newLocation, IsPrimary: true} : {...x, IsPrimary: false} ))]
                            }
                        )
                    } else {
                        props.updateCustomer(
                            {
                                ...customer,
                                Locations: [newLocation, ...customer.Locations.map((x) => ({...x, IsPrimary: newLocation.IsPrimary ? false : x.IsPrimary}))]
                            },
                            true
                        )
                    }
                }
              }
            }
            detailsView={false}
            module={Enums.Module.Customer as any}
            inputErrors={{}}
            accessStatus={props.accessStatus}
            canEdit={false}
            iconMode
            canEditCustomerInNormalView={false}
            {...{} as any}
            canResetContact={false}
            canResetLocation={false}
        />
      {/*  {primaryContact ?
            <div className="contact">
              <p><strong>Primary Contact</strong></p>
              <p>{primaryContact.FirstName + " " + primaryContact.LastName}</p>
              <p>{primaryContact.MobileNumber}</p>
              <p>{primaryContact.EmailAddress}</p>
            </div> : ''
        }
        {primaryLocation
            ? <div className="contact">
              <p><strong>Primary Location</strong></p>
              <p>{primaryLocation.Description}</p>
              <p>{primaryLocation.LocationDisplay}</p>
            </div>
            : ""}*/}

        {formDefinitions.length > 0 ?
            <>
              <div className="forms">
                <Button
                    extraClasses="fit-content"
                    onClick={formButtonClick}
                    text="Forms"
                />
              </div>

              {showFormsModal ?
                  <FormDefinitionsForItem
                      customer={customer}
                      onClose={formsClose}
                      itemID={customer.ID}
                      itemModule={Enums.Module.Customer}
                      linkedFormDefinitions={[]}
                      onlyLinkedForms={false}
                      {...{} as any}
                  /> : ''
              }
            </> : ''
        }

        <Space h={10} />

        <CustomerForm
            {...props}
        />

        <div className="comments-and-history">
          <ItemComments
              itemID={customer.ID}
              module={Enums.Module.Customer}
              storeID={customer.StoreID}
              triggerSave={triggerSaveComment}
              {...{} as any}
          />

          <AuditLog recordID={customer.ID} retriggerSearch={saveToggle}/>
        </div>

        <style jsx>{`
          .inner-container {
            margin-top: 2.5rem;
            position: relative;
          }

          .row {
            display: flex;
          }

          .column {
            display: flex;
            flex-basis: 0;
            flex-direction: column;
            flex-grow: 1;
          }

          .column :global(.textarea-container) {
            height: 100%;
          }

          .column + .column {
            margin-left: 1.25rem;
          }

          .switch {
            flex-direction: row-reverse;
            display: flex;
            flex-basis: 0;
            flex-grow: 1;
          }

          .contact {
            color: ${colors.blueGrey};
            padding-right: 5rem;
            position: relative;
            width: fit-content;
          }

          .contact h1 {
            color: ${colors.darkPrimary};
            font-size: 2rem;
            margin: 0 0 0.75rem;
          }

          .contact p {
            margin: 3px 0 0;
            opacity: 0.8;
          }

          .contact strong {
            color: ${colors.darkPrimary};
            margin-bottom: 0.5rem;
          }

          .contact + .contact {
            margin-top: 1rem;
          }

          .edit {
            cursor: pointer;
            position: absolute;
            right: 0;
            top: 0;
          }

          .heading-row {
            display: flex;
          }

          .heading {
            color: ${colors.blueGrey};
            font-weight: bold;
            margin: 1.5rem 0 0.5rem;
          }

          .customer-type {
            margin-left: 1rem;
            margin-top: 0.9rem;
          }

          .status {
            position: absolute;
            right: 0;
            top: 0;
            width: 20rem;
          }

          .status :global(.input-container) {
            background-color: ${colors.bluePrimary};
          }

          .status :global(input) {
            color: ${colors.white};
          }

          .status :global(label) {
            color: ${colors.white};
            opacity: 0.8;
          }

          .comments-and-history {
            padding-right: 3rem;
          }

          .forms {
            position: absolute;
            right: 0;
            top: 0;
          }

          .form-width-container {
            max-width: ${constants.maxFormWidth};
          }
        `}</style>
      </div>
  );
}

export default CustomerDetails;
