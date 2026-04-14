import { FC } from "react";
import { Title } from "@mantine/core";
import QueriesStatusSummaryTable from "@/PageComponents/Table/Component Tables/QueriesStatusSummaryTable";
/*import CellTech from "@/components/cells/tech";
import KendoCellEmployee from "@/components/kendo/cells/kendo-cell-employee";
import CellDate from "@/components/cells/date";
import KendoCellDate from "@/components/kendo/cells/kendo-cell-date";
import CellCurrency from "@/components/cells/currency";
import KendoCellCurrency from "@/components/kendo/cells/kendo-cell-currency";
import CellStatus from "@/components/cells/status";
import KendoCellStatus from "@/components/kendo/cells/kendo-cell-status";
import CellBool from "@/components/cells/bool";
import KendoCellBool from "@/components/kendo/cells/kendo-cell-bool";
import CellBold from "@/components/cells/bold";
import CellWide from "@/components/cells/wide";
import helper from "@/utils/helper";
import KendoTable from "@/components/kendo/kendo-table";
import Fetch from "@/utils/Fetch";*/

const QueryStatusSummary: FC<{ queryId: string }> = ({ queryId }) => {
    return <>
        <Title order={5} mb={'md'} mt={25}>
            {/*<IconHistory size={18} />*/} Query Status Summary
        </Title>




        <QueriesStatusSummaryTable queryId={queryId} />
    </>

    /*const [queryStatusSummaryResults, setQueryStatusSummaryResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('');

    const [columnState, setColumnState] = useState([{
        Header: 'Description',
        accessor: 'QueryStatusDescription',
        ColumnName: 'QueryStatusDescription',
        CellType: 'status',
        UserWidth: null
    },
    {
        Header: 'In Status',
        accessor: 'DaysInStatus',
        ColumnName: 'DaysInStatus',
        CellType: 'int',
        UserWidth: null
    }, {
        Header: 'Created',
        accessor: 'CreatedDate',
        ColumnName: 'CreatedDate',
        CellType: 'date',
        UserWidth: null
    }, {
        Header: 'Created By',
        accessor: 'CreatedBy',
        ColumnName: 'CreatedBy',
        CellType: 'none',
        UserWidth: null
    }, {
        Header: 'Modified',
        accessor: 'ModifiedDate',
        ColumnName: 'ModifiedDate',
        CellType: 'date',
        UserWidth: null
    }, {
        Header: 'Modified By',
        accessor: 'ModifiedBy',
        ColumnName: 'ModifiedBy',
        CellType: 'none',
        UserWidth: null
    }]);

    const columns = useMemo(
        () => columnState.map(function (column) {
            let columnObject = {
                Header: column.Header,
                accessor: column.accessor as any,
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
                        columnObject['Cell'] = ({ cell: { value } }) => <CellCurrency value={value} currencySymbol={"xxxx"} />;
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
                        columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} color={"black"} fontSize={"1rem"} />;
                }
            }

            if (column.accessor == 'LocationDescription') {
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
        [columnState]
    );

    const setSort = (field) => {
        setSortDirection(helper.getSortDirection(field, sortField, sortDirection));
        setSortField(field);
    };

    function rowClick(row) {
    }

    const getQueryStatusChanges = async () => {
        let results = await Fetch.post({
            url: "/Query/GetQueryStatusChanges",
            params: {
                QueryID: queryId
            }
        } as any);

        setQueryStatusSummaryResults(results.Results);
    };

    useEffect(() => {
        getQueryStatusChanges();
    }, []);

    return (
        <div className="container">
            <div className="heading">
                Query Status Summary
            </div>

            <div className="margin-top">
                {queryStatusSummaryResults.length != 0 ?
                    <KendoTable
                        searching={searching}
                        columns={columns}
                        data={queryStatusSummaryResults}
                        rowClick={rowClick}
                        setSort={setSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        type="JobStatusSummary"
                        heightOffset={300}
                        actions={undefined}
                        highlightColumnLink={undefined}
                        highlightColumnName={undefined}
                        onColumnResize={undefined}
                        setSelectedItems={undefined}
                    /> : ''}
            </div>

            <style jsx>{`
            .container {
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              overflow-x: visible;
            }
            .column {
              width: 100%;
            }
            .column-margin {
              margin-left: 24px;
            }
            .row {
              display: flex;
              justify-content: space-between;
            }
            .margin-top {
              margin-top: 0.5rem;
            }
          `}</style>
        </div>
    );*/
}

export default QueryStatusSummary
