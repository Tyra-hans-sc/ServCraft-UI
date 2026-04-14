import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as Enums from '../../../utils/enums';
import CustomerSelector from './customer-selector';
import ContactSelector from './contact-selector';
import LocationSelector from './location-selector';
import PS from '../../../services/permission/permission-service';

function CustomerContactLocationSelector({ isNew = false, selectedCustomer, setSelectedCustomer, canChangeCustomer = true, excludedCustomerID = null,
  selectedContact, setSelectedContact, sendFromContact = false, canResetContact = true, canResetLocation = true,
  selectedLocation, setSelectedLocation, canEditCustomerInNormalView = false,
  sendEmail, setSendEmail, sendSMS, setSendSMS, hasSMSCreditsAvailable = false, backButtonText,
  inputErrors, accessStatus, detailsView = false, module = null, canEdit = true, compactView = true, extraClasses, cypressCustomer, cypressContact, cypressLocation,
                                           mode = undefined, iconMode = false, inline = false, mt = undefined,
                                             locationRequired = false,
                                             hideLocation = false,
                                           onCustomersLoaded = null,
                                           onContactsLoaded = null,
                                           onLocationsLoaded = null,
    canClear = undefined, disableCustomerRouterLink = false
}) {

  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));

  const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer));
  const [changeJobLocationPermission] = useState(PS.hasPermission(Enums.PermissionName.ChangeJobLocation));

  const [showAddCustomer, setShowAddCustomer] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [contactTotalResults, setContactTotalResults] = useState(0);
  const [contactSearch, setContactSearch] = useState('');
  const [canChangeContact, setCanChangeContact] = useState(false);

  const [locations, setLocations] = useState([]);
  const [locationTotalResults, setLocationTotalResults] = useState(0);
  const [locationSearch, setLocationSearch] = useState('');
  const [canChangeLocation, setCanChangeLocation] = useState(false);

  const [canSendEmail, setCanSendEmail] = useState(true);
  const [canSendSMS, setCanSendSMS] = useState(true);

  const canEditLocation = useMemo(() => {
    
    if (module === Enums.Module.JobCard) {
      return changeJobLocationPermission;
    }

    return canEdit;

  }, [changeJobLocationPermission, canEdit, module]);

  return (
    <div>
      <CustomerSelector
        isNew={isNew}
        canResetContact={canResetContact}
        canResetLocation={canResetLocation}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        canChangeCustomer={canChangeCustomer}
        excludedCustomerID={excludedCustomerID}
        showAddCustomer={showAddCustomer}
        setShowAddCustomer={setShowAddCustomer}
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
        customersLoaded={onCustomersLoaded}
        contacts={contacts}
        setContacts={(contacts) => {
          setContacts(contacts)
          onContactsLoaded && onContactsLoaded(contacts)
        }}
        setContactTotalResults={setContactTotalResults}
        setContactSearch={setContactSearch}
        setCanChangeContact={setCanChangeContact}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        locations={locations}
        setLocations={(locations) => {
          setLocations(locations)
          onLocationsLoaded && onLocationsLoaded(locations)
        }}
        setLocationTotalResults={setLocationTotalResults}
        setLocationSearch={setLocationSearch}
        setCanChangeLocation={setCanChangeLocation}
        setCanSendEmail={setCanSendEmail}
        setSendEmail={setSendEmail}
        setCanSendSMS={setCanSendSMS}
        setSendSMS={setSendSMS}
        sendFromContact={sendFromContact}
        inputErrors={inputErrors}
        accessStatus={accessStatus}
        customerPermission={customerPermission}
        detailsView={detailsView}
        module={module}
        canEdit={canEdit}
        editCustomerPermission={editCustomerPermission}
        compactView={compactView}
        extraClasses={extraClasses}
        cypress={cypressCustomer}
        canEditCustomerInNormalView={canEditCustomerInNormalView}
        mode={mode || (isNew ? 'edit' : 'view')}
        iconMode={iconMode}
        inline={inline}
        mt={mt}
        canClear={canClear}
        disableCustomerRouterLink={disableCustomerRouterLink}
      />
      <div > {/*className={!detailsView && selectedContact ? `margin-top` : ``}*/}
        <ContactSelector
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          contactSearch={contactSearch}
          setContactSearch={setContactSearch}
          showAddCustomer={showAddCustomer}
          canChangeContact={canChangeContact}
          contacts={contacts}
          setContacts={(contacts) => {
              setContacts(contacts)
              onContactsLoaded && onContactsLoaded(contacts)
          }}
          contactTotalResults={contactTotalResults}
          setContactTotalResults={setContactTotalResults}
          selectedCustomer={selectedCustomer}
          canSendEmail={canSendEmail}
          setCanSendEmail={setCanSendEmail}
          sendEmail={sendEmail}
          setSendEmail={setSendEmail}
          canSendSMS={canSendSMS}
          setCanSendSMS={setCanSendSMS}
          sendSMS={sendSMS}
          setSendSMS={setSendSMS}
          hasSMSCreditsAvailable={hasSMSCreditsAvailable}
          inputErrors={inputErrors}
          accessStatus={accessStatus}
          customerPermission={customerPermission}
          sendFromContact={sendFromContact}
          detailsView={detailsView}
          canEdit={canEdit}
          editCustomerPermission={editCustomerPermission}
          compactView={compactView}
          extraClasses={extraClasses}
          cypress={cypressContact}
          backButtonText={backButtonText}
          mode={mode || (isNew ? 'edit' : 'view')}
          iconMode={iconMode}
          inline={inline}
          canClear={canClear}
        />
      </div>
        {
            !hideLocation &&
            <div> {/* className={!detailsView && selectedLocation ? `margin-top` : ``}*/}
                <LocationSelector
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    locationSearch={locationSearch}
                    setLocationSearch={setLocationSearch}
                    canChangeLocation={canChangeLocation}
                    locations={locations}
                    setLocations={(locations) => {
                      setLocations(locations)
                      onLocationsLoaded && onLocationsLoaded(locations)
                    }}
                    locationTotalResults={locationTotalResults}
                    setLocationTotalResults={setLocationTotalResults}
                    selectedCustomer={selectedCustomer}
                    customerPermission={customerPermission}
                    inputErrors={inputErrors}
                    accessStatus={accessStatus}
                    detailsView={detailsView}
                    showAddCustomer={showAddCustomer}
                    canEdit={canEditLocation}
                    editCustomerPermission={editCustomerPermission}
                    compactView={compactView}
                    extraClasses={extraClasses}
                    cypress={cypressLocation}
                    backButtonText={backButtonText}
                    mode={mode || (isNew ? 'edit' : 'view')}
                    iconMode={iconMode}
                    inline={inline}
                    required={locationRequired}
                    canClear={canClear}
                />
            </div>
        }

        <style jsx>{`
            .margin-top {
                margin-top: 0.5rem;
            }
        `}</style>
    </div>
  );
}

export default CustomerContactLocationSelector;
