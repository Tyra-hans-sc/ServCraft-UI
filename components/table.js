import React, { useState, useEffect, useRef } from 'react';
import {
  useTable,
  useGroupBy,
  useFilters,
  useSortBy,
  useExpanded,
  usePagination
} from 'react-table';
import Button from './button';
import RowPreview from './row-preview';
import PreviewJobCard from './modals/jobcard/preview-job-card';
import PreviewAttachment from './modals/attachment/preview-attachment';
import PreviewMessage from './modals/message/preview-message';
import { colors, fontSizes, layout, shadows } from '../theme';
import * as Enums from '../utils/enums';
import useOutsideClick from "../hooks/useOutsideClick";

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

  useEffect(() => {
    if (hoverRow && hoverRow.tagName != 'TD') {
      setHoverRow(hoverRow.closest("td"));
    }
  }, [hoverRow]);

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


    return () => {
      window.removeEventListener("mouseup", windowMouseUp);
      window.removeEventListener("mousemove", windowMouseMove);
      window.removeEventListener("mousedown", windowMouseDown);
      window.removeEventListener("mouseenter", windowMouseEnter);
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

  const onRowMouseEnter = (e, row) => {
    setHoverRow(e.target);
    setHoverRowObject(row.original);
  }

  const focused = useRef(null);
  const focusedAlreadyResized = useRef(false);
  const resizing = useRef(false);

  const windowMouseDown = (ev) => {
    if (focused.current !== null) {
      resizing.current = true;
    }
  };

  const windowMouseEnter = (ev) => {
    if (ev.buttons === 0) {
      focused.current = null;
      focusedAlreadyResized.current = false;
      resizing.current = null;
    }
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

  const thMaxWidthPX = (width) => {
    return width ? null : `${thWidthModifier(500)}px`;
  }

  const tdMaxWidthPX = (width) => {
    return width ? null : `${tdWidthModifier(500)}px`;
  }

  const onChangeTimer = useRef(null);

  const windowMouseMove = (ev) => {
    if (resizing.current && ev.buttons === 1) {
      let item = document.getElementById(`resize_div_${focused.current}`)
      let alreadyResized = focusedAlreadyResized.current;

      let left = item.getBoundingClientRect().x;

      let endX = ev.clientX;

      let width = endX - left;

      let minWidth = 25;

      if (width < minWidth) {
        width = minWidth;
      }

      width = parseInt(width);

      item.style.width = thWidthModifierPX(width);

      let tdDivs = document.querySelectorAll(`div[data-id="resize_td_${focused.current}"]`);

      tdDivs.forEach(tdDiv => {
        tdDiv.style.width = `${tdWidthModifier(width)}px`;
      });

      let focusedCurrent = focused.current;
      focusedAlreadyResized.current = true;
      onChangeTimer.current && clearTimeout(onChangeTimer.current);
      if (!alreadyResized) {
        onColumnResize && onColumnResize(focusedCurrent, width);
      } else {
        onChangeTimer.current = setTimeout(() => {
          onColumnResize && onColumnResize(focusedCurrent, width);
        }, 250);
      }
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
    focusedAlreadyResized.current = false;
  };

  const resizeBarMouseEnter = (ev, columnName, width) => {
    if (!resizing.current) {
      focused.current = columnName;
      focusedAlreadyResized.current = width !== null;
    }
  };

  const resizeBarMouseLeave = (ev, columnName) => {
    if (!resizing.current && ev.buttons !== 1) {
      focused.current = null;
      focusedAlreadyResized.current = false;
    }
  };

  const getOverlayRightOffset = () => {
    if (!tableRef.current) return "4rem";

    const leftPosition = tableRef.current.getBoundingClientRect().left;
    const width = tableRef.current.getBoundingClientRect().width;
    const windowWidth = window.innerWidth;

    const rightPosition = leftPosition + width;
    if (rightPosition + 48 > windowWidth) {
      return "4rem";
    } else {
      return `${windowWidth - rightPosition}px`;
    }

  };

  const getPagerWidth = () => {
    if (!tableRef.current) return "auto";
    const width = tableRef.current.getBoundingClientRect().width;
    return `${width}px`;
  };

  return (
    <div style={onColumnResize ? {} : { width: "100%" }} onMouseLeave={(e) => setHoverRow(undefined)} >
      <table className="table" {...getTableProps()} ref={tableRef}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th id={`resize_th_${column.ColumnName}`} style={{ position: "relative", paddingLeft: "4px", flex: 1 }} {...column.getHeaderProps()} className={(column.id == sortField ? ('sorted ' + sortDirection) : '') + (column.extraClasses ? " " + column.extraClasses : "") + ` ${column.id}`} >
                    <div className="resize-div" id={`resize_div_${column.ColumnName}`} onClick={() => setSort(column.id)} style={{ width: thWidthModifierPX(column.UserWidth), flex: 1, maxWidth: thMaxWidthPX(column.UserWidth, column.ColumnName) }}>
                      {column.render('Header')}
                    </div>
                    <span className="resize-bar" id={`resize_div_bar_${column.ColumnName}`}
                      onDoubleClick={(ev) => resetColumnWidth(ev, column.ColumnName)}
                      onMouseEnter={(ev) => resizeBarMouseEnter(ev, column.ColumnName, column.UserWidth)}
                      onMouseLeave={(ev) => resizeBarMouseLeave(ev, column.ColumnName)}>
                      <span className={"resize-bar-line" + (column.UserWidth ? " resized" : "")} title={(column.UserWidth ? "Double click to set to auto-size or drag to resize" : "Drag to resize")}></span>
                    </span>
                  </th>
                  // <TableHeaderResize column={column} sortField={sortField} 
                  // sortDirection={sortDirection} setSort={setSort} key={index} index={index}
                  // invert={invert}/>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {/* <tr className="spacer"></tr> */}
          {rows.map(
            (row, i) => {
              prepareRow(row);
              return (
                <tr key={i}
                  className={rowClick ? "pointer" : ""} {...row.getRowProps()}
                  onClick={rowClick ? () => rowClick(row) : null}
                  onMouseEnter={(e) => onRowMouseEnter(e, row)}
                  onMouseLeave={() => setShowPreview(false)}
                >
                  {row.cells.map((cell, index) => {
                    return <td key={'rowKey' + index} {...cell.getCellProps()} className={(cell.column.id + (cell.column.extraClasses ? " " + cell.column.extraClasses : ""))}>
                      <div data-id={`resize_td_${cell.column.ColumnName}`} className="resize-cell" style={{ width: tdWidthModifierPX(cell.column.UserWidth), maxWidth: tdMaxWidthPX(cell.column.UserWidth, cell.column.ColumnName) }}>
                        {cell.render('Cell')}
                      </div>
                    </td>
                  })}
                </tr>
              )
            }
          )}
        </tbody>
      </table>
      {hoverRow && actions
        ? <div className="overlay" onClick={rowClick ? () => rowClick(hoverRowObject) : null} >
          {actions.map((action, key) => {
            if (action.text == "Preview") {
              return (
                <div key={key} className="preview-container">
                  <Button text={action.text} icon={action.icon} onClick={(e) => {
                    type === 'Job' ? executePreviewAction(e, action, setShowJobCardPreview, true)
                      : type === 'Attachment' ? executePreviewAction(e, action, setShowAttachmentPreview, true)
                        : type === 'Message' ? executePreviewAction(e, action, setShowMessagePreview, true)
                          : executeAction(e, setShowPreview, true);
                  }} extraClasses="white-overlay" ref={showJobCardPreview ? jobCardPreviewRef : null} />
                  {showPreview
                    ? <RowPreview item={hoverRowObject} type={type} setShowPreview={setShowPreview} />
                    : ''
                  }
                </div>
              )
            }
            if (action.text == "Manage Permissions") {
              if (hoverRowObject.UserID) {
                return (
                  <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
                )
              } else {
                return "";
              }
            }
            if (action.text == "Retry") {
              if (hoverRowObject.MessageStatus === Enums.MessageStatus.OutOfCredits) {
                return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            if (action.text == "Download Report") {
              if (hoverRowObject.HasErrorReport == true) {
                return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            if (action.text == "Errors") {
              if (hoverRowObject.Error &&
                (hoverRowObject.ImportStatus == Enums.ImportStatus.Completed || hoverRowObject.ImportStatus == Enums.ImportStatus.Errors)) {
                return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
          }
          )}
        </div>
        : ''
      }

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
          height: 100%;
          border-radius: 2px;
          // border-bottom-right-radius: 2px;
          ${onColumnResize ? "" : "display: none;"}
        }

        .resize-bar-line {
          background: #718fa233;
          width: 2px;
          height: 100%;
          position: inherit;
        }

        .resize-bar-line.resized {
          background: #718fa2a0;
        }

        .table {
          border-collapse: collapse;
          margin-top: 0.5rem;
          width: 100%;
          flex: 1;
        }
        .table th {
          /* color: ${colors.blueGrey}; */
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: normal;
          padding: 0.5rem 1rem 0.5rem 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
          background: ${colors.backgroundGrey};
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
          height: 2rem;
        }
        .table td {
          font-size: 12px;
          padding-right: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
        }
        .table tr:nth-child(even) td {
          background-color: ${invert ? colors.background : `${colors.backgroundGrey}55`};
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
        .pointer {
          cursor: pointer;
        }
        .overlay {
          align-items: center;
          background: linear-gradient(270deg, #003ED0 0%, #003ED0 0.01%, rgba(174, 176, 178, 0) 76.04%);
          border-radius: ${layout.cardRadius};
          display: ${hoverRow ? hoverRow.getBoundingClientRect().top >= 64 ? 'flex' : 'none' : 'flex'};
          height: 4rem;
          justify-content: flex-end;
          pointer-events: none;
          position: fixed;
          right: ${getOverlayRightOffset()};
          top: ${hoverRow ? hoverRow.getBoundingClientRect().top : 0}px;
        }
        .overlay :global(.button) {
          pointer-events: auto;
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






// import React, { useState, useEffect } from 'react';
// import {
//   useTable,
//   useGroupBy,
//   useFilters,
//   useSortBy,
//   useExpanded,
//   usePagination
// } from 'react-table';
// import Button from './button';
// import RowPreview from './row-preview';
// import PreviewJobCard from './modals/jobcard/preview-job-card';
// import PreviewAttachment from './modals/attachment/preview-attachment';
// import PreviewMessage from './modals/message/preview-message';
// import { colors, fontSizes, layout, shadows } from '../theme';
// import * as Enums from '../utils/enums';
// import TableHeaderResize from './table-header-resize';

// function Table({ actions, columns, data, setSort, sortField, sortDirection, rowClick, type, invert }) {

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//   } = useTable({
//     columns,
//     data,
//   });

//   const [hoverRow, setHoverRow] = useState();
//   const [hoverRowObject, setHoverRowObject] = useState();
//   const [showPreview, setShowPreview] = useState(false);
//   const [showJobCardPreview, setShowJobCardPreview] = useState(false);
//   const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
//   const [showMessagePreview, setShowMessagePreview] = useState(false);
//   const [tempHoverRowObject, setTempHoverRowObject] = useState();

//   useEffect(() => {
//     if (hoverRow && hoverRow.tagName != 'TD') {
//       setHoverRow(hoverRow.closest("td"));
//     }
//   }, [hoverRow]);

//   function handleScroll() {
//     setHoverRow(undefined);
//   }
//   useEffect(() => {
//     if (document.getElementsByClassName("table-container")[0]) {
//       document.getElementsByClassName("table-container")[0].addEventListener('scroll', handleScroll);
//     }
//   }, []);

//   function executeAction(e, actionFunc, rowObject) {
//     e.stopPropagation();
//     if (actionFunc) {
//       actionFunc(rowObject);
//     }
//   }

//   function executePreviewAction(e, action, actionFunc, rowObject) {
//     e.stopPropagation();
//     if (actionFunc) {
//       if ((type === 'Job' || type === 'Attachment' || type === 'Message') && action.text === 'Preview') {
//         setTempHoverRowObject(hoverRowObject);
//       }
//       actionFunc(rowObject);
//     }
//   }

//   const onRowMouseEnter = (e, row) => {
//     setHoverRow(e.target);
//     setHoverRowObject(row.original);
//   }

//   return (
//     <div onMouseLeave={(e) => setHoverRow(undefined)} >
//       <table className="table" {...getTableProps()}>
//         <thead>
//           {headerGroups.map(headerGroup => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column, index) => {
//                 return (
//                 <th style={{position: "relative", paddingLeft: "4px"}} {...column.getHeaderProps()} className={(column.id == sortField ? ('sorted ' + sortDirection) : '') + (column.extraClasses ? " " + column.extraClasses : "") + ` ${column.id}`} onClick={() => setSort(column.id)}>
//                   {column.render('Header')}
//                 </th>
//                 // <TableHeaderResize column={column} sortField={sortField} 
//                 // sortDirection={sortDirection} setSort={setSort} key={index} index={index}
//                 // invert={invert}/>
//                 );
//               })}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           <tr className="spacer"></tr>
//           {rows.map(
//             (row, i) => {
//               prepareRow(row);
//               return (
//                 <tr key={i}
//                   className={rowClick ? "pointer" : ""} {...row.getRowProps()}
//                   onClick={rowClick ? () => rowClick(row) : null}
//                   onMouseEnter={(e) => onRowMouseEnter(e, row)}
//                   onMouseLeave={() => setShowPreview(false)}
//                 >
//                   {row.cells.map(cell => {
//                     return <td {...cell.getCellProps()} className={cell.column.id}>{cell.render('Cell')}</td>
//                   })}
//                 </tr>
//               )
//             }
//           )}
//         </tbody>
//       </table>
//       {hoverRow && actions
//         ? <div className="overlay" onClick={rowClick ? () => rowClick(hoverRowObject) : null} >
//           {actions.map((action, key) => {
//             if (action.text == "Preview") {
//               return (
//                 <div key={key} className="preview-container">
//                   <Button text={action.text} icon={action.icon} onClick={(e) => {
//                     type === 'Job' ? executePreviewAction(e, action, setShowJobCardPreview, true)
//                       : type === 'Attachment' ? executePreviewAction(e, action, setShowAttachmentPreview, true)
//                       : type === 'Message' ? executePreviewAction(e, action, setShowMessagePreview, true)
//                         : executeAction(e, setShowPreview, true);
//                   }} extraClasses="white-overlay" />
//                   {showPreview
//                     ? <RowPreview item={hoverRowObject} type={type} setShowPreview={setShowPreview} />
//                     : ''
//                   }
//                 </div>
//               )
//             }
//             if (action.text == "Manage Permissions") {
//               if (hoverRowObject.UserID) {
//                 return (
//                   <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
//                 )
//               } else {
//                 return "";
//               }
//             }
//             if (action.text == "Retry") {
//               if (hoverRowObject.MessageStatus === Enums.MessageStatus.OutOfCredits) {
//                 return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
//               } else {
//                 return '';
//               }
//             }
//             return <Button key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, hoverRowObject)} extraClasses="white-overlay" />
//           }
//           )}
//         </div>
//         : ''
//       }

//       {showJobCardPreview ?
//         <PreviewJobCard id={tempHoverRowObject.ID} setShowJobCardPreview={setShowJobCardPreview} /> : ''
//       }

//       {showAttachmentPreview ?
//         <PreviewAttachment attachment={tempHoverRowObject} setShowAttachmentPreview={setShowAttachmentPreview} /> : ''
//       }

//       {showMessagePreview ?
//         <PreviewMessage message={tempHoverRowObject} setShowPreview={setShowMessagePreview} /> : ''
//       }

//       <style jsx>{`
//         .table {
//           border-collapse: collapse;
//           margin-top: 1.5rem;
//           width: 100%;
//         }
//         .table th {
//           color: ${colors.blueGrey};
//           cursor: pointer;
//           font-size: 0.75rem;
//           font-weight: normal;
//           padding: 4px 1rem 4px 0; 
//           position: relative;
//           text-align: left;
//           text-transform: uppercase;
//           transform-style: preserve-3d;
//           user-select: none;
//           white-space: nowrap;
//         }
//         .table th:last-child {
//           padding-right: 1rem;
//           text-align: right;
//         }
//         .table th:first-child {
//           padding-left: 0.5rem;
//           text-align: left;
//         }
//         .table th.sorted:after {
//           border-bottom: 2px solid ${colors.blueGrey};
//           border-right: 2px solid ${colors.blueGrey};
//           content: '';
//           display: block;
//           height: 8px;
//           position: absolute;
//           right: 28px;
//           top: 4px;
//           transform: rotate(45deg);
//           width: 8px;
//         }
//         .table th.sorted:before {
//           background-color: #E5EBF0;
//           border-radius: ${layout.bodyRadius};
//           bottom: 0;
//           content: '';
//           left: -8px;
//           position: absolute;
//           right: 1rem;
//           top: 0;
//           transform: translateZ(-1px);
//         }
//         .table th.ascending:after {
//           top: 8px;
//           transform: rotate(-135deg);
//         }
//         .table .spacer {
//           height: 0.75rem !important;
//         }
//         .table tbody tr {
//           height: 4rem;
//         }
//         .table td {
//           font-size: 12px;
//           min-width: 6rem;
//           padding-right: 1rem;
//         }
//         .table tr:nth-child(even) td {
//           background-color: ${invert ? colors.background : colors.white};
//         }
//         .table tr:nth-child(odd) td {
//           color: ${colors.darkPrimary};
//         }
//         .table td:last-child {
//           border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
//           text-align: right;
//         }
//         .table td:last-child :global(div) {
//           margin-left: auto;
//         }
//         .table td:first-child {
//           border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
//           padding-left: 1rem;
//           text-align: left;
//         }
//         .table td:first-child :global(div){
//           margin-left: 0;
//         }
//         .pointer {
//           cursor: pointer;
//         }
//         .overlay {
//           align-items: center;
//           background: linear-gradient(270deg, #003ED0 0%, #003ED0 0.01%, rgba(174, 176, 178, 0) 76.04%);
//           border-radius: ${layout.cardRadius};
//           display: flex;
//           height: 4rem;
//           justify-content: flex-end;
//           pointer-events: none;
//           position: fixed;
//           right: 4rem;
//           top: ${hoverRow ? hoverRow.getBoundingClientRect().top : 0}px;
//           z-index: 2;
//         }
//         .overlay :global(.button) {
//           pointer-events: auto;
//         }
//         .preview-container {
//           position: relative;
//         }

//         /*EXTRA CLASSES*/
//         .table :global(.header-right-align) {
//           text-align: right !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Table;
