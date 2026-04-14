import React, { useState, useEffect, useRef } from 'react';
import {
  useTable,
  useGroupBy,
  useFilters,
  useSortBy,
  useExpanded,
  usePagination
} from 'react-table';
import Button from '../button';
import RowPreview from '../row-preview';
import PreviewJobCard from '../modals/jobcard/preview-job-card';
import PreviewAttachment from '../modals/attachment/preview-attachment';
import PreviewMessage from '../modals/message/preview-message';
import { colors, fontSizes, layout, shadows } from '../../theme';
import useOutsideClick from "../../hooks/useOutsideClick";
import { FloatingActionButton } from "@progress/kendo-react-buttons";
import NoSSR from '../../utils/no-ssr';
import helper from '../../utils/helper';

function Table({ actions, columns, data, setSort, sortField, sortDirection, rowClick, type, invert, onColumnResize }) {

  const tableRef = useRef();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  const [hoverRow, setHoverRow] = useState();
  const [hoverRowObject, setHoverRowObject] = useState();
  const [showPreview, setShowPreview] = useState(false);
  const [showJobCardPreview, setShowJobCardPreview] = useState(false);

  const jobCardPreviewRef = useRef();
  useOutsideClick(jobCardPreviewRef, () => {
    if (showJobCardPreview) {
      setShowJobCardPreview(false);
    }
  });

  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [tempHoverRowObject, setTempHoverRowObject] = useState();

  // useEffect(() => {
  //   if (hoverRow && hoverRow.tagName != 'TD') {
  //     setHoverRow(hoverRow.closest("td"));
  //   }
  // }, [hoverRow]);

  function handleScroll() {
    setHoverRow(undefined);
  }

  useEffect(() => {
    if (document.getElementsByClassName("table-container")[0]) {
      document.getElementsByClassName("table-container")[0].addEventListener('scroll', handleScroll);
    }

    window.addEventListener("mouseup", windowMouseUp);
    window.addEventListener("mousemove", windowMouseMove);
    window.addEventListener("mousedown", windowMouseDown);
    window.addEventListener("mouseenter", windowMouseEnter);
    window.addEventListener("mouseleave", windowMouseLeave);
    
    return () => {
      window.removeEventListener("mouseup", windowMouseUp);
      window.removeEventListener("mousemove", windowMouseMove);
      window.removeEventListener("mousedown", windowMouseDown);
      window.removeEventListener("mouseenter", windowMouseEnter);
      window.removeEventListener("mouseleave", windowMouseLeave);
    };
  }, []);

  function executeAction(e, actionFunc, rowObject) {
    e.stopPropagation();
    if (actionFunc) {
      actionFunc(rowObject);
    }
  }

  function executePreviewAction(e, action, actionFunc, rowObject) {
    e.stopPropagation();
    if (actionFunc) {
      if ((type === 'Job' || type === 'Attachment' || type === 'Message') && action.text === 'Preview') {
        setTempHoverRowObject(hoverRowObject);
      }
      actionFunc(rowObject);
    }
  }  

  const focused = useRef(null);
  const resizing = useRef(false);

  const windowMouseDown = (ev) => {
    if (focused.current !== null) {
      resizing.current = true;
    }
  };

  const windowMouseEnter = (ev) => {
    if (ev.buttons === 0) {
      focused.current = null;
      resizing.current = null;
    }

    // let td = ev.children.item(ev.children.length - 1);
		// td.style.display = "table-cell";
  };

  const windowMouseLeave = (ev) => {
    // let td = ev.children.item(ev.children.length - 1);
		// td.style.display = "none";
  };

  const thWidthModifier = (width) => {
    return width ? width - 16 : null;
  }

  const tdWidthModifier = (width) => {
    return width ? width - 12 : null;
  };

  const thWidthModifierPX = (width) => {
    return width ? `${thWidthModifier(width)}px` : null;
  }

  const tdWidthModifierPX = (width) => {
    return width ? `${tdWidthModifier(width)}px` : null;
  };

  const onChangeTimer = useRef(null);

  const windowMouseMove = (ev) => {
    if (resizing.current && ev.buttons === 1) {
      let item = document.getElementById(`resize_div_${focused.current}`)

      let left = item.getBoundingClientRect().x;

      let endX = ev.clientX;

      let width = endX - left;

      let minWidth = 25;

      if (width < minWidth) {
        width = minWidth;
      }

      item.style.width = thWidthModifierPX(width);
      let tdDivs = document.querySelectorAll(`div[data-id="resize_td_${focused.current}"]`);

      tdDivs.forEach(tdDiv => {
        tdDiv.style.width = `${tdWidthModifier(width)}px`;
      });

      let focusedCurrent = focused.current;
      onChangeTimer.current && clearTimeout(onChangeTimer.current);
      onChangeTimer.current = setTimeout(() => {
        onColumnResize && onColumnResize(focusedCurrent, width);
      }, 250);

    } else {
      resizing.current = false;
    }
  };

  const resetColumnWidth = (ev, columnName) => {
    let item = document.getElementById(`resize_div_${columnName}`);
    item.style.width = null;
    let tds = document.querySelectorAll(`div[data-id="resize_td_${columnName}"]`);

    tds.forEach(td => {
      td.style.width = null;
    });

    onColumnResize && onColumnResize(columnName, null);
  };

  const windowMouseUp = (ev) => {
    resizing.current = false;
    focused.current = null;
  };

  const resizeBarMouseEnter = (ev, columnName) => {
    if (!resizing.current) {
      focused.current = columnName;
    }
  };

  const resizeBarMouseLeave = (ev, columnName) => {
    if (!resizing.current && ev.buttons !== 1) {
      focused.current = null;
    }
  };

  const getAlignOffset = () => {
    let newPosition = -1280;

    if (tableRef.current) {
      const leftPosition = tableRef.current.getBoundingClientRect().left;
      const windowWidth = window.innerWidth;
      newPosition = -(windowWidth - leftPosition - 180);
    }

    return {
      x: newPosition,
      y: 14,
    };
  };

  const getLeftAlignment = () => {
    let newPosition = 100;
    if (tableRef.current) {
      const boundingBox = tableRef.current.getBoundingClientRect();
      const leftPosition = boundingBox.left;
      const rightPosition = boundingBox.right;
      const width = boundingBox.width;
      const windowWidth = window.innerWidth;

      console.log(leftPosition, rightPosition, width, windowWidth);
      //newPosition = windowWidth - leftPosition;
    }
    return `${1200}px`;
  };

  const getRightAlignment = () => {
    // let newPosition = 100;
    // if (tableRef.current) {
    //   const boundingBox = tableRef.current.getBoundingClientRect();
    //   const leftPosition = boundingBox.left;
    //   const rightPosition = boundingBox.right;
    //   const width = boundingBox.width;
    //   const windowWidth = window.innerWidth;

    //   console.log(leftPosition, rightPosition, width, windowWidth);
    //   //newPosition = windowWidth - leftPosition;
    // }
    // return `${400}px`;
    if (!tableRef.current) return "4rem";

    const leftPosition = tableRef.current.getBoundingClientRect().left;
    const width = tableRef.current.getBoundingClientRect().width;
    const windowWidth = window.innerWidth;

    console.log('getRight called')

    const rightPosition = leftPosition + width;
    if (rightPosition + 48 > windowWidth) {
      return "4rem";
    } else {
      return `${windowWidth - rightPosition}px`;
    }
  };

  const [rowMouseEnter, setRowMouseEnter] = useState(false);
  const [rightPosition, setRightPosition] = useState('300px');  

  const onRowMouseEnter = async (e, row) => {
    // setHoverRow(e.target);
    // setHoverRowObject(row.original);    
    //setRowMouseEnter(!rowMouseEnter);
  };

  const onRowMouseLeave = async (e, row) => {
    setShowPreview(false);
    //setRowMouseEnter(false);
  };

  useEffect(() => {
    setRightPosition(getRightAlignment());
  }, [rowMouseEnter]);

  return (
    <div onMouseLeave={(e) => setHoverRow(undefined)} >
      <table className="table" {...getTableProps()} ref={tableRef}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th id={`resize_th_${column.ColumnName}`} style={{ position: "relative", paddingLeft: "4px", width: column.width }} {...column.getHeaderProps()} className={(column.id == sortField ? ('sorted ' + sortDirection) : '') + (column.extraClasses ? " " + column.extraClasses : "") + ` ${column.id}`} >
                    <div className="resize-div" id={`resize_div_${column.ColumnName}`} onClick={() => setSort(column.id)} style={{width: thWidthModifierPX(column.UserWidth)}}>
                      {column.render('Header')}
                    </div>
                    <span className="resize-bar" id={`resize_div_bar_${column.ColumnName}`} 
                    onDoubleClick={(ev) => resetColumnWidth(ev, column.ColumnName)} 
                    onMouseEnter={(ev) => resizeBarMouseEnter(ev, column.ColumnName)} 
                    onMouseLeave={(ev) => resizeBarMouseLeave(ev, column.ColumnName)}>
                      <span className={"resize-bar-line" + (column.UserWidth ? " resized" : "")} title={(column.UserWidth ? "Double click to set to auto-size or drag to resize" : "Drag to resize")}></span>
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          <tr className="spacer"></tr>
          {rows.map(
            (row, i) => {
              prepareRow(row);
              return (
                <>
                  <tr key={i}
                    className={`table-row ${rowClick ? "pointer" : ""}`} {...row.getRowProps()}
                    onClick={rowClick ? () => rowClick(row) : null}
                    onMouseEnter={(e) => onRowMouseEnter(e, row)}
                    onMouseLeave={(e) => onRowMouseLeave(e, row)}
                    >
                    {row.cells.map((cell, index) => {
                        return (
                          <td {...cell.getCellProps()} className={cell.column.id}>
                            <div data-id={`resize_td_${cell.column.ColumnName}`} className="resize-cell" style={{width: tdWidthModifierPX(cell.column.UserWidth)}}>
                                {cell.render('Cell')}
                            </div>
                          </td>
                        )
                    })}
                    <td className="button-overlay-container" style={{right: rightPosition}}>
                      Edit
                    </td>
                  </tr>
                  {/* <div className="floating-button-container">
                    <div className="floating-button">
                      Edit
                    </div>
                  </div> */}
                </>                 
              )
            }
          )}
        </tbody>
      </table>      

      {showJobCardPreview ?
        <PreviewJobCard id={tempHoverRowObject.ID} setShowJobCardPreview={setShowJobCardPreview} showJobEdit={true} /> : ''
      }

      {showAttachmentPreview ?
        <PreviewAttachment attachment={tempHoverRowObject} setShowAttachmentPreview={setShowAttachmentPreview} /> : ''
      }

      {showMessagePreview ?
        <PreviewMessage message={tempHoverRowObject} setShowPreview={setShowMessagePreview} /> : ''
      }

      <style jsx>{`

      .table-row:hover {
        background: linear-gradient(270deg, #508ACD 0%, #508ACD 0.01%, rgba(174, 176, 178, 0) 76.04%) !important;
      }
      .table-row:hover td {
        background-color: transparent !important;
      }
      .table tr:nth-child(even) td {
        background-color: ${invert ? colors.background : colors.white};
      }

      tr {
        position: relative;
      }
      td.button-overlay-container {
        position: absolute;
        right: 300px;
        top: 14px;
        border: none;
        color: green !important;
        font-weight: bold !important;
        display: flex;
        text-align: right;
        background: none !important;
      }

        .floating-button-container {
          position: relative;
          display: flex;
        }

        .floating-button {
          position: absolute;
          right: 100px;
          top: 14px;
          display: flex;
        }

        .resize-div {
          position: relative;
          user-select: none;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 4px;
        }

        .resize-cell {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 4px;
        }

        .resize-bar {
          position: absolute;
          right: 0px;
          width: 4px;
          padding: 0 1px;
          // border-top: 1px solid #718fa255;
          // border-bottom: 1px solid #718fa255;
          cursor: e-resize;
          top: 0px;
          height: 22px;
          border-radius: 2px;
          // border-bottom-right-radius: 2px;
          ${onColumnResize ? "" : "display: none;"}
        }

        .resize-bar-line {
          background: #718fa233;
          width: 2px;
          height: 22px;
          position: inherit;
        }

        .resize-bar-line.resized {
          background: #718fa2a0;
        }

        .table {
          border-collapse: collapse;
          margin-top: 1.5rem;
          width: 100%;
          position: relative;
        }
        .table th {
          color: ${colors.blueGrey};
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table th.sorted:after {
          border-bottom: 2px solid ${colors.blueGrey};
          border-right: 2px solid ${colors.blueGrey};
          content: '';
          display: block;
          height: 8px;
          position: absolute;
          right: 12px;
          top: 4px;
          transform: rotate(45deg);
          width: 8px;
        }
        .table th.sorted:before {
          background-color: #E5EBF0;
          border-radius: ${layout.bodyRadius};
          bottom: 0;
          content: '';
          left: 0px;
          position: absolute;
          right: 0;
          top: 0;
          transform: translateZ(-1px);
        }
        .table th.ascending:after {
          top: 8px;
          transform: rotate(-135deg);
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tbody tr {
          height: 4rem;
        }
        .table td {
          font-size: 12px;
          padding-right: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          border: none;
        }
        .table tr:nth-child(odd) td {
          color: ${colors.darkPrimary};
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div) {
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }        

        .table-overlay {
          align-items: center;
          height: 4rem;
          justify-content: flex-end;
          pointer-events: none;
          position: fixed;
          right: 4rem;
          top: ${hoverRow ? hoverRow.getBoundingClientRect().top : 0}px;
        }
        .table-overlay :global(.button) {
          pointer-events: auto;
        }

        .pointer {
          cursor: pointer;
        }
        .preview-container {
          position: relative;
        }

        /*EXTRA CLASSES*/
        .table :global(.header-right-align) {
          text-align: right !important;
        }
      `}</style>
    </div>
  );
}

export default Table;
