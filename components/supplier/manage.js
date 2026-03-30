import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { layout } from '../../theme';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import ConfirmAction from '../modals/confirm-action';
import SCInput from '../sc-controls/form-controls/sc-input';
import Breadcrumbs from '../breadcrumbs';
import LegacyButton from '../button';
import Tabs from '../tabs';
import SCSwitch from '../sc-controls/form-controls/sc-switch';
import AuditLog from '../shared-views/audit-log';
import Attachments from '../shared-views/attachments';
import Communications from '../shared-views/communications';
import PurchaseOrders from '../shared-views/purchases';
import Contacts from '../contact/contacts';
import Locations from '../location/locations';
import SupplierStores from '../supplier/supplier-store';
import PS from '../../services/permission/permission-service';
import SupplierService from '../../services/supplier/supplier-service';
import constants from '../../utils/constants';
import {Box, Flex, Card, Button, Space} from '@mantine/core'
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {IconArrowBackUp, IconDeviceFloppy} from "@tabler/icons-react";
import {useElementSize} from "@mantine/hooks";
import ItemContactsTable from "../../PageComponents/Table/Component Tables/ItemContactsTable";
import CustomerLocationsTable from "../../PageComponents/Table/Component Tables/CustomerLocationsTable";
import ItemPurchasesTable from "../../PageComponents/Table/Component Tables/ItemPurchasesTable";

