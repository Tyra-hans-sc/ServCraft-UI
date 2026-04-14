import {Box, Button} from "@mantine/core";
import { useState, useEffect } from 'react';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Time from '../../../utils/time';
import { colors, layout } from '../../../theme';
import ManageForm from "../form/manage-form";
import DownloadService from '../../../utils/download-service';
import helper from "../../../utils/helper";
import SCDropdownList from "../../sc-controls/form-controls/sc-dropdownlist";
import SCSpinner from "../../sc-controls/misc/sc-spinner";
import useRefState from "../../../hooks/useRefState";
import SCModal from "@/PageComponents/Modal/SCModal";

const FormDefinitionsForItem = ({ itemID, itemModule, customer, supplier, asset, linkedFormDefinitions, onClose, onlyLinkedForms = false }) => {

    const [formHeaders, setFormHeaders] = useState([]);
    const [formDefinitions, setFormDefinitions] = useState([]);
    const [manageFormHeader, setManageFormHeader] = useState(null);
    const [selectedFormDefinition, setSelectedFormDefinition] = useState(null);
    const [isPrinting, setIsPrinting, getIsPrintingValue] = useRefState([]);

    const getFormHeaders = async () => {
        let formHeaderResponse = await Fetch.get({
            url: "/Form/GetByItemID",
            params: {
                itemID: itemID,
                itemModule: itemModule
            }
        });

        setFormHeaders(formHeaderResponse.Results);
    };

    const getFormDefinitions = async () => {
        let formDefinitionResponse = await Fetch.post({
            url: "/FormDefinition/GetFormDefinitions",
            params: {
                PageSize: 100,
                ShowDraftVersion: true
            }
        });

        let results = formDefinitionResponse.Results;
        if (itemModule === Enums.Module.Customer) {
            results = results.filter(x => x.FormRule === Enums.FormRule.Customer);
        }

        setFormDefinitions(results);
    };

    const printFormHeader = async (formHeader) => {
        let isPrintingTemp = [...getIsPrintingValue()];
        isPrintingTemp.push(formHeader);
        setIsPrinting(isPrintingTemp);
        DownloadService.downloadFile("GET", `/Form/PrintForm?formHeaderID=${formHeader.ID}`, null, true, false, "", "", null, false, () => {
            let isPrintingTemp = [...getIsPrintingValue()];
            isPrintingTemp = isPrintingTemp.filter(x => x !== formHeader);
            setIsPrinting(isPrintingTemp);
        });
    };

    useEffect(() => {
        getFormDefinitions();
        getFormHeaders();
    }, []);

    const getAssociatedItemID = (module) => {
        switch (module) {
            case Enums.Module.Customer:
                return customer.ID;
            case Enums.Module.Asset:
                return asset.ID;
            case Enums.Module.Supplier:
                return supplier.ID;
            default:
                return null;
        }
    };

    const validForms = () => {
        let headersToShow = [...formHeaders];
        linkedFormDefinitions && linkedFormDefinitions.filter(x => x.IsActive).forEach(definition => {
            let idx = headersToShow.findIndex(x => x.FormDefinition.MasterID === definition.MasterID);
            if (idx < 0) {
                headersToShow.push({
                    FormDefinitionID: definition.ID,
                    FormDefinition: definition,
                    Module: itemModule,
                    ItemID: itemID,
                    FormStatus: Enums.FormStatus.Draft,
                    AssociatedModule: definition.Module,
                    AssociatedItemID: getAssociatedItemID(definition.Module),
                    CompletedDate: null,
                    Invalid: false,
                    ID: helper.newGuid(),
                    _isNew: true
                });
            }
            else {
                headersToShow[idx]._isNew = false;
            }
        });

        return headersToShow.sort((a, b) => {
            return a.FormDefinition.Name > b.FormDefinition.Name ? 1 : -1;
        });
    };

    const unallocatedFormDefinitions = () => {
        let allocatedIDs = validForms().map(x => x.FormDefinition.MasterID);
        let unallocated = formDefinitions.filter(x => allocatedIDs.indexOf(x.MasterID) < 0);
        return unallocated.sort((a, b) => {
            return a.Name > b.Name ? 1 : -1;
        })
    }

    const getFormExpired = (formHeader) => {
        if (!formHeader.ExpireDate) {
            return false;
        }
        return Time.now().valueOf() > Time.parseDate(formHeader.ExpireDate).valueOf();
    };

    const getFormHeader = async (formHeaderID) => {
        const result = await Fetch.get({
            url: "/Form",
            params: {
                id: formHeaderID
            }
        });
        return result;
    };

    const doManageFormHeader = async (formHeader) => {
        if (!formHeader._isNew) {
            const result = await getFormHeader(formHeader.ID);

            setManageFormHeader({
                ...result,
                _isNew: false
            });
        } else {
            setManageFormHeader({
                ...formHeader,
                _isNew: true
            });
        }
    };

    const onSave = async (formHeader = null) => {
        setManageFormHeader(formHeader);
        setSelectedFormDefinition(null);
        getFormDefinitions();
        getFormHeaders();
    };

    const onRenew = async (formHeader) => {
        setManageFormHeader(null);
        // let def = formDefinition;
        // // need timeout to let hooks apply new state
        setTimeout(() => {
            editSelectedFormHeader(formHeader);
        }, 100);
    };

    const renewExpiredForm = async (formHeader) => {
        doManageFormHeader(formHeader);
    };

    const editSelectedFormHeader = async (formHeader) => {
        let result = await getFormHeader(formHeader.ID);
        result = {
            ...result,
            FormDefinition: formHeader.FormDefinition,
            Module: itemModule,
            ItemID: itemID,
            FormStatus: Enums.FormStatus.Draft,
            AssociatedModule: formHeader.FormDefinition.Module,
            AssociatedItemID: getAssociatedItemID(formHeader.FormDefinition.Module),
            CompletedDate: null,
            Invalid: false,
            ExpireDate: null,
            _isNew: false
        };
        setManageFormHeader(result);
    };

    const addSelectedFormDefinition = (formDefinition) => {
        const id = helper.newGuid();
        let formHeader = {
            ID: id,
            MasterID: id,
            FormDefinitionID: formDefinition.ID,
            FormDefinition: formDefinition,
            Module: itemModule,
            ItemID: itemID,
            FormStatus: Enums.FormStatus.Draft,
            AssociatedModule: formDefinition.Module,
            AssociatedItemID: getAssociatedItemID(formDefinition.Module),
            CompletedDate: null,
            Invalid: false,
            ExpireDate: null,
            FormDefinitionDisplayName: formDefinition.Name,
            FormDefinitionDescription: formDefinition.Description,
            _isNew: true
        };

        console.log(formHeader.ID, id);

        setManageFormHeader(formHeader);
    }

    // return (<div className="overlay" onClick={(e) => e.stopPropagation()}>
    /*
    * <div className="modal-container"></div>
    */
    return (<>
    <SCModal open={!manageFormHeader} >
        <Box mt={'sm'} className="title">
            <h1>Allocated Forms</h1>
        </Box>

        <div className="table-container">
            <table className="table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>For</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Expired</th>
                    <th className="narrow-column"></th>
                </tr>
                </thead>
                <tbody>
                {validForms().map((formHeader, index) => {
                    let expired = getFormExpired(formHeader);
                    let def = formDefinitions.find(x => x.ID === formHeader.FormDefinitionID);
                    return (<>
                        <tr key={index}>
                            <td>{formHeader.FormDefinition.Name}</td>
                            <td>{Enums.getEnumStringValue(Enums.FormRule, formHeader.FormDefinition.FormRule)}</td>
                            <td>{formHeader.FormDefinition.Version}</td>
                            <td>{Enums.getEnumStringValue(Enums.FormStatus, formHeader.FormStatus)}</td>
                            <td>{expired ? <span className="expired">Yes</span> : "No"}</td>
                            <td className="fit-column">
                                {!formHeader._isNew ?
                                    <span className="img-container">
                                                {getIsPrintingValue().find(x => x === formHeader) ?
                                                    <SCSpinner colour="dark"/> :
                                                    <img className="pointer" src="/icons/printer-blue.svg" alt="print"
                                                         title="Print form"
                                                         onClick={() => printFormHeader(formHeader)}/>
                                                }
                                            </span> : ''
                                }
                                {expired ?
                                    <span className="img-container">
                                                <img className="pointer" src="/icons/repeat-blue.svg" alt="renew"
                                                     title="Renew expired form"
                                                     onClick={() => renewExpiredForm(formHeader)}/>
                                            </span>
                                    : ""}
                                <span className="img-container">
                                            <img className="pointer" src="/icons/edit.svg" alt="edit"
                                                 title={(formHeader.FormStatus === Enums.FormStatus.Completed ? "View completed form" : "Edit draft form")}
                                                 onClick={() => doManageFormHeader(formHeader)}/>
                                        </span>
                            </td>
                        </tr>
                    </>);
                })}
                </tbody>
            </table>
        </div>

        {!onlyLinkedForms && unallocatedFormDefinitions().length > 0 ? <>
            <div className="row">
                <div className="column">
                    <SCDropdownList
                        options={unallocatedFormDefinitions()}
                        label="Other forms"
                        onChange={setSelectedFormDefinition}
                        value={selectedFormDefinition}
                        dataItemKey="ID"
                        textField="Name"
                        canClear={true}
                    />
                    {/* <SelectInput
                            options={unallocatedFormDefinitions()}
                            noInput={true}
                            label="Other forms"
                            setSelected={setSelectedFormDefinition}
                            type="form-definition"
                            value={selectedFormDefinition ? selectedFormDefinition.Name : ""}
                        /> */}
                </div>
                <div className="column" style={{position: "relative"}}>
                    {selectedFormDefinition ? <div style={{position: "absolute", bottom: 0}}>
                        {/*<LegacyButton text="Add Form" onClick={() => addSelectedFormDefinition(selectedFormDefinition)}/>*/}
                        <Button onClick={() => addSelectedFormDefinition(selectedFormDefinition)}>Add Form</Button>
                    </div> : ""}
                </div>
            </div>
        </> : ""}

        <div>
            <div>
                <Button mt={'sm'} onClick={onClose} variant={'outline'}>
                    Close
                </Button>
                {/*<LegacyButton text="Close" extraClasses="hollow" onClick={onClose}/>*/}
            </div>
        </div>
    </SCModal>



    {manageFormHeader ? <>
        <ManageForm
            onSave={onSave}
            onRenew={onRenew}
            formHeaderToManage={manageFormHeader}
            isNew={manageFormHeader._isNew}
        />
    </> : ""}

    <style jsx>{`
        .expired {
            color: ${colors.warningRed};
        }

        .pointer {
            cursor: pointer;
        }

        .narrow-column {
            width: 94px;
        }

        .fit-column {
            width: max-content;
        }

        .img-container {
            margin-left: 0.25rem;
        }

        .row {
            display: flex;
            justify-content: space-between;
        }

        .column {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .column + .column {
            margin-left: 1.25rem;
        }

        .end {
            align-items: flex-end;
        }

        .header {
            font-weight: bold;
        }

        .button-widths {
            width: 6rem;
        }

        .left-padding {
            padding-left: 0.5em;
        }

        .right-padding {
            padding-right: 0.5em;
        }


        .table-container {
            overflow-x: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .table {
            border-collapse: collapse;
            margin-top: 1.5rem;
            width: 100%;
        }

        .table thead tr {
            background-color: ${colors.backgroundGrey};
            height: 3rem;
            border-radius: ${layout.cardRadius};
            width: 100%;
        }

        .table th {
            color: ${colors.darkPrimary};
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

        .table th.number-column {
            padding-right: 0;
            text-align: right;
        }

        .table th:last-child {
            padding-right: 1rem;
            text-align: right;
        }

        .table th:first-child {
            padding-left: 0.5rem;
            text-align: left;
        }

        .table .spacer {
            height: 0.75rem !important;
        }

        .table tr {
            height: 2.5rem;
        }

        .table td {
            font-size: 12px;
            padding-right: 1rem;
        }

        .table td.number-column {
            padding-right: 0;
            text-align: right;
        }

        .table tr:nth-child(even) td {
            background-color: ${colors.white};
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

        .table td:first-child :global(div) {
            margin-left: 0;
        }

    `}</style>
    </>);
};

export default FormDefinitionsForItem;