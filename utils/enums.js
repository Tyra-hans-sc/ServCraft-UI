export const Cookie = {
  servSidebarState: "servSidebarState",
  permissions: "permissions",
  token: "token",
  tenantID: "tenantID",
  userID: "userID",
  employeeID: "employeeID",
  servUserName: "servUserName",
  servFullName: "servFullName",
  servCompanyName: "servCompanyName",
  servCrumbs: "servCrumbs",
  subscriptionInfo: "subscriptionInfo",
  apiHost: "apiHost",
  fingerPrint: "fingerPrint",
  blockMessage: "blockMessage",
  pageSize: "pageSize",
  breakpoint: "breakpoint",
  supplierContactID: "supplierContactID",
  supplierID: "supplierID",
  mapLoaded: "mapLoaded",
  mobileViewAlertDismissed: "mobileViewAlertDismissed",
  maintenanceMessageDismissed: "maintenanceMessageDismissed",
  hasVan: "hasVan"
};

export const LicenseType = {
  Free: 1,
  Trial: 2,
  Standard: 3,
  Enterprise: 4,
};

export const PrintLabelType = {
  JobCard: 1,
  JobAsset: 2,
}

export const Module = {
  Customer: 0,
  JobCard: 1,
  Query: 2,
  Asset: 3,
  Collection: 4,
  Quote: 5,
  PickingSlip: 6,
  WebQuery: 7,
  Supplier: 9,
  None: 10,
  Sales: 11,
  Workshop: 12,
  Employee: 13,
  Inventory: 14,
  Invoice: 15,
  Service: 16,
  Project: 17,
  Comment: 18,
  Attachment: 19,
  Appointment: 20,
  Document: 21,
  Import: 22,
  // Supplier: 23,
  PurchaseOrder: 24,
  CustomerZone: 25,
  Store: 26,
  Tenant: 27,
  FormDefinition: 28,
  MessageQueue: 29,
  TaskItem: 30,
  Integration: 31,
  FormHeader: 32,
  StockTransactionGRV: 33,
  StockTransactionTransfer: 34,
  StockTransactionAdjustment: 35,
  StockTransactionExternalTransfer: 36,
  Signature: 37,
  MessageQueueBulk: 38,
  MessageQueueBulkItem: 39,
  RecurringJob: 40,
  Bundle: 45,
  Stocktake: 46,
  StocktakeTemplate: 47,
  VanStock: 48
}

export const IntegrationModule = {
  Customer: 0,
  Quote: 5,
  Employee: 13,
  Inventory: 14,
  Invoice: 15,
  Contact: 23,
  QuoteAsInvoice: 24,
  QuoteDetail: 25,
  InventoryCategory: 26,
}

export const IntegrationPartner = {
  SageOne: 1,
  Xero: 2,
  QuickBooks: 3,
  PayFast: 4,
  Seon: 5,
}

export const IntegrationType = {
  Accounting: 1,
  CRM: 2,
  PaymentGateway: 3,
}

export const IntegrationStatus = {
  Unspecified: 0,
  Live: 1,
  Unauthorized: 2,
  Cancelled: 3,
  Commissioning: 4
}

export const DeliveryStatus = {
  None: 0,
  Unsent: 1,
  Sent: 2,
  Viewed: 3
}

export const SyncStatus = {
  Never: 0,
  Pending: 1,
  Synced: 2,
  Failed: 3,
  NotSyncable: 4,
  Delete: 5,
  Deleted: 6,
}

export const SyncStatusColor = {
  Never: "var(--mantine-color-gray-3)",
  Pending: "var(--mantine-color-gray-6)",
  Synced: "var(--mantine-color-green-5)",
  Failed: "var(--mantine-color-red-5)",
  NotSyncable: "var(--mantine-color-orange-5)",
  Delete: "var(--mantine-color-violet-5)",
  Deleted: "var(--mantine-color-violet-8)",
}

export const ProgressStatus = {
  Asleep: 0,
  InProgress: 1,
}

export const ModuleSettings = {
  Customer: 0,
  JobCard: 1,
  Query: 2,
  Product: 3,
  Collection: 4,
  Quote: 5,
  Sales: 11,
  Inventory: 14,
  Invoice: 15,
}
// this Enum is used to map the module name to the module url - only valid urls are defined
export const ModuleUrl = {
  customer: 0,
  job: 1,
  query: 2,
  // product: 3,
  // collection: 4,
  quote: 5,
  // pickingslip: 6,
  // webquery: 7,
  // none: 10,
  // sales: 11,
  // workshop: 12,
  // employee: 13,
  inventory: 14,
  invoice: 15,
  // service: 16,
  project: 17,
  // comment: 18,
  // attachment: 19,
  // appointment: 20,
  // document: 21,
  // import: 22,
  "message/bulk": 38
}

export const AppointmentType = {
  OnSite: 0,
  PhoneCall: 1,
  InStore: 2,
}

export const AppointmentReminder = {
  'No reminder': 0,
  '1 hour before appointment': 1,
  '2 hours before appointment': 2,
  '6 hours before appointment': 6,
  '24 hours before appointment': 24,
}

export const QueryPriority = {
  Low: 0,
  Medium: 1,
  High: 2
}

export const QueryPriorityColor = {
  Low: "var(--mantine-color-scBlue-2)", // Light Blue
  Medium: "var(--mantine-color-scBlue-3)", // Amber/Yellow
  High: "var(--mantine-color-scBlue-5)" // Red-Orange
};

