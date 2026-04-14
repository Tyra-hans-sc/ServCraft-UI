import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Fetch from '../../utils/Fetch';
import useOutsideClick from "../../hooks/useOutsideClick";
import SelectInput from '../select-input';
import CreateCustomer from '../modals/customer/create-customer';

function InvoiceAddCustomer({selectCustomerFunc, defaultView, error}) {

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerID, setSelectedCustomerID] = useState();
  const [searching, setSearching] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersTotalResults, setCustomersTotalResults] = useState();
  const handleCustomerChange = (e) => {
    setCustomerSearch(e.target.value);
  }

  useEffect(() => {
    if (selectedCustomerID) {
      selectCustomerFunc(selectedCustomerID);
    }
  }, [selectedCustomerID]);

  async function searchCustomers() {
    setSearching(true);

    const customers = await Fetch.post({
      url: `/Customer/GetCustomers`,
      params: {
        pageSize: 10, 
        pageIndex: 0,
        searchPhrase: customerSearch,
        sortExpression: "", 
        sortDirection: "",
        populatedList: true,
      },
    });

    setCustomers(customers.Results);
    setCustomersTotalResults(customers.TotalResults);
    setSearching(false);
  }

  const [localDefaultView, setLocalDefaultView] = useState(defaultView);
  function addCustomerClick() {
    setLocalDefaultView(false);
  }

  const addCustomerRef = useRef();
  useOutsideClick(addCustomerRef, () => {
    if (!localDefaultView && !showCreateCustomer) {
      setLocalDefaultView(true);
      selectCustomerFunc(null);
    }
  });

  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const createCustomer = (customer) => {
    selectCustomerFunc(customer.ID);
  }

  return (
    <div>
      <div className={`add-customer-box ${localDefaultView ? 'flex-show' : ''} ${error ? ' error' : ''}`} onClick={addCustomerClick}>
        <div className="add-customer-image">
          <img src="/icons/user-plus-blue.svg" alt="customer-add" />
        </div>
        <div className="add-customer-label">
          Add a customer to your invoice
        </div>
      </div>

      { selectedCustomerID ?
        '' :
        <div className={`add-customer-search ${localDefaultView ? '' : 'show'}`} ref={addCustomerRef}>
          <SelectInput
            addOption={{text: "Add new customer", action: () => setShowCreateCustomer(!showCreateCustomer)}}
            changeHandler={handleCustomerChange} 
            label="Customer name"
            options={customers}
            placeholder="Search for a customer"
            required={true}
            searchFunc={searchCustomers}
            searching={searching}
            setSelected={(e) => {setSelectedCustomerID(e.ID)}}
            totalOptions={customersTotalResults}
            type="customer"
            value={customerSearch}
          />
        </div>
      }

      { showCreateCustomer ? 
        <CreateCustomer setShowCreateCustomer={setShowCreateCustomer} createCustomer={createCustomer} />
        : ''
      }

      <style jsx>{`
        .add-customer-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: ${colors.backgroundGrey};
          width: 320px;
          height: 232px;
          cursor: pointer;
          display: none;
        }
        .add-customer-box img {
          width: 72px;
          height: auto;
        }
        .add-customer-label {

        }
        .add-customer-search {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: ${colors.backgroundGrey};
          width: 320px;
          height: 232px;
          display: none;
        }
        .customer-selected {

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
    </div>
  );
}

export default InvoiceAddCustomer;
