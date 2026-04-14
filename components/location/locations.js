import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../kendo/kendo-pager';
import Button from '../button';
// import ManageLocation from '../modals/location/manage-location';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import ToastContext from '../../utils/toast-context';
import CustomerService from '../../services/customer/customer-service';

import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellWide from '../cells/wide';
import CellBool from '../cells/bool';
import CellStatus from '../cells/status-old';

import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import LocationForm from "../../PageComponents/customer/LocationForm";

function Locations({ module, moduleData, locations, updateModuleData, accessStatus, editCustomerPermission }) {

  const rowClick = (row) => {
    editLocation(row.original);
  };

  const [countries, setCountries] = useState([]);
  
  const [columnState, _] = useState([{
      Header: 'Description',
      accessor: 'Description',
      ColumnName: 'Description',
      CellType: 'string',
    }, {
      Header: 'Type',
      accessor: 'LocationType',
      ColumnName: 'LocationType',
      CellType: 'status',
    },
    {
      Header: 'Address',
      accessor: 'LocationDisplay',
      ColumnName: 'LocationDisplay',
      CellType: 'string',
    },
    {
      Header: 'Country',
      accessor: 'CountryDescription',
      ColumnName: 'CountryDescription',
      CellType: 'string',
    },
    {
      Header: 'Primary Location',
      accessor: 'IsPrimary',
      ColumnName: 'IsPrimary',
      CellType: 'icon',
    }]);

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

    const getCountries = async () => {
        setCountries(await CustomerService.getCountries());
    };

    useEffect(() => {
        getCountries();
    }, []);

  const toast = useContext(ToastContext);

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled locations',
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

  const [locationResults, setLocationResults] = useState(locations);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLocationResults(locations);
  }, [locations]);

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
      searchLocations();
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
    searchLocations();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchLocations(update = false) {

    setSearching(true);

    let params = {
      pageSize: pageSize,
      pageIndex: (currentPage - 1),
      searchPhrase: searchVal,
      SortExpression: sortField,
      SortDirection: sortDirection,
      IsActive: !ancillaryFilters["ShowDisabled"]
    };

    if (module == Enums.Module.Customer) {
      params = { ...params, customerID: moduleData.ID };
    } else {
      params = { ...params, supplierID: moduleData.ID };
    }

    const searchRes = await Fetch.post({
      url: '/Location/GetLocations',
      params: params,
      toastCtx: toast
    });

    if (update) {
      updateModuleData("Locations", searchRes.Results, false);
    }

    setLocationResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  const [showManageLocation, setShowManageLocation] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState();
  const [isNewLocation, setIsNewLocation] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState();

  const createNewLocation = () => {
    if (countries.length > 0) {
        let sa = countries.find(x => x.Description == "South Africa");
        setSelectedCountry(sa);
    }
    setIsNewLocation(true);
    setShowManageLocation(true);
  };

  const editLocation = async (location) => {
    let temp = locationResults.find(x => x.ID == location.ID);
    setLocationToEdit(temp);
    setSelectedCountry(await CustomerService.getCountry(temp.CountryID));
    setIsNewLocation(false);
    setShowManageLocation(true);
  };

  const onSave = (location) => {
    setShowManageLocation(false);
    setLocationToEdit(undefined);    
    searchLocations(location);
  };

  const onCancel = () => {
    setShowManageLocation(false);
    setLocationToEdit(undefined);
  }

  return (
    <div className={`tab-list-container ${locationResults.length == 0 ? 'full-height' : ''}`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Locations"
            resultsNum={locationResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchLocations}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
        <div className="create">
          {editCustomerPermission ?
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text="Add Location" icon="plus-circle" extraClasses="fit-content no-margin" onClick={() => createNewLocation()} />
            : ""}
        </div>
      </div>
      <div className={"no-items" + (locationResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Location Folder" />
        <h3>No locations found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {locationResults.length != 0 ? <KendoTable
            searching={searching}
            actions={[
              { text: "Edit", icon: "edit", function: (row) => editLocation(row) },
            ]}
            columns={columns}
            data={locationResults}
            rowClick={rowClick}
            setSort={setSort}
            sortField={sortField}
            sortDirection={sortDirection}
            type="Location"
            heightOffset={295}
          /> : ""}
      </div>

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      {showManageLocation ? 
        // <ManageLocation isNew={isNewLocation} location={locationToEdit} module={module} moduleData={moduleData} countries={countries} onSave={onSave} onCancel={onCancel} accessStatus={accessStatus} />
        <LocationForm isNew={isNewLocation} location={locationToEdit} module={module} moduleData={moduleData} countries={countries} onSave={onSave} onCancel={onCancel} accessStatus={accessStatus} />
        : ''
      }

      <style jsx>{`
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

export default Locations;