export const QuerySource = {
  None: 0,
  Internal: 1,
  Email: 2,
  Webform: 3,
}

export const QuoteStatus = {
  None: -1,
  Draft: 0,
  Accepted: 1,
  Declined: 2,
  Invoiced: 3,
  Expired: 4,
  Approved: 6,
  Cancelled: 7,
}

export const QuoteStatusColor = {
  Cyan: 0,
  Green: 1,
  Red: 2,
  Orange: 3,
  Blue: 6,
  Purple: 7,
}

export const QuoteItemType = {
  None: 0,
  Inventory: 1,
  Description: 2,
}

export const QuoteTaxRate = {
  'Standard Rate': 0,
  'No VAT': 1,
}

export const TaxRate = {
  'Standard Rate': 0,
  'No VAT': 1,
}

export const InvoiceStatus = {
  None: 0,
  Draft: 1, // approve to take it to unpaid
  Unpaid: 2, // move to paid
  Overdue: 3, // expressed as overdue when due date elapsed. move to paid
  Paid: 4, // move back to unpaid
  Cancelled: 5,
}

export const InvoiceStatusColor = {
  Cyan: 1,
  Green: 2,
  Red: 3,
  Blue: 4,
  Purple: 5,
}

export const InvoiceItemType = {
  None: 0,
  Inventory: 1,
  Description: 2,
}

export const PurchaseOrderStatus = {
  None: 0,
  Draft: 1,
  Approved: 2,
  Billed: 3,
  Cancelled: 4,
}

export const PurchaseOrderStatusColor = {
  Cyan: 1,
  Green: 2,
  Blue: 3,
  Purple: 4,
}

export const ItemType = {
  None: 0,
  Inventory: 1,
  Description: 2,
}

export const StockItemType = {
  Product: 0,
  Part: 1,
  Service: 2,
}

export const MessageStatus = {
  Queued: 0,
  InProgress: 1,
  Completed: 2,
  Aborted: 3,
  Error: 4,
  RetryCountExceeded: 5,
  ValidationFailed: 6,
  CompletedWithErrors: 7,
  OutOfCredits: 8,
  Delivered: 9,
  Opened: 10,
  Forbidden: 11,
  Draft: 12,
  QuotaExceeded: 13
}

export const MessageStatusColorMapping = {
  [MessageStatus.Queued]: "#808080",
  [MessageStatus.InProgress]: "#007BFF",
  [MessageStatus.Completed]: "#28A745",
  [MessageStatus.Aborted]: "#FFA500",
  [MessageStatus.Error]: "#DC3545",
  [MessageStatus.RetryCountExceeded]: "#FF8C00",
  [MessageStatus.ValidationFailed]: "#FF0000",
  [MessageStatus.CompletedWithErrors]: "#FFC107",
  [MessageStatus.OutOfCredits]: "#9E9E9E",
  [MessageStatus.Delivered]: "#20C997",
  [MessageStatus.Opened]: "#17A2B8",
  [MessageStatus.Forbidden]: "#6F42C1",
  [MessageStatus.Draft]: "#B0BEC5",
  [MessageStatus.QuotaExceeded]: "#e78207"
}


export const MessageSource = {
  None: 0,
  Module: 1,
  MessageSequence: 2,
  ProductSequence: 3,
  JobSequence: 4,
  ServiceSequence: 5,
  WCF: 6,
  Customer: 7,
  Comment: 8,
  Appointment: 9,
  Custom: 10,
  Trigger: 11,
  SMSNotification: 12,
  MessageQueueBulk: 13,
}

export const FormDefinitionStatusColor = {
  Grey: 0,
  Orange: 1,
  Blue: 2
}

export const MessageStatusColor = {
  Cyan: 0,
  Green: 1,
  Blue: 2,
  Black: 3,
  Orange: 5,
  Red: 4,
  White: 12
}

export const MessageType = {
  Email: 0,
  SMS: 1,
  Both: 2
}

export const TemplateType = {
  System: 0,
  User: 1,
}

export const Icon = {
  Excel: '/icons/excel.svg',
  Help: '/icons/help-circle-bluegrey.svg',
  MapPin: '/icons/map-pin.svg',
  MessageCircle: '/icons/message-circle.svg',
  MessageCircleBlue: '/icons/message-circle-blue.svg',
  PDF: '/icons/pdf-blue-gray.svg',
  Send: '/icons/send.svg',
  Upload: '/icons/upload.svg',
  User: '/icons/user.svg',
  Alert: '/icons/alert-triangle.svg',
}

export const ControlType = {
  Text: 0,
  Number: 1,
  Date: 2,
  Select: 3,
  Email: 4,
  Checkbox: 5,
  Radio: 6,
  MultiSelect: 7,
  Switch: 8,
  ContactNumber: 9,
  Custom: 99,
}

export const UserType = {
  None: 0,
  Employee: 1,
  Technician: 2,
  Supplier: 3,
  SupplierContact: 4,
  //Supplier: 5,
  Customer: 6,
  System: 7,
  Communication: 8,
  MobileView: 9,
  Test: 10,
  Admin: 99,
}

export const ImportType = {
  Customer: 1,
  Inventory: 2,
  Asset: 3,
  // AssetNandos: 4,
  FaultCode: 5,
  FaultCause: 6,
  FaultReason: 7,
  Supplier: 8,
  CustomerContact: 9,
}

export const ImportStatus = {
  Queued: 0,
  Inprogress: 1,
  Checking: 2,
  Processing: 3,
  Errors: 4,
  Completed: 5,
}
export const ImportStatusColor = {
  Cyan: 0,
  Green: 1,
  Yellow: 2,
  Orange: 3,
  Red: 4,
  Blue: 5,
}

