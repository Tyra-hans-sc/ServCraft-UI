import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Search from '../search';
import KendoPager from '../kendo/kendo-pager';
import Button from '../button';
import EditLocation from '../modals/location/edit-location';
import CreateLocation from '../modals/location/create-location';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import ToastContext from '../../utils/toast-context';
import CellBold from '../cells/bold';
import CellBool from '../cells/bool';
import CellStatus from '../cells/status-old';

function Locations({ module, moduleData, updateModuleData, accessStatus, editCustomerPermission }) {

  const [editLocation, setEditLocation] = useState();

  const editTheLocation = (location) => {
    let temp = locationResults.find(x => x.ID == location.ID);
    setEditLocation(temp);
  };

  const [countries, setCountries] = useState([]);
  const [addingLocation, setAddingLocation] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: 'Description',
        accessor: 'Description',
        Cell: ({ cell: { value } }) => <CellBold value={value} />
      }, {
        Header: 'Type',
        accessor: 'LocationType',
        Cell: ({ cell: { value } }) => <CellStatus value={value} valueEnum='LocationType' />
      },
      {
        Header: 'Address',
        accessor: 'LocationDisplay'
      },
      {
        Header: 'Country',
        accessor: 'CountryDescription'
      },
      {
        Header: 'Primary Location',
        accessor: 'IsPrimary',
        Cell: ({ cell: { value } }) => <CellBool value={value} />
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const countriesRequest = await Fetch.get({
        url: '/Country',
      });
      setCountries(countriesRequest.Results)
    };
    fetchData();
  }, []);

  function updateLocations() {
    searchLocations(true);
  }

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

  const [locationResults, setLocationResults] = useState([]);
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

  async function searchLocations(updateCustomer = false) {

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

    if (updateCustomer) {
      updateModuleData("Locations", searchRes.Results, false);
    }

    setLocationResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
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
              text="Add Location" icon="plus-circle" extraClasses="fit-content no-margin" onClick={() => setAddingLocation(true)} />
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
      <div className={"table-container" + (locationResults.length != 0 ? " table-container-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <Table
          actions={[
            { text: "Edit", icon: "edit", function: (row) => editTheLocation(row) },
          ]}
          columns={columns}
          data={locationResults}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      {editLocation ?
        <EditLocation location={editLocation} setEditLocation={setEditLocation} updateLocation={updateLocations} countries={countries} accessStatus={accessStatus} />
        : ''
      }

      {addingLocation ?
        <CreateLocation
          setCreateLocation={setAddingLocation}
          createLocation={updateLocations}
          moduleData={moduleData}
          module={module}
          countries={countries}
        /> : ''
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
      `}</style>
    </div>
  )
}

export default Locations;