function ManageSupplier({isNew, manageSupplier, accessStatus, multiTenantStore}) {

    const editCustomerPermission = PS.hasPermission(Enums.PermissionName.EditCustomer);
    const purchaseOrderPermission = PS.hasPermission(Enums.PermissionName.PurchaseOrder);

    const [supplier, setSupplier] = useState(isNew ? {
        Name: '',
        Code: '',      
        EmailAddress: '',
        ContactNumber: '',  
        IsActive: true,
        VATNumber: null,
        CompanyNumber: null
    } : manageSupplier);

    const [contacts, setContacts] = useState(supplier.Contacts);
    const [locations, setLocations] = useState(supplier.Locations);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());    

    const [inputErrors, setInputErrors] = useState({});

    const toast = useContext(ToastContext);

    const updateSupplier = (field, value, setDirty = true) => {
        let newSupplierState = { ...supplier };
        newSupplierState[field] = value;
        setSupplier(newSupplierState);

        if (field == "Contacts") {
            setContacts(value);
          }
      
          if (field == "Locations") {
            setLocations(value);
          }
    
        if (!isNew) {
            getCounts();
        }

        setFormIsDirty(setDirty);
    };    

    const handleInputChange = (e) => {
        updateSupplier([e.name], e.value);
    };

    useEffect(() => {
        if (!isNew) {
            getCounts();
        }
    }, []);

    const supplierDetails = () => {
        return (
            <>
                {isNew ?
                    <div className="heading">
                        Supplier
                    </div> : ''
                }
                <div className="row">
                    <div className="column">
                        <SCInput 
                            name="Code"
                            label={'Code'}
                            value={supplier.Code}
                            onChange={handleInputChange}
                            error={inputErrors.Code}
                            cypress="data-cy-code"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput 
                            onChange={handleInputChange}
                            label={"Name"} 
                            name="Name"
                            required={true}
                            value={supplier.Name}
                            error={inputErrors.Name}
                            cypress="data-cy-name"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput 
                            onChange={handleInputChange}
                            label={"Email Address"} 
                            name="EmailAddress"
                            value={supplier.EmailAddress}
                            error={inputErrors.EmailAddress}
                            cypress="data-cy-email"
                        />
                    </div>               
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput 
                            onChange={handleInputChange}
                            label={"Contact Number"} 
                            name="ContactNumber"
                            value={supplier.ContactNumber}
                            error={inputErrors.ContactNumber}
                            cypress="data-cy-contactnumber"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput 
                            onChange={handleInputChange}
                            label={"VAT Number"} 
                            name="VATNumber"
                            value={supplier.VATNumber}
                            cypress="data-cy-vatnumber"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput 
                            onChange={handleInputChange}
                            label={"Company Reg Number"} 
                            name="CompanyNumber"
                            value={supplier.CompanyNumber}
                            cypress="data-cy-companynumber"
                        />
                    </div>
                </div>

                {!isNew ?
                    <div className="switch">
                        <SCSwitch 
                            name="IsActive" 
                            onLabel="Active" 
                            offLabel="Active" 
                            checked={supplier.IsActive}
                            onChange={() => handleInputChange({ name: "IsActive", value: !supplier.IsActive })}
                        />
                    </div> : ''
                }
                {isNew ?
                    <Flex my={'lg'} gap={'sm'} justify={'end'} direction={'row-reverse'} wrap={'wrap-reverse'}>
                        <Button onClick={saveSupplier} disabled={saving} >
                            Create
                        </Button>
                        <Button variant={'outline'} onClick={cancel} >
                            Cancel
                        </Button>
                    </Flex> : <Space h={15} />
                }
                {!isNew ? 
                    <AuditLog recordID={supplier.ID} retriggerSearch={supplier} /> : ''
                }

                <style jsx>{`
                    .row {
                        display: flex;
                        justify-content: space-between;
                    }
                    .column {
                        display: flex;
                        flex-direction: column;
                        width: ${layout.inputWidth};
                    }
                    .column + .column {
                        margin-left: 1.25rem;
                    }
                    .switch {
                        flex-direction: row-reverse;
                        display: flex;
                        margin-top: 1rem;
                        width: ${layout.inputWidth};
                    }
                    .actions {
                        display: flex;
                        flex-direction: row-reverse;
                        width: ${layout.inputWidth};
                    }
                    .actions :global(.button){
                        margin-left: 0.5rem;
                        margin-top: 1rem;
                        padding: 0 1rem;
                        white-space: nowrap;
                    }
                `}</style>
            </>
        );
    };

    const [attachmentCount, setAttachmentCount] = useState(0);
    const [communicationCount, SetCommunicationCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);
    const [locationCount, setLocationCount] = useState(0);
    const [purchaseOrderCount, setPurchaseOrderCount] = useState(0);
    const [countsToggle, setCountsToggle] = useState(false);

    const getCounts = async () => {
        let countRequest = await SupplierService.getTabCounts(supplier.ID);

        setAttachmentCount(countRequest.attachmentCount);
        SetCommunicationCount(countRequest.communicationCount);
        setContactCount(countRequest.contactCount);
        setLocationCount(countRequest.locationCount);
        setPurchaseOrderCount(countRequest.purchaseOrderCount);

        setCountsToggle(!countsToggle);
    };

    useEffect(() => {
        buildUpPageTabs();
    }, [countsToggle, multiTenantStore]);

    const onAttachmentRefresh = () => {
        getCounts();
    };

    const [pageTabs, setPageTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Supplier');

    const buildUpPageTabs = () => {
        let tabs = [
            { text: 'Supplier' },            
        ];

        if (multiTenantStore)
            tabs.push({ text: 'Stores', suppressCount: true });
                
        tabs.push(...[
            { text: 'Contacts', count: contactCount },
            { text: 'Locations', count: locationCount }
        ]);

        if (purchaseOrderPermission)
            tabs.push({ text: 'Purchases', count: purchaseOrderCount });

        tabs.push(...[
            { text: 'Attachments', count: attachmentCount },
        ]);

        tabs.push({ text: 'Communication', count: communicationCount },);

        setPageTabs(tabs);
    };

    const [saving, setSaving] = useState(false);
    
    async function saveSupplier() {
        setSaving(true);

        let {isValid, errors} = SupplierService.validate(supplier);
        setInputErrors(errors);

        if (isValid) {

            let result = {};

            if (isNew) {
                result = await SupplierService.createSupplier(supplier, toast);
            } else {
                result = await SupplierService.editSupplier(supplier, toast);
            }

            if (result.ID) {
                if (isNew) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.createSupplier, {
                        "supplierID": result.ID
                    });
                } else {
                    Helper.mixpanelTrack(constants.mixPanelEvents.editSupplier, {
                        "supplierID": result.ID
                    });
                }

                setFormIsDirty(false);
                toast.setToast({
                    message: 'Supplier saved successfully',
                    show: true,
                    type: 'success'
                });

                await Helper.waitABit();

                if (isNew) {
                    Helper.nextRouter(Router.push, '/supplier/[id]', `/supplier/${result.ID}`);
                } else {
                    setSupplier(result);
                    setContacts(result.Contacts);
                    setLocations(result.Locations);
                }
            } else {
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error,
            });
            setSaving(false);
        }

        if (!isNew) {
            setSaving(false);
        }

        return isValid;
    };

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveSupplier);

    const cancel = () => {
        Helper.nextRouter(Router.push, '/inventory/list?tab=suppliers');
    };

    const fetchSupplierDetails = async () => {
        try {          
            const result = await Fetch.get({
                url: `/Supplier/${supplier.ID}`
            });
            setSupplier(result);  
            
            setContacts(result.Contacts);
            setLocations(result.Locations);
    
            setFormIsDirty(false);
            getCounts();
          
        } catch (error) {
          console.log('fetchSupplierDetails', error);
        }
      };

      const trySetSelectedTab = async (tab) => {
        if (tab !== selectedTab && tab === "Supplier") {
          await fetchSupplierDetails();
        }
    
        if (selectedTab === "Supplier" && tab !== "Supplier" && formIsDirty) {
          setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            display: true,
    
            heading: "Save Changes?",
            text: "Save changes before changing the tab?",
            confirmButtonText: "Save Changes",
            discardButtonText: "Discard Changes",
            showDiscard: true,
            showCancel: true,
            onDiscard: async () => {
              await fetchSupplierDetails();
              setSelectedTab(tab);
            },
            onConfirm: async() => {
              let result = await saveSupplier();
              if (result === true) {
                setSelectedTab(tab);
              }
            }
          });
        } else {
          setSelectedTab(tab);
        }
      };

    const {height: toolbarHeight, ref: toolbarRef} = useElementSize()

    return (
        <>
            <Box bg={'white'} ref={toolbarRef} pb={isNew ? 'sm' : 0}>
                <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10}>
                    <Flex align={'center'} >
                        {isNew ?
                            <Breadcrumbs currPage={{ text: 'Create Supplier', link: '/supplier/create', type: 'create' }} /> :
                            <Breadcrumbs currPage={{ text: supplier.Code ? supplier.Code : supplier.Name, link: `/supplier/${supplier.ID}` }} />
                        }
                    </Flex>
                    {
                        !isNew &&
                        <ToolbarButtons
                            buttonGroups={[
                                [
                                    {
                                        breakpoint: 480,
                                        type: 'button',
                                        text: 'Cancel',
                                        hideIcon: true,
                                        variant: 'outline',
                                        icon: <IconArrowBackUp />,
                                        onClick: cancel,
                                    }
                                ],
                                [
                                    {
                                        breakpoint: 480,
                                        type: 'button',
                                        icon: <IconDeviceFloppy />,
                                        isBusy: saving,
                                        disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                        text: saving ? "Saving" : "Save",
                                        onClick: saving ? null : () => saveSupplier(),
                                    }
                                ]
                            ]}
                        />
                    }

                </Flex>

                {
                    !isNew &&
                    <Tabs
                        selectedTab={selectedTab}
                        setSelectedTab={trySetSelectedTab}
                        tabs={pageTabs}
                        useNewTabs
                        tabsProps={
                            {mt: {base: 'sm', xl: 0}, mx: {base: 1, sm: 'xs', md: 'sm', lg: 'md'}}
                        }
                    />
                }
            </Box>
            {/*<div className="row">
                <div className="title">
                    {isNew ?
                        <Breadcrumbs currPage={{ text: 'Create Supplier', link: '/supplier/create', type: 'create' }} /> :
                        <Breadcrumbs currPage={{ text: supplier.Code ? supplier.Code : supplier.Name, link: `/supplier/${supplier.ID}` }} />
                    }
                </div>
                {!isNew ?
                    <div className="actions">
                        <LegacyButton text="Cancel" extraClasses="hollow" onClick={cancel} />
                        <LegacyButton disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={saving ? "Saving" : "Save"} onClick={saving ? null : () => saveSupplier()}
                        />
                    </div>
                    : ''
                }
            </div>*/}
            {isNew ?
                <Box
                    // bg={'gray.1'}
                    py={{base: 5, xs: 8, sm: 'md'}}
                    px={{base: 5, xs: 8}}
                    mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
                >
                    <Card
                        p={'md'}
                        px={{base: 1, xs: 5, sm: 'sm'}}
                        radius={'md'}
                        // maw={1000}
                        // mx={'auto'}
                    >
                        <Box maw={480}>
                            {(() => {
                                return supplierDetails();
                            })()}
                        </Box>
                    </Card>
                </Box>
                :
                <>
                    <Box
                        bg={'gray.1'}
                        py={{base: 5, xs: 8, sm: 'md'}}
                        px={{base: 5, xs: 8}}
                        mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
                    >
                        <Card
                            p={'md'}
                            px={{base: 1, xs: 5, sm: 'sm'}}
                            radius={'md'}
                        >
                            {(() => {
                                switch (selectedTab) {
                                    case "Supplier":
                                        return supplierDetails();
                                    case 'Contacts':
                                        return <>
                                            <ItemContactsTable supplierId={supplier.ID} module={Enums.Module.Supplier} accessStatus={accessStatus} moduleData={supplier} updateModuleData={fetchSupplierDetails} canEdit={editCustomerPermission}/>
                                            {/*<Contacts contacts={contacts} module={Enums.Module.Supplier} moduleData={supplier} updateModuleData={fetchSupplierDetails} accessStatus={accessStatus} editCustomerPermission={editCustomerPermission} />*/}
                                        </>

                                    case 'Locations':
                                        return <>
                                            <CustomerLocationsTable supplierId={supplier.ID} module={Enums.Module.Supplier} accessStatus={accessStatus} moduleData={supplier} updateModuleData={fetchSupplierDetails} canEdit={editCustomerPermission}/>
                                            {/*<Locations locations={locations} module={Enums.Module.Supplier} moduleData={supplier} updateModuleData={fetchSupplierDetails} accessStatus={accessStatus} editCustomerPermission={editCustomerPermission} />;*/}
                                        </>
                                    case 'Stores':
                                        return <SupplierStores supplierID={supplier.ID} accessStatus={accessStatus} />;
                                    case 'Purchases':
                                        return <>
                                            <ItemPurchasesTable itemId={supplier.ID} customerId={''} module={Enums.Module.Supplier} />
                                            {/*<PurchaseOrders module={Enums.Module.Supplier} moduleID={supplier.ID} supplierID={supplier.ID} accessStatus={accessStatus} />;*/}
                                        </>

                                    case 'Attachments':
                                        return <Attachments topMargin={false} displayName={supplier.Code} itemId={supplier.ID} module={Enums.Module.Supplier} onRefresh={onAttachmentRefresh} accessStatus={accessStatus} />;
                                    case 'Communication':
                                        return <Communications topMargin={false} itemId={supplier.ID} module={Enums.Module.Supplier} supplierID={supplier.ID} accessStatus={accessStatus} />;
                                    default:
                                        return '';
                                }
                            })()}
                        </Card>
                    </Box>


                </>
            }

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <style jsx>{`
                .row {
                    display: flex;
                    justify-content: space-between;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    width: 490px;
                }
                .actions {
                    display: flex;
                }
                .actions :global(.button){
                    margin-left: 0.5rem;
                    margin-top: 0;
                    padding: 0 1rem;
                    white-space: nowrap;
                }
            `}
            </style>
        </>
    );
}

export default ManageSupplier;
