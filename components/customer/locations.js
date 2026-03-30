import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Search from '../search';
import Pagination from '../pagination';
import Button from '../button';
import EditLocation from '../modals/customer/edit-location';
import CreateLocation from '../modals/customer/create-location';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import CellBold from '../cells/bold';
import CellBool from '../cells/bool';
import CellStatus from '../cells/status-old';

function Locations(props) {

  const [editLocation, setEditLocation] = useState();

  const editTheLocation = (location) => {
    let temp = props.locations.find(x => x.ID == location.ID);
    setEditLocation(temp);
  };

  const [countries, setCountries] = useState([]);
  const [addingLocation, setAddingLocation] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: 'Description',
        accessor: 'Description',
        Cell: ({ cell: { value } }) => <CellBold value={value}/>
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

  function updateLocations(newLocation) {
    searchLocations(true);
  }

  const toast = useContext(ToastContext);

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled locations',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ShowDisabled: false});

  const handleAncillaryFilterChange = (result) => {
    if (result.key == "ShowDisabled") {
      setAncillaryFilters({ ShowDisabled: result.checked });
    }
  }

  const [locationResults, setLocationResults] = useState(props.locations);
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
  }

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

  async function searchLocations(updateCustomer = false) {

    setSearching(true);

    const searchRes = await Fetch.post({
      url: '/Location/GetLocations',
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
      props.updateCustomer("Locations", searchRes.Results);
    }

    setLocationResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  return (
    <div className={`tab-list-container ${locationResults.length == 0 ? 'full-height': '' }`}>
      <div className="row">
        <div className="heading">
          Locations
        </div>
        <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
          text="Add Location" icon="plus-circle" extraClasses="fit-content" onClick={() => setAddingLocation(true)} />
      </div>
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
            {text: "Edit", icon: "edit", function: (row) => editTheLocation(row)},
          ]}
          columns={columns}
          data={locationResults}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>      

      <Pagination pageSize={pageSize} setPageSize={setPageSize} currentPage={currentPage} totalResults={totalResults} setCurrentPage={setCurrentPage} />

      { editLocation ? 
        <EditLocation location={editLocation} setEditLocation={setEditLocation} updateLocation={updateLocations} countries={countries} accessStatus={props.accessStatus}/> 
        : ''
      }

      { addingLocation ? 
        <CreateLocation 
          setCreateLocation={setAddingLocation} 
          createLocation={updateLocations} 
          customer={props.customer} 
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

export default Locations;