export const ExportType = {
  PDF: 0,
  Word: 1,
  Excel: 2
}

export const JobStatusOptionName = {
  Supplier: 1,
  PurchaseOrder: 2,
  QuoteAmount: 3,
  QuoteNumber: 4,
  InvoiceAmount: 5,
  InvoiceNumber: 6,
  CreditNoteAmount: 7,
  CreditNoteNumber: 8,
  SupplierAmount: 9,
  SupplierNumber: 10,
  CourierAmount: 11,
  CourierNumber: 12,
  CourierName: 13,
  LabourAmount: 14,
  //SignatureCustomer: 15,
  //SignatureEmployee: 16,
  FaultCause: 17,
  FaultCode: 18,
  FaultReason: 19,
  FaultCauseList: 20,
  FaultCodeList: 21,
  FaultReasonList: 22,
  CustomField1: 23,
  CustomField2: 24,
  CustomFilter1: 25,
  CustomFilter2: 26,
  CustomDate1: 27,
  CustomDate2: 28,
  CustomNumber1: 29,
  CustomNumber2: 30,
  Accessories: 31,
  AssessmentFee: 32,
  PreviousJobNumber: 33,
  QuoteExceed: 34,
  ReferenceNumber: 35,
  SerialNumber: 36,
  SupplierWarranty: 37,
  Product: 38,
  Project: 39,
  EmployeeList: 40,
  EmployeeTime: 41,
  EmployeeStartTime: 42,
  EmployeeEndTime: 43,
  EmployeeTravel: 44,
  ProofOfPurchaseDate: 45,
  Description: 46,
  JobCardAttach: 49,
  WorkshopAttach: 50,
  SignOffAttach: 51,
  JobItem: 52,
  CustomField3: 53,
  CustomField4: 54,
  Materials: 55,
  Van: 56
}

export const OptionConfiguration = {
  None: 0,
  Optional: 1,
  Required: 2,
};

export const DisplayColor = {
  Red: 0,
  Orange: 1,
  Yellow: 2,
  Green: 3,
  Blue: 4,
  Purple: 5,
  Black: 6,
  Grey: 7,
  LightGrey: 8,
}

export const JobStatusTypes = {
  textField31: 31,
  amount32: 32,
  singleSelect47: 47,
  multiSelect48: 48,
  amount11: 11,
  textField13: 13,
  textField12: 12,
  amount7: 7,
  textField8: 8,
  datetime27: 27,
  datetime28: 28,
  textField23: 23,
  textField24: 24,
  textField53: 53,
  textField54: 54,
  bool25: 25,
  bool26: 26,
  number29: 29,
  number30: 30,
  textField46: 46,
  datetime43: 43,
  multiSelect40: 40,
  datetime42: 42,
  integer41: 41,
  number44: 44,
  singleSelect17: 17,
  multiSelect20: 20,
  singleSelect18: 18,
  multiSelect21: 21,
  singleSelect19: 19,
  multiSelect22: 22,
  amount5: 5,
  textField6: 6,
  attach49: 49,
  amount14: 14,
  textField33: 33,
  singleSelect38: 38,
  singleSelect39: 39,
  datetime45: 45,
  textField2: 2,
  amount3: 3,
  amount34: 34,
  textField4: 4,
  textField35: 35,
  textField36: 36,
  attach15: 15,
  attach16: 16,
  attach51: 51,
  amount9: 9,
  textField10: 10,
  textField37: 37,
  attach50: 50,
  singleSelect1: 1,
  singleSelect56: 56
}

export const JobStatusOptionEndpoints = {
  '/Employee': 40,
  '/FaultCause': 17,
  '/FaultCause': 20,
  '/FaultCode': 18,
  '/FaultCode': 21,
  '/FaultReason': 19,
  '/FaultReason': 22,
  '/Supplier': 1,
  '/Warehouse': 56,
}

export const JobItemSelection = {
  Both: 1,
  Inventory: 2,
  Asset: 3,
  Disabled: 4
}

export const JobItemOrder = {
  Inventory: 1,
  Asset: 2,
}

export const CollectionType = {
  Collection: 0,
  Delivery: 1
}

export const CollectionSubType = {
  JobCard: 0,
  Supplier: 1,
  General: 2,
  Product: 3,
  New: 10
}

export const CollectionStatus = {
  Pending: 0,
  Completed: 1,
  Cancelled: 2
}

export const ReportGenerator = {
  RDLC: 0,
  Excel: 1,
  RDLCExcel: 2,
  SQLExcel: 3,
  ExcelPDF: 4,
}

export const BillingProvider = {
  None: 0,
  PayFastAdhoc: 1,
  PayFastOnceOff: 2,
  EFT: 3,
  DebitOrder: 4,
  ThirdParty: 5,
  PeachPayments: 6
}

export const BillingStatus = {
  None: 0,
  Success: 1,
  Cancelled: 2,
  Blocked: 3
}

export const PayFastStatus = {
  None: 0,
  Activated: 1,
  Deactivated: 2,
}

export const Frequency = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
}

export const DayOfWeek = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

export const LocalStorage = {
  LegacyDocumentValue: "ldv",
  LastRefreshedAPI: "lrapi",
  TimeShiftMilliseconds: "tsm",
  LastRefreshedPermissions: "lrp",
  SchedulerSlotDuration: "ssd",
  TenantZoneSignatures: "tzs",
  HubSpotToken: "hst",
  RunningTimers: "rts"
};

