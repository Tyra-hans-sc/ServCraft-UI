import { FC, useEffect, useMemo, useState } from "react";
import * as Enums from '@/utils/enums';
import CellEmployee from "@/components/cells/employee";
import KendoCellEmployee from "@/components/kendo/cells/kendo-cell-employee";
import CellDate from "@/components/cells/date";
import KendoCellDate from "@/components/kendo/cells/kendo-cell-date";
import CellStatus from "@/components/cells/status";
import KendoCellStatus from "@/components/kendo/cells/kendo-cell-status";
import CellBold from "@/components/cells/bold";
import CellBool from "@/components/cells/bool";
import KendoCellBool from "@/components/kendo/cells/kendo-cell-bool";
import CellDescription from "@/components/cells/description";
import Fetch from "@/utils/Fetch";
import Search from "@/components/search";
import Button from "@/components/button";
import storage from "@/utils/storage";
import helper from "@/utils/helper";
import { useRouter } from "next/router";
import KendoTable from "@/components/kendo/kendo-table";
import KendoPager from "@/components/kendo/kendo-pager";
import { colors } from "@/theme";
import stockTransactionService from "@/services/stock-transaction/stock-transaction-service";
import Link from "next/link";

const StockTransactionList: FC<{ stockTransactionType: number }> = ({ stockTransactionType }) => {

    const [stockTransactionResults, setStockTransactionResults] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeDisabled: false });
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);

    const getAccessStatus = () => {
        let subscriptionInfo = storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    };

    const columnState = [{
        Label: 'Number',
        ColumnName: 'StockTransactionNumber',
        CellType: 'bold',
    }, {
        Label: 'Date',
        ColumnName: 'Date',
        CellType: 'date',
    }, {
        Label: 'Type',
        ColumnName: 'StockTransactionType',
        CellType: 'status',
    }, {
        Label: 'Status',
        ColumnName: 'StockTransactionStatus',
        CellType: 'status',
    },
    {
        Label: 'Source',
        ColumnName: 'SourceWarehouseName',
    },
    {
        Label: 'Destination',
        ColumnName: 'DestinationWarehouseName',
    }, {
        Label: 'Employee',
        ColumnName: 'EmployeeFullName',
        CellType: 'employee',
    },
    {
        Label: 'Created',
        ColumnName: 'CreatedDate',
        CellType: 'date',
    }, {
        Label: 'Created By',
        ColumnName: 'CreatedBy',
        CellType: 'none',
    }, {
        Label: 'Modified',
        ColumnName: 'ModifiedDate',
        CellType: 'date',
    }, {
        Label: 'Modified By',
        ColumnName: 'ModifiedBy',
        CellType: 'none',
    }];

    const ancillaryFilterDefinition = useMemo(() => {
        return {
            IncludeDisabled: [{
                type: Enums.ControlType.Switch,
                label: 'Include disabled warehouses',
            }]
        };
    }, []);

    const columns = useMemo(
        () => columnState.map(function (column) {
            let columnObject = {
                Header: column.Label,
                accessor: column.ColumnName,
                // for table resize columns
                ColumnName: column.ColumnName,
                // for table resize columns
            };

            if (column.CellType != "none") {
                switch (column.CellType) {
                    case 'employee':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellEmployee value={value} />;
                        columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
                        break;
                    case 'date':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
                        columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
                        break;
                    case 'status':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
                        columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />;
                        break;
                    case 'bold':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
                        break;
                    case 'icon':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={value} />;
                        columnObject['KendoCell'] = (props) => <KendoCellBool {...props} />;
                        break;
                    case 'Description':
                        columnObject['Cell'] = ({ cell: { value } }) => <CellDescription value={value} />;
                        break;
                    default:
                        columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
                }
            }

            if (column.ColumnName == 'StockTransactionStatus') {
                columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum="StockTransactionStatus" />;
            }

            return columnObject;
        }),
        [columnState]
    );


    const stockTransactionCreateUrl = useMemo(() => {
        return `/stocktransaction/create?type=${stockTransactionType}`
    }, [stockTransactionType])


    const search = async () => {
        setSearching(true);

        const stockTransactions = await stockTransactionService.searchStockTransactions({
            pageSize: pageSize,
            pageIndex: currentPage - 1,
            searchPhrase: searchVal,
            sortExpression: sortField,
            sortDirection: sortDirection,
            includeDisabled: ancillaryFilters["IncludeDisabled"],
            stockTransactionTypes: [stockTransactionType]
        });

        setStockTransactionResults(stockTransactions.Results);
        setTotalResults(stockTransactions.TotalResults);

        setSearching(false);
    };

    const handleAncillaryFilterChange = (result) => {
        if (result.reset) {
            setAncillaryFilters({ IncludeDisabled: false });
        } else {
            setAncillaryFilters({ IncludeDisabled: result.checked });
        }
    };

    function rowClick(row) {
        helper.nextRouter(router.push, `/stocktransaction/[id]`, `/stocktransaction/${row.original.ID}`);
    }

    const createStockTransaction = () => {
        helper.nextRouter(router.push, stockTransactionCreateUrl, stockTransactionCreateUrl);
    }

    function setSort(field) {
        setSortDirection(helper.getSortDirection(field, sortField, sortDirection));
        setSortField(field);
    }

    const pageSizeChanged = (size) => {
        setPageSize(size);
    };

    const pageChanged = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        if (currentPage == 1) {
            search();
        } else {
            setCurrentPage(1);
        }
    }, [sortField, sortDirection, pageSize, ancillaryFilters]);

    useEffect(() => {
        search();
    }, [currentPage]);

    useEffect(() => {
        if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            helper.nextRouter(router.replace, "/");
        }
    }, [accessStatus]);

    useEffect(() => {
        getAccessStatus();
        //search();
    }, []);

    return (<div className="list-container">


        <div className="row end">
            <div className="search-container">
                <Search
                    placeholder="Search Name, Code or Email"
                    resultsNum={stockTransactionResults.length}
                    searchVal={searchVal}
                    setSearchVal={setSearchVal}
                    searchFunc={search}
                    ancillaryFilters={ancillaryFilterDefinition}
                    setAncillaryFilters={handleAncillaryFilterChange}
                />
            </div>

            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createStockTransaction} />
        </div>

        <div className={"no-items" + (stockTransactionResults.length == 0 ? " no-items-visible" : "")}>
            <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
                <div className="loader"></div>
            </div>
            <img src="/job-folder.svg" alt="Warehouse Folder" />
            <h3>No stock transactions found</h3>
            <p>If you can't find a stock transaction, try another search or create a new one.</p>
            <Link href={stockTransactionCreateUrl}><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new stock transaction</Link>
            <img className="wave" src="/wave.svg" alt="wave" />
        </div>

        <div className="margin-top">
            {stockTransactionResults.length != 0 ? <KendoTable
                searching={searching}
                actions={[
                    { text: "Edit", icon: "edit", function: (row) => helper.nextRouter(router.push, `/stocktransaction/[id]`, `/stocktransaction/${row.ID}`) },
                ] as any}
                columns={columns}
                data={stockTransactionResults}
                rowClick={rowClick}
                setSort={setSort}
                sortField={sortField}
                sortDirection={sortDirection}
                type="StockTransaction"
                heightOffset={300}
                highlightColumnName="Date"

                // defaults
                onColumnResize={() => { }}
                canSelectItems={false}
                selectedItems={[]}
                setSelectedItems={() => { }}
                highlightColumnLink={null}
            /> : ""}
        </div>

        <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

        <style jsx>{`
        .inverted {
          background-color: ${colors.blueDark};
        }
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
        .padded {
          padding-bottom: 1rem;
        }
        .row.top-gap {
          margin-top: 2.5rem;
        }
        .search-container :global(.search) {
          width: 528px;
        }
        a {
          text-decoration: none;
        }
        .margin-top {
          margin-top: 0.5rem;
        }
        `}</style>
    </div>);
};

export default StockTransactionList;
