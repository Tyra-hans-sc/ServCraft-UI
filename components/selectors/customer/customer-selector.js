import React, {useState, useEffect, useContext, useRef, useMemo, useCallback} from 'react';
import { colors, shadows } from '../../../theme';
import { useOutsideClick } from "rooks";
import ToastContext from '../../../utils/toast-context';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import CreateCustomer from '../../modals/customer/create-customer';
import EditCustomer from '../../modals/customer/edit-customer';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import customerService from '@/services/customer/customer-service';
import {Box, Combobox, Flex, Text, useCombobox} from "@mantine/core";
import CustomerIcon from "@/PageComponents/Icons/CustomerIcon";
import Link from 'next/link';

function CustomerSelector({ isNew = false, selectedCustomer, setSelectedCustomer, canChangeCustomer, excludedCustomerID = null,
  showAddCustomer, setShowAddCustomer, canResetContact = true,
  selectedContact, setSelectedContact, setContactSearch, setCanChangeContact, canResetLocation = true, customersLoaded, setContacts, setContactTotalResults, canEditCustomerInNormalView = false,
  selectedLocation, setSelectedLocation, setLocationSearch, setCanChangeLocation, setLocations, setLocationTotalResults,
  sendFromContact = false, setCanSendEmail, setSendEmail, setCanSendSMS, setSendSMS,
  inputErrors, accessStatus, customerPermission, detailsView = false, canEdit = true, compactView = false, canClear = false, ignoreContactLocations = false, module, mode = 'edit',
    iconMode = false, inline = false, mt, disableCustomerRouterLink = false,
}) {

  const toast = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);

  const [defaultView, setDefaultView] = useState(true);

  const addCustomerClick = () => {
    setDefaultView(false);
  };

  const addCustomerRef = useRef();

  useOutsideClick(addCustomerRef, () => {
    if (!defaultView && !showCreateCustomer) {
      setDefaultView(true);
      if (selectedCustomer) setShowAddCustomer(false);
    }
  });

  const [clearContact, setClearContact] = useState(canResetContact ? selectedContact ? false : true : false);

  const oldSelectedCustomer = useRef(selectedCustomer);

  useEffect(() => {
    let doFetch = JSON.stringify(selectedCustomer) !== JSON.stringify(oldSelectedCustomer.current) && !ignoreContactLocations;
    oldSelectedCustomer.current = selectedCustomer;

    if (selectedCustomer && !updateTrigger) {
      doFetch && getContacts();
      setClearContact && setClearContact(true);
      //setClearLocation(true);
      doFetch && getLocations(isNew);
      setCanChangeContact && setCanChangeContact(true);
      setCanChangeLocation && setCanChangeLocation(true);
      setDefaultView && setDefaultView(true);
      setShowAddCustomer && setShowAddCustomer(false);
    }

    setUpdateTrigger(undefined);
  }, [selectedCustomer]);


  const getCustomers = async (skipIndex, take, filter) => {

    const customers = await Fetch.post({
      url: `/Customer/GetCustomers`,
      params: {
        pageSize: take,
        pageIndex: skipIndex,
        searchPhrase: filter,
        sortExpression: "",
        sortDirection: "",
      },
      toastCtx: toast
    });

    let customerResults = customers.Results;
    let totalResults = customers.TotalResults;

    customersLoaded && customersLoaded(customerResults);

    if (excludedCustomerID) {
      customerResults = customerResults.filter(x => x.ID !== excludedCustomerID);
      totalResults -= 1;
    }

    return { customerResults, totalResults };
  };

  /*const customersQuery = useQuery(['customers'], () => getCustomers(0, 100, ''), {
    onSuccess: (data) => {
      console.log(data)
    }
  })*/

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    defaultOpened: false,
    onDropdownOpen: () => combobox.selectOption(customers.findIndex(x => x.ID === selectedContact.ID) + 1)
  });
  // const [fetchedContacts, setLatestContacts] = useState(contacts);
  const options = useMemo(() => (
          [
            customerPermission && <Combobox.Option  value={'addNew'}> + Add New</Combobox.Option>,
            ...customers.map((x, i) => (
                <Combobox.Option value={x.ID} key={x.ID}>
                  {x.FullName}
                </Combobox.Option>
            ))])
      , [customers])

  const handleSelectedOption = useCallback(
      (optionValue) => {
        if(optionValue === 'addNew') {
          if(customerPermission) {
            setShowCreateCustomer(!showCreateCustomer)
          }
        } else if(typeof optionValue === 'string') {
          setSelectedCustomer(customers.find(x => (
              x.ID === optionValue
          )))
        }
      }, [customers])
  // console.log('contacts', contacts )



  const searchCustomersSC = async (skipIndex, take, filter) => {

    const { customerResults, totalResults } = await getCustomers(skipIndex, take, filter);

    return { data: customerResults, total: totalResults };
  };

  const handleCustomerChangeSC = (e) => {
    setSelectedCustomer && setSelectedCustomer(e);

    if (!e) {
      setCanChangeContact && setCanChangeContact(false);
      setContactSearch && setContactSearch('');
      setSelectedContact && setSelectedContact(undefined);

      setLocationSearch && setLocationSearch('');
      setSelectedLocation && setSelectedLocation(undefined);
      setCanChangeLocation && setCanChangeLocation(false);

      if (sendFromContact) {
        setSendEmail && setSendEmail(false);
        setCanSendEmail && setCanSendEmail(false);
        setSendSMS && setSendSMS(false);
        setCanSendSMS && setCanSendSMS(false);
      }
    } else {
      setCanChangeContact && setCanChangeContact(true);
      setCanChangeLocation && setCanChangeLocation(true);
    }
  }

  const getContacts = async () => {
    const results = await Fetch.get({
      url: `/Contact`,
      params: {
        pageSize: 200,
        pageIndex: 0,
        includeClosed: true,
        customerID: selectedCustomer.ID,
      },
      toastCtx: toast
    });
    let contactList = [...results.Results];
    let totalContacts = results.TotalResults;

    setContacts && setContacts(contactList);
    setContactTotalResults && setContactTotalResults(totalContacts);

    if (clearContact && canResetContact) {
      if (detailsView) {
        if (contactList.length > 0) {
          setSelectedContact && setSelectedContact(contactList.filter(x => x.IsPrimary)[0] || contactList[0]);
        } else {
          setSelectedContact && setSelectedContact(undefined);
        }
      } else {
        if (contactList.length == 1) {
          setContactSearch && setContactSearch(contactList[0].FirstName + " " + contactList[0].LastName);
          setSelectedContact && setSelectedContact(contactList[0]);
        } else {
          if ((selectedContact && selectedCustomer && selectedContact.CustomerID === selectedCustomer.ID) === false) {
            setContactSearch && setContactSearch('');
            setSelectedContact && setSelectedContact(undefined);

            if (sendFromContact) {
              setSendEmail && setSendEmail(false);
              setCanSendEmail && setCanSendEmail(false);
              setSendSMS && setSendSMS(false);
              setCanSendSMS && setCanSendSMS(false);
            }
          }
        }
      }
    }
  };

  const [clearLocation, setClearLocation] = useState(false);

  const firstLoadRef = useRef(!isNew);
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    if (selectedLocation && canResetLocation) {
      setClearLocation(false);
    } else {
      setClearLocation(true);
    }
  }, [selectedLocation]);

  const getLocations = async (overrideClear = false) => {

    const results = await Fetch.get({
      url: `/Location`,
      params: {
        pageSize: 200,
        pageIndex: 0,
        includeClosed: true,
        customerID: selectedCustomer.ID,
      },
      toastCtx: toast
    });
    let locationList = [...results.Results];
    let totalLocations = results.TotalResults;

    setLocations && setLocations(locationList);
    setLocationTotalResults && setLocationTotalResults(totalLocations);

    if ((clearLocation || overrideClear) && canResetLocation) {
      if (detailsView) {
        if (locationList.length > 0) {
          setSelectedLocation && setSelectedLocation(locationList.filter(x => x.IsPrimary)[0] || locationList[0]);
        } else {
          setSelectedLocation && setSelectedLocation(undefined);
        }
      } else {
        if (locationList.length == 1) {
          setLocationSearch && setLocationSearch(locationList[0].LocationDisplay);
          setSelectedLocation && setSelectedLocation(locationList[0]);
        } else {
          if ((selectedLocation && selectedCustomer && selectedLocation.CustomerID === selectedCustomer.ID) === false) {
            setLocationSearch && setLocationSearch('');
            setSelectedLocation && setSelectedLocation(undefined);
          }
        }
      }
    }
  };

  // CREATE CUSTOMER

  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customerCreateState, setCustomerCreateState] = useState(false);

  const createCustomerJSX = () => (
    showCreateCustomer ?
      <CreateCustomer setShowCreateCustomer={setShowCreateCustomer} createCustomer={onCustomerCreate} />
      : ''
  );

  useEffect(() => {
    if (customerCreateState) {
      setSelectedCustomer(customers ? customers[0] : undefined);
      setCustomerCreateState(false);
    }
  }, [customerCreateState]);

  const onCustomerCreate = (customer) => {
    setCustomers([customer]);
    setSelectedContact(customer.Contacts ? customer.Contacts[0] : undefined);

    if (sendFromContact) {
      setSendEmail(customer.Contacts ? customer.Contacts[0].SendEmail : false);
      setCanSendEmail(customer.Contacts ? customer.Contacts[0].SendEmail : false);
      setSendSMS(customer.Contacts ? customer.Contacts[0].SendSMS : false);
      setCanSendSMS(customer.Contacts ? customer.Contacts[0].SendSMS : false);
    }

    setCustomerCreateState(true);
    setCanChangeContact(true);
    setCanChangeLocation(true);
    toast.setToast({
      message: 'Customer created successfully',
      show: true,
      type: 'success'
    });
  };

  // EDIT CUSTOMER

  const [editCustomer, setEditCustomer] = useState(undefined);
  const [updateTrigger, setUpdateTrigger] = useState();

  const editTheCustomer = async () => {
    if (selectedCustomer) {

      let customerToEdit = await customerService.getCustomer(selectedCustomer.ID);

      // let customerToEdit = {
      //   ...selectedCustomer
      // };
      setEditCustomer(customerToEdit);
    }
  };

  const updateCustomer = (updatedCustomer) => {
    setUpdateTrigger(updatedCustomer);
    toast.setToast({
      message: 'Customer saved successfully',
      show: true,
      type: 'success'
    });
  };

  useEffect(() => {
    if (updateTrigger) {
      setSelectedCustomer(updateTrigger);
    }
  }, [updateTrigger]);

  const changeCustomer = () => {
    setShowAddCustomer(true);
    setDefaultView(false);
  };

  if (detailsView) {
    return (
      <>
        {showAddCustomer ?
          <>
            {/* <div className={`add-customer-box ${defaultView ? 'flex-show' : ''} ${inputErrors.Customer ? ' error' : ''}`} onClick={addCustomerClick}>
              <div className="add-customer-image">
                <img src="/icons/user-plus-blue.svg" alt="customer-add" />
              </div>
              {module ?
                <div className="add-customer-label">
                  Add a customer to your {Enums.getEnumStringValue(Enums.Module, module).toLowerCase()}
                </div> : ''
              }
            </div> */}

            <div className={`add-customer-search show`} ref={addCustomerRef}>
              <SCComboBox
                addOption={(customerPermission ? { text: "Add new customer", action: () => setShowCreateCustomer(!showCreateCustomer) } : null)}
                getOptions={searchCustomersSC}
                // forceFetch={(!selectedContact && !!customersLoaded)}
                onChange={handleCustomerChangeSC}
                value={selectedCustomer}
                error={inputErrors.Customer}
                label="Customer"
                required={true}
                disabled={!canChangeCustomer}
                dataItemKey={"ID"}
                textField={"CustomerName"}
                placeholder="Search for a customer"
                filterFunction={(text, item) => true}
                canClear={canClear}
              />
            </div>
          </>
          :
          <>
            <div className="customer-container">
              <div className="customer-header">
                <h3>
                  {selectedCustomer ? (
                      disableCustomerRouterLink ? selectedCustomer.CustomerName :
                        <Link href={`/customer/${selectedCustomer.ID}`} style={{ textDecoration: 'none' }}>
                            <Text fw={600} c={'scBlue'}>
                                {selectedCustomer.CustomerName}
                            </Text>
                        </Link>
                  ) : ''}
                </h3>
                {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit ? <>
                  <img src="/icons/edit.svg" alt="edit" title="Edit customer" onClick={editTheCustomer} />
                </> : ''}
              </div>

              {canChangeCustomer ?
                <div className="customer-button" onClick={changeCustomer}>
                  Change customer
                </div> : ''
              }
            </div>
          </>
        }

        {createCustomerJSX()}

        {editCustomer ?
          <EditCustomer
            customer={editCustomer}
            setEditCustomer={setEditCustomer}
            updateCustomer={updateCustomer}
          />
          : ''
        }

        <style jsx>{`
          .add-customer-box {
            margin-top: 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: ${colors.backgroundGrey};
            width: 500px;
            height: 150px;
            cursor: pointer;
            display: none;
          }
          .add-customer-box img {
            width: 72px;
            height: auto;
          }
          .add-customer-search {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* background-color: ${colors.backgroundGrey}; */
            /* width: calc(500px - 1rem); */
            /* height: 150px; */
            /* padding: 0 0.5rem; */
            display: none;
          }
          .customer-container {  
            /* width: 35%; */
            /* line-height: 32px; */
            color: ${colors.darkPrimary};
          }

          .customer-header {
            display: flex;
            font-weight: bold;
            margin-top: 1rem;
          }
          .customer-header h3 {
            /* font-size: 2rem; */
            margin: 0 0 0 0;
            opacity: 0.8;
          }
          .customer-header img {
            margin-left: 1rem;
            margin-top: 0rem;
            cursor: pointer;
          }
          .customer-button {
            color: ${colors.bluePrimary};
            cursor: pointer;
            margin-bottom: 0.5rem;
            width: fit-content;
          }
          
          .contact p {
            margin: 3px 0 0;
            opacity: 0.8;
          }
          .contact div {
            margin: 3px 0 0;
            opacity: 0.8;
          }

          .flex-show {
            display: flex;
          }
          .show {
            display: block;
          }
          .error {
            border: 1px solid ${colors.warningRed};
          }
        `}</style>
      </>
    );
  } else {

    if(selectedCustomer) {
      return (
          <>
            <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  handleSelectedOption(val);
                  combobox.closeDropdown();
                }}
                shadow={'sm'}
            >
              <Combobox.Target>
                <Box mt={mt ?? 'sm'} maw={500}>
                  {
                      !iconMode &&
                      <Text size={'sm'} className={mode === 'view' ? 'customerViewLabel' : ''}>Customer</Text>
                  }
                  <div className={'selected-contact ' + (combobox.dropdownOpened ? 'active ' : '') + (compactView ? "compact " : "selected-contact ") + (mode === 'edit' ? 'edit-mode' : '')}
                       // onClick={combobox.openDropdown}
                  >
                    {
                        iconMode &&
                        <CustomerIcon color={'inherit'} size={23} style={{marginLeft: -3}} />
                    }
                    <Flex direction={'column'} style={{flexGrow: 1}}>
                      <p style={{maxWidth: 'calc(100% - 50px)'}}>
                        {selectedCustomer ? (
                            disableCustomerRouterLink ? selectedCustomer.CustomerName :
                                <Link href={`/customer/${selectedCustomer.ID}`} style={{ textDecoration: 'none' }}>
                                    <Text fw={600} c={'scBlue'}>
                                        {selectedCustomer.CustomerName}
                                    </Text>
                                </Link>
                        ) : ''}
                      </p>
                      <span className="selected-contact-edit">
                    {
                      accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ?
                          <img src="/specno-icons/edit.svg"
                               alt="edit"
                               className="edit"
                               title='Edit customer'
                               style={{ cursor: "pointer"}}
                               onClick={editTheCustomer}
                          /> : ""
                    }
                        {
                          canChangeCustomer ? <img src="/specno-icons/clear.svg" alt="edit" className="edit clear" title='Clear selection' onClick={() => {handleCustomerChangeSC(null)}}
                                                   style={{ cursor: "pointer", marginLeft: 8 }}/>
                              : ""
                        }
                  </span>
                    </Flex>

                    {/*<span style={{float: 'inline-end', marginLeft: 'auto'}}>
                  {
                    selectedCustomer && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ?
                        <img src="/specno-icons/edit.svg"
                             alt="edit"
                             className="edit"
                             title='Edit customer'
                             style={{ cursor: "pointer"}}
                             onClick={editTheCustomer}
                        /> : ""
                  }
                  {
                    canChangeCustomer ? <img src="/specno-icons/clear.svg" alt="edit" className="edit" title='Clear selection' onClick={() => {handleCustomerChangeSC(null)}}
                                             style={{ cursor: "pointer", marginLeft: 8 }}/>
                        : ""
                  }
                </span>*/}
                  </div>



                </Box>
              </Combobox.Target>

              <Combobox.Dropdown style={{boxShadow: shadows.combobox}}>
                <Combobox.Options>
                  {options}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            {editCustomer ?
                <EditCustomer
                    customer={editCustomer}
                    setEditCustomer={setEditCustomer}
                    updateCustomer={updateCustomer}
                />
                : ''
            }
          </>
      )

    } else {
      return (
          <div className={compactView ? "" : "section"} style={{ position: "relative", maxWidth: "500px" }}>
            {!compactView ? <h3>Customer</h3> : ""}
            <SCComboBox
                addOption={(customerPermission ? { text: "Add new customer", action: () => setShowCreateCustomer(!showCreateCustomer) } : null)}
                getOptions={searchCustomersSC}
                forceFetch={!selectedContact && customersLoaded}
                onChange={handleCustomerChangeSC}
                value={selectedCustomer}
                error={inputErrors.Customer}
                label={iconMode ? undefined : "Customer"}
                required={true}
                disabled={!canChangeCustomer}
                dataItemKey={"ID"}
                textField={"CustomerName"}
                placeholder={iconMode ? ('Select Customer *') : "Search for a customer"}
                filterFunction={(text, item) => true}
                hoverLabelMode={mode === 'view'}
                iconMantine={iconMode ? <CustomerIcon color={'var(--mantine-color-gray-5)'} size={23} /> : undefined}
                mt={mt}
            />

            {selectedCustomer && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ? <>
              <img style={{ cursor: "pointer", position: "absolute", right: 36, top: 24 }} src="/specno-icons/edit.svg" alt="edit" title="Edit customer" onClick={editTheCustomer} />
            </> : ''}
            {createCustomerJSX()}

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

        `}</style>
          </div>
      )
    }

    /*return (
        <>
          {
            selectedCustomer ? (
                    <div className={compactView ? "selected-contact compact" : "selected-contact"}
                         style={{
                           maxWidth: 500,
                           width: '100%',
                           marginTop: 10
                         }}
                    >
                      <span>Customer</span>
                      <p>{selectedCustomer?.CustomerName}</p>
                      <div className="selected-contact-edit">
                        {
                          /!*selectedCustomer && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ? <>
                            <img style={{ cursor: "pointer", position: "absolute", right: 36, top: 24 }} src="/specno-icons/edit.svg" alt="edit" title="Edit customer" onClick={editTheCustomer} />
                          </> : ''*!/
                        }
                        {
                          selectedCustomer && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ?
                            <img src="/specno-icons/edit.svg"
                                 alt="edit"
                                 className="edit"
                                 title='Edit customer'
                                 style={{ cursor: "pointer"}}
                                 onClick={editTheCustomer}
                            /> : ""
                        }
                        {
                          canChangeCustomer ? <img src="/specno-icons/clear.svg" alt="edit" className="edit" title='Clear selection' onClick={() => {handleCustomerChangeSC(null)}}
                                            style={{ cursor: "pointer", marginLeft: 8 }}/>
                              : ""
                        }
                      </div>
                    </div>
                ) :
                <div className={compactView ? "" : "section"} style={{ position: "relative", maxWidth: "500px" }}>
                  {!compactView ? <h3>Customer</h3> : ""}
                  <SCComboBox
                      addOption={(customerPermission ? { text: "Add new customer", action: () => setShowCreateCustomer(!showCreateCustomer) } : null)}
                      getOptions={searchCustomersSC}
                      onChange={handleCustomerChangeSC}
                      value={selectedCustomer}
                      error={inputErrors.Customer}
                      label="Customer"
                      required={true}
                      disabled={!canChangeCustomer}
                      dataItemKey={"ID"}
                      textField={"CustomerName"}
                      placeholder="Search for a customer"
                      filterFunction={(text, item) => true}
                  />

                  {selectedCustomer && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && customerPermission && canEdit && canEditCustomerInNormalView ? <>
                    <img style={{ cursor: "pointer", position: "absolute", right: 36, top: 24 }} src="/specno-icons/edit.svg" alt="edit" title="Edit customer" onClick={editTheCustomer} />
                  </> : ''}
                  {createCustomerJSX()}

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

        `}</style>
                </div>
          }



          {editCustomer ?
              <EditCustomer
                  customer={editCustomer}
                  setEditCustomer={setEditCustomer}
                  updateCustomer={updateCustomer}
              />
              : ''
          }
        </>

    );*/
  }
}

export default CustomerSelector;