export const PermissionName = {
  Job: "AA53C147-14B6-485B-A000-FD274E4F2F92",
  Query: "504B4A28-6B38-481B-8E1A-0647EF6ED576",
  Quote: "8E2BF096-B004-4F5F-ACE4-B396CE19DF48",
  QuoteRevert: "D575C7BE-27DC-458D-AB0D-B5629AF7D930",
  Appointment: "9C5F6DD1-6834-41D2-B5F6-F248E3426498",
  Product: "A3F5E320-5696-494A-B27F-2C8D325974E2",
  Customer: "118F90A1-2FC2-4DCB-9057-E0115EB181DC",
  Inventory: "10CD23F5-883B-460E-959F-D0FA3E8E05D5",
  Message: "F2A2C2E6-FB46-4674-9E05-51B3C6BBD2F2",
  Reports: "4874326A-43DB-45CC-B9F5-A67DC4330157",
  UserManagement: "9529D245-7A4F-48F9-AD3C-6944ECE45C40",
  MasterOfficeAdmin: "E45825C9-8629-418C-B278-44FF92E61ECC",
  MasterSystemAdmin: "F111108F-49D1-4643-B3F9-3DD1E9036BA0",
  Technician: "A5CA9CA2-FF2E-4381-9807-D5177BFBE337",
  Invoice: "600A9BAE-9D90-4BCA-B4A8-F2EE1853DEF7",
  InvoiceRevert: "F6D8FFF0-1365-48C4-A0D7-ADF4D7A2255D",
  PurchaseOrder: "FF2AFF14-49F9-4AB4-9BA3-763E4E7940F0",
  PurchaseOrderRevert: "4F896BF6-35D0-43CC-B994-DBA16AC3863E",
  EditJob: "CE41B79F-34DB-4337-9B0E-2C04858F289F",
  CloseJob: "43BEF0A0-F906-4D92-809E-51665E835193",
  ArchiveJob: "44D8DF08-6F0B-44A0-8276-76BBD4CED95C",
  AddTaskItems: "C0A0A3D0-E2CE-4765-A2F6-BA6941045A97",
  RecurringJob: "ED9EB86A-3E1F-4829-9A82-6678E99BB799",
  AddRepeatJobs: "DA05B0A4-B42E-41D8-81B6-A95D6C4E482C",
  ManageItemsUsed: "044DCFF8-A791-4262-A451-25785BC4722A",
  ManageMyTimers: "4F81E4A5-68CC-4757-961E-CFEFF1DAE1A1",
  EditOtherTimers: "80DFF6AB-C4A1-4238-A750-9F6357914614",
  Project: "1D21A3BD-E9E2-4A45-8CDC-7B2CB4DC674C",
  EditCustomer: "7761247E-0411-4357-A131-FDB214E115A5",
  ModuleChangeCustomer: "E16F032E-CCA7-4367-BC50-9F559D0B2C74",
  EditCompany: "5A045748-3CF9-4F82-835A-4CAA47B01291",
  ChangeMyPassword: "B47DCEC0-4509-47F5-B1CE-A074E8218CE4",
  Exports: "19233C30-AD7A-44C6-9A90-CE2E9E13CFFB",
  Owner: "88D3A406-2337-4457-B6E8-9229B58D158C", // stubbed for main owner - not in the db, needs to be guid for security
  StoreChangeJob: "A0F9C8C6-6C92-45E5-9536-FA75B0DA38B7",
  AttachmentSecure: "28EE7490-B49F-49CE-8386-6C608BE7A06C",
  ChangeJobLocation: "C1CB09A1-9AD7-4331-A77D-8387710760A0",
  Comment: "37EE3B83-ED48-46CF-B412-691332EFDB72",
  AllowPublicComments: "3971FF37-DE68-4081-A157-12EDD1303E67",
  EditComments: "5272D5B6-865E-4FE9-861B-96CC91C2C955",
  Integrations: "E1EE14DB-2D9C-4AAD-80D3-E98364F40586",
  Subscriptions: "61CD71C2-0084-41F6-85EE-4E486F8D1609",
  ManageCosting: "21FF299E-8780-4F26-8655-CDE509D449A8",
  InventoryCostPrice: "8FF1EAF2-39C6-47B4-BE13-486F945E5511",
  WarehouseStockEditLevels: "8761E210-289F-471D-9D3A-9248C6F87CC1",
  StockTransactionsView: "A78B5FC4-73DD-470E-964F-E3D99E1EE23E",
  StockTransactionGRV: "4179B0BF-86C4-4197-B0A6-F2739069A0F0",
  StockTransactionAdjustment: "C727D390-39A3-4859-80E5-FAF296B35C92",
  StockTransactionTransfer: "13178F7B-BD03-4292-B4C0-3E8B5B0B3926",
  StockTake: "8B62ADC6-09F2-466A-9896-1062B0DC3FF0",
  StockTakeManager: "FAAD51CC-E59C-486C-8CDB-BB904B150B91",
  PurchaseOrderReceiveStock: "B0DA32BC-7A78-45AF-8911-5BA9559F80FB",
  PurchaseOrderApprove: "78EBD695-CECA-4D4B-A11D-AC9FB5D3C3D5",
  QuoteApprove: "758145C2-158B-48CA-AFAF-78A2CBD829A6",
  InvoiceApprove: "EDE48527-E8CE-4730-A923-2D8EE9956A1B",
  Van: "EA6B2902-B9E9-4944-B9CD-76377933A0DB",
  VanManage: "0E5C955E-9D5F-41AF-8E3E-57BB60C89C56"

};

