import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Attachments from '../shared-views/attachments';
import ItemComments from '../shared-views/item-comments';
import ToastContext from '../../utils/toast-context';
import ConfirmAction from '../modals/confirm-action';
import KendoInput from '../kendo/kendo-input';
import KendoNumericInput from '../kendo/kendo-numeric-input';
import KendoSimpleCombobox from '../kendo/kendo-simple-combobox';
import InventoryCategorySelector from '../selectors/inventory/inventory-category-selector';
import InventorySubcategorySelector from '../selectors/inventory/inventory-subcategory-selector';
import SupplierSelector from '../selectors/supplier/supplier-selector';
import Breadcrumbs from '../breadcrumbs';
import Button from '../button';
import ButtonDropdown from '../../components/button-dropdown';
import Tabs from '../tabs';
import ReactSwitch from '../react-switch';
import HelpDialog from '../help-dialog';
import AuditLog from '../shared-views/audit-log';
import PS from '../../services/permission/permission-service';
import IntegrationService from '../../services/integration-service';
import OptionService from '../../services/option/option-service';

/**
 * @deprecated The method should not be used
 */
function ManageCustomer({isNew, manageCustomer, initTab, countries, customFields, accessStatus}) {

    const [customer, setCustomer] = useState(isNew ? {

    } : manageCustomer);

    const toast = useContext(ToastContext);

    const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
    const [quotePermission] = useState(PS.hasPermission(Enums.PermissionName.Quote));
    const [invoicePermission] = useState(PS.hasPermission(Enums.PermissionName.Invoice));
    const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));
    const [productPermission] = useState(PS.hasPermission(Enums.PermissionName.Product));
    const [appointmentPermission] = useState(PS.hasPermission(Enums.PermissionName.Appointment));
    const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer));

    const [pageTabs, setPageTabs] = useState([]);

    const [selectedTab, setSelectedTab] = useState(initTab);
    const [saving, setSaving] = useState(false);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, null);

    const [saveDisabled, setSaveDisabled] = useState(false);

    useEffect(() => {
        if (!isNew) {
            // preparing permissions relevant to buttons that are misbehaving
            let disable = accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
            let disableSave = !editCustomerPermission || disable;
            setSaveDisabled(disableSave);

            getCounts();
        }
    }, []);

    const [contactCount, setContactCount] = useState(0);
    const [locationCount, setLocationCount] = useState(0);
    const [jobCount, setJobCount] = useState(0);
    const [quoteCount, setQuoteCount] = useState(0);
    const [invoiceCount, setInvoiceCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [attachmentCount, setAttachmentCount] = useState(0);
    const [communicationCount, setCommunicationCount] = useState(0);

    const [countsToggle, setCountsToggle] = useState(false);

    const getCounts = async () => {
        let countRequest = await Fetch.get({
            url: `/Customer/GetCounts?id=${props.customer.ID}`,
        });
        let result = countRequest.Results;
        setContactCount(result.find(x => x.Key == 'Contacts').Value);
        setLocationCount(result.find(x => x.Key == 'Locations').Value);
        setJobCount(result.find(x => x.Key == 'Jobs').Value);
        setQuoteCount(result.find(x => x.Key == 'Quotes').Value);
        setInvoiceCount(result.find(x => x.Key == 'Invoices').Value);
        setQueryCount(result.find(x => x.Key == 'Queries').Value);
        setProductCount(result.find(x => x.Key == 'Products').Value);
        setAppointmentCount(result.find(x => x.Key == 'Appointments').Value);
        setAttachmentCount(result.find(x => x.Key == 'Attachments').Value);
        setCommunicationCount(result.find(x => x.Key == 'Communication').Value);

        setCountsToggle(!countsToggle);
    };

    useEffect(() => {
        buildUpPageTabs();
    }, [countsToggle]);

    const buildUpPageTabs = () => {
        let tabs = [
            { text: 'Details', count: '0' },
            { text: 'Contacts', count: contactCount },
            { text: 'Locations', count: locationCount }];

        if (jobPermission && jobCount > 0)
            tabs.push({ text: 'Jobs', count: jobCount });
        if (quotePermission && quoteCount > 0)
            tabs.push({ text: 'Quotes', count: quoteCount });
        if (invoicePermission && invoiceCount > 0)
            tabs.push({ text: 'Invoices', count: invoiceCount });
        if (queryPermission && queryCount > 0)
            tabs.push({ text: 'Queries', count: queryCount });
        if (productPermission && productCount > 0)
            tabs.push({ text: 'Assets', count: productCount });
        if (appointmentPermission)
            tabs.push({ text: 'Appointments', count: appointmentCount });

        tabs.push(...[{ text: 'Attachments', count: attachmentCount },
            { text: 'Communication', count: communicationCount }]);

        setPageTabs(tabs);
    };

    const [optionButtons, setOptionButtons] = useState([]);

    const getOptionButtons = () => {
      let buttons = [
        { text: 'New Customer', link: `CreateCustomer` },
        { text: 'Send Customer zone link', link: `SendCustomerZoneLink` },
      ];
  
      if (jobPermission) {
        buttons.push({
          text: 'Create Job', link: `CreateJob`
        });
      }
  
      if (quotePermission) {
        buttons.push({
          text: 'Create Quote', link: `CreateQuote`
        });
      }
  
      if (invoicePermission) {
        buttons.push({
          text: 'Create Invoice', link: `CreateInvoice`
        });
      }
  
      if (queryPermission) {
        buttons.push({
          text: 'Create Query', link: `CreateQuery`
        });
      }
  
      if (productPermission) {
        buttons.push({
          text: 'Create Asset', link: `CreateAsset`
        });
      }
  
      setOptionButtons(buttons);
    };
  
    const optionsClick = (link) => {
        switch (link) {
            case 'CreateCustomer':
            Helper.nextRouter(Router.push, `/customer/create`);
            break;
            case 'SendCustomerZoneLink':
            Helper.nextRouter(Router.push, `/new-communication/[id]?moduleCode=${Enums.Module.Customer}&method=email&templateID=${Constants.templateIDs.TemplateCustomerZone}`, `/new-communication/${customer.ID}?moduleCode=${Enums.Module.Customer}&method=email&templateID=${Constants.templateIDs.TemplateCustomerZone}`);
            break;
            case 'CreateJob':
            Helper.nextRouter(Router.push, `/job/create?module=${Enums.Module.Customer}&moduleID=${customer.ID}&customerID=${customer.ID}`);
            break;
            case 'CreateQuote':
            Helper.nextRouter(Router.push, `/quote/create?module=${Enums.Module.Customer}&moduleID=${customer.ID}&customerID=${customer.ID}`);
            break;
            case 'CreateInvoice':
            Helper.nextRouter(Router.push, `/invoice/create?module=${Enums.Module.Customer}&moduleID=${customer.ID}&customerID=${customer.ID}`);
            break;
            case 'CreateQuery':
            Helper.nextRouter(Router.push, `/query/create?module=${Enums.Module.Customer}&moduleID=${customer.ID}&customerID=${customer.ID}`);
            break;
            case 'CreateAsset':
            Helper.nextRouter(Router.push, `/asset/create?module=${Enums.Module.Customer}&moduleID=${customer.ID}`);
            break;
        }
    };

    // INTEGRATION

    const [integration, setIntegration] = useState();
    const [integrationTooltip, setIntegrationTooltip] = useState('');

    const getIntegration = async () => {
        let integration = await IntegrationService.getIntegration();
        if (integration) {
            setIntegrationTooltip(integration.Status == Enums.IntegrationStatus.Live ? ''
                : `Customer on ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)} has status of ${Enums.getEnumStringValue(Enums.IntegrationStatus, integration.Status)}`);
        }
        setIntegration(integration);
    };

    const syncCustomer = async () => {
        const result = await Fetch.post({
            url: `/Customer/CustomerSync?customerID=${customer.ID}`,
            toastCtx: toast
        });
        if (result.ID) {
            toast.setToast({
                message: 'Customer successfully queued for sync',
                show: true,
                type: 'success'
            });
            setCustomer(result);
        } else {
            toast.setToast({
                message: 'Customer failed to sync',
                show: true,
                type: Enums.ToastType.error
            });
        }
    };

    // ARCHIVING

    const [archiving, setArchiving] = useState(false);
  
    const archiveCustomer = async () => {
        setArchiving(true);

        const customerPut = await Fetch.put({
            url: '/Customer/Archive?id=' + customer.ID,
            toastCtx: toast
        });

        if (customerPut.ID) {
            const message = customerPut.IsArchived ? 'Customer un-archived successfully' : 'Customer archived successfully'
            toast.setToast({
                action: 'Undo',
                actionFunc: async function () {
                    const customerPutInner = await Fetch.put({
                        url: '/Customer/Archive?id=' + customer.ID,
                    });
                    setCustomer(customerPutInner);
                    setFormIsDirty(false);
                },
                message: message,
                show: true,
                type: 'success'
            });
            setCustomer(customerPut);
            setFormIsDirty(false);
        }

        setArchiving(false);
    };

    const [inputErrors, setInputErrors] = useState({});

    const validate = () => {

        let validationItems = [
            { key: 'CustomerName', value: customer.CustomerName, required: true, type: Enums.ControlType.Text },
            { key: 'DefaultDiscount', value: customer.DefaultDiscount, required: true, gte: 0, type: Enums.ControlType.Number },
        ];
    
        let { customerStatusRequired, customerTypeRequired, industryTypeRequired, mediaTypeRequired } =
            OptionService.getCustomerCustomFields(customFields);
    
        if (customerStatusRequired) {
            validationItems = [...validationItems,
                { key: 'CustomerStatus', value: customerStatus, required: true, type: Enums.ControlType.Select },
            ];
        }
    
        if (customerTypeRequired) {
            validationItems = [...validationItems,
                { key: 'CustomerType', value: customerType, required: true, type: Enums.ControlType.Select },
            ];
        }
    
        if (industryTypeRequired) {
            validationItems = [...validationItems,
                { key: 'IndustryType', value: industryType, required: true, type: Enums.ControlType.Select },
            ];
        }
    
        if (mediaTypeRequired) {
            validationItems = [...validationItems,
                { key: 'MediaType', value: mediaType, required: true, type: Enums.ControlType.Select },
            ];
        }
    
        const { isValid, errors } = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };

    async function saveCustomer() {
        setSaving(true);

        let isValid = validate();

        if (isValid) {

        }

        setSaving(false);
    }

    const cancel = () => {
        Helper.nextRouter(Router.push, '/customer/list');
    };

    const customerDetails = () => {
        return (
            <>
                
            </>
        );
    };

    return (
        <>
            <div className="row">
                <div className="title">
                    {isNew ? 
                        <Breadcrumbs currPage={{ text: 'Create Customer', link: '/customer/create', type: 'customer-show' }} /> :
                        <Breadcrumbs currPage={{ text: customer.CustomerName, link: '/customer/' + customer.ID, type: 'customer-show' }} />
                    }                    
                </div>
                {!isNew ?
                    <div className="actions">
                        <ButtonDropdown disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            action={optionsClick}
                            text="Options"
                            options={optionButtons}
                        />

                        {customer.IsArchived ? 
                            <Button disabled={saveDisabled}
                                text={archiving ? "Un-archiving" : "Archived"} icon="archive-white" extraClasses="grey-action w13" onClick={archiving ? null : archiveCustomer} />
                            :
                            <Button disabled={saveDisabled}
                                text={archiving ? "Archiving" : "Archive"} icon="archive" extraClasses="white-action w13" onClick={archiving ? null : archiveCustomer} />
                        }

                        {integration ?
                            customer.CustomerSyncStatus == Enums.SyncStatus.Pending ?
                            <Button disabled={true} text={`Sync pending to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} /> :
                                customer.CustomerSyncStatus == Enums.SyncStatus.Synced ?
                                    <Button disabled={true} text={`Synced`} /> :
                                        customer.IsActive && customer.CustomerSyncStatus == Enums.SyncStatus.Failed ?
                                    <>
                                        <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                        text={`Retry sync to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} icon="send" extraClasses="white-action"
                                        tooltip={integrationTooltip}
                                        onClick={() => integration.Status == Enums.IntegrationStatus.Live ? syncCustomer() : {}} />
                                        <HelpDialog position="bottom" message={`${customer.CustomerSyncMessage}`} width={175} />
                                    </> : '' : ''
                        }

                        <Button disabled={saveDisabled} text={saving ? "Saving" : "Save"} onClick={saving ? null : saveCustomer} extraClasses="w9" />
                    </div> : ''                
                }
            </div>
        </>
    );
}

export default ManageCustomer;
