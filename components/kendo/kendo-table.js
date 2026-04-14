import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import Link from 'next/link';
import Router from 'next/router';
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import Checkbox from "../checkbox";
import { colors, shadows } from '../../theme';
import RowPreview from "../row-preview";
import PreviewJobCard from "../modals/jobcard/preview-job-card";
import PreviewMessage from "../modals/message/preview-message";
import { useOutsideClick } from "rooks";
import NoSSR from "../../utils/no-ssr";
import Helper from "../../utils/helper";
import Constants from "../../utils/constants";
import SCMessageBarContext from "../../utils/contexts/sc-message-bar-context";

const initialDataState = {
    sort: [
        // {
        //     field: "code",
        //     dir: "asc",
        // },
    ],
    take: 10,
    skip: 0,
};

function ActionsComponent({ actionsRef, onActionClick, actions, type, getGridWidth, hasScrollbar }) {

    const [showJobCardPreview, setShowJobCardPreview] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [tempHoverRowObject, setTempHoverRowObject] = useState(false);

    const jobCardPreviewRef = useRef();
    useOutsideClick(jobCardPreviewRef, () => {
        if (showJobCardPreview) {
            setShowJobCardPreview(false);
        }
    });

    function executePreviewAction(e, action, actionFunc, rowObject) {
        e.stopPropagation();
        if (actionFunc) {
            // if ((type === 'Job' || type === 'Message') && action.text === 'Preview') {
            //     // setTempHoverRowObject(hoverRowObject);
            // }
            // else if (type === 'Attachment') {
            //     action.function(onActionClick());
            // }

            actionFunc(rowObject);
        }
    }

    function executeAction(e, actionFunc, rowObject) {
        e.stopPropagation();
        if (actionFunc) {
            actionFunc(rowObject);
        }
    }

    function executeOnActionClick(action) {
        action.function(onActionClick());
    }

    const mouseOver = useCallback(() => {
        actionsRef.current.style.display = "block";
    });

    const mouseOut = useCallback(() => {
        actionsRef.current.style.display = "none";
    });


    return (<><div ref={actionsRef}
        className="floater"
        onMouseOver={mouseOver}
        onMouseOut={mouseOut}
    >
        <div className="inner">
            {actions && actions.map((action, key) => {

                if (action.text == "Preview" || (action.type && action.type == "Preview")) {
                    return (
                        <>
                            <img key={key} className="icon" title={action.text} src={`/icons/${action.icon}.svg`} onClick={(e) => {
                                setTempHoverRowObject(onActionClick());
                                type === 'Job' ? executePreviewAction(e, action, setShowJobCardPreview, true)
                                    : type === 'Attachment' ? action.function(onActionClick())
                                        : type === 'Message' ? executePreviewAction(e, action, setShowMessagePreview, true)
                                            : executeAction(e, setShowPreview, true);
                            }} ref={showJobCardPreview ? jobCardPreviewRef : null} />
                            {showPreview
                                ? <RowPreview item={tempHoverRowObject} type={type} setShowPreview={setShowPreview} />
                                : ''
                            }
                        </>
                    )
                }

                return (
                    <img key={key} className="icon" title={action.text} src={`/icons/${action.icon}.svg`} onClick={() => {
                        action.function && action.function(onActionClick());
                    }} />
                );
            })}
        </div>
    </div>

        {showJobCardPreview ?
            <PreviewJobCard id={tempHoverRowObject.ID} setShowJobCardPreview={setShowJobCardPreview} showJobEdit={true} /> : ''
        }

        {showMessagePreview ?
            <PreviewMessage message={tempHoverRowObject} setShowPreview={setShowMessagePreview} /> : ''
        }

        <style jsx>{`
    
        .floater {
            ${hasScrollbar ? "right: 16px;" : "right: 0px;"}
            position: absolute;
            z-index: 0;
            display: none;
            cursor: pointer;
        }

        .inner {
            margin-top: 0;
            background: ${colors.white};
            padding: 6px;
            border-radius: 3px;
            box-shadow: ${shadows.cardSmall};
        }

        .icon {
            margin: 0 8px;
        }


    `}</style>

    </>);
};