// always add new id to the end of the list to avoid existing permissions the the cookie from misfiring, also keep Guid UPPERCASE
export const permissionIDShortCodes = {
  "Dx": "AA53C147-14B6-485B-A000-FD274E4F2F92",
  "hg": "504B4A28-6B38-481B-8E1A-0647EF6ED576",
  "uj": "8E2BF096-B004-4F5F-ACE4-B396CE19DF48",
  "Ub": "D575C7BE-27DC-458D-AB0D-B5629AF7D930",
  "qV": "9C5F6DD1-6834-41D2-B5F6-F248E3426498",
  "If": "A3F5E320-5696-494A-B27F-2C8D325974E2",
  "nj": "118F90A1-2FC2-4DCB-9057-E0115EB181DC",
  "zr": "10CD23F5-883B-460E-959F-D0FA3E8E05D5",
  "Xa": "F2A2C2E6-FB46-4674-9E05-51B3C6BBD2F2",
  "rv": "4874326A-43DB-45CC-B9F5-A67DC4330157",
  "cs": "9529D245-7A4F-48F9-AD3C-6944ECE45C40",
  "cf": "E45825C9-8629-418C-B278-44FF92E61ECC",
  "Wo": "F111108F-49D1-4643-B3F9-3DD1E9036BA0",
  "eX": "A5CA9CA2-FF2E-4381-9807-D5177BFBE337",
  "Ts": "600A9BAE-9D90-4BCA-B4A8-F2EE1853DEF7",
  "sX": "F6D8FFF0-1365-48C4-A0D7-ADF4D7A2255D",
  "Cx": "FF2AFF14-49F9-4AB4-9BA3-763E4E7940F0",
  "Jy": "4F896BF6-35D0-43CC-B994-DBA16AC3863E",
  "mg": "CE41B79F-34DB-4337-9B0E-2C04858F289F",
  "NY": "43BEF0A0-F906-4D92-809E-51665E835193",
  "WO": "44D8DF08-6F0B-44A0-8276-76BBD4CED95C",
  "eq": "C0A0A3D0-E2CE-4765-A2F6-BA6941045A97",
  "LN": "ED9EB86A-3E1F-4829-9A82-6678E99BB799",
  "eG": "DA05B0A4-B42E-41D8-81B6-A95D6C4E482C",
  "Uh": "044DCFF8-A791-4262-A451-25785BC4722A",
  "Bf": "4F81E4A5-68CC-4757-961E-CFEFF1DAE1A1",
  "mJ": "80DFF6AB-C4A1-4238-A750-9F6357914614",
  "KT": "1D21A3BD-E9E2-4A45-8CDC-7B2CB4DC674C",
  "Hz": "7761247E-0411-4357-A131-FDB214E115A5",
  "LI": "E16F032E-CCA7-4367-BC50-9F559D0B2C74",
  "jF": "5A045748-3CF9-4F82-835A-4CAA47B01291",
  "da": "B47DCEC0-4509-47F5-B1CE-A074E8218CE4",
  "AT": "19233C30-AD7A-44C6-9A90-CE2E9E13CFFB",
  "iy": "88D3A406-2337-4457-B6E8-9229B58D158C",
  "yI": "A0F9C8C6-6C92-45E5-9536-FA75B0DA38B7",
  "pR": "28EE7490-B49F-49CE-8386-6C608BE7A06C",
  "rL": "C1CB09A1-9AD7-4331-A77D-8387710760A0",
  "hH": "37EE3B83-ED48-46CF-B412-691332EFDB72",
  "iQ": "3971FF37-DE68-4081-A157-12EDD1303E67",
  "CE": "5272D5B6-865E-4FE9-861B-96CC91C2C955",
  "aJ": "E1EE14DB-2D9C-4AAD-80D3-E98364F40586",
  "Hb": "61CD71C2-0084-41F6-85EE-4E486F8D1609",
  "al": "21FF299E-8780-4F26-8655-CDE509D449A8",
  "pk": "8FF1EAF2-39C6-47B4-BE13-486F945E5511",
  "yq": "8761E210-289F-471D-9D3A-9248C6F87CC1",
  "Tx": "A78B5FC4-73DD-470E-964F-E3D99E1EE23E",
  "TK": "4179B0BF-86C4-4197-B0A6-F2739069A0F0",
  "FN": "C727D390-39A3-4859-80E5-FAF296B35C92",
  "uq": "13178F7B-BD03-4292-B4C0-3E8B5B0B3926",
  "Ha": "8B62ADC6-09F2-466A-9896-1062B0DC3FF0",
  "tA": "FAAD51CC-E59C-486C-8CDB-BB904B150B91",
  "Aw": "B0DA32BC-7A78-45AF-8911-5BA9559F80FB",
  "MD": "78EBD695-CECA-4D4B-A11D-AC9FB5D3C3D5",
  "Vu": "758145C2-158B-48CA-AFAF-78A2CBD829A6",
  "SV": "EDE48527-E8CE-4730-A923-2D8EE9956A1B",
  "oD": "EA6B2902-B9E9-4944-B9CD-76377933A0DB",
  "ix": "0E5C955E-9D5F-41AF-8E3E-57BB60C89C56",
};

