import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Search from '../search';
import KendoPager from '../kendo/kendo-pager';
import Button from '../button';
import EditContact from '../modals/contact/edit-contact';
import CreateContact from '../modals/contact/create-contact';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import Storage from '../../utils/storage';
import ToastContext from '../../utils/toast-context';
import CellBold from '../cells/bold';
import CellBool from '../cells/bool';

function Contacts({ module, moduleData, updateModuleData, accessStatus, editCustomerPermission }) {

  const [editContact, setEditContact] = useState();

  const editTheContact = (contact) => {
    let temp = contactResults.find(x => x.ID == contact.ID);
    setEditContact(temp);
  };

  const [addingContact, setAddingContact] = useState(false);

  const getColumnData = () => {
    let temp = [
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
      }
    ];

    if (module == Enums.Module.Customer) {
      temp.push({
        Header: 'Accounting Contact',
        accessor: 'IsPrimaryAccount',
        Cell: ({ cell: { value } }) => <CellBool value={value} />
      });
    } else if (module == Enums.Module.Supplier) {
      temp.splice(1, 0, {
        Header: 'User Name',
        accessor: 'UserName',
      });
    }

    return temp;
  };

  const columns = useMemo(
    () => getColumnData(), []
  );

  function updateContacts() {
    searchContacts(true);
  }

  const toast = useContext(ToastContext);

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled contacts',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ ShowDisabled: false });

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      let oldFilters = { ...ancillaryFilters };
      Object.keys(oldFilters).filter(key => !result.ignore.includes(key)).forEach(key => oldFilters[key] = false);
      setAncillaryFilters(oldFilters);
    } else {
      setAncillaryFilters({
        ...ancillaryFilters,
        [result.key]: result.checked
      });
    }
  };

  const [contactResults, setContactResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    if (size != pageSize) {
      setPageSize(size);
    }
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

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
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  const searchContacts = async (update = false) => {

    setSearching(true);

    let url = '';
    let params = {
      pageSize: pageSize,
      pageIndex: (currentPage - 1),
      searchPhrase: searchVal,
      SortExpression: sortField,
      SortDirection: sortDirection,
      IsActive: !ancillaryFilters["ShowDisabled"]
    };

    if (module == Enums.Module.Customer) {
      url = '/Contact/GetContacts';
      params = { ...params, customerID: moduleData.ID };
    } else {
      url = '/SupplierContact/GetContacts';
      params = { ...params, supplierID: moduleData.ID };
    }

    const searchRes = await Fetch.post({
      url: url,
      params: params,
      toastCtx: toast
    });

    if (update) {
      updateModuleData("Contacts", searchRes.Results, false);
    }

    setContactResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  };

  return (
    <div className="tab-list-container">
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
        <div className="create">
          {editCustomerPermission ?
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text="Add Contact" icon="plus-circle" extraClasses="fit-content no-margin" onClick={() => setAddingContact(true)} />
            : ""}
        </div>          
      </div>

      <Table
        actions={[
          { text: "Edit", icon: "edit", function: (row) => editTheContact(row) },
        ]}
        columns={columns}
        data={contactResults}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal}  parentPageNumber={currentPage}/>

      {editContact
        ? <EditContact module={module} contact={editContact} setEditContact={setEditContact} updateContact={updateContacts} accessStatus={accessStatus} />
        : ''
      }
      {addingContact
        ? <CreateContact module={module} moduleData={moduleData} setCreateContact={setAddingContact} createContact={updateContacts} />
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
          margin-top: 0.5rem;
        }
        .search-container :global(.search) {
          width: 528px;
        }
      `}</style>
    </div>
  )
}

export default Contacts;