export default function KendoTable({ actions = undefined, columns, data, setSort, sortField, sortDirection, rowClick, type, onColumnResize,
    canSelectItems = false, selectedItems = [], setSelectedItems, heightOffset, highlightColumnName, highlightColumnLink, searching }) {

    const messageBarContext = useContext(SCMessageBarContext);

    const [columnState, setColumnState] = useState(columns);

    useEffect(() => {
        setColumnState(columns);
    }, [columns]);

    const actionsRef = useRef();
    const dataRef = useRef(null);

    const dataStateChanged = (e) => {
        // setDataState(e.dataState);
        let sort = e.dataState.sort;
        if (sort && sort.length === 1) {
            let field = sort[0].field;
            // update the sort field and direction
            setSort(field);
        } else {
            setSort(sortField);
        }
    }

    const [dataState, setDataState] = useState(initialDataState);

    useEffect(() => {
        let state = { ...dataState };
        if (sortField && sortDirection) {
            state.sort = [{
                field: sortField,
                dir: sortDirection.trim().toLowerCase() === "ascending" ? "asc" :
                    sortDirection.trim().toLowerCase() === "descending" ? "desc" : sortDirection
            }];
        } else {
            state.sort = [];
        }

        setDataState(state);
    }, [sortField, sortDirection]);

    const onRowClick = (e) => {
        rowClick && rowClick({ original: e.dataItem });
    };

    const columnDebounce = useRef(null);

    const columnResized = (e) => {
        let index = e.index;
        if (canSelectItems) {
            index--;
        }
        let columnName = columnState[index].ColumnName;
        let isLastColumnResized = e.index === columnState.length - (canSelectItems ? 0 : 1);
        let gridWidth = gridRef.current.element.getBoundingClientRect().width - 20 - (canSelectItems ? 40 : 0);
        let colWidth = 0;
        e.columns.forEach(x => {
            colWidth += parseFloat(x.width);
        });
        colWidth -= (canSelectItems ? 40 : 0);
        let diff = parseInt(gridWidth) - parseInt(colWidth);
        let makeSmaller = e.newWidth > e.oldWidth;
        let width = e.newWidth;
        if (diff > 0 && isLastColumnResized && makeSmaller) {
            width = columnState[index].UserWidth;
            setResizeable(false);
            setTimeout(() => {
                setResizeable(true);
            }, 100);
        }

        clearTimeout(columnDebounce.current);

        if (e.end) {
            columnDebounce.current = setTimeout(() => {
                onColumnResize(columnName, width)
            }, 100);
        }
    }

    // const columnResized = (e) => {

    //     let index = e.index;
    //     let columnName = columnState[index].ColumnName;
    //     let isLastColumnResized = e.index === columnState.length - 1;
    //     let gridWidth = gridRef.current.element.getBoundingClientRect().width - 20;
    //     let colWidth = 0;
    //     e.columns.forEach(x => {
    //         colWidth += x.width;
    //     });
    //     let diff = gridWidth - colWidth;
    //     let makeSmaller = e.newWidth < e.oldWidth;


    //     clearTimeout(columnDebounce.current);
    //     columnDebounce.current = setTimeout(() => {
    //         onColumnResize(null, null, e.columns.map((x, key) => {
    //             let isLastColumn = key === columnState.length - 1;
    //             let width = parseInt(x.width);
    //             if (isLastColumn && diff > 0) {
    //                 if (makeSmaller && isLastColumnResized) {
    //                     width = x.userWidth;
    //                 }
    //             }
    //             return {
    //                 columnName: x.field,
    //                 width: width
    //             };
    //         }));
    //     }, 100);
    // }

    const onHeaderSelectionChange = (e) => {
        const checked = e;
        if (checked) {
            setSelectedItems(data.map(x => x.ID));
        } else {
            setSelectedItems([]);
        }
    };

    const onMouseOverEvent = useCallback((e) => {
        let trParent = e.target.parentElement;
        while (trParent.tagName !== "TR") {
            trParent = trParent.parentElement;
        }
        let rect = trParent.getBoundingClientRect();
        let hardTopRect = gridRef.current.element.getBoundingClientRect();

        if (actionsRef.current) {
            actionsRef.current.style.top = `${rect.top - hardTopRect.top}px`;
            actionsRef.current.style.display = "block";
        }

        dataRef.current = data[parseInt(trParent.dataset.gridRowIndex)];
    });

    const onMouseOutEvent = useCallback((e) => {
        if (actionsRef.current) {
            actionsRef.current.style.display = "none";
        }
    });

    const onActionClick = useCallback(() => {
        return dataRef.current;
    });

    const rowClickDebounce = useRef(null);

    const rowRender = (trElement, props) => {

        const trProps = {
            onMouseOver: onMouseOverEvent,
            onMouseOut: onMouseOutEvent,
            onClick: () => {
                setTimeout(() => {
                    if (rowClickDebounce.current) {
                        rowClickDebounce.current = false;
                        return;
                    }
                    onRowClick(props);
                }, 100);
            },
            style: { cursor: "pointer" }
        };

        return React.cloneElement(
            trElement,
            { ...trProps },
            trElement.props.children
        );
    };

    const gridRef = useRef();

    function getGridHeight() {
        try {
            let containerHeight = messageBarContext.isActive ? window.innerHeight - Constants.messageBarMargin : window.innerHeight;
            return `${parseInt(containerHeight - heightOffset)}px`;
        } catch {
            return "450px";
        }
    }

    function getGridWidth() {
        if (gridRef.current) {
            let rightMostPoint = gridRef.current.element.getBoundingClientRect().left +
                gridRef.current.columnResize.columns.map(x => parseInt(x.width.toString().replace("px", ""))).reduce((a, b) => a + b, 0)
                + 50;
            return rightMostPoint;
        } else return 0;
    }

    function getOverlayPositioning() {
        let position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        return position;
    }

    const onGridScroll = useCallback((e) => {
        if (actionsRef.current) {
            actionsRef.current.style.display = "none";
        }
    });

    const columnWidthRef = useRef(0);

    const [resizeable, setResizeable] = useState(true);
    const [hasScrollbar, setHasScrollbar] = useState(true);

    const updateHasScrollbar = () => {
        if (gridRef.current) {
            const containerHeight = gridRef.current.element.getElementsByClassName("k-grid-container")[0].getBoundingClientRect().height;
            const tableHeight = gridRef.current.element.getElementsByClassName("k-grid-container")[0].getElementsByClassName("k-grid-table")[0].getBoundingClientRect().height;
            const newHasScrollbar = tableHeight > containerHeight;
            if (newHasScrollbar !== hasScrollbar) {
                setHasScrollbar(newHasScrollbar);
            }
        }
    };

    useEffect(() => {
        setTimeout(() => {
            updateHasScrollbar();
        }, 100);
    }, [data, getGridHeight()])

    const navigate = (path) => {
        Helper.nextLinkClicked(path);
    };

    const highlightableCell = (props) => {
        return (
            <>
                <td>
                    <Link legacyBehavior={true} href={`${highlightColumnLink}${props.dataItem.ID}`}>
                        <a onClick={() => navigate(`${highlightColumnLink}${props.dataItem.ID}`)}>
                            {props.dataItem[props.field]}
                        </a>
                    </Link>
                </td>

                <style jsx>{`
                    a {
                        font-weight: bold !important;
                        color: ${colors.bluePrimary};
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                `}</style>
            </>            
        )
    };

    return (
        <div style={{ position: "relative" }}>
            <NoSSR>
                <Grid
                    ref={gridRef}
                    pageable={false}
                    sortable={true}
                    filterable={false}
                    resizable={resizeable}
                    style={{
                        maxHeight: getGridHeight(),
                    }}
                    columnVirtualization={false}
                    dataItemKey="ID"
                    data={data}
                    {...dataState}
                    onDataStateChange={dataStateChanged}
                    onColumnResize={columnResized}
                    selectedField="selected"
                    selectable={canSelectItems}
                    rowRender={rowRender}
                    onScroll={onGridScroll}
                >
                    {canSelectItems ? <Column width="40px" resizable={false} field="selected" title=" "
                        headerCell={() => {
                            return (<>
                                <Checkbox extraClasses="smaller" changeHandler={() => {
                                    onHeaderSelectionChange(JSON.stringify(selectedItems.sort()) !== JSON.stringify(data.map(x => x.ID).sort()))
                                }}
                                    checked={JSON.stringify(selectedItems.sort()) === JSON.stringify(data.map(x => x.ID).sort())} />
                            </>)
                        }}
                        cell={({ dataItem, style, className }) => {
                            const onSelect = () => {
                                rowClickDebounce.current = true;
                                if (!selectedItems) return;
                                let newList = [...selectedItems];
                                let idx = newList.findIndex(x => x === dataItem.ID);
                                if (idx > -1) {
                                    newList.splice(idx, 1);
                                } else {
                                    newList.push(dataItem.ID);
                                }
                                setSelectedItems(newList);
                            };

                            return <td style={{ ...style, width: "40px" }} className={className} >
                                {/* use better checkbox */}
                                <Checkbox extraClasses="smaller" preventDefault={true} changeHandler={onSelect} checked={selectedItems && selectedItems.findIndex(x => x === dataItem.ID) > -1} />
                            </td>
                        }}
                    /> : ""}

                    {columnState && columnState.map((column, key) => {

                        if (key === 0) {
                            columnWidthRef.current = 0;
                        }

                        let minWidth = 200;

                        let cell = column.KendoCell;
                        let cellProp = cell ? {
                            cell
                        } : {};

                        if (!cell && highlightColumnName && highlightColumnLink && highlightColumnName === column.ColumnName) {
                            cellProp = {cell: highlightableCell};
                        }

                        let colWidth = column.UserWidth ? {
                            width: `${column.UserWidth >= 50 ? column.UserWidth : 50}px`
                        } : {
                            width: `${minWidth}px`
                        };                        

                        let thisColWidth = column.UserWidth ? column.UserWidth : minWidth;
                        columnWidthRef.current += thisColWidth;

                        let isLastColumn = key === columnState.length - 1;

                        if (isLastColumn && gridRef.current) {
                            let rect = gridRef.current.element.getBoundingClientRect();
                            let gridWidth = rect.width - (hasScrollbar ? 20 : 2) - (canSelectItems ? 40 : 0);
                            let diff = gridWidth - columnWidthRef.current;
                            if (diff > 0) {
                                colWidth = {
                                    width: `${diff + thisColWidth}px`
                                };
                            }
                        }

                        return (
                            <Column {...colWidth} userWidth={column.UserWidth} {...cellProp} minResizableWidth={100}
                                 key={key} field={column.ColumnName} title={column.Header} navigatable={true}
                            />
                        );
                    })}

                </Grid>

            </NoSSR>

            <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")} style={getOverlayPositioning()}>
                <div className="loader"></div>
            </div>

            {actions ?
                <ActionsComponent actionsRef={actionsRef} onActionClick={onActionClick} actions={actions} type={type} getGridWidth={getGridWidth} hasScrollbar={hasScrollbar} /> : ''
            }

            <style>
                {`

                .k-grid-table td {
                    white-space: nowrap !important;
                }


                .highlightable {
                    font-weight: bold !important;
                    color: ${colors.bluePrimary};
                }

                .highlightable:hover {
                    text-decoration: underline;
                }

                `}
            </style>
        </div>
    );
};