// export const PermissionName = {
//   Job: "Job Card - Job Card",
//   Query: "Query - Query",
//   Quote: "Quote - Quote",
//   Appointment: "Appointment - Appointment",
//   Product: "Product - Product",
//   Customer: "Customer - Customer",
//   Inventory: "Inventory - Inventory",
//   Message: "System - Message",
//   Reports: "Report - Reports",
//   UserManagement: "System - User Management",
//   Technician: "Job Card - Technician",
//   MasterOfficeAdmin: "Master - Office Admin",
//   MasterSystemAdmin: "Master - System Admin",
//   Owner: "Owner",
//   Invoice: "Invoice - Invoice",
//   PurchaseOrder: "Purchase Order - Purchase Order",
//   // new permissions
//   EditJob: "Job - Edit Job",
//   CloseJob: "Job - Close Job",
//   ArchiveJob: "Job - Archive Job",
//   AddTaskItems: "Job - Add Task Items",
//   AddRecurringJobs: "Job - Add Recurring Jobs",
//   AddRepeatJobs: "Job - Add Repeat Jobs",
//   ManageItemsUsed: "Job - Manage Items Used",
//   ManageMyTimers: "Job - Manage My Timers",
//   EditOtherTimers: "Job - Edit Other Timers",
//   CreateProjects: "Project - Create Projects",
//   ModuleEditCustomer: "Customer - Edit Module Customer",
//   ModuleChangeCustomer: "Customer - Change Module Customer",
//   OwnerControl: "Settings - Owner Control",
//   ChangeMyPassword: "Settings - Change My Password",
//   Exports: "Exports - Exports"
// };

export const ToastType = {
  success: 'success',
  error: 'error'
};

export const ActivationStatus = {
  Valid: 0,
  Invalid: 1,
  Expired: 2,
  AlreadyActivated: 3
};

export const AccessStatus = {
  None: 0,
  Trial: 1,
  Live: 2,
  LiveAndOwing: 3,
  LockedWithAccess: 4,
  LockedWithOutAccess: 5
};

export const FlowType = {
  WorkFlow: 0,
  Flowless: 1,
};

export const PaymentStatus = {
  None: 0,
  Pending: 1,
  Paid: 2,
  Cancelled: 3
}

export const PaymentSubscriptionType = {
  None: 0,
  Adhoc: 1,
  OnceOff: 2
};

export const PaymentReason = {
  None: 0,
  Subscription: 1,
  SMSCredits: 2,
  SettleAccount: 3
};

export const AttachmentType = {
  Other: 0,
  Quote: 1,
  Invoice: 2,
  POP: 3,
  POD: 4,
  Image: 5,
  Audio: 6,
  Contract: 7,
  Sketch: 8,
  CustomerSignature: 9,
  TechnicianSignature: 10,
  Logo: 11,
  JobCard: 12,
  Import: 13,
  ImportReport: 14,
  PurchaseOrder: 15,
  ImportEworks: 16,
  Signature: 17,
  DisplayImage: 18,
  None: 99,
};

export const getAttachmentTypes = () => {
  return getEnumItems(AttachmentType).filter(x => x != getEnumStringValue(AttachmentType, AttachmentType.CustomerSignature)
    && x != getEnumStringValue(AttachmentType, AttachmentType.TechnicianSignature)
    && x != getEnumStringValue(AttachmentType, AttachmentType.Signature));
};

export const CustomerStatus = {
  Demo: 0,
  Trial: 1,
  Live: 2,
  Cancelled: 3,
  NotInterestedDemo: 4,
  NotInterestedTrial: 5,
  Test: 6,
  Kiratech: 7,
  OnHold: 8,
  Lead: 9,
  SignUp: 10,
};

export const LocationType = {
  Delivery: 0,
  Postal: 1,
};

export const StockItemStatus = {
  None: 0,
  WorkedOn: 1,
  ItemUsed: 2,
};

export const StocktakeStatus = {
  Draft: 0,
  Pending: 1,
  Counting: 2,
  CountingComplete: 3,
  StocktakeComplete: 4,
  Cancelled: 99,
};

export const StocktakeType = {
  Templated: 0,
  OpenCapture: 1
};


export const StocktakeStatusText = {
  0: { label: 'Draft', color: '#9E9E9E' }, // Medium Gray
  1: { label: 'Pending', color: '#808080' }, // Amber/Orange
  2: { label: 'Counting', color: '#0096e1' }, // Bright Blue
  3: { label: 'Counting Completed', color: '#2577d6' }, // Green
  4: { label: 'Completed', color: '#3ca342' }, // Green
  99: { label: 'Cancelled', color: 'var(--mantine-color-yellow-7)' } // Standard warning yellow
};


/*export const StocktakeStatusText = {
  0: {label: 'Draft', color: '#808080'}, // Gray
  1: {label: 'Pending', color: '#2577d6'}, // Dark Green
  2: {label: 'InProgress', color: '#4682B4'}, // Steel Blue
  3: {label: 'Completed', color: '#00CED1'}, // Dark Turquoise
  4: {label: 'Cancelled', color: 'var(--mantine-color-yellow-7)'}
};*/

export const StocktakeItemSource = {
  Template: 0,
  User: 1
};

export const StocktakeItemStatus = {
  Pending: 0,
  Counted: 1,
  // Recount: 2,
  // Recounted: 3,
  Adjustment: 2,
  // Verified: 5
};

export const StocktakeItemStatusText = {
  0: { label: 'Pending', color: '#808080' }, // Gray
  1: { label: 'Counted', color: '#2577d6' }, // Dark Green
  // 2: {label: 'Recount', color: '#4682B4'}, // Steel Blue
  // 3: {label: 'Recounted', color: '#00CED1'}, // Dark Turquoise
  // 4: {label: 'Adjustment', color: '#0c5ebc'}, // Gold
  2: { label: 'Adjustment', color: 'var(--mantine-color-grape-7)' }, // Purple
  // 5: {label: 'Verified', color: '#1E90FF'}  // Dodger Blue
};

