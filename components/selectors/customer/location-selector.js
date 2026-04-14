import React, {useState, useEffect, useContext, useCallback, useMemo} from 'react';
import { colors, shadows } from '../../../theme';
// import ManageLocation from '../../modals/location/manage-location';
import ChangeLocation from '../../modals/location/change-location';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import {Box, Combobox, Flex, Text, useCombobox} from "@mantine/core"
import LocationIcon from "@/PageComponents/Icons/LocationIcon";
import {useQuery} from "@tanstack/react-query";
import LocationForm from "@/PageComponents/customer/LocationForm";

function LocationSelector({ selectedLocation, setSelectedLocation, locationSearch, setLocationSearch, canChangeLocation,
  locations, setLocations, locationTotalResults, setLocationTotalResults,
  selectedCustomer, customerPermission, inputErrors, accessStatus, editCustomerPermission, detailsView = false, showAddCustomer, canEdit = true,
  compactView = false,
  extraClasses, cypress, backButtonText, mode = 'edit',
                            iconMode = false, inline = false, required = false, canClear = true
}) {

  useEffect(() => {
    getCountries();
  }, []);


  const handleLocationChangeSC = (e) => {
    setSelectedLocation && setSelectedLocation(e);
  }

  const toast = useContext(ToastContext);

  const [showChangeLocation, setShowChangeLocation] = useState(false);
  const [changedLocation, setChangedLocation] = useState();

  const searchLocationsSC = async (skipIndex, take, filter) => {
    const locationList = await Fetch.post({
      url: `/Location/GetLocations`,
      params: {
        pageSize: take,
        pageIndex: skipIndex,
        searchPhrase: filter,
        sortExpression: "",
        sortDirection: "",
        isActive: true,
        customerID: selectedCustomer ? selectedCustomer.ID : null,
      },
      toastCtx: toast
    });

    const data = locationList.Results.map(x => (
        {
          ...x,
          labelText: x.LocationDisplay + (x.Description && (' (' + x.Description + ')') || '')
        }
    ))

    // setLocations(locationList.Results)

    return { data: data, total: locationList.TotalResults, skipIndex, take, filter };
  }

  const locationListQuery = useQuery(['locations', locationSearch, selectedCustomer], () => Fetch.post({
    url: `/Location/GetLocations`,
    params: {
      pageSize: 1000,
      pageIndex: 0,
      searchPhrase: locationSearch,
      sortExpression: "",
      sortDirection: "",
      isActive: true,
      customerID: selectedCustomer ? selectedCustomer.ID : null,
    },
    toastCtx: toast
  }), {
    onSuccess: (locationList) => {
      setLocations(locationList.Results)
      setLocationTotalResults(locationList.TotalResults)
    },
    refetchOnWindowFocus: false
  })
 /*

this is bad implementation as the query will be redeclared on each rerender, rerunning again
  const searchLocations = async () => {

    const locationList = await Fetch.post({
      url: `/Location/GetLocations`,
      params: {
        pageSize: 100,
        pageIndex: 0,
        searchPhrase: locationSearch,
        sortExpression: "",
        sortDirection: "",
        isActive: true,
        customerID: selectedCustomer ? selectedCustomer.ID : null,
      },
      toastCtx: toast
    });

    setLocations(locationList.Results);
    setLocationTotalResults(locationList.TotalResults);

    return locationList.Results;
  };*/


  /*useEffect(() => {
    if(locations.length === 0 && selectedLocation) {
      // searchLocations()
    }
  }, [selectedLocation])*/


// selected item combobox
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    defaultOpened: false,
    onDropdownOpen: () => combobox.selectOption(locations.findIndex(x => x.ID === selectedLocation.ID) + 1)
  });
  const options = useMemo(() => (
          [
            editCustomerPermission && <Combobox.Option  value={'addNew'}> + Add New</Combobox.Option>,
            ...locations.map((x, i) => (
                <Combobox.Option value={x.ID} key={x.ID}>
                  {x.LocationDisplay} {x.Description ? ` (${x.Description})` : ''}
                </Combobox.Option>
            ))])
      , [locations])
  const handleSelectedOption = useCallback(
      (optionValue) => {
        if(optionValue === 'addNew') {
          if(editCustomerPermission) {
            createLocationClick()
          }
        } else if(typeof optionValue === 'string') {
          setSelectedLocation(locations.find(x => (
              x.ID === optionValue
          )))
        }
      }, [locations])

  useEffect(() => {
    combobox.closeDropdown()
  }, [selectedLocation])


  // MANAGE LOCATION

  const [isNew, setIsNew] = useState(false);
  const [showManageLocation, setShowManageLocation] = useState(false);

  const [editLocation, setEditLocation] = useState();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getCountries();
  }, [editLocation, showChangeLocation, isNew]);

  const getCountries = async () => {

    if ((!editLocation && !showChangeLocation && !isNew) || (countries && countries.length > 0)) {
      return;
    }

    const newCountries = await Fetch.get({
      url: '/Country',
    });
    setCountries(newCountries.Results);
  };

  const createLocationClick = () => {
    if (!editCustomerPermission) return;
    setIsNew(true);
    setShowManageLocation(true);
  };

  const editLocationClick = (location) => {
    setEditLocation(location);
    setIsNew(false);
    setShowManageLocation(true);
  };
    const updateLocations = (location) => {
        const newLocations = locations.map(loc =>
            loc.ID === location.ID ? location : loc
        );

        if (!newLocations.some(loc => loc.ID === location.ID)) {
            newLocations.push(location);
        }

        setLocations(newLocations);

        if (selectedLocation && selectedLocation.ID === location.ID) {
            if (!location.IsActive) {
                setSelectedLocation(null);
            } else {
                setSelectedLocation(location);
            }
        }

        setShowManageLocation(false);
    };

  /*const createLocationJSX = () => (
    isNew && showManageLocation ?
      <LocationForm isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
        onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
      />
      /!*<ManageLocation isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
        onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
      />*!/ : ''
  );*/

  const onLocationCreate = (location) => {
    setLocations([...locations, location]);

    location.IsActive && setSelectedLocation(location);

    setShowManageLocation(false);
  };

  const clearSelection = () => {
    setLocationSearch('');
    setSelectedLocation(undefined);
  };

  const changeCustomerLocation = async () => {
    const locs = locationListQuery.data.Results;
    if (selectedLocation) {
      setChangedLocation(selectedLocation);
      setShowChangeLocation(true);
    } else if (locs && locs.length > 0) {
      setChangedLocation(selectedLocation);
      setShowChangeLocation(true);
    } else {
      createLocationClick();
    }
  };
    
  const changeLocation = (location) => {

    if (location.IsActive) {
      setSelectedLocation(location);
    }

    setChangedLocation(undefined);
    setShowChangeLocation(false);
  };

  if (detailsView) {
    return (
      <>
        <div className="customer-container">
          {!showAddCustomer ?
            selectedLocation ?
              <div className="location">
                {selectedLocation.LocationDisplay} {selectedLocation.Description ? ` (${selectedLocation.Description})` : ""}
                {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess
                  //&& locations && locations.length > 0
                   && canEdit ? <>
                  <img src="/icons/edit.svg" alt="edit" title="Edit location" onClick={changeCustomerLocation} />
                </> : ''}
              </div>
              :
              <div className="location">
                No Location
                {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess
                  //&& locations && locations.length > 0 
                  && canEdit ? <>
                  <img src="/icons/edit.svg" alt="edit" title="Add location" onClick={changeCustomerLocation} />
                </> : ''}
              </div>
            : ''
          }

          <style jsx>{`
          .customer-container {
            line-height: 24px;
            color: ${colors.blueGrey};
            opacity: 0.8;
          }
          .customer-container img {
            /*margin-top: -1rem;*/
            margin-left: 1rem;
            cursor: pointer;
            /* position: absolute; */
            margin-top: -8px;
            margin-bottom: -6px;
          }
          .location {
            margin-top: 3px;
          }
        `}</style>
        </div>

        {/* {createLocationJSX()} */}

        {isNew && showManageLocation ?
          <LocationForm isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
                         defaultValues={{
                        primaryToggle: {
                            alwaysChecked: (locationType) => !locations.some(location => location.LocationType == Enums.LocationType[locationType]),
                            color: (locationType) => !locations.some(location => location.LocationType == Enums.LocationType[locationType]) ?
                                'var(--mantine-color-blue-1)' : undefined,
                        }
                    }}
              />
          /*<ManageLocation isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
          />*/ : ''}

        {showChangeLocation ?
          <ChangeLocation
            locations={locations}
            setLocations={setLocations}
            changeLocation={changeLocation}
            changedLocation={changedLocation}
            setShowChangeLocation={setShowChangeLocation}
            customer={selectedCustomer}
            countries={countries}
            accessStatus={accessStatus}
          /> : ''
        }

      </>
    )
  } else {
    return (
      <div className={compactView ? "" : "section"}>
        <div className="row">
          {!compactView ? <h3>Select Location</h3> : ""}
          {selectedLocation && !compactView
            ? <img src="/icons/x-circle-blue.svg" alt="edit" className="edit" title='Clear selection'
              onClick={clearSelection}
            />
            : ''
          }
        </div>
        {selectedLocation ? (

            <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  handleSelectedOption(val);
                  combobox.closeDropdown();
                }}
                shadow={'sm'}

            >
              <Combobox.Target>
                <Box mt={mode === 'edit' ? 'sm' : 3} maw={500} >
                  {
                      !iconMode &&
                      <Text size={'sm'} className={mode === 'view' ? 'customerViewLabel' : ''}>Location {required && <span style={{color: 'red'}}>*</span>}</Text>
                  }

                  <div className={'selected-contact ' + (combobox.dropdownOpened ? 'active ' : '') + (compactView ? "compact " : "") + (mode === 'edit' ? 'edit-mode' : '')} onClick={combobox.openDropdown}>
                    {
                        iconMode &&
                        <LocationIcon size={23} style={{marginLeft: -3}} />
                    }
                    <Flex direction={'column'} style={{flexGrow: 1}}>
                      <Text w={'calc(100% - 50px)'}>{selectedLocation.LocationDisplay} {selectedLocation.Description ? ` (${selectedLocation.Description})` : ""}</Text>

                      <div className="selected-contact-edit">
                        {editCustomerPermission ? <img src="/specno-icons/edit.svg" alt="edit" className="edit" title='Edit location'
                                                       onClick={(e) => {
                                                         combobox.closeDropdown()
                                                         e.stopPropagation()
                                                         editLocationClick(selectedLocation)
                                                       }}
                        /> : ""}
                        {compactView && canClear ? <img src="/specno-icons/clear.svg" alt="edit" className="edit clear" title='Clear selection' onClick={clearSelection}
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
                addOption={(editCustomerPermission ? { text: "Add new location", action: () => createLocationClick() } : null)}
                onChange={handleLocationChangeSC}
                error={inputErrors.Location}
                label={iconMode ? undefined : "Location"}
                getOptions={searchLocationsSC}
                placeholder={mode === 'view' ? "No location selected " + (iconMode && required ? ' *' : '') : iconMode ? 'Select Location' + (required ? ' *' : '') : "Select preferred location"}
                required={required}
                value={selectedLocation}
                disabled={!canChangeLocation}
                cascadeDependency={selectedCustomer}
                dataItemKey="ID"
                textField="labelText"
                name="locationSelector"
                style={{maxWidth: 500}}
                hoverLabelMode={mode === 'view'}
                mt={mode === 'view' ? 2 : 'sm'}
                iconMantine={iconMode ? <LocationIcon color={'var(--mantine-color-gray-5)'} size={24} /> : undefined}
                canClear={canClear}
            />
          </>
        }

        {/* {createLocationJSX()} */}

        {isNew && showManageLocation ?
          <LocationForm isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
                    defaultValues={{
                        primaryToggle: {
                            alwaysChecked: (locationType) => !locations.some(location => location.LocationType == Enums.LocationType[locationType]),
                            color: (locationType) => !locations.some(location => location.LocationType == Enums.LocationType[locationType]) ?
                                'var(--mantine-color-blue-1)' : undefined,
                        }
                    }}
          />
          /*<ManageLocation isNew={true} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onCancel={() => setShowManageLocation(false)} onSave={onLocationCreate} accessStatus={accessStatus}
          />*/ : ''}

        {!isNew && showManageLocation ?
          <LocationForm isNew={false} location={editLocation} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onSave={updateLocations} onCancel={() => setShowManageLocation(false)} accessStatus={accessStatus} backButtonText={backButtonText}
          />
          /*<ManageLocation isNew={false} location={editLocation} module={Enums.Module.Customer} moduleData={selectedCustomer} countries={countries}
            onSave={updateLocations} onCancel={() => setShowManageLocation(false)} accessStatus={accessStatus} backButtonText={backButtonText}
          />*/
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

export default LocationSelector;
