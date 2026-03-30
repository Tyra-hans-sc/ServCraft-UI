import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoDatePicker from '../kendo/kendo-date-picker';
import SelectInput from '../select-input';
import TextArea from '../text-area';
import TextInput from '../text-input';
import Button from '../button';
import ToastContext from '../../utils/toast-context';
import Time from '../../utils/time';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ItemComments from '../shared-views/item-comments';
import AssignEmployee from '../shared-views/assign-employee';
import AuditLog from '../shared-views/audit-log';
import CustomerContactLocationSelector from '../selectors/customer/customer-contact-location-selector';
import PS from '../../services/permission/permission-service';
import Storage from '../../utils/storage';
import StoreSelector from '../selectors/store/store-selector';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import EmployeeSelector from '../selectors/employee/employee-selector';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import {Box, Flex} from "@mantine/core";
import constants from "../../utils/constants";

function ProjectDetails({ project, updateProject, customer, setCustomer, contact, setContact, contacts, setContacts,
  location, setLocation, locations, setLocations, employee, setEmployee,
  triggerSaveComment,
  // comments, newComment, submitComment, setNewComment, canLoadMoreComments, loadMoreComments,
  inputErrors, accessStatus }) {

  const toast = useContext(ToastContext);

  useEffect(() => {
    getStore();
  }, []);

  const handleInputChange = (e) => {
    updateProject(e.target.name, e.target.value);
  };

  const handleInputChangeSC = (e) => {
    updateProject(e.name, e.value);
  }

  const handleFloatChange = (e) => {
    updateProject(e.target.name, parseFloat(e.target.value));
  };

  const handleFloatChangeSC = (e) => {
    updateProject(e.name, parseFloat(e.value));
  };

  const handleDateChange = (day, fieldName) => {
    updateProject(fieldName, day ? Time.toISOString(Time.parseDate(day)) : null);
  };

  // EMPLOYEES

  const assignEmployee = (employee) => {
    setEmployee(employee);
    updateProject(null, null, [{
      key: 'Employee',
      value: employee
    }, {
      key: 'EmployeeID',
      value: employee ? employee.ID : null
    }]);
  };

  // COMMENTS

  // const handleCommentChange = (e) => {
  //   setNewComment(e.target.value);
  // };

  // const [submitting, setSubmitting] = useState(false);

  // async function submitTheComment() {

  //   if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }

  //   setSubmitting(true);
  //   submitComment();
  //   setSubmitting(false);
  // }

  const [isMultiStore, setIsMultiStore] = useState(false);
  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);
  };

  const [selectedStore, setSelectedStore] = useState(project ? project.Store : null);

    return (
        <div>

            <CustomerContactLocationSelector selectedCustomer={customer} setSelectedCustomer={setCustomer}
                                             canChangeCustomer={false}
                                             selectedContact={contact} setSelectedContact={setContact}
                                             selectedLocation={location} setSelectedLocation={setLocation}
                                             detailsView={false} module={null} inputErrors={inputErrors}
                                             accessStatus={accessStatus} iconMode={true}
                                             canEditCustomerInNormalView={true}
            />

            <div className="heading">
                Project Details
            </div>

            <Flex gap={0} align={'stretch'} direction={'column'} style={{ maxWidth: constants.maxFormWidth }}>
                <Flex gap={'sm'} align={'stretch'} style={{flexGrow: 1}} direction={{base: 'column', xs: 'row', md: 'column'}} wrap={'wrap'}>
                    {
                        isMultiStore &&
                        <Box
                            style={{flexGrow: 1}}
                        >
                            <StoreSelector
                                accessStatus={accessStatus}
                                disabled={true}
                                selectedStore={selectedStore}
                                setSelectedStore={setSelectedStore}
                            />
                        </Box>
                    }
                </Flex>
                <Flex wrap={'wrap'} gap={0} justify={'space-between'} w={'100%'}>
                    <Box
                        w={{base: '100%', xs: '49%'}}
                    >
                        <SCDatePicker
                            label="Start date"
                            required={true}
                            name="StartDate"
                            changeHandler={(e) => handleDateChange(e.value, "StartDate")}
                            value={project.StartDate}
                            error={inputErrors.StartDate}
                        />
                    </Box>
                    <Box
                        w={{base: '100%', xs: '49%'}}
                    >
                        <SCDatePicker
                            label="Due date"
                            name="DueDate"
                            changeHandler={(e) => handleDateChange(e.value, "DueDate")}
                            value={project.DueDate}
                            error={inputErrors.DueDate}
                            canClear={true}
                        />
                    </Box>
                </Flex>

                <Flex wrap={'wrap'} gap={0} justify={'space-between'} w={'100%'}>
                    <Box
                        // style={{flexGrow: 1}}
                        w={{base: '100%', xs: '49%'}}
                    >
                        <SCNumericInput
                            error={inputErrors.Budget}
                            label="Budget estimate of the project"
                            name="Budget"
                            value={project.Budget}
                            format={Enums.NumericFormat.Currency}
                            onChange={handleFloatChangeSC}
                        />
                    </Box>
                    <Box
                        // style={{flexGrow: 1}}
                        w={{base: '100%', xs: '49%'}}
                    >
                        <EmployeeSelector
                            accessStatus={accessStatus}
                            error={inputErrors.Employee}
                            storeID={project.StoreID}
                            required={true}
                            selectedEmployee={employee}
                            setSelectedEmployee={assignEmployee}
                            canClear={false}
                        />
                    </Box>
                </Flex>

                <Flex wrap={'wrap'} gap={'sm'}>
                    <Box style={{flexGrow: 1}}>
                        <SCTextArea
                            maw={'100%'}
                            onChange={handleInputChangeSC}
                            error={inputErrors.Description}
                            label="Description of the project"
                            name="Description"
                            required={true}
                            value={project.Description}
                        />
                    </Box>
                </Flex>

            </Flex>

            <div className="comments-and-history">
                <ItemComments
                    itemID={project.ID}
                    module={Enums.Module.Project}
                    storeID={project.StoreID}
                    triggerSave={triggerSaveComment}
                    // comments={comments}
                    // handleCommentChange={handleCommentChange}
                    // newComment={newComment}
                    // submitComment={submitTheComment}
                    // submitting={submitting}
                    // canLoadMoreComments={canLoadMoreComments}
                    // loadMoreComments={loadMoreComments}
                />

                <AuditLog recordID={project.ID} retriggerSearch={project}/>
            </div>
            <style jsx>{`
                .container {
                    margin-top: 0.5rem;
                    position: relative;
                }

                .row {
                    display: flex;
                }

                .column {
                    display: flex;
                    flex-basis: 0;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .column :global(.textarea-container) {
                    height: 100%;
                }

                .column + .column {
                    margin-left: 1.25rem;
                }

                .edit-img {
                    margin-top: -1rem;
                    margin-left: 1rem;
                    cursor: pointer;
                }

                .location {
                    margin-top: 0;
                }

                .contact {
                    color: ${colors.blueGrey};
                }

                .contact h1 {
                    color: ${colors.darkPrimary};
                    font-size: 2rem;
                    margin: 0 0 0.75rem;
                }

                .contact div {
                    margin: 3px 0 0;
                    opacity: 0.8;
                }

                .heading {
                    color: ${colors.blueGrey};
                    font-weight: bold;
                    margin: 1.5rem 0 0.5rem;
                }

                .new-comment {
                    position: relative;
                }

                .new-comment img {
                    cursor: pointer;
                    position: absolute;
                    right: 1rem;
                    top: 1rem;
                }

                .loader {
                    border-color: rgba(113, 143, 162, 0.2);
                    border-left-color: ${colors.blueGrey};
                    display: block;
                    margin-bottom: 1rem;
                    margin-top: 1rem;
                }

                .comment {
                    background-color: ${colors.white};
                    border-radius: ${layout.cardRadius};
                    box-sizing: border-box;
                    color: ${colors.blueGrey};
                    display: flex;
                    flex-direction: column;
                    height: 5rem;
                    justify-content: center;
                    margin-top: 0.5rem;
                    padding: 0.5rem 1rem;
                    position: relative;
                    width: 100%;
                }

                .comment-info {
                    align-items: center;
                    display: flex;
                    margin-bottom: 4px;
                }

                .query {
                    color: ${colors.bluePrimary};
                    font-weight: bold;
                }

                .name {
                    color: ${colors.darkPrimary};
                    font-weight: bold;
                }

                .status {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 20rem;
                }

                .status :global(.input-container) {
                    background-color: ${colors.bluePrimary};
                }

                .status :global(input) {
                    color: ${colors.white};
                }

                .status :global(label) {
                    color: ${colors.white};
                    opacity: 0.8;
                }

                .comments-and-history {
                    padding-right: 3rem;
                }
            `}</style>
        </div>
    );
}

export default ProjectDetails;