export const StocktakeAdjustmentReason = {
  DamagedGoods: 0,
  Theft: 1,
  Miscounted: 2,
  Misplaced: 3,
  AdministrationError: 4
};

export const StocktakeAdjustmentReasonText = {
  0: 'Damaged Goods',
  1: 'Theft',
  2: 'Miscounted',
  3: 'Misplaced',
  4: 'Administration Error'
};


export const Breakpoint = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
};

export const TriggerActionType = {
  Communication: 1,
  PropertySet: 2,
}

export const TriggerNotificationType = {
  None: 0,
  CustomerContacts: 1,
  CustomerPrimaryContact: 2,
  CustomerContactsForItem: 3,
  Employee: 4,
  EmployeesForItem: 5,
  EmployeeAll: 6,
  CustomerPrimaryAccounting: 7,
  EmployeesAllocated: 8, // Job Employee Allocated
  EmployeesUnallocated: 9, // Job Employee Unallocated
  EmployeeAllocated: 10, // Query Employee Allocated
  SupplierContacts: 11,
  SupplierPrimaryContact: 12,
  SupplierPrimaryAccounting: 13,
  SupplierContactsForItem: 14,
}

export const QuoteReminderType = {
  None: 0,
  AfterQuoteDate: 1,
  BeforeExpiryDate: 2,
}

export const InvoiceReminderType = {
  None: 0,
  AfterInvoiceDate: 1,
  AfterInvoiceDueDate: 2,
}

export const ConfigurationType = {
  None: 0,
  PageFilters: 1,
  CRUD: 2
}

export const ConfigurationSection = {
  None: 0,
  Job: 1,
  Query: 2,
  Quote: 3,
  Invoice: 4,
  PurchaseOrder: 5,
  Appointment: 6,
  Product: 7,
  Inventory: 8,
  InventorySubcategory: 9,
  Attachment: 10,
  Message: 11,
  Template: 12,
  TaskTemplate: 13,
  Trigger: 14,
  Bundle: 15,
  WebForm: 16,
  Supplier: 17,
  Dashboard: 18,
  Import: 19,
  Customer: 20,
  JobInventory: 21,
  General: 22,
  Stocktake: 23,
  StocktakeTemplate: 24
}

export const TaskTemplateDataTypes = {
  // Checkbox: "Checkbox",
  String: "Text",
  Number: "Number",
  Boolean: "Yes or No",
  Date: "Date",
  DateTime: "Date and Time",
  Attachment: "Upload Attachment",
  Select: "Select",
  MultiSelect: "Multiselect",
  CustomerSignature: "Customer's signature",
  EmployeeSignature: "Employee's signature",
  CompleteForms: "Complete Forms",
  TakePhoto: "Take Photo",
}

export const FormDefinitionFieldTypes = {
  Checkbox: "Checkbox",
  String: "Text",
  LongText: "Text Box",
  Number: "Number",
  Boolean: "Yes or No",
  Date: "Date",
  DateTime: "Date and Time",
  Select: "Select",
  MultiSelect: "Multiselect",
  Table: "Table",
  Image: "Image",
  Signature: "Signature",
  InformationalText: "Informational Text",
  InformationalImage: "Informational Image"
}

export const FormStatus = {
  None: 0,
  Draft: 1,
  Completed: 2,
  Vetted: 3
};

export const WebFormType = {
  None: 0,
  ContactUs: 1,
  LogServiceRequest: 2,
  RegisterWarranty: 3,
  ItemBooking: 4,
  //Custom: 99,
}

export const FormRule = {
  None: 0,
  Customer: 1,
  Job: 2,
}

export const DashboardDateRange = {
  Last7Days: 0,
  Last14Days: 1,
  Last21Days: 2,
  Last28Days: 3,
  Last90Days: 4,
  Last365Days: 5,
  ThisMonth: 6,
  // LastMonth: 7,
  ThisYear: 8,
  // LastYear: 9,
  AllTime: 10
}

export const SchedulerView = {
  day: 'day',
  week: 'week',
  workweek: 'work-week',
  month: 'month'
}

export const CommentType = {
  General: 0,
  Ageing: 1,
  Lead: 2,
  UTM: 3,
  Cancellation: 4,
  Help: 5,
  Feedback: 6,
  SchedulerFeedback: 7
}

export const NumericFormat = {
  Integer: 1,
  Decimal: 2,
  Currency: 3,
  Percentage: 4,
};

export const FileType = {
  Image: 1,
  PDF: 2,
  Video: 3,
};

export const Widgets = {
  NotSpecified: 0,
  JobsTracker: 1,
  JobsAttention: 2,
  AppointmentsCalendar: 3,
  AppointmentsTile: 4,
  JobsForTodayGrid: 5,
  JobsForTodayTile: 6,
  QuotesSummary: 7,
  InvoicesSummary: 8,
  CommentsLatest: 9,
  YouTube: 10,
  Carousel: 11,
  Checklist: 12,
  LearningCenter: 13,
  DownloadApp: 14,
  JobsSummary: 15,
  WhatsNew: 16,
  YoureIn: 17,
  AdvertJobs: 18,
  AdvertInvoices: 19,
  QuickActions: 20,
  DailyStats: 21,
  AdvertJobsAgeing: 22,
  JobsAgeing: 23,
  JobStatusStats: 24,
  QueryStatus: 25,
  QuoteStatus: 26,
  InvoiceStatus: 27,
  Feedback: 28,
  WelcomeBar: 29,
  Feedbear: 30,
  JobWizard: 31,
};

