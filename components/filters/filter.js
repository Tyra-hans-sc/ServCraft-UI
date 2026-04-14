import { useState, useRef, useEffect } from "react";
import { colors, layout, tickSvg } from "../../theme";
import FilterCheck from "./check";
import { useOutsideClick } from "rooks";
import useWindowSize from "../../hooks/useWindowSize";
import Helper from "../../utils/helper";
import KendoDateRangePicker from "../kendo/kendo-date-range-picker";
import Time from "../../utils/time";
import NoSSR from "../../utils/no-ssr";

function Filter(props) {
  const ref = useRef();
  let timeout = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [optionsSelected, setOptionsSelected] = useState(false);

  const [showDisabled, setShowDisabled] = useState(false);
  const [toggleShowDateRange, setToggleShowDateRange] = useState(0);
  const suppressOpenDateRange = useRef(false);

  useEffect(() => {
    let sd = false;
    props.selectedOptions.forEach((select) => {
      if (select && !select.isActive) {
        sd = true;
      }
    });
    setShowDisabled(sd);
  }, []);

  useOutsideClick(ref, () => {
    if (showFilter) {
      setShowFilter(false);
    }
    // closeDateRangePicker();
  });

  const debounceApply = () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      applyFilter(true);
    }, 1000);
  };

  const drRef = useRef({});

  const isDateRange = () => {
    return props.filterObject.type === "date-range";
  };

  function filterType() {
    switch (props.filterObject.type) {
      case "check":
        return (
          <FilterCheck
            filterObject={props.filterObject}
            selected={props.selectedOptions}
            checkFunc={(filterName, item) => {
              props.checkFunc(filterName, item);
              debounceApply();
            }}
            filterName={props.filterName}
            showDisabled={showDisabled}
          />
        );
    //   case "date-range":
    //     var dr = {
    //       start: props.selectedOptions[0]
    //         ? Time.parseDate(props.selectedOptions[0])
    //         : null,
    //       end: props.selectedOptions[1]
    //         ? Time.parseDate(props.selectedOptions[1])
    //         : null,
    //     };
    //     drRef.current[props.filterName] = dr;
    //     return (
    //       <KendoDateRangePicker
    //         toggleShow={toggleShowDateRange}
    //         anchor={ref}
    //         dateRange={drRef.current[props.filterName]}
    //         onChange={(dateRange) => {
    //           let start = dateRange.start;
    //           let end = dateRange.end;
    //           if (end) {
    //             end.setHours(23);
    //             end.setMinutes(59);
    //             end.setSeconds(59);
    //           }
    //           drRef.current[props.filterName] = { start, end };
    //           props.checkFunc(
    //             props.filterName,
    //             drRef.current[props.filterName]
    //           );
    //         }}
    //       />
    //     );
      default:
        return null;
    }
  }

  useEffect(() => {
    updateSelectedState();
  }, [props.selectedOptions.length]);

  function filterText() {
    if (props.selectedOptions.length > 2) {
      return (
        props.selectedOptions[0].name +
        " + " +
        (props.selectedOptions.length - 1)
      );
    } else if (props.selectedOptions.length == 0) {
      return Helper.splitWords(props.filterName);
    }

    if (props.filterObject.type == "date-range") {
      if (props.selectedOptions.every((x) => x == null)) {
        return Helper.splitWords(props.filterName);
      } else {
        return props.selectedOptions
          .map((x) =>
            x === null
              ? ""
              : Time.toISOString(Time.parseDate(x), false, false, false, "/")
          )
          .join(" - ");
      }
    } else {
      return props.selectedOptions.map((x) => x.name).join(", ");
    }
  }

  function updateSelectedState() {
    if (props.filterObject.type == "date-range") {
      if (props.selectedOptions.some((x) => x != null)) {
        setOptionsSelected(true);
      } else {
        setOptionsSelected(false);
      }
    } else {
      if (props.selectedOptions.length > 0) {
        setOptionsSelected(true);
      } else {
        setOptionsSelected(false);
      }
    }
  }

  function applyFilter(dontClose) {
    if (showFilter && dontClose === false) {
      setShowFilter(false);
    }
    //updateSelectedState();
    //props.submitFunc();
  }

  function clearFilter(e) {
    if (showFilter) {
      setShowFilter(false);
    }
    updateSelectedState();
    props.clearFilters(e);
  }

  const windowSize = useWindowSize();
  const containerMaxHeight = `${Math.floor(windowSize.height * 0.5)}px`;

  const getIsSelected = () => {
    if (props.filterObject.type === "date-range") {
      return props.selectedOptions.some((x) => x !== null);
    }
    return optionsSelected;
  };

  const openDateRangePicker = () => {
    if (suppressOpenDateRange.current) {
      suppressOpenDateRange.current = false;
      return;
    }
    let newVal = Math.floor(Math.random() * 1000) * 2 + 1;
    if (newVal === toggleShowDateRange) newVal += 2;
    setToggleShowDateRange(newVal);
  };

  const closeDateRangePicker = () => {
    let newVal = Math.floor(Math.random() * 1000) * 2;
    if (newVal === toggleShowDateRange) newVal += 2;
    setToggleShowDateRange(newVal);
  };

  const clearDateRangeSelection = () => {
    suppressOpenDateRange.current = true;
    drRef.current[props.filterName] = { start: null, end: null };
    props.checkFunc(props.filterName, drRef.current[props.filterName]);
  };

  return (
    <NoSSR>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute" }}>
          {isDateRange() ? (
            <>
              {(() => {
                var dr = {
                  start: props.selectedOptions[0]
                    ? Time.parseDate(props.selectedOptions[0])
                    : null,
                  end: props.selectedOptions[1]
                    ? Time.parseDate(props.selectedOptions[1])
                    : null,
                };
                drRef.current[props.filterName] = dr;
                return (
                  <KendoDateRangePicker
                    anchor={ref}
                    dateRange={drRef.current[props.filterName]}
                    onChange={(dateRange) => {
                      // let start = new Date(dateRange.start);
                      let start = dateRange.start ? new Date(dateRange.start) : null;
                      // let end = new Date(dateRange.end);
                      let end = dateRange.end ? new Date(dateRange.end) : null;

                      if (end) {
                        end.setHours(23);
                        end.setMinutes(59);
                        end.setSeconds(59);
                      }
                      drRef.current[props.filterName] = { start, end };
                      props.checkFunc(
                        props.filterName,
                        drRef.current[props.filterName]
                      );
                    }}
                  />
                );
              })()}
            </>
          ) : (
            ""
          )}
        </div>
        <div
          className={"filter " + (getIsSelected() ? " selected-filter" : "")}
          style={{ pointerEvents: isDateRange() ? "none" : "auto" }}
          onClick={() => {
            !isDateRange() && setShowFilter(!showFilter);
            isDateRange() && openDateRangePicker();
          }}
          ref={ref}
        >
          {filterText()}

          {isDateRange() && !props.selectedOptions.every((x) => x == null) ? (
            <span className="clear-x" onClick={clearDateRangeSelection} style={{pointerEvents: "auto"}}>
              <img src="/icons/cross-white.svg" height="24" />
            </span>
          ) : (
            ""
          )}
          <div
            className={"container" + (showFilter ? " container-visible" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            {filterType()}
            <div className="actions">
              <div
                className="button button-clear"
                onClick={clearFilter}
                data-filter={props.filterName}
              >
                Clear
              </div>

              <div
                className="option small"
                onClick={() => setShowDisabled(!showDisabled)}
              >
                <div
                  className={"box small" + (showDisabled ? " box-checked" : "")}
                ></div>
                <span>Show Disabled</span>
              </div>
            </div>
          </div>
          <style jsx>{`
            .filter {
              align-items: center;
              background-color: ${colors.blueGrey};
              border-radius: 1rem;
              box-sizing: border-box;
              color: ${colors.white};
              cursor: pointer;
              display: flex;
              font-size: 14px;
              height: 2rem;
              justify-content: center;
              margin-left: 0.5rem;
              padding: 0 1.5rem;
              position: relative;
            }
            .filter.selected-filter {
              background-color: ${colors.bluePrimary};
            }
            .container {
              background-color: ${colors.white};
              border-radius: 8px;
              box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04),
                0px 20px 25px rgba(0, 0, 0, 0.1);
              box-sizing: border-box;
              display: none;
              flex-direction: column;
              flex-shrink: 0;
              left: 0;
              padding: 1rem;
              position: absolute;
              top: 2.5rem;
              z-index: 5;
              max-height: ${containerMaxHeight};
            }
            .container-visible {
              display: flex;
            }
            .actions {
              border-top: 1px solid ${colors.blueGreyLight};
              display: flex;
              justify-content: space-between;
              margin-top: 1rem;
              padding-top: 1rem;
            }
            .button {
              align-items: center;
              background-color: ${colors.bluePrimary};
              border-radius: 3px;
              color: ${colors.white};
              cursor: pointer;
              display: flex;
              height: 40px;
              flex-shrink: 0;
              margin-left: 2rem;
              padding: 0px 12px;
            }
            .button-clear {
              background: none;
              color: ${colors.bluePrimary};
              cursor: pointer;
              margin-left: 0;
            }

            .container .option {
              align-items: center;
              color: ${colors.darkPrimary}88;
              cursor: pointer;
              display: flex;
              font-size: 10px;
              height: 2.5rem;
              width: max-content;
            }

            .container .box {
              background-color: ${colors.formGrey};
              border-radius: ${layout.inputRadius};
              height: 14px;
              margin-right: 0.25rem;
              width: 14px;
            }

            .container .box-checked {
              background-color: ${colors.bluePrimary};
              background-image: ${tickSvg};
              background-position: center;
              background-repeat: no-repeat;
              background-size: 70%;
            }
            .clear-x {
              margin-left: 0.25rem;
              padding: 0.1rem;
              border-radius: 2rem;
              cursor: pointer;
            }
            .clear-x:hover {
              background: #00000033;
            }
          `}</style>
        </div>
      </div>
    </NoSSR>
  );
}

export default Filter;
