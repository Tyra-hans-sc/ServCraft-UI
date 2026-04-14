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

const RenderHeaderGroup = ({ column, sortField, sortDirection, resetColumnWidth, resizeBarMouseEnter, resizeBarMouseLeave, setSort, thWidthModifierPX, onColumnResize }) => {
  return (
    <>
      <th id={`resize_th_${column.ColumnName}`} style={{ position: "relative", paddingLeft: "4px", flex: 1 }} {...column.getHeaderProps()} className={(column.id == sortField ? ('sorted ' + sortDirection) : '') + (column.extraClasses ? " " + column.extraClasses : "") + ` ${column.id}`} >
        <div className="resize-div" id={`resize_div_${column.ColumnName}`} onClick={() => setSort(column.id)} style={{ width: thWidthModifierPX(column.UserWidth), flex: 1 }}>
          {column.render('Header')}
        </div>
        <span className="resize-bar" id={`resize_div_bar_${column.ColumnName}`}
          onDoubleClick={(ev) => resetColumnWidth(ev, column.ColumnName)}
          onMouseEnter={(ev) => resizeBarMouseEnter(ev, column.ColumnName)}
          onMouseLeave={(ev) => resizeBarMouseLeave(ev, column.ColumnName)}>
          <span className={"resize-bar-line" + (column.UserWidth ? " resized" : "")} title={(column.UserWidth ? "Double click to set to auto-size or drag to resize" : "Drag to resize")}></span>
        </span>
      </th>
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

     
        th {
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
        th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        th.sorted:after {
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
        th.sorted:before {
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
        th.ascending:after {
          top: 8px;
          transform: rotate(-135deg);
        }
        .spacer {
          height: 0.75rem !important;
        }
      
        .pointer {
          cursor: pointer;
        }
 
        /*EXTRA CLASSES*/
        .table :global(.header-right-align) {
          text-align: right !important;
        }

      `}</style>
    </>
  );
}

const RenderTableRow = ({ renderEven, row, rowClick, onRowMouseEnter, tdWidthModifierPX, invert, actions, type }) => {

  const tdRef = useRef();
  const trRef = useRef();

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

  const id = `tr_id_${Math.random()}`;

  const onThisRowMouseEnter = (e, row) => {

    if (!tdRef.current) return;

    tdRef.current.style.display = "table-cell";

    onRowMouseEnter(e, row);
  }

  const onThisRowMouseLeave = (e, row) => {

    if (!tdRef.current) return;

    tdRef.current.style.display = "none";

    setShowPreview(false);
  }

  const getFABTop = () => {
    if (!trRef.current) return "";
    const elem = trRef.current;
    if (!elem) return "";
    return `${elem.getBoundingClientRect().top}px`;
  }

  function executeAction(e, actionFunc, rowObject) {
    e.stopPropagation();
    if (actionFunc) {
      actionFunc(rowObject);
    }
  }

  function executePreviewAction(e, action, actionFunc, rowObject) {
    e.stopPropagation();
    if (actionFunc) {
      // if ((type === 'Job' || type === 'Attachment' || type === 'Message') && action.text === 'Preview') {
      //   setTempHoverRowObject(hoverRowObject);
      // }
      actionFunc(rowObject);
    }
  }

  const suppressRowClick = useRef(false);

  const tryRowClick = () => {
    if (suppressRowClick.current) return;

    rowClick && rowClick(row);
  }

  return (<>
    <tr id={id} ref={trRef}
      className={`${(rowClick ? "pointer" : "")} {}`}
      {...row.getRowProps()}
      onClick={tryRowClick}
      onMouseEnter={(e) => onThisRowMouseEnter(e, row)}
      onMouseLeave={(e) => onThisRowMouseLeave(e, row)}
    >
      {row.cells.map((cell, index) => {
        return <td {...cell.getCellProps()} className={`${cell.column.id} ${(renderEven ? "even-cell" : "odd-cell")}`} >
          <div data-id={`resize_td_${cell.column.ColumnName}`} className="resize-cell" style={{ width: tdWidthModifierPX(cell.column.UserWidth) }}>
            {cell.render('Cell')}
          </div>
        </td>
      })}
      <td className="overlay-css" ref={tdRef}>
        <div className="fab-container">
          {actions && actions.map((action, key) => {
            if (action.text == "Preview") {
              return (
                <div
                  onMouseEnter={() => suppressRowClick.current = true}
                  onMouseLeave={() => suppressRowClick.current = false}
                  key={key} className="preview-container">
                  <Button text={action.text} icon={action.icon} onClick={(e) => {
                    type === 'Job' ? executePreviewAction(e, action, setShowJobCardPreview, true)
                      : type === 'Attachment' ? executePreviewAction(e, action, setShowAttachmentPreview, true)
                        : type === 'Message' ? executePreviewAction(e, action, setShowMessagePreview, true)
                          : executeAction(e, setShowPreview, true);
                  }} extraClasses="white-overlay" ref={showJobCardPreview ? jobCardPreviewRef : null} />
                  {showPreview
                    ? <RowPreview
                      onMouseEnter={() => suppressRowClick.current = true}
                      onMouseLeave={() => suppressRowClick.current = false}
                      item={row.original} type={type} setShowPreview={setShowPreview} />
                    : ''
                  }
                </div>
              )
            }
            if (action.text == "Manage Permissions") {
              if (row.original.UserID) {
                return (
                  <Button
                    onMouseEnter={() => suppressRowClick.current = true}
                    onMouseLeave={() => suppressRowClick.current = false}
                    key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, row.original)} extraClasses="white-overlay" />
                )
              } else {
                return "";
              }
            }
            if (action.text == "Retry") {
              if (row.original.MessageStatus === Enums.MessageStatus.OutOfCredits) {
                return <Button
                  onMouseEnter={() => suppressRowClick.current = true}
                  onMouseLeave={() => suppressRowClick.current = false}
                  key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, row.original)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            if (action.text == "Download Report") {
              if (row.original.HasErrorReport == true) {
                return <Button
                  onMouseEnter={() => suppressRowClick.current = true}
                  onMouseLeave={() => suppressRowClick.current = false}
                  key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, row.original)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            if (action.text == "Errors") {
              if (row.original.Error &&
                (row.original.ImportStatus == Enums.ImportStatus.Completed || row.original.ImportStatus == Enums.ImportStatus.Errors)) {
                return <Button
                  onMouseEnter={() => suppressRowClick.current = true}
                  onMouseLeave={() => suppressRowClick.current = false}
                  key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, row.original)} extraClasses="white-overlay" />
              } else {
                return '';
              }
            }
            return <Button
              onMouseEnter={() => suppressRowClick.current = true}
              onMouseLeave={() => suppressRowClick.current = false}
              key={key} text={action.text} icon={action.icon} onClick={(e) => executeAction(e, action.function, row.original)} extraClasses="white-overlay" />
          }
          )}
        </div>
      </td>
      <td style={{ width: 0, zIndex: 1000000 }}>
        {showJobCardPreview ?
          <PreviewJobCard
            onMouseEnter={() => suppressRowClick.current = true}
            onMouseLeave={() => suppressRowClick.current = false}
            id={row.original.ID} setShowJobCardPreview={setShowJobCardPreview} showJobEdit={true} /> : ''
        }

        {showAttachmentPreview ?
          <PreviewAttachment
            onMouseEnter={() => suppressRowClick.current = true}
            onMouseLeave={() => suppressRowClick.current = false}
            attachment={row.original} setShowAttachmentPreview={setShowAttachmentPreview} /> : ''
        }

        {showMessagePreview ?
          <PreviewMessage
            onMouseEnter={() => suppressRowClick.current = true}
            onMouseLeave={() => suppressRowClick.current = false}
            message={row.original} setShowPreview={setShowMessagePreview} /> : ''
        }
      </td>
    </tr>
    <style jsx>{`


.resize-cell {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 4px;
}

tr {
  height: 4rem;
  position: relative;
}
td {
  font-size: 12px;
  // min-width: 6rem;
  padding-right: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
}
td.even-cell {
  background-color: ${invert ? colors.background : colors.white};
}
td.odd-cell {
  color: ${colors.darkPrimary};
}
// td:last-child {
//   border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
//   text-align: right;
// }
// td:last-child :global(div) {
//   margin-left: auto;
// }
td:first-child {
  border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
  padding-left: 1rem;
  text-align: left;
}
td:first-child :global(div){
  margin-left: 0;
}
.pointer {
  cursor: pointer;
}

td.overlay-css {
  position: absolute;
  right: 0;
  left: 0;
  background: rgba(255, 0, 0, 0.2);
  border: none;
  color: green;
  font-weight: bold;
  display: none;
  text-align: left;
  height: 3.9rem;
  z-index: 100000;
}

td.overlay-css .fab-container {
  position: fixed;
  height: 3.9rem;
  top: ${getFABTop()};
  right: 8rem;
}

.preview-container {
  position: relative;
}

`}</style>
  </>);
}

export default function TableTestTdOverlay({ actions, columns, data, setSort, sortField, sortDirection, rowClick, type, invert, onColumnResize }) {

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



  const onRowMouseEnter = (e, row) => {
    // setHoverRow(e.target);
    // setHoverRowObject(row.original);
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

      console.log(focused.current);
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
              {headerGroup.headers.map((column, index) =>
                <RenderHeaderGroup
                  key={index}
                  column={column}
                  resetColumnWidth={resetColumnWidth}
                  resizeBarMouseEnter={resizeBarMouseEnter}
                  resizeBarMouseLeave={resizeBarMouseLeave}
                  setSort={setSort}
                  sortDirection={sortDirection}
                  sortField={sortField}
                  thWidthModifierPX={thWidthModifierPX}
                  onColumnResize={onColumnResize}
                />
              )}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          <tr className="spacer"></tr>
          {rows.map(
            (row, i) => {
              prepareRow(row);
              return <RenderTableRow
                key={i}
                renderEven={i % 2 === 0}
                invert={invert}
                onRowMouseEnter={onRowMouseEnter}
                row={row}
                rowClick={rowClick}
                tdWidthModifierPX={tdWidthModifierPX}
                actions={actions}
                type={type}
              />
            }
          )}
        </tbody>
      </table>
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
          flex: 1;
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
          // min-width: 6rem;
          padding-right: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
        }
        .table tr:nth-child(even) td {
          background-color: ${invert ? colors.background : colors.white};
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