export const MessageBarType = {
  Warning: 0,
  Error: 1,
};

export const MessageBarSubType = {
  TrialExpiring: 0,
  TrialExpired: 1,
  AccountOverdue: 2,
  AccountLockedNoPermission: 3,
  AccountLockedPermission: 4,
  NoAccessNoPermission: 5,
};

export const ColumnMapping = {
  Job: 'JobList',
  JobSchedule: 'JobScheduleList',
  Project: 'ProjectList',
  Customer: 'CustomerList',
  Asset: 'ProductList',
  Inventory: 'InventoryList',
  Supplier: 'SupplierList',
};

export const Bank = {
  ABSA: 632005,
  BankOfAthens: 410506,
};

export const DocumentType = {
  JobCardCustomer: 1,
  JobCardSignOff: 2,
  JobCardWorkshop: 3,
  Quote: 4,
  Invoice: 5,
  JobCardJobSheet: 6,
  PurchaseOrder: 7,
  Form: 8
}

export const Orientation = {
  Portrait: 0,
  Landscape: 1
}

export const VoucherStatus = {
  None: 0,
  Invalid: 1,
  Applied: 2,
}

export const FormDefinitionStatus = {
  None: 0,
  Draft: 1,
  Confirmed: 2
}

export const WarehouseType = {
  //None: 0,
  Warehouse: 1,
  Mobile: 2
}

export const StockTransactionStatus = {
  // None: 0,
  Draft: 1,
  Complete: 2,
  Cancelled: 3
}

export const StockTransactionType = {
  NotSpecified: 0,
  GRV: 1,
  Transfer: 2,
  Adjustment: 3,
  ExternalTransfer: 4,
  Generic: 5,  // stock control changes to quantities without documentation
  Initial: 6,
  Used: 7,
  Return: 8
}

export const SignatureType = {
  None: 0,
  Employee: 1,
  Customer: 2,
  Supplier: 3,
  Courier: 4,
  Generic: 5
}

export const SignatureSource = {
  None: 0,
  WebApp: 1,
  MobileApp: 2,
  SignatureZone: 3
}

export const DebitOrderDay = {
  // None: 0,
  Second: 2,
  // Fifth: 5,
  // Tenth: 10,
  // Fifteenth: 15,
  TwentyFifth: 25,
}

export const DebitOrderStatus = {
  None: 0,
  Pending: 1,//0
  Confirmed: 2,//1
  Vetted: 3,//2
  Cancelled: 4,//3
  NotInterested: 5
}

export const LinkType = {
  Default: 0,
  JobsToQueries: 1
}

export const MessageGroupingType = {
  CustomerType: 0,
  CustomerGroup: 1,
  AllActiveCustomers: 2,
  CustomerStatus: 3,
  JobActivity: 4,
  IndustryType: 5,
  IncludeArchivedCustomer: 6,
  PrimaryContactType: 7,
  MarketingBlacklistLookback: 8,
  LimitTop: 9,
  JobStatus: 10,
  OpenJobs: 11,
  ClosedJobs: 12,

  // parent types
  CustomerFilters: 100,
  JobFilters: 101
};

export const InventoryGroup = {
  Category: 0,
  Section: 1,
};

export const WarehouseStockLocationChange = {
  None: 0,
  AvailableToInProgress: 1,
  InProgressToAvailable: 2
};

//public const string PermissionNameSales = "Sales - Sales";

// ------------------ HELPER FUNCTIONS ------------------- //

const splitIntoWords = (key) => {
  key = key ? key.toString() : "";
  let letters = [...key];
  let split = [""];
  letters.map(l => {
    if (l !== l.toLowerCase()) {
      split.push("")
    }
    split[split.length - 1] += l;
  });
  let sentence = "";
  for (let i = 0; i < split.length; i++) {
    let word = split[i];
    if (i === 0 || (word.length === 1 && split[i - 1].length === 1)) {
      sentence += word;
    } else {
      sentence += ` ${word}`;
    }
  }
  return sentence.trim();
};

export const getEnumStringValue = (theEnum, value, splitWords = false) => {
  for (var k in theEnum) {
    if (theEnum[k] == value) {
      return splitWords ? splitIntoWords(k) : k;
    }
  }
  return null;
};

export const getEnumItems = (theEnum, sorted = true, splitWords = false) => {
  let enumItems = [];
  for (let item in theEnum) {
    if (isNaN(Number(item))) {
      enumItems.push(splitWords ? splitIntoWords(item) : item);
    }
  }
  if (sorted) {
    return enumItems.sort();
  } else {
    return enumItems;
  }
};

export const getEnumItemValues = (theEnum, sorted = true) => {
  let enumItems = [];
  for (let item in theEnum) {
    if (isNaN(Number(item))) {
      enumItems.push(theEnum[item]);
    }
  }
  if (sorted) {
    return enumItems.sort();
  } else {
    return enumItems;
  }
};

export const getEnumItemsVD = (theEnum, splitWords = false, sorted = true) => {
  let enumItems = [];
  for (let item in theEnum) {
    enumItems.push({ description: splitWords ? splitIntoWords(item) : item, value: theEnum[item] });
  }
  return sorted ? enumItems.sort() : enumItems;
};
