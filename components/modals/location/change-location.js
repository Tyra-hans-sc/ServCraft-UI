import React, { useState, useContext, useEffect } from 'react';
import { colors } from '../../../theme';
import Button from '../../button';
// import ManageLocation from './manage-location';
import Search from '../../search';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import PS from '../../../services/permission/permission-service';
import LocationForm from "@/PageComponents/customer/LocationForm";

function ChangeLocation({ locations, setLocations, changedLocation, changeLocation, customer, setCustomer, countries, setShowChangeLocation, accessStatus }) {

  const toast = useContext(ToastContext);

  const [localChangedLocation, setLocalChangedLocation] = useState(changedLocation);

  const [isNew, setIsNew] = useState(false);
  const [showManageLocation, setShowManageLocation] = useState(false);

  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
  const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer));

  let editLocationPropogation = true;

  const onLocationClick = (location) => {
    if (editLocationPropogation) {
      setLocalChangedLocation(location);
      setTimeout(() => {
        changeLocation(location);
      }, 200);
    }
  };

  const createLocation = (location) => {
    setLocations([...locations, location]);
    setLocalChangedLocation(location);
    changeLocation(location);

    setShowManageLocation(false);
  };

  const createLocationClick = () => {
    setIsNew(true);
    setShowManageLocation(true);
  };

  const [editLocation, setEditLocation] = useState(null);

  function updateLocation(updatedLocation) {
    let newLocations = customer.Locations.filter(contact => contact.ID != updatedLocation.ID);
    newLocations.push(updatedLocation);
    if (setCustomer) {
      const updatedCustomer = {
        ...customer,
        Locations: newLocations
      };
      setCustomer(updatedCustomer);
    }
    editLocationPropogation = true;
    onLocationClick(updatedLocation);
    console.log('updated location', updatedLocation);

    setShowManageLocation(false);
  }

  const onEditLocationClick = (location) => {
    setEditLocation(location);
    editLocationPropogation = false;

    setIsNew(false);
    setShowManageLocation(true);
  };

  const [searchVal, setSearchVal] = useState('');
  const [searching, setSearching] = useState(false);

  const [localLocations, setLocalLocations] = useState(locations);

  const searchLocations = async () => {

    setSearching(true);

    let locationList = [...locations];
    if (!Helper.isNullOrWhitespace(searchVal)) {
      let searcher = searchVal.toLowerCase().trim();
      locationList = locationList.filter(x => 
        x.Description.toLowerCase().includes(searcher)
        || (x.AddressLine1 && x.AddressLine1.toLowerCase().includes(searcher))
        || (x.AddressLine2 && x.AddressLine2.toLowerCase().includes(searcher))
        || (x.AddressLine3 && x.AddressLine3.toLowerCase().includes(searcher))
        || (x.AddressLine4 && x.AddressLine4.toLowerCase().includes(searcher))
        || (x.AddressLine5 && x.AddressLine5.toLowerCase().includes(searcher))
      );
    }

    setLocalLocations(locationList);
    setSearching(false);
  };

  useEffect(() => {
    searchLocations();
  }, [localChangedLocation]);

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">

        <div className="row">
          <div className="search-container">
            <Search
              placeholder="Search Locations"
              resultsNum={localLocations.length}
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              searchFunc={searchLocations}
            />
          </div>
        </div>

        <div className="locations-container">
          {localLocations && localLocations.map(function (location, index) {
            return (
              <div key={index} className={`location-container ${localChangedLocation && localChangedLocation.ID == location.ID ? 'change-selected-location' : ''}`} onClick={() => onLocationClick(location)}>
                {editCustomerPermission ?
                  <div className="edit-location-container" title="Edit location" onClick={() => onEditLocationClick(location)}>
                    <img src="/icons/edit.svg" alt="edit" className="edit" />
                  </div>
                  : ''}
                {location.IsPrimary ?
                  <div className="primary-location">
                    Primary Location
                  </div>
                  : ''
                }
                <div className="description">
                  {location.Description}
                </div>
                <div className="display">
                  {location.LocationDisplay}
                </div>
              </div>
            )
          })}
        </div>

        {showManageLocation ?
          /*<ManageLocation isNew={isNew} location={isNew ? null : editLocation} module={Enums.Module.Customer} moduleData={customer}
            countries={countries} onSave={isNew ? createLocation : updateLocation} onCancel={() => setShowManageLocation(false)} accessStatus={accessStatus}
          />*/
          <LocationForm isNew={isNew} location={isNew ? null : editLocation} module={Enums.Module.Customer} moduleData={customer}
            countries={countries} onSave={isNew ? createLocation : updateLocation} onCancel={() => setShowManageLocation(false)} accessStatus={accessStatus}
          />
          : ''
        }

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => setShowChangeLocation(false)} />
            {editCustomerPermission ?
                <Button text="Add new location" icon="plus-circle" extraClasses="auto left-margin" onClick={createLocationClick} />
              
              : ''}
        </div>
      </div>

      <style jsx>{`
        .locations-container {
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
        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }
        .space-between {
          justify-content: space-between;
        }
        .justify-end {
          display: flex;
          justify-content: flex-end;
        }
        .location-container {
          background-color: ${colors.white};
          box-shadow: 0px 8px 16px rgba(51, 51, 51, 0.1);
          box-sizing: border-box;
          border-radius: 3px;
          margin: 0.5rem 0 0;
          padding: 1.5rem 1rem;
          cursor: pointer;
          position: relative;
        }
        .location-container:last-child {
          margin-bottom: 1rem;
        }
        .location-container:hover {
          box-shadow: 0px 8px 16px rgba(51, 51, 51, 0.3);
        }
        .edit-location-container {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }
        .change-selected-location {
          border: 2px solid ${colors.bluePrimary};
        }
        .primary-location {
          color: ${colors.bluePrimary};
        }
        .description {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .display {
          color: ${colors.labelGrey};
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

export default ChangeLocation
