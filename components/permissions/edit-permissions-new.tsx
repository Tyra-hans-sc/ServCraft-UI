import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import { colors, layout } from '../../theme';
import { Button, Flex, Switch, Tooltip, Text, Box } from '@mantine/core';
import SCWidgetTitle from '../sc-controls/widgets/new/sc-widget-title';
import ToastContext from '@/utils/toast-context';
import { IconCaretDownFilled, IconCaretRightFilled } from '@tabler/icons-react';
import permissionService from '@/services/permission/permission-service';
import helper from '@/utils/helper';
import ConfirmAction from '../modals/confirm-action';
import PremiumIcon from "@/PageComponents/Premium/PremiumIcon";
import featureService from '@/services/feature/feature-service';
import constants from '@/utils/constants';
import { useQuery } from "@tanstack/react-query";

function EditPermissionsNew({ employee, onUpdate }: { employee: any, onUpdate?: (selectedPermissionIDs: string[]) => void }) {

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [serverPermissions, setServerPermissions] = useState<any[]>([]);
    const [expandedPermissions, setExpandedPermissions] = useState<string[]>([]);
    const [userIsAnOwner] = useState<boolean>(permissionService.hasPermission(Enums.PermissionName.Owner, true));
    const [confirmOptions, setConfirmOptions] = useState<any>(helper.initialiseConfirmOptions());
    const [hasPOGRVFeature, setHasPOGRVFeature] = useState(false);

    const { data: hasStockTake } = useQuery(['hasStockTake'], () => featureService.getFeature(constants.features.STOCK_TAKE));
    const { data: hasVanStock } = useQuery(['hasVanStock'], () => featureService.getFeature(constants.features.VAN_STOCK));

    const toast = useContext(ToastContext);

    useEffect(() => {

        featureService.getFeature(constants.features.PO_GRV).then(feature => {
            setHasPOGRVFeature(!!feature);
        });

        getEmployeePermissions();
        getServerPermissions();
    }, []);

    const isOwner = () => {
        return employee.Owner === true;
    }

    const getEmployeePermissions = async () => {
        const request = await Fetch.get({
            url: `/Employee/Permission/${employee.ID}`
        } as any);
        setSelectedPermissions(request.Results.map(x => x.ID.toUpperCase()));
    };

    const getServerPermissions = async () => {
        const request = await Fetch.get({
            url: `/Permission/GetPermissions`
        } as any);
        setServerPermissions(request.Results);
    };

    useEffect(() => {
        if (serverPermissions && serverPermissions.length > 0) {
            setupAdvancedPermissions();
        }
    }, [serverPermissions, hasPOGRVFeature, hasStockTake]);

    const findDescription = (permName) => {
        let perm = serverPermissions.find(x => x.ID.toUpperCase() == permName);
        if (perm) {
            return perm.Description;
        } else {
            return '';
        }
    };

    // use this to specify ordering of sections on front end, as well as type safe section names on compile time
    const sectionNames = {
        General: "General",
        Stock: "Stock",
        Financials: "Financials",
        Admin: "Admin"
    };

    const setupAdvancedPermissions = () => {
        let perms: any[] = [];
        let jobPerm = { name: Enums.PermissionName.Job, label: "Jobs", description: findDescription(Enums.PermissionName.Job), children: [] as any[], section: sectionNames.General };
        jobPerm.children.push(...[
            { name: Enums.PermissionName.EditJob, label: "Edit job", description: findDescription(Enums.PermissionName.EditJob), children: [] },
            { name: Enums.PermissionName.CloseJob, label: "Close job", description: findDescription(Enums.PermissionName.CloseJob), children: [] },
            { name: Enums.PermissionName.ArchiveJob, label: "Archive job", description: findDescription(Enums.PermissionName.ArchiveJob), children: [] },
            { name: Enums.PermissionName.AddTaskItems, label: "Add task items", description: findDescription(Enums.PermissionName.AddTaskItems), children: [] },
            { name: Enums.PermissionName.RecurringJob, label: "Recurring jobs", description: findDescription(Enums.PermissionName.RecurringJob), children: [] },
            { name: Enums.PermissionName.ManageItemsUsed, label: "Manage materials", description: findDescription(Enums.PermissionName.ManageItemsUsed), children: [] },
            { name: Enums.PermissionName.ManageMyTimers, label: "Manage my timers", description: findDescription(Enums.PermissionName.ManageMyTimers), children: [] },
            { name: Enums.PermissionName.EditOtherTimers, label: "Edit other timers", description: findDescription(Enums.PermissionName.EditOtherTimers), children: [] },
            { name: Enums.PermissionName.Project, label: "Projects", description: findDescription(Enums.PermissionName.Project), children: [] },
            { name: Enums.PermissionName.StoreChangeJob, label: "Store change", description: findDescription(Enums.PermissionName.StoreChangeJob), children: [] },
            { name: Enums.PermissionName.ChangeJobLocation, label: "Change location", description: findDescription(Enums.PermissionName.ChangeJobLocation), children: [] },
        ]);
        perms.push(jobPerm);
        let customerPerm = { name: Enums.PermissionName.Customer, label: "Customers", description: findDescription(Enums.PermissionName.Customer), children: [] as any[], section: sectionNames.General };
        customerPerm.children.push(...[
            { name: Enums.PermissionName.EditCustomer, label: "Edit customer", description: findDescription(Enums.PermissionName.EditCustomer), children: [] },
            { name: Enums.PermissionName.ModuleChangeCustomer, label: "Change customer for modules", description: findDescription(Enums.PermissionName.ModuleChangeCustomer), children: [] },
        ]);
        perms.push(customerPerm);

        let settingsPerm = { name: Enums.PermissionName.MasterOfficeAdmin, label: "Super Admin", description: findDescription(Enums.PermissionName.MasterOfficeAdmin), children: [] as any[], force: isOwner(), forceReason: "Cannot remove super admin permission for owner", section: sectionNames.Admin };
        settingsPerm.children.push(...[
            { name: Enums.PermissionName.EditCompany, label: "Edit company", description: findDescription(Enums.PermissionName.EditCompany), children: [], force: isOwner(), forceReason: "Cannot remove edit company permission for owner" },
            { name: Enums.PermissionName.UserManagement, label: "Employees", description: findDescription(Enums.PermissionName.UserManagement), children: [], force: isOwner(), forceReason: "Cannot remove employees permission for owner" },
            { name: Enums.PermissionName.Integrations, label: "Integrations", description: findDescription(Enums.PermissionName.Integrations), children: [], force: isOwner(), forceReason: "Cannot remove integrations permission for owner", ownerRequired: true, ownerRequiredReason: "You must be an owner to change this permission" },
            { name: Enums.PermissionName.Subscriptions, label: "Subscriptions", description: findDescription(Enums.PermissionName.Subscriptions), children: [], force: isOwner(), forceReason: "Cannot remove subscriptions permission for owner", ownerRequired: true, ownerRequiredReason: "You must be an owner to change this permission" }
        ]);
        perms.push(settingsPerm);

        perms.push(...[
            { name: Enums.PermissionName.ChangeMyPassword, label: "Change my password", description: findDescription(Enums.PermissionName.ChangeMyPassword), children: [], section: sectionNames.Admin },
            { name: Enums.PermissionName.Query, label: "Queries", description: findDescription(Enums.PermissionName.Query), children: [], section: sectionNames.General },
            { name: Enums.PermissionName.Appointment, label: "Appointments", description: findDescription(Enums.PermissionName.Appointment), children: [], section: sectionNames.General },
        ]);

        let quotePerm = { name: Enums.PermissionName.Quote, label: "Quotes", description: findDescription(Enums.PermissionName.Quote), children: [] as any[], section: sectionNames.Financials };
        quotePerm.children.push(...[
            { name: Enums.PermissionName.QuoteRevert, label: "Revert quotes", description: findDescription(Enums.PermissionName.QuoteRevert) },
            { name: Enums.PermissionName.QuoteApprove, label: "Approve quotes", description: findDescription(Enums.PermissionName.QuoteApprove) }
        ]);
        perms.push(quotePerm);

        let invoicePerm = { name: Enums.PermissionName.Invoice, label: "Invoices", description: findDescription(Enums.PermissionName.Invoice), children: [] as any[], section: sectionNames.Financials };
        invoicePerm.children.push(...[
            { name: Enums.PermissionName.InvoiceRevert, label: "Revert invoices", description: findDescription(Enums.PermissionName.InvoiceRevert) },
            { name: Enums.PermissionName.InvoiceApprove, label: "Approve invoices", description: findDescription(Enums.PermissionName.InvoiceApprove) }
        ]);
        perms.push(invoicePerm);

        let purchaseOrderPerm = { name: Enums.PermissionName.PurchaseOrder, label: "Purchase Orders", description: findDescription(Enums.PermissionName.PurchaseOrder), children: [] as any[], section: sectionNames.Financials };
        purchaseOrderPerm.children.push(...[
            { name: Enums.PermissionName.PurchaseOrderRevert, label: "Revert purchase orders", description: findDescription(Enums.PermissionName.PurchaseOrderRevert) },
            { name: Enums.PermissionName.PurchaseOrderApprove, label: "Approve purchase orders", description: findDescription(Enums.PermissionName.PurchaseOrderApprove) },
            ...(hasPOGRVFeature ? [{ name: Enums.PermissionName.PurchaseOrderReceiveStock, label: "Receive stock", description: findDescription(Enums.PermissionName.PurchaseOrderReceiveStock) }] : []),
        ]);
        perms.push(purchaseOrderPerm);

        let manageCostingPerm = {
            name: Enums.PermissionName.ManageCosting,
            label: <Flex align={'center'} direction={'row'} gap={'xs'}><Text fw={600}>Manage Costing  </Text> <Box pos={'relative'} miw={20}><Box pos={'absolute'} left={-2} top={-15}> <PremiumIcon /></Box></Box> </Flex>,
            description: 'Manage costing for Jobs (exciting new features coming soon!)',
            children: [] as any[],
            section: sectionNames.Financials
        };
        perms.push(manageCostingPerm);

        perms.push(...[
            { name: Enums.PermissionName.Product, label: "Assets", description: findDescription(Enums.PermissionName.Product), children: [], section: sectionNames.General },
            {
                name: Enums.PermissionName.Inventory, label: "Inventory", description: findDescription(Enums.PermissionName.Inventory), children: [{
                    name: Enums.PermissionName.InventoryCostPrice, label: "Cost Price", description: findDescription(Enums.PermissionName.InventoryCostPrice), children: [], section: sectionNames.General
                }, {
                    name: Enums.PermissionName.WarehouseStockEditLevels, label: "Edit Stock Levels", description: findDescription(Enums.PermissionName.WarehouseStockEditLevels), children: [], section: sectionNames.General
                }], section: sectionNames.General
            },
            {
                name: Enums.PermissionName.StockTransactionsView, label: "Stock Transactions", description: findDescription(Enums.PermissionName.StockTransactionsView), children: [
                    ...(hasPOGRVFeature ? [{ name: Enums.PermissionName.StockTransactionGRV, label: "GRVs", description: findDescription(Enums.PermissionName.StockTransactionGRV) }] : []),
                    { name: Enums.PermissionName.StockTransactionAdjustment, label: "Adjustments", description: findDescription(Enums.PermissionName.StockTransactionAdjustment) },
                    { name: Enums.PermissionName.StockTransactionTransfer, label: "Transfers", description: findDescription(Enums.PermissionName.StockTransactionTransfer) },
                ], section: sectionNames.Stock
            },
            ...[hasStockTake && {
                name: Enums.PermissionName.StockTake,
                label: "Stock Take Capturer",
                description: findDescription(Enums.PermissionName.StockTake),
                children: [
                    {
                        name: Enums.PermissionName.StockTakeManager,
                        label: "Stock Take Manager",
                        description: findDescription(Enums.PermissionName.StockTakeManager)
                    },
                ],
                section: sectionNames.Stock
            } || {}],
            ...[hasVanStock && {
                name: Enums.PermissionName.VanManage,
                label: "Van Stock Manager",
                description: findDescription(Enums.PermissionName.VanManage),
                children: [
                    // {
                    //     name: Enums.PermissionName.VanManage,
                    //     label: "Van Stock Manager",
                    //     description: findDescription(Enums.PermissionName.VanManage)
                    // },
                ],
                section: sectionNames.Stock
            } || {}],
            {
                name: Enums.PermissionName.Comment, label: "Comments", description: findDescription(Enums.PermissionName.Comment), children: [
                    { name: Enums.PermissionName.AllowPublicComments, label: "Public comments", description: findDescription(Enums.PermissionName.AllowPublicComments) },
                    { name: Enums.PermissionName.EditComments, label: "Edit comment", description: findDescription(Enums.PermissionName.EditComments) }
                ], section: sectionNames.General
            },
            { name: Enums.PermissionName.Reports, label: "Reports", description: findDescription(Enums.PermissionName.Reports), children: [], section: sectionNames.Admin },
            { name: Enums.PermissionName.Exports, label: "Exports", description: findDescription(Enums.PermissionName.Exports), children: [], section: sectionNames.Admin },
            { name: Enums.PermissionName.Message, label: "Messages", description: findDescription(Enums.PermissionName.Message), children: [], section: sectionNames.Admin },
            { name: Enums.PermissionName.AttachmentSecure, label: "Secure attachments", description: findDescription(Enums.PermissionName.AttachmentSecure), children: [], section: sectionNames.Admin },
            // { name: Enums.PermissionName.Technician, label: "My View Only (Applies to selected permissions)", description: findDescription(Enums.PermissionName.Technician), children: [], section: sectionNames.Operations }
            { name: Enums.PermissionName.Technician, label: "View all items", description: "Can see items, for example jobs or quotes, that are unassigned, assigned to themselves or assigned to other employees.", children: [], section: sectionNames.General, invert: true }
        ]);

        setAllPermissions(perms.filter(x => !!x.name));
    };

    const isSelected = (permName, list = selectedPermissions, invert = false) => {
        let selected = list.indexOf(permName) > -1;
        if (invert) selected = !selected;
        return selected;
    };

    const canEnableAllPermissionsForSection = (sectionName) => {
        let list: string[] = [];
        let invertedList: string[] = [];

        let selected = [...selectedPermissions];

        allPermissions.filter(x => x.section === sectionName).forEach(parent => {
            if (parent.invert !== true) {
                list.push(parent.name);
            }
            else {
                invertedList.push(parent.name);
            }

            if (parent.force === true) {
                selected.push(parent.name);
            }
            if (Array.isArray(parent.children)) {
                parent.children.forEach(child => {
                    if (child.invert !== true) {
                        list.push(child.name);
                    }
                    else {
                        invertedList.push(child.name);
                    }
                    if (child.force === true) {
                        selected.push(child.name);
                    }
                });
            }
        });

        let allSelected = true;
        list.forEach(name => {
            allSelected = allSelected && selected.includes(name);
        });
        invertedList.forEach(name => {
            allSelected = allSelected && !selected.includes(name);
        });

        return canSelectAllInSection(sectionName) && !allSelected;
    };

    const enableAllPermissionsForSection = (sectionName) => {

        let list: string[] = [...selectedPermissions];

        allPermissions.filter(x => x.section === sectionName).forEach(parent => {
            let canEditPermission = (userIsAnOwner || parent.ownerRequired !== true) && parent.force !== true;

            if (canEditPermission) {
                if (!parent.invert && !list.includes(parent.name)) {
                    list.push(parent.name);
                }
                else if (parent.invert && list.includes(parent.name)) {
                    list.splice(list.indexOf(parent.name), 1);
                }
                if (Array.isArray(parent.children)) {
                    parent.children.forEach(child => {
                        let canEditChildPermission = (userIsAnOwner || child.ownerRequired !== true) && child.force !== true;

                        if (canEditChildPermission) {
                            if (!child.invert && !list.includes(child.name)) {
                                list.push(child.name);
                            }
                            else if (child.invert && list.includes(child.name)) {
                                list.splice(list.indexOf(child.name), 1);
                            }
                        }
                    });
                }
            }
        });

        setSelectedPermissions(list);
        onUpdate && onUpdate(list);
        saveSelectedPermissions(list);
    }

    const permissionChange = (permName, children = [], selectAll = false, parentName = null) => {
        let list = [...selectedPermissions];
        let unselect = false;
        let canExpand = false;
        let canContract = false;
        if (isSelected(permName, list)) {
            if (!selectAll) {
                list.splice(list.indexOf(permName), 1);
                unselect = true;
                canContract = children && children.length > 0;
            }
            else {
                canExpand = children && children.length > 0;
            }
        } else {
            canExpand = children && children.length > 0;
            list.push(permName);
        }

        if (children && children.length > 0 && unselect) {
            children.forEach((child: any) => {
                if (isSelected(child.name, list)) {
                    list.splice(list.indexOf(child.name), 1);
                }
            });
        }
        else if (children && children.length > 0 && selectAll) {
            children.forEach((child: any) => {
                if (!isSelected(child.name, list)) {
                    list.push(child.name);
                }
            });
        }

        if (parentName && !isSelected(parentName, list)) {
            list.push(parentName);
        }

        setSelectedPermissions(list);
        onUpdate && onUpdate(list);
        saveSelectedPermissions(list);

        if (canExpand) {
            expand(permName);
        }
        else if (canContract) {
            contract(permName);
        }
    };

    const expand = (permName) => {
        let expanded = [...expandedPermissions];
        if (!expanded.includes(permName)) {
            expanded.push(permName);
            setExpandedPermissions(expanded);
        }
    };

    const contract = (permName) => {
        let expanded = [...expandedPermissions];
        let expandedIndex = expanded.indexOf(permName);
        if (expandedIndex > -1) {
            expanded.splice(expandedIndex, 1);
            setExpandedPermissions(expanded);
        }
    };

    const saveTimeout = useRef<any>();
    const saveSelectedPermissions = (selectedPermissionIDs: string[]) => {
        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {

            const employeePostResponse = await Fetch.post({
                url: '/Employee/Permission?employeeID=' + employee.ID,
                params: selectedPermissionIDs,
                toastCtx: toast,
            } as any);

        }, 1000);
    };

    const permissionSections = useMemo(() => {
        let sections: any = {};

        allPermissions.forEach(parent => {
            let section: any[] = sections[parent.section] ?? [];
            section.push(parent);
            sections[parent.section] = section;
        });

        return sections;
    }, [allPermissions]);

    const forceLogout = async () => {
        setConfirmOptions({
            ...helper.initialiseConfirmOptions(),
            display: true,
            confirmButtonText: "Logout employee",
            heading: "Logout Employee?",
            text: "Note that it may cause them to lose all unsaved progress",
            onConfirm: async () => {
                const result = await Fetch.put({
                    url: `/Employee/ForceLogout/${employee.ID}`
                } as any);

                if (result === true) {
                    (toast as any).setToast({
                        message: "Employee successfully logged out",
                        show: true,
                        type: Enums.ToastType.success
                    });
                }
            }
        });
    };

    const canSelectAllInSection = (sectionName) => {
        return sectionName !== sectionNames.Admin;
    }

    const plotAdvancedPermission = (perm: any) => {
        let childrenLength = perm.children?.length ?? 0;
        let hasChildren = childrenLength > 0;

        const canSelectAll = () => {
            return canSelectAllInSection(perm.section);
        }

        const selectAll = () => {
            permissionChange(perm.name, perm.children, true)
        };

        const isAllSelected = () => {
            let allSelected = true;
            let permissionsToCheck: any[] = [];

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

        let childrenRows: any[][] = [[]];
        if (hasChildren) {
            perm.children.forEach(child => {
                let latestIdx = childrenRows.length - 1;
                let latestRow = childrenRows[latestIdx];
                if (latestRow.length >= 2) {
                    latestRow = [];
                    childrenRows.push(latestRow);
                }
                latestRow.push(child);
            });
        }

        const isExpanded = () => {
            return expandedPermissions.includes(perm.name);
        };

        const selectedChildren = () => {
            let selectedCount = 0;
            if (!hasChildren) return selectedCount;
            perm.children.forEach(child => {
                if (child.force || isSelected(child.name, selectedPermissions, child.invert === true)) {
                    selectedCount++;
                }
            });
            return selectedCount;
        };

        const ownerPermissionCheck = (ownerRequired) => {
            if (ownerRequired === true) {
                return userIsAnOwner;
            }
            return true;
        }

        let permInvert = perm.invert === true;


        const getTitle = (item) => {
            return item.ownerRequiredReason ?? item.forceReason;
        };

        return (<div className='permission-parent' style={{ border: isExpanded() ? "1px solid rgb(206 212 218 / 35%)" : "none" }}>
            <div className="row permission-row">
                <div className="column">
                    <Flex align={"center"} mt={"xs"}>
                        <Tooltip label={getTitle(perm)} refProp="rootRef" display={!!getTitle(perm) ? "block" : "none"}>
                            <Switch
                                checked={isSelected(perm.name, selectedPermissions, permInvert) || perm.force === true}
                                onChange={() => perm.force !== true && permissionChange(perm.name, perm.children) as any}
                                readOnly={perm.force === true || !ownerPermissionCheck(perm.ownerRequired)}
                                title={getTitle(perm)}
                            />
                        </Tooltip>
                        <div style={{ marginLeft: "1rem" }}>
                            <div style={{ fontWeight: "bold" }}>{perm.label} {!userIsAnOwner && perm.ownerRequired ? "(Must be owner to change)" : ""}</div>
                            <div style={{ fontSize: "0.7rem", opacity: "0.7" }}>{perm.description}</div>
                        </div>
                    </Flex>
                </div>
                {!isAllSelected() && hasChildren && canSelectAll() && isExpanded() && <div style={{ width: 150 }} className="tooltip-container column">
                    <div className='select-all'>
                        <Button variant='subtle' size='sm' onClick={selectAll}>
                            Enable All
                        </Button>
                    </div>

                </div>}
            </div>
            {hasChildren ? (isExpanded() ? <div style={{ position: "relative" }}>
                <div style={{ fontSize: "0.7rem", zIndex: 1, position: "relative" }} className="contract-link" title="Contract sub-permissions">
                    <IconCaretDownFilled size={20} style={{ color: colors.bluePrimary, left: "0.65rem", position: "absolute", top: "0rem", cursor: "pointer" }} onClick={() => contract(perm.name)} />
                </div>

                <div style={{ position: "relative", paddingLeft: "3.5rem" }}>


                    {childrenRows.map((childRow, idx) => {
                        let left = childRow[0];
                        let leftInvert = left.invert === true;
                        let right = childRow.length === 2 ? childRow[1] : null;
                        let rightInvert = right && right.invert === true;
                        return <div className="row" key={idx}>
                            <div className="column">
                                <Flex align={"center"} mt={"xs"}>
                                    <Tooltip label={getTitle(left)} refProp="rootRef" display={!!getTitle(left) ? "block" : "none"}>
                                        <Switch
                                            size='xs'
                                            checked={isSelected(left.name, selectedPermissions, leftInvert) || left.force === true}
                                            onChange={() => left.force !== true && permissionChange(left.name, [], false, perm.name) as any}
                                            readOnly={left.force === true || !ownerPermissionCheck(perm.ownerRequired) || !ownerPermissionCheck(left.ownerRequired)}
                                            title={getTitle(left)}
                                        />
                                    </Tooltip>
                                    <div style={{ marginLeft: "1rem" }}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "bold", opacity: 0.7 }}>{left.label} {!userIsAnOwner && left.ownerRequired ? "(Must be owner to change)" : ""}</div>
                                        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>{left.description}</div>
                                    </div>
                                </Flex>
                            </div>
                            <div className="column">
                                {right && <>
                                    <Flex align={"center"} mt={"xs"}>
                                        <Tooltip label={getTitle(right)} refProp="rootRef" display={!!getTitle(right) ? "block" : "none"}>
                                            <Switch
                                                size='xs'
                                                checked={isSelected(right.name, selectedPermissions, rightInvert) || right.force === true}
                                                onChange={() => right.force !== true && permissionChange(right.name, [], false, perm.name) as any}
                                                readOnly={right.force === true || !ownerPermissionCheck(perm.ownerRequired) || !ownerPermissionCheck(right.ownerRequired)}
                                                title={getTitle(right)}
                                            />
                                        </Tooltip>
                                        <div style={{ marginLeft: "1rem" }}>
                                            <div style={{ fontSize: "0.8rem", fontWeight: "bold", opacity: 0.7 }}>{right.label} {!userIsAnOwner && right.ownerRequired ? "(Must be owner to change)" : ""}</div>
                                            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>{right.description}</div>
                                        </div>
                                    </Flex>
                                </>}
                            </div>
                        </div>
                    })}
                </div>
            </div> : <div onClick={() => expand(perm.name)} className="expand-link">
                <IconCaretRightFilled size={20} style={{ color: colors.bluePrimary, left: "-3rem", position: "absolute", top: "-0.25rem", cursor: "pointer" }} onClick={() => contract(perm.name)} />
                {selectedChildren()} of {childrenLength} additional permissions selected
            </div>) :
                <></>
            }


            <style jsx>{`

                .permission-parent {
                    border: 1px solid rgb(206 212 218 / 25%);
                    padding: 0 0 0.5rem 0.5rem;
                    border-radius: ${layout.cardRadius};
                    margin-bottom: 0rem;
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
                    /* display: none; */
                    position: absolute;
                    top: 0;
                    right: 0;
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

                .expand-link {
                    font-size: 0.7rem;
                    margin-left: 3.6rem;
                    margin-top: 0.25rem;
                    font-weight: bold;
                    cursor: pointer;
                    opacity: 0.7;
                    color: ${colors.bluePrimary};
                    position: relative;
                }

                .expand-link:hover {
                    opacity: 1;
                }

                .contract-link {
                    color: black;
                    opacity: 0.7;
                }

                .contract-link:hover {
                    opacity: 1;
                }

            `}</style>
        </div>);
    }

    return (<>

        <Flex justify={"space-between"} align={"center"}>
            <h3>Permissions for {employee.FirstName} {employee.LastName}</h3>
            {/* <Button variant="subtle" onClick={forceLogout} >
                Force Logout
            </Button> */}

        </Flex>
        <div className="initial-blurb">
            <div>Permission changes are automatically saved, but <b>can take up to 15min to reflect</b> on web and mobile.</div>
            {/* <div>You can use <b>Force Logout</b> to refresh an employees web permissions now.</div> */}
            <div><span onClick={forceLogout} className='permission-link'>Click here</span> to refresh the employee's web permissions now.</div>
        </div>
        <div className="row">
            <div className="column" style={{ maxWidth: "1000px" }}>

                {Object.keys(permissionSections).sort((a, b) => {
                    return Object.keys(sectionNames).map(x => sectionNames[x]).indexOf(a) - Object.keys(sectionNames).map(x => sectionNames[x]).indexOf(b);
                }).map((section, idx) => {
                    let perms = permissionSections[section];
                    return <div>
                        <Flex justify={"space-between"}>
                            <SCWidgetTitle title={section} marginBottom={"0.5rem"} />
                            {canEnableAllPermissionsForSection(section) &&
                                <Button variant='subtle' size='sm' onClick={() => enableAllPermissionsForSection(section)}>
                                    Enable All {section}
                                </Button>}
                        </Flex>
                        {perms.map((perm) => {
                            return plotAdvancedPermission(perm);
                        })}
                    </div>;
                })}


            </div>
        </div>

        <ConfirmAction setOptions={setConfirmOptions} options={confirmOptions} />

        <style jsx>{`

            .initial-blurb {
                font-size: 0.8rem;
                margin-bottom: 1rem;
            }

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
    .permission-link {
          color: ${colors.bluePrimary};
          font-weight: bold;
          cursor: pointer;
        }

        .permission-link:hover {
          text-decoration: underline;
        }

    `}</style>
    </>);
}

export default EditPermissionsNew;
