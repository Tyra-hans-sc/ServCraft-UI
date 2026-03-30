import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../kendo/kendo-pager';
import Button from '../button';
import ManageContact from '../modals/contact/manage-contact';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import Storage from '../../utils/storage';
import ToastContext from '../../utils/toast-context';

import CellStatus from '../cells/status-old';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellWide from '../cells/wide';
import CellBool from '../cells/bool';

import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';

function Contacts({ module, moduleData, contacts, updateModuleData, accessStatus, editCustomerPermission }) {

  const rowClick = (row) => {
    editContact(row.original);
  };

  useEffect(() => {
    let temp = [      
      {
        Header: 'Contact Name',
        accessor: 'FullName',
        ColumnName: 'FullName',
        CellType: 'string',
      },
      {
        Header: 'Email Address',
        accessor: 'EmailAddress',
        ColumnName: 'EmailAddress',
        CellType: 'string',
      },
      {
        Header: 'Mobile Number',
        accessor: 'MobileNumber',
        ColumnName: 'MobileNumber',
        CellType: 'string',
      },
      {
        Header: 'Designation',
        accessor: 'DesignationDescription',
        ColumnName: 'DesignationDescription',
        CellType: 'string',
      },
      {
        Header: 'Primary Contact',
        accessor: 'IsPrimary',
        ColumnName: 'IsPrimary',
        CellType: 'icon',
      }
    ];

    if (module == Enums.Module.Customer) {
      temp.push({
        Header: 'Accounting Contact',
        accessor: 'IsPrimaryAccount',
        ColumnName: 'IsPrimaryAccount',
        CellType: 'icon',
      });
    } else if (module == Enums.Module.Supplier) {
      temp.splice(1, 0, {
        Header: 'User Name',
        accessor: 'UserName',
        ColumnName: 'UserName',
        CellType: 'string',
      });
    }

    setColumnState(temp);
  }, [module]);

  const [columnState, setColumnState] = useState([]);

  const columns = useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Header,
        accessor: column.accessor,
        // for table resize columns
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
        // for table resize columns
      };

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'employee':
            columnObject['Cell'] = ({ cell: { value } }) => <CellTech value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
            break;
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
          case 'currency':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellCurrency value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellCurrency {...props} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={columnObject.accessor} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={columnObject.accessor} />;
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={column.accessor == 'IsClosed' ? !value : value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} invertValue={column.ColumnName == 'IsClosed'} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDisplay') {
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      if (column.ColumnName == 'CustomerContactFullName') {
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState]
  );

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

  const [contactResults, setContactResults] = useState(contacts);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setContactResults(contacts);
  }, [contacts]);

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

  const [showManageContact, setShowManageContact] = useState(false);
  const [contactToEdit, setContactToEdit] = useState();
  const [isNewContact, setIsNewContact] = useState(true);

  const createNewContact = () => {
      setIsNewContact(true);
      setShowManageContact(true);
  };

  const editContact = (contact) => {
      let temp = contactResults.find(x => x.ID == contact.ID);
      setContactToEdit(temp);
      setIsNewContact(false);
      setShowManageContact(true);
  };

  const onSave = (contact) => {
      setShowManageContact(false);
      setContactToEdit(undefined);    
      searchContacts(contact);
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
              text="Add Contact" icon="plus-circle" extraClasses="fit-content no-margin" onClick={() => createNewContact()} />
            : ""}
        </div>          
      </div>

      <div className="margin-top">
        {contactResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => editContact(row) },
          ]}
          columns={columns}
          data={contactResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="Contact"
          heightOffset={295}
          highlightColumnName="Contact"
        /> : ""}
      </div>   

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      {showManageContact ? 
          <ManageContact isNew={isNewContact} contact={contactToEdit} module={module} moduleData={moduleData} 
            onSave={onSave} onCancel={() => setShowManageContact(false)} accessStatus={accessStatus}
          /> : ''
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
        .margin-top {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default Contacts;
