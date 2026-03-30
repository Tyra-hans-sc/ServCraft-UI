import React, { useState, useEffect } from 'react';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import Fetch from '../../utils/Fetch';
import InfoTooltip from '../info-tooltip';
import { colors, layout, shadows } from '../../theme';

function EditPermissions({ selectedPermissions, setSelectedPermissions, employee }) {

    const [allPermissions, setAllPermissions] = useState([]);
    const [serverPermissions, setServerPermissions] = useState([]);
    const [simplePermission, setSimplePermission] = useState(false);
    const [advancedPermission, setAdvancedPermission] = useState(false);
    const [expandedPermissions, setExpandedPermissions] = useState([]);

    useEffect(() => {
        getServerPermissions();
    }, []);

    const getServerPermissions = async () => {
        const request = await Fetch.get({
            url: `/Permission/GetPermissions`
        });
        setServerPermissions(request.Results);
    };

    useEffect(() => {
        if (serverPermissions && serverPermissions.length > 0) {
            const subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
            let advancedPermission = subscriptionInfo.AdvancedPermission === true;

            if (advancedPermission) {
                setupAdvancedPermissions();
            } else {
                setupSimplePermissions();
            }
        }
    }, [serverPermissions]);

    const findDescription = (permName) => {
        let perm = serverPermissions.find(x => x.ID.toUpperCase() == permName);
        if (perm) {
            if (advancedPermission) {
                return perm.Description;
            } else {
                return perm.SimpleDescription ? perm.SimpleDescription : perm.Description;
            }
        } else {
            return '';
        }
    };

    const setupSimplePermissions = () => {
        setSimplePermission(true);
        setAllPermissions([
            { name: Enums.PermissionName.Job, label: "Jobs", description: findDescription(Enums.PermissionName.Job) },
            { name: Enums.PermissionName.Quote, label: "Quotes", description: findDescription(Enums.PermissionName.Quote) },
            { name: Enums.PermissionName.Invoice, label: "Invoices", description: findDescription(Enums.PermissionName.Invoice) },
            { name: Enums.PermissionName.Product, label: "Assets", description: findDescription(Enums.PermissionName.Product) },
            { name: Enums.PermissionName.Inventory, label: "Inventories", description: findDescription(Enums.PermissionName.Inventory) },
            { name: Enums.PermissionName.Reports, label: "Reports", description: findDescription(Enums.PermissionName.Reports) },
            { name: Enums.PermissionName.UserManagement, label: "Employees", description: findDescription(Enums.PermissionName.UserManagement) },
            { name: Enums.PermissionName.Query, label: "Queries", description: findDescription(Enums.PermissionName.Query) },
            { name: Enums.PermissionName.Appointment, label: "Appointments", description: findDescription(Enums.PermissionName.Appointment) },
            { name: Enums.PermissionName.PurchaseOrder, label: "Purchase Orders", description: findDescription(Enums.PermissionName.PurchaseOrder) },
            { name: Enums.PermissionName.Customer, label: "Customers", description: findDescription(Enums.PermissionName.Customer) },
            { name: Enums.PermissionName.Comment, label: "Comments", description: findDescription(Enums.PermissionName.Comment) },
            { name: Enums.PermissionName.Message, label: "Messages", description: findDescription(Enums.PermissionName.Message) },
            { name: Enums.PermissionName.MasterOfficeAdmin, label: "Settings", description: findDescription(Enums.PermissionName.MasterOfficeAdmin) },
            { name: Enums.PermissionName.Technician, label: "My View Only (Applies to selected permissions)", description: findDescription(Enums.PermissionName.Technician) }
        ]);
    };

    const setupAdvancedPermissions = () => {
        setAdvancedPermission(true);

        let perms = [];
        let jobPerm = { name: Enums.PermissionName.Job, label: "Jobs", description: findDescription(Enums.PermissionName.Job), children: [] };
        jobPerm.children.push(...[
            { name: Enums.PermissionName.EditJob, label: "Edit Job", description: findDescription(Enums.PermissionName.EditJob), children: [] },
            { name: Enums.PermissionName.CloseJob, label: "Close Job", description: findDescription(Enums.PermissionName.CloseJob), children: [] },
            { name: Enums.PermissionName.ArchiveJob, label: "Archive Job", description: findDescription(Enums.PermissionName.ArchiveJob), children: [] },
            { name: Enums.PermissionName.AddTaskItems, label: "Add Task Items", description: findDescription(Enums.PermissionName.AddTaskItems), children: [] },
            { name: Enums.PermissionName.RecurringJob, label: "Recurring Jobs", description: findDescription(Enums.PermissionName.RecurringJob), children: [] },
            // { name: Enums.PermissionName.AddRepeatJobs, label: "Add Repeat Jobs", children: [] },
            { name: Enums.PermissionName.ManageItemsUsed, label: "Manage Materials", description: findDescription(Enums.PermissionName.ManageItemsUsed), children: [] },
            { name: Enums.PermissionName.ManageMyTimers, label: "Manage My Timers", description: findDescription(Enums.PermissionName.ManageMyTimers), children: [] },
            { name: Enums.PermissionName.EditOtherTimers, label: "Edit Other Timers", description: findDescription(Enums.PermissionName.EditOtherTimers), children: [] },
            { name: Enums.PermissionName.Project, label: "Projects", description: findDescription(Enums.PermissionName.Project), children: [] },
            { name: Enums.PermissionName.StoreChangeJob, label: "Store Change", description: findDescription(Enums.PermissionName.StoreChangeJob), children: [] },
            { name: Enums.PermissionName.ChangeJobLocation, label: "Change Location", description: findDescription(Enums.PermissionName.ChangeJobLocation), children: [] },
        ]);
        perms.push(jobPerm);
        let customerPerm = { name: Enums.PermissionName.Customer, label: "Customers", description: findDescription(Enums.PermissionName.Customer), children: [] };
        customerPerm.children.push(...[
            { name: Enums.PermissionName.EditCustomer, label: "Edit Customer", description: findDescription(Enums.PermissionName.EditCustomer), children: [] },
            { name: Enums.PermissionName.ModuleChangeCustomer, label: "Change Customer for Modules", description: findDescription(Enums.PermissionName.ModuleChangeCustomer), children: [] },
        ]);
        perms.push(customerPerm);
        let reportPerm = { name: Enums.PermissionName.Reports, label: "Reports", description: findDescription(Enums.PermissionName.Reports), children: [] };
        perms.push(reportPerm);
        let settingsPerm = { name: Enums.PermissionName.MasterOfficeAdmin, label: "Settings", description: findDescription(Enums.PermissionName.MasterOfficeAdmin), children: [] };
        settingsPerm.children.push(...[
            { name: Enums.PermissionName.EditCompany, label: "Edit Company", description: findDescription(Enums.PermissionName.EditCompany), children: [] },
            { name: Enums.PermissionName.UserManagement, label: "Employees", description: findDescription(Enums.PermissionName.UserManagement), children: [] }
        ]);
        perms.push(settingsPerm);

        perms.push(...[
            { name: Enums.PermissionName.ChangeMyPassword, label: "Change My Password", description: findDescription(Enums.PermissionName.ChangeMyPassword), children: [] },
            { name: Enums.PermissionName.Query, label: "Queries", description: findDescription(Enums.PermissionName.Query), children: [] },
            { name: Enums.PermissionName.Appointment, label: "Appointments", description: findDescription(Enums.PermissionName.Appointment), children: [] },
        ]);

        let quotePerm = { name: Enums.PermissionName.Quote, label: "Quotes", description: findDescription(Enums.PermissionName.Quote), children: [] };
        quotePerm.children.push(...[
            { name: Enums.PermissionName.QuoteRevert, label: "Revert Quotes", description: findDescription(Enums.PermissionName.QuoteRevert) }
        ]);
        perms.push(quotePerm);

        let invoicePerm = { name: Enums.PermissionName.Invoice, label: "Invoices", description: findDescription(Enums.PermissionName.Invoice), children: [] };
        invoicePerm.children.push(...[
            { name: Enums.PermissionName.InvoiceRevert, label: "Revert Invoices", description: findDescription(Enums.PermissionName.InvoiceRevert) }
        ]);
        perms.push(invoicePerm);

        let purchaseOrderPerm = { name: Enums.PermissionName.PurchaseOrder, label: "Purchase Orders", description: findDescription(Enums.PermissionName.PurchaseOrder), children: [] };
        purchaseOrderPerm.children.push(...[
            { name: Enums.PermissionName.PurchaseOrderRevert, label: "Revert Purchase Orders", description: findDescription(Enums.PermissionName.PurchaseOrderRevert) }
        ]);
        perms.push(purchaseOrderPerm);

        perms.push(...[
            { name: Enums.PermissionName.Product, label: "Assets", description: findDescription(Enums.PermissionName.Product), children: [] },
            { name: Enums.PermissionName.Inventory, label: "Inventories", description: findDescription(Enums.PermissionName.Inventory), children: [] },
            { name: Enums.PermissionName.Message, label: "Messages", description: findDescription(Enums.PermissionName.Message), children: [] },
            {
                name: Enums.PermissionName.Comment, label: "Comments", description: findDescription(Enums.PermissionName.Comment), children: [
                    { name: Enums.PermissionName.AllowPublicComments, label: "Public Comments", description: findDescription(Enums.PermissionName.AllowPublicComments) },
                    { name: Enums.PermissionName.EditComments, label: "Edit Comment", description: findDescription(Enums.PermissionName.EditComments) }
                ]
            },
            { name: Enums.PermissionName.Exports, label: "Exports", description: findDescription(Enums.PermissionName.Exports), children: [] },
            { name: Enums.PermissionName.AttachmentSecure, label: "Secure Attachments", description: findDescription(Enums.PermissionName.AttachmentSecure), children: [] },
            { name: Enums.PermissionName.Technician, label: "My View Only (Applies to selected permissions)", description: findDescription(Enums.PermissionName.Technician), children: [] }
        ]);

        setAllPermissions(perms);
        setExpandedPermissions(perms.map(x => x.name));
    };

    const allPermissionCount = () => {
        if (!advancedPermission || !allPermissions)
            return allPermissions.length;

        let count = 0;
        allPermissions.forEach(perm => {
            count += 1 + perm.children.length;
        });
        return count;
    };

    const allPermissionsFirstHalf = () => {
        if (!advancedPermission || !allPermissions) return;
        let totalCount = allPermissionCount();

        let perms = [];
        let count = 0;
        allPermissions.forEach(perm => {
            count += 1 + perm.children.length;
            if (count <= totalCount / 2) {
                perms.push(perm);
            }
        });
        return perms;
    };

    const allPermissionsSecondHalf = () => {
        if (!advancedPermission || !allPermissions) return;

        let perms = [];
        let firstHalfCount = allPermissionsFirstHalf().length;
        for (let i = firstHalfCount; i < allPermissions.length; i++) {
            perms.push(allPermissions[i]);
        }
        return perms;
    };

    const simplePermissionsFirstHalf = () => {
        let totalCount = allPermissionCount();

        let perms = [];
        let count = 0;
        allPermissions.forEach(perm => {
            count += 1;
            if (count <= totalCount / 2) {
                perms.push(perm);
            }
        });
        return perms;
    };

    const simplePermissionsSecondHalf = () => {
        let perms = [];
        let firstHalfCount = simplePermissionsFirstHalf().length;
        for (let i = firstHalfCount; i < allPermissions.length; i++) {
            perms.push(allPermissions[i]);
        }
        return perms;
    };

    const isSelected = (permName, list = selectedPermissions) => {
        return list.indexOf(permName) > -1;
    };

    const permissionChange = (permName, children, selectAll = false) => {
        let list = [...selectedPermissions];
        let unselect = false;
        if (isSelected(permName, list)) {
            if (!selectAll) {
                list.splice(list.indexOf(permName), 1);
                unselect = true;
            }
        } else {
            list.push(permName);
        }

        if (children && children.length > 0 && unselect) {
            children.forEach(child => {
                if (isSelected(child.name, list)) {
                    list.splice(list.indexOf(child.name), 1);
                }
            });
        }
        else if (children && children.length > 0 && selectAll) {
            children.forEach(child => {
                if (!isSelected(child.name, list)) {
                    list.push(child.name);
                }
            });
        }

        setSelectedPermissions(list);
    };

    const plotSimplePermission = (perm) => {
        return (<>
            <div className="row">
                <SCCheckbox
                    onChange={() => permissionChange(perm.name)}
                    value={isSelected(perm.name)}
                    label={perm.label}
                />
                <InfoTooltip title={perm.description} />
            </div>
        </>)
    };

    const plotAdvancedPermission = (perm) => {
        let hasChildren = perm.children && perm.children.length > 0;

        const selectAll = () => {
            permissionChange(perm.name, perm.children, true)
            expandPermission();
        };

        const isAllSelected = () => {
            let allSelected = true;
            let permissionsToCheck = [];

            if (hasChildren) {
                permissionsToCheck = perm.children.map(x => x.name);
            }

            permissionsToCheck.push(perm.name);

            permissionsToCheck.forEach(permName => {
                if (!isSelected(permName)) {
                    allSelected = false;
                }
            });
            return allSelected;
        };

        const isNoneSelected = () => {
            let noneSelected = true;
            let permissionsToCheck = [];

            if (hasChildren) {
                permissionsToCheck = perm.children.map(x => x.name);
            }

            permissionsToCheck.push(perm.name);

            permissionsToCheck.forEach(permName => {
                if (isSelected(permName)) {
                    noneSelected = false;
                }
            });
            return noneSelected;
        };

        const isExpanded = () => {
            return expandedPermissions.includes(perm.name);
        }

        const expandPermission = () => {
            setExpandedPermissions(exp => {
                let newExp = [...exp];
                newExp.push(perm.name);
                return newExp;
            })
        }

        const contractPermission = () => {
            setExpandedPermissions(exp => {
                let newExp = [...exp];
                let idx = newExp.indexOf(perm.name);
                newExp.splice(idx, 1);
                return newExp;
            })
        };

        return (<div className='permission-parent'>
            <div className="row permission-row">
                <SCCheckbox
                    onChange={() => permissionChange(perm.name, perm.children)}
                    value={isSelected(perm.name)}
                    indeterminate={isAllSelected() || isNoneSelected() ? undefined : true}
                    label={perm.label.toUpperCase()}
                />

                <div className="tooltip-container">
                    <div className="tooltip-container-inner">
                        <InfoTooltip title={perm.description} />
                    </div>
                    {hasChildren && !isAllSelected() && <span className='select-all' onClick={selectAll}>Select All</span>}

                </div>
            </div>
            {hasChildren && <div style={{ position: "relative" }}>
                {!isExpanded() ?
                    <div title="Show Sub-permissions" className="expand" onClick={() => expandPermission()}>+</div>
                    :
                    <div title="Hide Sub-permissions" className="contract" onClick={() => contractPermission()}>-</div>
                }
                {isExpanded() && <div className="permission-accordion">
                    {
                        perm.children.map(function (child) {
                            return (<div className="row indented permission-row">
                                <SCCheckbox
                                    onChange={() => permissionChange(child.name)}
                                    value={isSelected(child.name)}
                                    disabled={!isSelected(perm.name)}
                                    label={child.label}
                                />
                                <div className="tooltip-container-inner">
                                    <InfoTooltip title={child.description} />
                                </div>
                            </div>);
                        })
                    }
                </div>
                }
            </div>}


            <style jsx>{`

                .permission-parent {
                    border: 1px solid rgb(206, 212, 218);
                    padding: 0 0 0.5rem 0.5rem;
                    border-radius: ${layout.cardRadius};
                    margin-bottom: 0.5rem;
                }

                .tooltip-container {
                    /* display: none; */
                    display: flex;
                    position: relative;
                }

                .tooltip-container-inner {
                    display: none;
                }

                .permission-row:hover .tooltip-container-inner {
                    display: block;
                }
                
                .permission-accordion {
                    padding-bottom: 0.5rem;
                }

                .select-all {
                    display: none;
                    font-size: 0.8rem;
                    position: absolute;
                    white-space: nowrap;
                    top: 14px;
                    left: 40px;
                    font-weight: bold;
                    color: ${colors.bluePrimary};
                    opacity: 0.5;
                    cursor: pointer;
                }

                .permission-parent:hover .select-all {
                    display: block;
                }

                .select-all:hover {
                    opacity: 1;
                }

                .expand {
                    cursor: pointer;
                    position: relative; 
                    left: 3px;
                    border: 1px solid black;
                    width: 14px;
                    margin-top: 14px;
                    padding: 2px;
                    line-height: 8px;
                    border-radius: 4px; 
                }

                .contract {
                    cursor: pointer;
                    position: absolute;
                    left: 3px;
                    border: 1px solid black;
                    width: 14px;
                    top: 14px;
                    padding: 1px 4px 3px 4px;
                    line-height: 8px;
                    border-radius: 4px;
                }

                .expand:hover, .contract:hover {
                    background: lightgrey;
                }

            `}</style>
        </div>);
    }

    return (<>

        {simplePermission ? <>
            <div className="row">
                <div className="column">
                    {simplePermissionsFirstHalf().map((perm) => {
                        return plotSimplePermission(perm);
                    })}
                </div>
                <div className="column">
                    {simplePermissionsSecondHalf().map((perm) => {
                        return plotSimplePermission(perm);
                    })}
                </div>
            </div>
        </> : ''
        }

        {advancedPermission ? <>
            <div className="row">
                <div className="column">
                    {allPermissionsFirstHalf().map((perm) => {
                        return plotAdvancedPermission(perm);
                    })}
                    {/* </div>
                <div className="column"> */}
                    {allPermissionsSecondHalf().map((perm) => {
                        return plotAdvancedPermission(perm);
                    })}
                </div>
            </div>
        </> : ""}

        <style jsx>{`
    :global(.row) {
        display: flex;
    }
    :global(.column) {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    :global(.indented) {
        padding-left: 2rem;
    }
 
    {/* :global(.indented:before) {
        content: '${"\\27F6"}';
        width: 1.5rem;
        margin-top: 6px;
        margin-right: 4px
    } */}

    `}</style>
    </>);
}

export default EditPermissions;
