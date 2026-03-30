import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Search from '../../components/search';
import KendoPager from '../../components/kendo/kendo-pager';
import Router from 'next/router';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import KendoTable from '../../components/kendo/kendo-table';
import ColumnSelect from '../../components/column-select';
import CellStatus from '../../components/cells/status';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellWide from '../../components/cells/wide';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import ToastContext from '../../utils/toast-context';
import EmployeeService from '../../services/employee/employee-service';
import ProjectService from '../../services/project/project-service';

function ProjectList(props) {

    const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

    const toast = useContext(ToastContext);

    const [columnState, setColumnState] = useState([]);
    const [availableColumns, setAvailableColumns] = useState();
    const [requiredColumns, setRequiredColumns] = useState();
    const [selectedColumns, setSelectedColumns] = useState();

    const [selectedProjects, setSelectedProjects] = useState([]);

    const [accessStatus, setAccessStatus] = useState(props.accessStatus);

    const [triggerClientFiltering, setTriggerClientFiltering] = useState(false);

    const getColumns = async () => {
        if (isInitialTab) {
            setColumnState(props.columns);
            setAvailableColumns(props.columns.map(column => column.Label));
            setRequiredColumns(props.columns.filter(column => column.IsRequired).map(column => column.Label));
            setSelectedColumns(props.columns.filter(column => column.Show).map(column => column.Label));
        } else {
            const mappings = await EmployeeService.getColumnMappings(Enums.ColumnMapping.Project);
            let columns = mappings.Results;
            setColumnState(columns);
            setAvailableColumns(columns.map(column => column.Label));
            setRequiredColumns(columns.filter(column => column.IsRequired).map(column => column.Label));
            setSelectedColumns(columns.filter(column => column.Show).map(column => column.Label));

            setTriggerClientFiltering(true);
        }
    };

    useEffect(() => {
        if (triggerClientFiltering) {
            searchProjects();
        }
    }, [triggerClientFiltering]);

  const columns = useMemo(
    () => columnState.filter(column => column.Show == true).map(function (column) {
      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
      }

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
          case 'int':
          case 'int?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={false} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={false} />;
            break;
          case 'decimal':
          case 'decimal?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={true} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={true} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDescription') {
        columnObject['accessor'] = (row) => {
          if (row.Location) {
            return row.Location.LocationDisplay;
          } else {
            return row.LocationDescription;
          }
        }
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState, selectedProjects]
  );

  function setColumn(selected) {
    let newColumns = [...selectedColumns];
    if (newColumns.includes(selected)) {
      newColumns = newColumns.filter((value) => { return value !== selected })
    } else {
      newColumns.push(selected);
    }
    setSelectedColumns(newColumns);

    const newState = columnState.map(function (column) {
      if (column.Label == selected) {
        column.Show = !column.Show;
      }
      return column;
    });
    setColumnState(newState);
    columnMappingPut(newState);
  }

  async function setReorder(updatedOptions) {

    const newState = updatedOptions.map((item, index) => {
      let column = columnState.find(x => x.Label == item);
      column.Order = index;
      return column;
    });

    setAvailableColumns(updatedOptions);
    setColumnState(newState);

    columnMappingPut(newState);
  }

  const columnMappingPut = async (newState) => {
    await EmployeeService.saveColumnMappings(newState, Enums.ColumnMapping.Project, toast);
  };

  const [projectResults, setProjectResults] = useState(props.projects ? props.projects : []);
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    getColumns();
  }, []);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchProjects();
  }, [currentPage]);

  const firstUpdate = useRef(true);
  
  useEffect(() => {
    if (firstUpdate.current) {
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);

      return;      
    }

    if (currentPage == 1) {
      searchProjects();
    } else {
      setCurrentPage(1);
    }
  }, [searchVal, sortField, sortDirection, pageSize]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  const searchProjects = async () => {

    setSearching(true);    

    const projects = await ProjectService.getProjectList(searchVal, pageSize, currentPage, sortField, sortDirection);

    setProjectResults(projects.Results);
    setTotalResults(projects.TotalResults);
    setSearching(false);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/project/[id]', `/project/${row.original.ID}`);
  }

  const getTableActions = () => {
    let acts = [
      { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/project/[id]', `/project/${row.ID}`) }
    ];

    return acts;
  };

  async function resetColumnWidths() {
    const newState = columnState.map(function (column) {
      column.UserWidth = null;
      return column;
    });
    setColumnState(newState);
    columnMappingPut(newState);
  }

  async function onColumnResize(columnName, width, columnNamesAndWidths) {
    const newState = columnState.map(function (column) {
      if (column.ColumnName === columnName) {
        column.UserWidth = width;
      } else if (columnNamesAndWidths) {
        let match = columnNamesAndWidths.find(x => x.columnName === column.ColumnName);
        if (match) {
          column.UserWidth = match.width;
        }
      }
      return column;
    });
    setColumnState(newState);
    columnMappingPut(newState);
  }

  return (
    <div className="container">      
      <div className="row end padded">
        <div className="search-container">
          <Search
            placeholder="Search customer or job card"
            resultsNum={projectResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
          />
        </div>
        <div className="row end">
          <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns} setColumn={setColumn} setReorder={setReorder}
            resetColumnWidths={resetColumnWidths} />
        </div>
      </div>

      <div className={"no-items" + (projectResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Project Folder" />
        <h3>No projects found</h3>
        <p>If you can't find a project, try another search or create a new one.</p>
        <a href="/project/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new project</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {projectResults.length != 0 ? <KendoTable
        searching={searching}
        actions={getTableActions()}
        columns={columns}
        data={projectResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Project"
        onColumnResize={onColumnResize}
        heightOffset={345}
        highlightColumnName="ProjectNumber"
        highlightColumnLink="/project/"
      /> : ""}

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal}  parentPageNumber={currentPage}/>

      <style jsx>{`
        .column {
          width: 100%;
        }
        .column-margin {
          margin-left: 24px;
        }
        .button-container {
          flex-shrink: 0;
          width: 10rem;
        }
        .button-container :global(.button){
          margin-top: 0.5rem;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .end {
          align-items: flex-end;
        }
        .row.top-gap {
          margin-top: 2.5rem;
        }
        .padded {
          padding-bottom: 1rem;
        }
        .search-container :global(.search) {
          width: 528px;
        }
        a {
          text-decoration: none;
        }
        .select-actions {
          display: flex;
          margin-left: -1rem;
        }
        .select-actions :global(.white-action) {
          font-size: 0.875rem;
          margin: 0 0 0 1rem; 
          width: auto;
        }
        .select-actions :global(.icon) {
          left: 1rem !important;
        }
      `}</style>
    </div>
  );
}

export default ProjectList;
