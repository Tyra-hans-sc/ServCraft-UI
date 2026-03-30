import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Search from '../search';
import Pagination from '../pagination';
import Button from '../button';
import EditContact from '../modals/customer/edit-contact';
import CreateContact from '../modals/customer/create-contact';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import ToastContext from '../../utils/toast-context';
import CellBold from '../cells/bold';
import CellBool from '../cells/bool';

function Contacts(props) {

  const [editContact, setEditContact] = useState();

  const editTheContact = (contact) => {
    let temp = props.contacts.find(x => x.ID == contact.ID);
    setEditContact(temp);
  };

  const [addingContact, setAddingContact] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: 'Contact Name',
        accessor: row => row.FirstName + " " + row.LastName,
        Cell: ({ cell: { value } }) => <CellBold value={value} />
      },
      {
        Header: 'Email Address',
        accessor: 'EmailAddress'
      },
      {
        Header: 'Mobile Number',
        accessor: 'MobileNumber'
      },
      {
        Header: 'Primary Contact',
        accessor: 'IsPrimary',
        Cell: ({ cell: { value } }) => <CellBool value={value} />
      },
      {
        Header: 'Accounting Contact',
        accessor: 'IsPrimaryAccount',
        Cell: ({ cell: { value } }) => <CellBool value={value} />
      },
    ],
    []
  );

  function updateContacts(newContact) {
    searchContacts(true);
  }

  const toast = useContext(ToastContext);

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled contacts',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ShowDisabled: false});

  const handleAncillaryFilterChange = (result) => {
    if (result.key == "ShowDisabled") {
      setAncillaryFilters({ ShowDisabled: result.checked });
    }
  };

  const [contactResults, setContactResults] = useState(props.contacts);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);
  const getPageSize = () => {
    let size = Storage.getCookie(Enums.Cookie.pageSize);
    if (size > 0) {
      setPageSize(size);
    }
  };

  useEffect(() => {
    getPageSize();
  }, []);
  
  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (currentPage == 1) {
      searchContacts();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize, ancillaryFilters]);

  const firstUpdatePage = useRef(true);
  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchContacts();
  }, [currentPage]);

  function setSort(field) {
    if (field != sortField) {
      setSortDirection('ascending');
    } else {
      if (sortDirection == 'ascending') {
        setSortDirection('descending');
      } else {
        setSortDirection('ascending');
      }
    }

    setSortField(field);
  }

  async function searchContacts(updateCustomer = false) {

    setSearching(true);

    const searchRes = await Fetch.post({
      url: '/Contact/GetContacts',
      params: {
        customerID: props.customer.ID,
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,
        IsActive: !ancillaryFilters["ShowDisabled"],
      },
      toastCtx: toast
    });

    if (updateCustomer) {
      props.updateCustomer("Contacts", searchRes.Results);
    }

    setContactResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  return (
    <div className="tab-list-container">
      <div className="row">
        <div className="heading">
          Contacts
        </div>
        <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
          text="Add Contact" icon="plus-circle"  extraClasses="fit-content" onClick={() => setAddingContact(true)} />
      </div>

      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Contacts"
            resultsNum={contactResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchContacts}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
      </div>

      <Table 
        actions={[
          {text: "Edit", icon: "edit", function: (row) => editTheContact(row)},
        ]}
        columns={columns} 
        data={contactResults} 
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      <Pagination pageSize={pageSize} setPageSize={setPageSize} currentPage={currentPage} totalResults={totalResults} setCurrentPage={setCurrentPage} />

      { editContact
        ? <EditContact contact={editContact} setEditContact={setEditContact} updateContact={updateContacts} accessStatus={props.accessStatus}/>
        : ''
      }
      { addingContact
        ? <CreateContact customer={props.customer} setCreateContact={setAddingContact} createContact={updateContacts} />
        : ''
      }
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-top: 2.5rem;
          position: relative;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .create {
          max-width: 10rem;
          width: 100%;
        }
        .search-container :global(.search) {
          width: 528px;
        }
      `}</style>
    </div>
  )
}

export default Contacts;
