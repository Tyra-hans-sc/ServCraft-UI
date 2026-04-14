import React, { useState, useEffect } from 'react';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import { colors, layout } from '../../theme';
import Tabs from '../tabs';
import ReactSwitch from '../react-switch';
import ConfirmAccess from '../modals/auth/confirm-access';
import Helper from '../../utils/helper';
import SCUploadDropzone from '../sc-controls/form-controls/sc-upload-dropzone';
import * as Enums from '../../utils/enums';
import SCNumericInput from "../sc-controls/form-controls/sc-numeric-input";
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function ManageStore(props) {

    const [selectedTab, setSelectedTab] = useState('Store Settings');

    // #region Store Settings

    const name = props.store.Name;

    const handleNameChange = (e) => {
        props.updateStore('Name', e.value);
    };

    const registeredName = props.store.RegisteredName;

    const handleRegisteredNameChange = (e) => {
        props.updateStore('RegisteredName', e.value);
    };

    const code = props.store.Code;

    const handleCodeChange = (e) => {
        props.updateStore('Code', e.value);
    };

    const addressLine1 = props.store.AddressLine1;

    const handleAddressLine1Change = (e) => {
        props.updateStore('AddressLine1', e.value);
    };

    const addressLine2 = props.store.AddressLine2;

    const handleAddressLine2Change = (e) => {
        props.updateStore('AddressLine2', e.value);
    };

    const addressLine3 = props.store.AddressLine3;

    const handleAddressLine3Change = (e) => {
        props.updateStore('AddressLine3', e.value);
    };

    const addressLine4 = props.store.AddressLine4;

    const handleAddressLine4Change = (e) => {
        props.updateStore('AddressLine4', e.value);
    };

    const postalLine1 = props.store.PostalLine1;

    const handlePostalLine1Change = (e) => {
        props.updateStore('PostalLine1', e.value);
    };

    const postalLine2 = props.store.PostalLine2;

    const handlePostalLine2Change = (e) => {
        props.updateStore('PostalLine2', e.value);
    };

    const postalLine3 = props.store.PostalLine3;

    const handlePostalLine3Change = (e) => {
        props.updateStore('PostalLine3', e.value);
    };

    const postalLine4 = props.store.PostalLine4;

    const handlePostalLine4Change = (e) => {
        props.updateStore('PostalLine4', e.value);
    };

    const telephone = props.store.TelephoneNumber;

    const handleTelephoneChange = (e) => {
        props.updateStore('TelephoneNumber', e.value);
    };

    const fax = props.store.FaxNumber;

    const handleFaxChange = (e) => {
        props.updateStore('FaxNumber', e.value);
    };

    const email = props.store.EmailAddress;

    const handleEmailChange = (e) => {
        props.updateStore('EmailAddress', e.value);
    };

    const emailFromName = props.store.EmailFromName;

    const handleEmailFromNameChange = (e) => {
        props.updateStore('EmailFromName', e.value);
    };

    const jobTerms = props.store.JobTerms;

    const handleJobTermsChange = (e) => {
        props.updateStore('JobTerms', e.value);
    };

    const emailFromAddress = props.store.EmailFromAddress;

    const handleEmailFromAddressChange = (e) => {
        props.updateStore('EmailFromAddress', e.value);
    };

    const emailFromEmployee = props.store.EmailFromEmployee;

    const handleEmailFromEmployeeChange = () => {
        props.updateStore('EmailFromEmployee', !emailFromEmployee);
    };

    const website = props.store.WebsiteAddress;

    const handleWebsiteChange = (e) => {
        props.updateStore('WebsiteAddress', e.value);
    };

    const vatRegistration = props.store.VATRegistrationNo;

    const handleVatRegistrationChange = (e) => {
        props.updateStore('VATRegistrationNo', e.value);
    };

    const companyRegistration = props.store.CompanyRegistrationNo;

    const handleCompanyRegistrationChange = (e) => {
        props.updateStore('CompanyRegistrationNo', e.value);
    };

    // #endregion

    // #region Notify Settings

    const customerNotify = props.store.CustomerNotify;

    const handleCustomerNotifyChange = (e) => {
        props.updateStore('CustomerNotify', e.value);
    };

    const queryNotify = props.store.QueryNotify;

    const handleQueryNotifyChange = (e) => {
        props.updateStore('QueryNotify', e.value);
    };

    const productNotify = props.store.ProductNotify;

    const handleProductNotifyChange = (e) => {
        props.updateStore('ProductNotify', e.value);
    };

    const jobCardNotify = props.store.JobCardNotify;

    const handleJobCardNotifyChange = (e) => {
        props.updateStore('JobCardNotify', e.value);
    };

    const collectionNotify = props.store.CollectionNotify;

    const handleCollectionNotifyChange = (e) => {
        props.updateStore('CollectionNotify', e.value);
    };

    const inventoryNotify = props.store.InventoryNotify;

    const handleInventoryNotifyChange = (e) => {
        props.updateStore('InventoryNotify', e.value);
    };

    const quoteNotify = props.store.QuoteNotify;

    const handleQuoteNotifyChange = (e) => {
        props.updateStore('QuoteNotify', e.value);
    };

    const invoiceNotify = props.store.InvoiceNotify;

    const handleInvoiceNotifyChange = (e) => {
        props.updateStore('InvoiceNotify', e.value);
    };

    // #endregion

    // #region Prefix Settings

    const customerPrefix = props.store.PrefixCustomer;

    const handleCustomerPrefixChange = (e) => {
        props.updateStore('PrefixCustomer', e.value);
    };

    const invoicePrefix = props.store.PrefixInvoice;

    const handleInvoicePrefixChange = (e) => {
        props.updateStore('PrefixInvoice', e.value);
    };

    const jobCardPrefix = props.store.PrefixJobCard;

    const handleJobCardPrefixChange = (e) => {
        props.updateStore('PrefixJobCard', e.value);
    };

    const productPrefix = props.store.PrefixProduct;

    const handleProductPrefixChange = (e) => {
        props.updateStore('PrefixProduct', e.value);
    };

    const queryPrefix = props.store.PrefixQuery;

    const handleQueryPrefixChange = (e) => {
        props.updateStore('PrefixQuery', e.value);
    };

    const quotePrefix = props.store.PrefixQuote;

    const handleQuotePrefixChange = (e) => {
        props.updateStore('PrefixQuote', e.value);
    };

    // #endregion

    // #region Bank Settings

    const bankAccountName = props.store.BankAccountName;

    const handleBankAccountNameChange = (e) => {
        props.updateStore('BankAccountName', e.value);
    };

    const bankName = props.store.BankName;

    const handleBankNameChange = (e) => {
        props.updateStore('BankName', e.value);
    };

    const accountNumber = props.store.BankAccountNumber;

    const handleAccountNumberChange = (e) => {
        props.updateStore('BankAccountNumber', e.value);
    };

    const branchName = props.store.BankBranchName;

    const handleBranchNameChange = (e) => {
        props.updateStore('BankBranchName', e.value);
    };

    const bankBranchCode = props.store.BankBranchCode;

    const handleBankBranchCodeChange = (e) => {
        props.updateStore('BankBranchCode', e.value);
    };

    // #endregion

    // #region Sales Order Settings

    const taxPercentage = props.store.TaxPercentage;

    const handleTaxPercentageChange = (e) => {
        let value = parseFloat(e.value);
        if (value < 0 || Helper.isNullOrUndefined(value)) {
            value = 0;
        } else {
            let temp = Helper.countDecimals(value);
            if (temp >= 3) {
                value = value.toFixed(2);
            }
        }
        props.updateStore('TaxPercentage', value);
    }

    const quoteExpiry = props.store.QuoteExpiryPeriod;

    const handleQuoteExpiryChange = (e) => {
        let value = parseInt(e.value);
        if (value < 0 || Helper.isNullOrUndefined(value)) {
            value = 0;
        }
        props.updateStore('QuoteExpiryPeriod', value);
    }

    const invoiceDue = props.store.InvoiceDuePeriod;

    const handleInvoiceDueChange = (e) => {
        let value = parseInt(e.target.value);
        if (value < 0 || Helper.isNullOrUndefined(value)) {
            value = 0;
        }
        props.updateStore('InvoiceDuePeriod', value);
    }

    const quoteComment = props.store.QuoteComment;

    const handleQuoteCommentChange = (e) => {
        props.updateStore('QuoteComment', e.value);
    };

    const invoiceComment = props.store.InvoiceComment;

    const handleInvoiceCommentChange = (e) => {
        props.updateStore('InvoiceComment', e.value);
    };

    // #endregion

    // #region Status Settings

    const isDefault = props.store.IsDefault;

    const handleIsDefaultChange = (e) => {
        props.updateStore('IsDefault', !isDefault);
        setActiveDisabled(!isDefault);
    };

    const [isEnabled, setIsEnabled] = useState(props.store.IsActive);
    const [activeDisabled, setActiveDisabled] = useState(isDefault);

    const handleIsEnabledChange = (e) => {
        const oldVal = isEnabled;
        const newVal = !isEnabled;

        setIsEnabled(newVal);

        if (oldVal === false && props.canAmendSubscription) {
            setConfirmEmployeeAccessOptions({
                display: true,
                onConfirm: () => {
                    props.updateStore('IsActive', newVal);
                    setIsEnabled(newVal);
                },
                onCancel: () => {
                    setIsEnabled(oldVal);
                }
            });
        } else {
            props.updateStore('IsActive', newVal);
        }
    };

    // #endregion

    const [confirmEmployeeAccessOptions, setConfirmEmployeeAccessOptions] = useState({
        display: false,
        onConfirm: () => { },
        onCancel: () => { }
    });

    return (
        <>
            <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab}
                tabs={[
                    { text: 'Store Settings', suppressCount: true },
                    { text: 'Bank Settings', suppressCount: true },
                    { text: 'Sales Settings', suppressCount: true },
                    { text: 'Job Settings', suppressCount: true },
                ]} />
            {(() => {
                switch (selectedTab) {
                    case 'Store Settings':
                        return <div key={0}>
                            <div className="row">
                                <div className="column">
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="name"
                                                label="Name"
                                                onChange={handleNameChange}
                                                required={true}
                                                value={name}
                                                error={props.inputErrors.Name}
                                                cypress="data-cy-name"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="RegisteredName"
                                                label="Registered name"
                                                onChange={handleRegisteredNameChange}
                                                value={registeredName}
                                                cypress="data-cy-registeredname"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="Code"
                                                label="Branch Code"
                                                onChange={handleCodeChange}
                                                required={true}
                                                value={code}
                                                error={props.inputErrors.Code}
                                                cypress="data-cy-code"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                type={'tel'}
                                                name="Telephone"
                                                label="Telephone Number"
                                                onChange={handleTelephoneChange}
                                                required={true}
                                                value={telephone}
                                                error={props.inputErrors.Telephone}
                                                cypress="data-cy-tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="FaxNumber"
                                                label="Fax Number"
                                                onChange={handleFaxChange}
                                                value={fax}
                                                cypress="data-cy-fax"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="EmailAddress"
                                                label="Email Address"
                                                onChange={handleEmailChange}
                                                value={email}
                                                cypress="data-cy-emailaddress"
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="column">
                                            <SCInput
                                                name="WebsiteAddress"
                                                label="Website Address"
                                                onChange={handleWebsiteChange}
                                                value={website}
                                                cypress="data-cy-website"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="column column-center">
                                    <br />
                                    <SCUploadDropzone hint={`Add Logo`} note={`Drag and Drop file to Upload`} multiple={false}
                                        onChange={props.onUploadLogoChange} dropzoneOverlaySrc={props.store.LogoURL} fileType={Enums.FileType.Image}
                                        onDelete={props.deleteLogo} uploading={props.uploading} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="AddressLine1"
                                        label="Address Line 1"
                                        onChange={handleAddressLine1Change}
                                        required={true}
                                        value={addressLine1}
                                        error={props.inputErrors.AddressLine1}
                                        cypress="data-cy-addressline1"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PostalLine1"
                                        label="Postal Line 1"
                                        onChange={handlePostalLine1Change}
                                        required={true}
                                        value={postalLine1}
                                        error={props.inputErrors.PostalLine1}
                                        cypress="data-cy-postalline1"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="AddressLine2"
                                        label="Address Line 2"
                                        onChange={handleAddressLine2Change}
                                        required={true}
                                        value={addressLine2}
                                        error={props.inputErrors.AddressLine2}
                                        cypress="data-cy-addressline2"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PostalLine2"
                                        label="Postal Line 2"
                                        onChange={handlePostalLine2Change}
                                        required={true}
                                        value={postalLine2}
                                        error={props.inputErrors.PostalLine2}
                                        cypress="data-cy-postalline2"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="AddressLine3"
                                        label="Address Line 3"
                                        onChange={handleAddressLine3Change}
                                        required={true}
                                        value={addressLine3}
                                        error={props.inputErrors.AddressLine3}
                                        cypress="data-cy-addressline3"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PostalLine3"
                                        label="Postal Line 3"
                                        onChange={handlePostalLine3Change}
                                        required={true}
                                        value={postalLine3}
                                        error={props.inputErrors.PostalLine3}
                                        cypress="data-cy-postalline3"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="AddressLine4"
                                        label="Address Line 4"
                                        onChange={handleAddressLine4Change}
                                        value={addressLine4}
                                        cypress="data-cy-addressline4"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PostalLine4"
                                        label="Postal Line 4"
                                        onChange={handlePostalLine4Change}
                                        value={postalLine4}
                                        cypress="data-cy-postalline4"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="EmailFromName"
                                        label="Reply to name"
                                        onChange={handleEmailFromNameChange}
                                        required={true}
                                        value={emailFromName}
                                        error={props.inputErrors.EmailFromName}
                                        cypress="data-cy-emailfromname"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="EmailFromAddress"
                                        label="Reply to address"
                                        onChange={handleEmailFromAddressChange}
                                        required={true}
                                        value={emailFromAddress}
                                        error={props.inputErrors.EmailFromAddress}
                                        cypress="data-cy-emailfromaddress"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                </div>
                                <div className="column">
                                    <SCCheckbox
                                        name="EmailFromEmployee"
                                        label="Reply to Employee"
                                        onChange={handleEmailFromEmployeeChange}
                                        value={emailFromEmployee}
                                        cypress="data-cy-emailfromemployee"
                                        hint='Only applicable Quotes, Invoices, Purchase Orders & Queries'
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="VATRegistrationNo"
                                        label="VAT Registration No"
                                        onChange={handleVatRegistrationChange}
                                        value={vatRegistration}
                                        cypress="data-cy-vat"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="CompanyRegistrationNo"
                                        label="Company Registration No"
                                        onChange={handleCompanyRegistrationChange}
                                        value={companyRegistration}
                                        cypress="data-cy-companyregistration"
                                    />
                                </div>
                            </div>
                            <br />
                            <div className="row">
                                <div className="column">
                                    <SCSwitch label='Default' checked={isDefault} onToggle={handleIsDefaultChange} disabled={props.defaultDisabled || !isEnabled} />
{/*
                                    <ReactSwitch label='Default' checked={isDefault} handleChange={handleIsDefaultChange} disabled={props.defaultDisabled || !isEnabled} />
*/}
                                </div>
                                <div className="column">
                                    <SCSwitch label='Active' checked={isEnabled} onToggle={handleIsEnabledChange} disabled={activeDisabled} />
{/*
                                    <ReactSwitch label='Active' checked={isEnabled} handleChange={handleIsEnabledChange} disabled={activeDisabled} />
*/}
                                </div>
                            </div>


                        </div>;
                    case 'Email Settings':
                        return <div key={1}>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="CustomerNotify"
                                        label="Customer notify"
                                        onChange={handleCustomerNotifyChange}
                                        required={true}
                                        value={customerNotify}
                                        cypress="data-cy-customernotify"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="QueryNotify"
                                        label="Query notify"
                                        onChange={handleQueryNotifyChange}
                                        required={true}
                                        value={queryNotify}
                                        cypress="data-cy-querynotify"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="ProductNotify"
                                        label="Product notify"
                                        onChange={handleProductNotifyChange}
                                        required={true}
                                        value={productNotify}
                                        cypress="data-cy-productnotify"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="JobCardNotify"
                                        label="Job card notify"
                                        onChange={handleJobCardNotifyChange}
                                        required={true}
                                        value={jobCardNotify}
                                        cypress="data-cy-jobnotify"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="CollectionNotify"
                                        label="Collection notify"
                                        onChange={handleCollectionNotifyChange}
                                        required={true}
                                        value={collectionNotify}
                                        cypress="data-cy-collectionnotify"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="InventoryNotify"
                                        label="Inventory notify"
                                        onChange={handleInventoryNotifyChange}
                                        required={true}
                                        value={inventoryNotify}
                                        cypress="data-cy-inventorynotify"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="QuoteNotify"
                                        label="Quote notify"
                                        onChange={handleQuoteNotifyChange}
                                        required={true}
                                        value={quoteNotify}
                                        cypress="data-cy-quotenotify"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="InvoiceNotify"
                                        label="Invoice notify"
                                        onChange={handleInvoiceNotifyChange}
                                        required={true}
                                        value={invoiceNotify}
                                        cypress="data-cy-invoicenotify"
                                    />
                                </div>
                            </div>
                        </div>;
                    case 'Prefix Settings':
                        return <div key={2}>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="PrefixCustomer"
                                        label="Customer prefix"
                                        onChange={handleCustomerPrefixChange}
                                        value={customerPrefix}
                                        cypress="data-cy-prefixcustomer"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PrefixInvoice"
                                        label="Invoice prefix"
                                        onChange={handleInvoicePrefixChange}
                                        value={invoicePrefix}
                                        cypress="data-cy-prefixinvoice"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="PrefixJobCard"
                                        label="Job card prefix"
                                        onChange={handleJobCardPrefixChange}
                                        value={jobCardPrefix}
                                        cypress="data-cy-prefixjob"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PrefixProduct"
                                        label="Product prefix"
                                        onChange={handleProductPrefixChange}
                                        value={productPrefix}
                                        cypress="data-cy-prefixproduct"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="PrefixQuery"
                                        label="Query prefix"
                                        onChange={handleQueryPrefixChange}
                                        value={queryPrefix}
                                        cypress="data-cy-prefixquery"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="PrefixQuote"
                                        label="Quote prefix"
                                        onChange={handleQuotePrefixChange}
                                        value={quotePrefix}
                                        cypress="data-cy-prefixquote"
                                    />
                                </div>
                            </div>
                        </div>;
                    case 'Bank Settings':
                        return <div key={3}>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="BankAccountName"
                                        label="Bank account name"
                                        onChange={handleBankAccountNameChange}
                                        value={bankAccountName}
                                        cypress="data-cy-bankaccountname"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="BankName"
                                        label="Bank name"
                                        onChange={handleBankNameChange}
                                        value={bankName}
                                        cypress="data-cy-bankname"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="BankAccountNumber"
                                        label="Account number"
                                        onChange={handleAccountNumberChange}
                                        value={accountNumber}
                                        cypress="data-cy-accountnumber"
                                    />
                                </div>
                                <div className="column">
                                    <SCInput
                                        name="BankBranchName"
                                        label="Branch name"
                                        onChange={handleBranchNameChange}
                                        value={branchName}
                                        cypress="data-cy-branchname"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCInput
                                        name="BankBranchCode"
                                        label="Branch code"
                                        onChange={handleBankBranchCodeChange}
                                        value={bankBranchCode}
                                        cypress="data-cy-branchcode"
                                    />
                                </div>
                                <div className="column">
                                </div>
                            </div>
                        </div>;
                    case 'Sales Settings':
                        return <div key={4}>
                            <div className="row">
                                <div className="column">
                                    <SCNumericInput
                                        name="TaxPercentage"
                                        label="Tax percentage"
                                        onChange={handleTaxPercentageChange}
                                        required={true}
                                        min={0}
                                        value={taxPercentage}
                                        error={props.inputErrors.TaxPercentage}
                                        cypress="data-cy-tax"
                                        format={Enums.NumericFormat.Percentage}
                                        disabled={true}
                                        hint='Edit Tax Percentage on Company Details'
                                    />
                                </div>
                                <div className="column">
                                    <SCNumericInput
                                        name="QuoteExpiryPeriod"
                                        label="Quote expiry period"
                                        onChange={handleQuoteExpiryChange}
                                        required={true}
                                        format={Enums.NumericFormat.Integer}
                                        value={quoteExpiry}
                                        error={props.inputErrors.QuoteExpiry}
                                        cypress="data-cy-quoteexpiry"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCNumericInput
                                        name="InvoiceDuePeriod"
                                        label="Invoice due period"
                                        onChange={handleInvoiceDueChange}
                                        required={true}
                                        format={Enums.NumericFormat.Integer}
                                        value={invoiceDue}
                                        error={props.inputErrors.InvoiceDue}
                                        cypress="data-cy-invoicedue"
                                    />
                                </div>
                                <div className="column">
                                </div>
                            </div>
                            <div className="row">
                                <div className="column">
                                    <SCTextArea
                                        name="QuoteComment"
                                        label="Quote note"
                                        onChange={handleQuoteCommentChange}
                                        value={quoteComment}
                                        cypress="data-cy-quotecomment"
                                    />
                                </div>
                                <div className="column">
                                    <SCTextArea
                                        name="InvoiceComment"
                                        label="Invoice note"
                                        onChange={handleInvoiceCommentChange}
                                        value={invoiceComment}
                                        cypress="data-cy-invoicecomment"
                                    />
                                </div>
                            </div>
                        </div>;
                    case "Job Settings":
                        return (
                            <div className="row">
                                <div className="column">
                                    <SCTextArea
                                        name="JobTerms"
                                        label="Job Terms"
                                        onChange={handleJobTermsChange}
                                        value={jobTerms}
                                        maxLength={15_000}
                                    />
                                </div>
                                <div className="column">
                                </div>
                            </div>
                        )
                    default:
                        return null;
                }
            })()}

            <ConfirmAccess options={confirmEmployeeAccessOptions} setOptions={setConfirmEmployeeAccessOptions} module={"Store"} />

            <style jsx>{`
                .container {
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 1.5rem 3rem;
                    overflow-x: hidden;
                    }
                .row {
                    display: flex;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    width: ${layout.inputWidth};
                }
                .column :global(.textarea-container) {
                    height: 100%;
                }
                .column + .column {
                    margin-left: 1.25rem;
                }
                .heading {
                    color: ${colors.blueGrey};
                    font-weight: bold;
                    margin: 1.5rem 0 0.5rem;
                }
                .loader {
                    border-color: rgba(113, 143, 162, 0.2);
                    border-left-color: ${colors.blueGrey};
                    display: block;
                    margin-bottom: 1rem;
                    margin-top: 1rem;
                }
                .column-center {
                    align-items: center;
                }
            `}</style>
        </>
    );
}

export default ManageStore;
