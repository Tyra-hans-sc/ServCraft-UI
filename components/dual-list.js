import { useState, useEffect } from 'react';
import { ListBox, ListBoxToolbar, processListBoxData, processListBoxDragAndDrop } from '@progress/kendo-react-listbox';


// example custom item
const ExampleTemplateFunction = (props) => {
    let { dataItem, selected, ...others } = props;
    return (
        <li {...others}>
            <div>
                <span
                    style={{
                        fontWeight: "bold",
                    }}
                >
                    {props.dataItem.ProductName}
                </span>
                <br />
                <span>Price: {props.dataItem.UnitPrice}$</span>
            </div>
        </li>
    );
};




const SELECTED_FIELD = "selected";


export default function DualList({ unassignedTitle, assignedTitle, options, selectedOptionIDs, textField, valueField, templateFunction, onChange, canFilter = false }) {

    useEffect(() => {
        if (!options) {
            options = [];
        }
        if (!selectedOptionIDs) {
            selectedOptionIDs = [];
        }

        options.forEach(opt => {
            opt[SELECTED_FIELD] = false;
        })

        let newState = {
            notAssigned: options.filter((opt) => !selectedOptionIDs.includes(opt[valueField])),
            assigned: options.filter((opt) => selectedOptionIDs.includes(opt[valueField])),
            draggedItem: {}
        };

        setState(newState);
    }, [options, selectedOptionIDs]);

    const [state, setState] = useState({
        notAssigned: [],
        assigned: [],
        draggedItem: {},
    });

    const [filterInput, setFilterInput] = useState({
        notAssigned: "",
        assigned: ""
    });


    const handleItemClick = (event, data, connectedData) => {
        setState({
            ...state,
            [data]: state[data].map((item) => {
                if (item[valueField] === event.dataItem[valueField]) {
                    item[SELECTED_FIELD] = !item[SELECTED_FIELD];
                } else if (!event.nativeEvent.ctrlKey) {
                    item[SELECTED_FIELD] = false;
                }

                return item;
            }),
            [connectedData]: state[connectedData].map((item) => {
                item[SELECTED_FIELD] = false;
                return item;
            }),
        });
    };

    const handleToolBarClick = (e) => {
        let toolName = e.toolName || "";
        let result = processListBoxData(
            state.notAssigned,
            state.assigned,
            toolName,
            SELECTED_FIELD
        );
        setState({
            ...state,
            notAssigned: result.listBoxOneData,
            assigned: result.listBoxTwoData,
        });

        onChange(result.listBoxTwoData.map(x => x[valueField]));
    };

    const handleDragStart = (e) => {
        setState({ ...state, draggedItem: e.dataItem });
    };

    const handleDrop = (e) => {
        let result = processListBoxDragAndDrop(
            state.notAssigned,
            state.assigned,
            state.draggedItem,
            e.dataItem,
            "value"
        );
        setState({
            ...state,
            notAssigned: result.listBoxOneData,
            assigned: result.listBoxTwoData,
        });

        onChange(result.listBoxTwoData.map(x => x[valueField]));
    };

    const keyUp = (e, data) => {
        let val = e.target.value;
        val = val ? val : "";
        setFilterInput({
            ...filterInput,
            [data]: val
        });
    };

    const getData = (data) => {
        let filter = filterInput[data];
        filter = filter ? filter.trim().toLowerCase() : "";
        let options = [...state[data]];
        options = options.filter(opt => opt.label.trim().toLowerCase().indexOf(filter) > -1);
        return options;
    };


    return (
        <div className="container">
            <div className="row">
                <div className="column">
                    <h4>{unassignedTitle}</h4>
                    {canFilter ? <>
                        <input placeholder="Search..." className="filter not-assigned" type="text" onKeyUp={(e) => keyUp(e, "notAssigned")}
                            />
                    </> : ""}
                    <ListBox
                        textField={textField}
                        style={{
                            height: 350,
                            width: "100% !important",
                        }}
                        data={getData("notAssigned")}
                        selectedField={SELECTED_FIELD}
                        onItemClick={(e) =>
                            handleItemClick(e, "notAssigned", "assigned")
                        }
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        item={templateFunction}
                        toolbar={() => {
                            return (
                                <ListBoxToolbar
                                    tools={[
                                        "transferAllTo",
                                        "transferTo",
                                        "transferFrom",
                                        "transferAllFrom",
                                    ]}
                                    data={state.notAssigned}
                                    dataConnected={state.assigned}
                                    onToolClick={handleToolBarClick}
                                />
                            );
                        }}
                    />
                </div>
                <div className="column spacer"></div>
                <div className="column">
                    <h4>{assignedTitle}</h4>
                    {canFilter ? <>
                        <input placeholder="Search..." className="filter" type="text" onKeyUp={(e) => keyUp(e, "assigned")}
                            />
                    </> : ""}
                    <ListBox
                        textField={textField}
                        style={{
                            height: 350,
                            width: "100%",
                        }}
                        data={getData("assigned")}
                        selectedField={SELECTED_FIELD}
                        onItemClick={(e) =>
                            handleItemClick(e, "assigned", "notAssigned")
                        }
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        item={templateFunction}
                    />
                </div>
            </div>

            <style jsx>{`
            .container {
                width: 100%;
            }
            .row {
                display: flex;
              }
              .column {
                display: flex;
                flex-direction: column;
                width: 100%;
              }
              .column.spacer {
                  width: 1.5rem;
              }

              :global(.k-listbox) {
                  width: 100%;
              }

              h4 {
                  margin: 0 0 0.5rem 0;
              }

              input.filter {
                border: 1px solid rgba(0,0,0,0.12);
                padding: 8px;
              }

              input.filter.not-assigned {
                  width: calc(100% - 66px);
              }

            `}</style>
        </div>
    );
}


