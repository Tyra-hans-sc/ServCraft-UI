import packageJson from '../package.json';

const appVersion = () => {
  return packageJson.version;
};

export const margins = {
  input: 12,
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16
}

const defaultQuoteDepositPercentage = 0

const devTenants = [
  'ce1d433e-f42f-4eb0-a223-b3e206cfcda9', // mouseco
  '8b0539ff-6d09-4663-ba75-35b2b6ce0121', // dev tenant
  '2dce8a8c-59d0-46b9-9132-30baad32a6f3', // dev tenant
  'c50d6a14-9d9e-4431-b862-3773d932fd5d', // dev tenant
  'e1b7c347-0c4d-49dd-9b7c-051506bc9907', // kai industries
  '425bdf7f-edfe-49e2-a852-9d598080d8bf', // dana security
  '9c76a0fe-6d72-4b7e-83d4-ff6e77029ff1', // zana
]

// mouseco, ed co, philco, tshidi co
const whiteListedNewFeatureTenants = [
  ...devTenants,
  /*'ce1d433e-f42f-4eb0-a223-b3e206cfcda9', // mouseco
  '8b0539ff-6d09-4663-ba75-35b2b6ce0121', // dev tenant
  '2dce8a8c-59d0-46b9-9132-30baad32a6f3', // dev tenant
  'c50d6a14-9d9e-4431-b862-3773d932fd5d', // dev tenant
  'e1b7c347-0c4d-49dd-9b7c-051506bc9907', // kai industries
  '425bdf7f-edfe-49e2-a852-9d598080d8bf', // dana security
  '9c76a0fe-6d72-4b7e-83d4-ff6e77029ff1', // zana*/
  // '834aaba9-001e-4e0c-8e90-42a5887dcf19', // pristem
  // '29f3bf61-34d0-4dc0-9e0e-c9b585fe3376', // dopro
  // 'a878d316-f694-4531-8ab1-d7b1a0d30304', // shmuel corp
  // '22f67da6-b130-4333-acdb-a57b0f7d8b4c', // spa and bath
  // 'ce37d963-2146-402b-bf6e-6e3fee045038', // amoroc
  // 'ffbbb4f0-80cf-4e3f-b3ac-8c5a057cb6f9', // accm
  // 'd2ff560c-1c4f-4880-9a16-5a7d82ff1096',
  // '7f92746b-55f5-49d3-b643-c758035a3305',
  // 'cfb71277-1ca9-4a45-84cf-fca6ed50887e',
  // '15f04e42-95f2-40b0-b3b0-a243e15839a5', // active moon
  // 'bcfc23fa-ecdb-48d7-af4e-d1deb4c38040', // AASS
  // 'c3f8c534-76a3-440c-8adc-affeea74a6cf', // Dunair
  // '1c400207-34bd-465b-9e6a-23e40c26cd43', // CCTV
  // 'd7761399-8762-45ec-bda7-138c686f2d79',
  // 'e86a72bc-7d90-42bd-b526-0973dcf9dba4',
  // 'f25cbc72-bfdd-43e0-aee0-1deb3ead12d1', // Twenty4seven Plumbing
  // '7aae35fc-d8a9-43eb-a312-60e56d5d4e1d', // Big mighty Group
  // '2b5ed792-4c3b-4b7b-9ece-f08d9f46cf24', // Digiport (Pty) ltd t/a Integrated home and office
  // '661f0c1d-6d8b-42db-a5b0-9ee621680097', // Relis Systems
  // '14c7d505-8235-48e1-8d6d-c0f526da819e', // Thorburn Security Solutions
  // 'ff4b581c-3ef7-4c2e-9422-d62ba115e5a3', // Prisecure
  // 'd71f3999-ac05-4849-8bf5-30027918ac30', // Overberg Gutters
  // '18cabff8-4148-47d2-bcda-734554f1f4c8', // Sizwe Buhle Security Services
  // '0f360bc2-e94d-4832-b820-2810f5571533', // Nsele Emergency Services
  // '18a8b1e4-17c2-4fe4-aadb-a321fb11a7e8', // Matmay Consulting(Pty)LTD
  // 'bf549564-6014-40c3-a8c0-0a3678fb2fb0', // HMA
  // '5bf9ee19-46dc-4508-a55b-9629add5e122', // Just Displays/JD Concepts
  // '86233cd6-c19d-4d58-81cc-e65527afc584', // Neokor
  // '8f259217-b9b2-4df9-9a74-ce5bc9ca8408', // Super Auto Services
  // 'da1c7f02-0e76-4772-abbf-b2ed41821537', // uMsinga Local Municipality
  // '2c482346-342c-451b-8983-90613be391dc', // Ibusisiwe Electrical PTY(LTD)
  // 'f67c076f-b2d7-466f-b86a-62be9729f540', // The Security Mecca Potchefstroom
  // 'a6314704-7e43-4d34-90ae-9ad4be1270d5', // Secure Tech Solutions
  // 'f395a9d9-fea0-4462-a390-50664406be1f', // GardenRoute communication
  // 'e46353ba-fc81-4773-b074-491b2b94b619', // Ithemba Systems MPU
  // 'e8966e78-5956-46e2-adfe-11b89752af73', // Trendmobility(Pty)Ltd
  // 'ccd2384b-e1e7-4d94-8ebe-628a5ae95b29', // Damn Straight (Pty) Ltd
  // '0b3b81f1-a530-4036-b720-3180a120bf14', // GadgetroniX.Net Limited
  // 'fd3352df-0620-4066-863d-0ec62bb70b2b', // Jovien Communications Pty Ltd
  // '093aa3ac-92cc-4a26-a4d2-567d33240b2d', // Drain Surgeon Krugersdorp
  // '0341fd47-6010-416d-b977-e439efa75dbd', // QC Installation & Repairs
  // '84b96a10-c37a-4c01-b3f9-f6e11237a359', // Represent
  // '893b7d00-2dc5-4fad-929a-432e4eb2aeba', // RB Electrical cc
  // '560f8648-266e-48c0-8768-adfc8d4fbce2', // Eco Renergy Pretoria
  // 'fbcdcd8d-cc99-477b-b3cc-35af2d16302d', // Maatla Africa Electrical Contractors
  // 'f27bba8e-395b-48ad-b628-f5dc63ecf421', // Drain Brain
  // '94edd88c-5e20-44bc-94c3-c5d074e30e7e', // Next Four CC
  // '8f3245c9-e32e-4050-a93d-2736816bcaa2', // Ibayi Pc Sales and repairs
  // '9acdbc9d-9530-40f3-a4c8-d58e3be9b2fa', // Hydrate Irrigation
  // '723a731a-ceac-4423-af47-c4fccd23f550', // 1 Cloud Africa
  // '3a5b5fc2-e12b-48ca-82a3-1daab45e6d1b', // SMR Monitoring and Reaction
  // '9b251247-dc9d-4840-8a8b-1dd687b8247e', // Anco Energy Pty Ltd
  // 'abf5c297-458b-4bba-be61-d5a8a6c1484f', // Volocity Energy Solutions (Pty) Ltd
  // '2f39f00b-5eef-4539-997e-6714de9eae35', // Quantico Security Solutions Pty Ltd
  // '821ff040-79b2-4609-8905-203c225c6c5e', // Bono Urban Projects (Pty) Ltd
  // '328efbd3-cac6-4896-97b2-8883bd7b1c08', // Orange Gear
  // 'cf03d9d5-3e2d-420f-b488-c1849d6d60f6', // BD Smart
  // '42c4192e-8580-47a2-a35a-fc2e1ea82cdc', // CHAKAZY GENERAL SERVICES
  // 'b3519524-7764-44b7-b81e-8250eab73061', // SEALPRO WITBANK
  // '232ae15f-a6aa-4942-b77b-516e115c5223', // Skitterblink Pest Control Montana
  // '4056b604-9baa-4671-af19-315b162ee931', // Ethemba Computers and Consulting
  // '22365bd9-4cae-44e0-89b6-4ed9119dd4a2', // Jotechauto
  // '2465e67d-d9b8-42d2-ac97-88902e800bbe', // Hilo Aluminium
  // '033d50cf-c0b2-4ed0-ad0f-626f709ba5ad', // QBEConnect (Pty) Ltd
  // 'bc735a77-42c4-4600-968e-84b03eb8892e', // Siyakhula Elevators
  // '79149c77-a856-4d13-9bb4-6f4aaf75db66', // Vertice Healthcare
  // '4c8a48e5-2cf8-40eb-99f1-e2d08d96ad4e', // Capital Guarding (Pty) Ltd
  // '93097fcd-0fa0-4964-a2c2-1f3d91b5d3fd', // Truckelec pty ltd
  // 'b883bbb7-ea88-4c66-aa80-0ab676c5e8d2', // Securica CCTV & Security
  // '5bfe394f-7530-4a11-ad90-efb2f162a32b', // Luxus Laser
  // 'd73fdf38-9f99-4201-ae18-4214b620a8b7', // Fitrite services
  // 'f4f63708-0489-4e3a-bae5-0e12f7c60083', // PC TECHIES
  // '25dd4152-ae87-49b1-97a0-6bd9da253f8b', // Wihon 25cc t/a Big 5 Security
  // '24a38870-b475-4b44-a975-9d05b281853d', // Ruby Rapscallion
  // 'a3e63135-7ebf-43c9-9fef-8ceba7e17ee4', // Big Solutions
  // '40e3b8f1-f67d-48ca-bb04-f3139e90502a', // Access Control Solutions Pty Ltd
  // 'a3f12cbd-d083-4237-8795-011b1dc34524', // ROCS
  // 'a7a86fb8-af09-4474-bfae-0208894542e3', // TopMech S.A.
  // '22ad9b56-5f2b-49ab-bde5-0bbbc6b8dad9', // CK Aluminium T/a Smart Aluminium
  // '0b9b2a08-898c-4725-8444-17f9f021dc6e', // J.P. Security
  // '19a45bb7-ed05-4f62-9e6d-f96fe1f5f8b6', // Vision Design and Print
  // '4e30026a-565b-4f48-8a9d-da24497c488a', // KZN Compressor Solutions
  // '853e7984-247a-450f-ae72-75455e46fd6e', // Buitendag Wealth t/a The Drain Surgeon Benoni
  // 'a35f026e-8b84-42f4-adea-6291e934a4e4', // Roman Retail (PTY) Ltd
  // '959b1feb-e333-4f78-9b60-2e1641d2cb78', // Shomrim
  // 'ae2c5988-e7ca-44bc-a694-7ba2c53a5e7c', // Life safety Trading
  // '12c783ce-5c50-4b2d-815f-e29a8727745d', // Greenlink Trade
  // '90597bf2-a611-4acd-93b7-ad8036a40cb2', // 4C Technology (Pty) Ltd
  // 'f920b64f-cf5a-454a-9fe7-d5a793c2ae55', // AWTOH TECH
  // '503d05be-2e13-4d8a-9f83-c3c27208ac30', // Skylite trading 62cc
  // 'fb1d8477-40e3-4389-a25c-b4ae2f7fe9b3', // Powersports Group (Pty) Ltd
  // '66d30a5f-d316-4527-b1a1-6d574c7d81f1', // BB Vision Auto Repair
  // 'cf1a3b5e-9ed5-48ce-b5c1-2f1fa48f314d', // PCSRUS Computers
  // '3c67481e-6fcb-4119-9be3-d29c9370e26b', // Swift Fuel Management
  // '43819cf2-a224-4ce9-8f8c-494883d6155c', // TOG Door and Glass Fittings
  // 'de892d0c-2340-469c-a5ad-abcbacecec0e', // Track Cam Africa
  // '3f22d61c-7319-4218-a253-1159f60b362e', // CWA(KZN) (Pty) Ltd
  // '9912c90f-b886-44cd-87f8-28b080e8278d', // New life church
  // 'e613be83-eb83-4a5e-9f86-7e197d41f2fc', // Maak Dit Reg
  // 'c6eee5ff-459c-4f24-8c17-ab8cda6c00ac', // A & B Gearbox and Diff
  // '80b6b940-eece-4661-8292-c278c1f1f3d9', // Pool Avenue
  // '10e0b322-8d16-4fa4-8de9-35ad10c03019', // Alpha Energy
  // 'd6fb9d67-c43a-4cd4-b5a3-31b41b657835', // Sync Systems
  // 'c108c7df-fd9d-49bf-90cd-9ef382474271', // Blue Glacier Consulting (Pty) Ltd
  // '83e811ef-e383-463b-892e-bd5f9eff7d55', // Homesec PTY LTD
  // 'afb31d5b-1811-4bc5-b86a-36dcb3382a30', // Vector Logistics
  // '8189e1c3-a4c7-4fe7-a9cf-e9b421e1f13b', // Chemrotech
  // 'c96e0ac7-6774-4b70-b2f0-474e0d1c7b57', // Procelex (PTY) LTD
  // '6e5a7163-e940-4c6f-98d2-9e5692bdde32', // RAG Security
  // 'a6ec216f-c29f-4c37-b87c-ee8ca42f8c25', // Critical cooling solutions
  // 'ab11e601-6050-43f2-9744-aedc5de27fd6', // Inject-a-seal
  // 'd6c5cbfa-e483-422e-959c-abe3fe1f8ac9', // PIM Machine Tools
  // '41fce42f-e14d-494d-b364-5a5693ef13ee', // Mooirivier Tegnies
  // '48218f9d-aebf-43bf-aa60-7621406e7732', // The Finishing Contractor
  // '09647bf5-3ed2-4643-be22-118004b16a52', // JAMNIX Solutions (Pty) Ltd
  // 'e302fa64-5543-4e01-970b-6cabfb530fd7', // Westsmith Electrical
  // '1a4efcec-b20e-4762-93fa-9a09fab5562a', // Fujifilm South Africa
  // '4c3a162c-32c8-4f59-bab0-a4d49e7822c6', // In A Nutshell
  // 'd3a1bff1-56f3-4cf6-8215-865825892e9e', // Transvaal Hydraulics
  // 'cd87a5ed-0e1d-442b-8248-5360d4470c61', // GRAF TECHNICAL AIR
  // '463a7322-2e1d-457c-9921-b2495d34f6f0', // Kabod Technical Services
  // 'd41ebc47-bf6e-4899-9f05-735eebaede97', // Cleanwell
  // '36718898-1d49-42e9-968a-18c14098dff5', // Integr8
  // 'd2ff560c-1c4f-4880-9a16-5a7d82ff1096', // Simply Secure SA
  // '10ed7f8c-0a11-443b-bfe3-66839566e8d7', // Blacklight Group
  // '75b563d7-971d-4cc8-9dfb-36692bf12473', // Logical Auto Solutions
  // '517814fd-610a-44ba-99b5-7fc5592f8e4b', // Skyline Project Solutions
  // 'aa369758-b318-485f-b94f-696214b15766', // Chipkins Puratos
  // '7b0df79f-7ac8-43d4-8f28-01341bc222a2', // North Co Connections
  // '3c81bef0-6d69-4ab3-abd6-c3487cbd575d', // Next Level Energy PTY LTD
  // '225841f7-3972-4267-bf6f-05e71e9193d7', // Qualisec security cc
  // '89ca7230-0931-4f16-b653-112f4a5e9a66', // Frontline Terminators
  // '37e0696a-e3b1-4f48-995a-aafa7c0bbdb2', // Robertson Asset Protection Services
  // 'a3284d20-c4c2-4c16-b47f-6d9592b6b054', // Unifyd
  // '736b4ba8-3ffc-4e84-84fb-912e7307deed', // Neo Technologies
  // '2e47b677-56c7-4a7b-9a71-a14af2accbf6', // Sekuriteit Sonder Grense
  // '56bafc98-6ebd-49b2-84a1-14d7b279c636', // Energey (Pty) Ltd
  // '87afdcb8-b385-4cea-9473-e4390caa9dc8', // Online integration and cinema
  // '59f525ae-8043-4f38-94bf-aa7f4712dec7', // Sentry Tec
  // '29f3bf61-34d0-4dc0-9e0e-c9b585fe3376', // DoPro Healthcare
  // '543965a3-3e2a-4e84-9f20-dc0e418cf204', // MRM Electrical
  // '4edfe47f-a089-4fca-9acb-0481d208909b', // Khubez Communications
  // '4fa82e20-c391-4acf-832f-3ccbf6539af5', // BGC WATER DRILLING AND TESTING PTY LTD
  // '2d3deb8e-664d-4c10-a128-bb74fe41f3f3', // The Gas Men
  // '5df86d70-33ad-450e-84de-03799f2ae93b', // Nastro Air Systems
  // 'a3ff02b7-1fbb-438d-9642-dc6c817ac9b9', // JWE
  // '6faaa531-c0fa-4f79-acc2-ecbac3c8cc5a', // Audio Visual Supreme
  // '33246c4d-b739-4494-ba98-68050c0701f7', // MC Interactive Computers
  // '31313c29-5155-40dd-8bde-7b649b4865f6', // GW Store Renewables
  // 'a1e58b73-8edd-40a7-a1de-1435c08f2008', // HVAC Maintenance
  // '860c49c7-e46b-4611-a750-993b8f9e8324', // Solar360
  // '87cbd669-aeae-402c-a3d5-937eb597afe7', // Gumbatechnology (Pty) Ltd
  // 'e0854314-7a26-4a9a-a095-8f5ebdbeb473', // BLACK POINT TECH CC
  // 'f3cf35f2-eac5-49c2-8758-a68c72bd0eb7', // Humor Diagnostica
  // '80d1054b-a04c-4ebe-a55e-6e8413df20e4', // Kidd and Thompson
  // '1b143c91-1b9d-4ffc-bbba-2cee44fd232c', // Anchorsure cleaning group
  // '2b01630c-3a67-4c96-91e6-9090131b5452', // Connectnology (Pty) Ltd
  // 'cbb07852-6d31-4b13-9c23-4541d0953822', // POWERCUBE GENERATORS
  // '287f2b65-33f9-4010-9735-89df80b91dcf', // G85 Mr Fixit
  // 'e0de85bc-2aa3-4c2d-a7aa-55693fa94e8f', // Ardelis ENG
  // '2e37fae6-c32a-45a7-8c1d-8ea4624d0956', // SAVANNAH AIRCRAFT
  // 'f39c2d3a-7bf9-43a1-ac39-26eb5ecc100c', // LWAYO COMMUNICATION
  // 'b0dd8d84-874c-4fc8-a82e-d0882242b577', // Trojan Security
  // 'a6d86add-fe24-4b38-92a1-99c22a12daf1', // Tappans Elektrical
  // 'c40a2394-58f9-4bed-b4ff-ff39afa7a59e', // ARMAGUARD
  // '42d24109-8f35-4360-adac-58f28d06e8f1',
]

const blockSubscriptionMessageDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const mixPanelEvents = {
  navigate: "navigate",
  slideshowCardClicked: "slideshowCardClicked",
  checklist: "checklist",
  downloadAppLinkClicked: "downloadAppLinkClicked",
  learningCenterLinkClicked: "learningCenterLinkClicked",
  createInventory: "create-inventory",
  editInventory: "edit-inventory",
  createContact: "create-contact",
  editContact: "edit-contact",
  login: "login",
  createCustomer: "create-customer",
  createJob: "create-job",
  createQuote: "create-quote",
  createInvoice: "create-invoice",
  createEmployee: "create-employee",
  createImport: "create-import",
  createIntegration: "create-integration",
  editQuote: "edit-quote",
  editInvoice: "edit-invoice",
  editCompany: "edit-company",
  jobEmployeeAssigned: "job-employee-assigned",
  widgetJobSummaryCreateClicked: "widget-job-summary-create-clicked",
  widgetQuoteSummaryCreateClicked: "widget-quote-summary-create-clicked",
  widgetInvoiceSummaryCreateClicked: "widget-invoice-summary-create-clicked",
  referAFriendButtonClicked: "refer-a-friend-button-clicked",
  createBundle: "create-bundle",
  editBundle: "edit-bundle",
  createInventoryCategory: "create-inventory-category",
  editInventoryCategory: "edit-inventory-category",
  createInventorySubcategory: "create-inventory-subcategory",
  editInventorySubcategory: "edit-inventory-subcategory",
  createJobType: "create-jobtype",
  editJobType: "edit-jobtype",
  createWorkflow: "create-workflow",
  editWorkflow: "edit-workflow",
  createLocation: "create-location",
  editLocation: "edit-location",
  createFormDefinition: "create-form-definition",
  editFormDefinition: "edit-form-definition",
  onlinePaymentButtonClick: "onlinePaymentButtonClick",
  createJobSchedule: "create-job-schedule",
  manageAppointment: "manage-appointment",
  createPurchaseOrder: "create-purchase-order",
  editPurchaseOrder: "edit-purchase-order",
  dashboardWidgetDismissed: "dashboardWidgetDismissed",
  createSupplier: "create-supplier",
  editSupplier: "edit-supplier",
  createTaskTemplate: "create-task-template",
  editTaskTemplate: "edit-task-template",
  resetPassword: "reset-password",
  createProduct: "create-product",
  createCommunication: "create-communication",
  createProject: "create-project",
  createQuery: "create-query",
  createJobStatus: "create-job-status",
  createRole: "create-role",
  createOption: "create-option",
  createStore: "create-store",
  settleSubscription: "settle-subscription",
  createSubscription: "create-subscription",
  buyCredits: "buy-credits",
  saveFormDefinitionAsDraft: "save-form-definition-draft",
  confirmFormDefinition: "confirm-form-definition",
  widgetWhatsNewClicked: "widget-whats-new-clicked",
  widgetYoureInWatchOverviewClicked: "widget-youre-in-watch-overview-clicked",
  widgetYoureInCreateFirstJob: "widget-youre-in-create-first-job",
  widgetCreateItemClicked: "widget-create-item-clicked",
  createPayment: "create-payment",
  sidebarNavigate: "sidebar-navigation"
};

const mixpanelSettings = {
  mixPanelToken: "74dd79a8da631678227ddf6b376f0e94",
  mixPanelTokenDev: "141988f909b4bc16ae95cdc7481eeef3",
  permitAll: true,
  ignoreAll: false,
  permitEvents: [
    mixPanelEvents.slideshowCardClicked,
    mixPanelEvents.checklist,
    mixPanelEvents.downloadAppLinkClicked,
    mixPanelEvents.learningCenterLinkClicked,
    mixPanelEvents.createInventory,
    mixPanelEvents.createContact,
    mixPanelEvents.login,
    mixPanelEvents.createCustomer,
    mixPanelEvents.createJob,
    mixPanelEvents.createQuote,
    mixPanelEvents.createInvoice,
    mixPanelEvents.createEmployee,
    mixPanelEvents.createImport,
    mixPanelEvents.createIntegration,
    mixPanelEvents.editQuote,
    mixPanelEvents.editInvoice,
    mixPanelEvents.editCompany,
    mixPanelEvents.jobEmployeeAssigned,
    mixPanelEvents.widgetJobSummaryCreateClicked,
    mixPanelEvents.widgetQuoteSummaryCreateClicked,
    mixPanelEvents.widgetInvoiceSummaryCreateClicked,
    mixPanelEvents.referAFriendButtonClicked,
    mixPanelEvents.saveFormDefinitionAsDraft,
    mixPanelEvents.confirmFormDefinition,
    mixPanelEvents.widgetWhatsNewClicked,
    mixPanelEvents.widgetYoureInWatchOverviewClicked,
    mixPanelEvents.createPayment,
    mixPanelEvents.widgetCreateItemClicked,
    mixPanelEvents.sidebarNavigate,
  ],
  ignoreEvents: []
};

const appStrings = {
  TriggerRuleJobStatusChange: "Job Status Change",
  TriggerRuleQuoteStatusChange: "Quote Status Change",
  TriggerRuleJobSLATimeElapsed: "Job SLA Time Elapsed",
  TriggerRuleQueryStatusChange: "Query Status Change",
  TriggerRuleJobEmployeeAllocated: "Job Employee Allocated",
  TriggerRuleJobEmployeeUnallocated: "Job Employee Unallocated",
  TriggerRuleQueryEmployeeAllocated: "Query Employee Allocated",
  TriggerRuleQuoteReminder: "Quote Reminder",
  TriggerRuleInvoiceStatusChange: "Invoice Status Change",
  TriggerRuleInvoiceReminder: "Invoice Reminder",
  TriggerRulePurchaseOrderStatusChange: "Purchase Order Status Change",
  TriggerRuleCustomerZoneMessage: "Customer Zone Message",
  TriggerRuleJobBackendStatusReminder: "Job Status Reminder",
  TriggerActionJobCardAttach: "JobCardAttach",
  TriggerActionWorkshopAttach: "WorkshopAttach",
  TriggerActionSignedOffAttach: "SignedOffAttach",
  TriggerActionJobSheetAttach: "JobSheetAttach",
  TriggerActionQuoteAttach: "QuoteAttach",
  TriggerActionSLAStartDateTime: "SLAStartDateTime",
  TriggerActionSLAEndDateTime: "SLAEndDateTime",
  TriggerActionInvoiceAttach: "InvoiceAttach",
  TriggerActionPurchaseOrderAttach: "PurchaseOrderAttach"
};

const messageBarMargin = 48;
const chatWidgetSafeArea = 80;

const messageBarStrings = {
  TrialExpiring: "Your ServCraft trial is almost over. Now is a good time to upgrade to enjoy the benefits.",
  AccountOverdue: `Your ServCraft account is overdue. Please settle your account in the Subscription page.`,
  AccountLockedNoPermission: "Your ServCraft account has been locked. Please contact your Administrator to renew your access.",
  TrialExpired: "Your ServCraft trial has expired. Visit the Subsription page to resubscribe.",
  AccountLockedPermission: "Your ServCraft account has been locked due to an overdue account.",
  NoAccessNoPermission: "You no longer have access to ServCraft. Please contact your Administrator to renew your membership.",
};

const templateIDs = {
  TemplateCustomerZone: 'a17b008d-ca09-47c0-9060-7bbee772ea8d',
  TemplateJobRating: '6d72b050-9cdf-4158-9074-e1acd07d7997', // temp
};

const clarityIDDev = "vlulfigt67";
const clarityID = "vjsi1iyafb";

const base64BitScalingFactor = 0.75;

const optionKeys = {
  PurchaseOrderOrderNow: "PurchaseOrder Order Now",
  LegacyDocuments: "Legacy Documents",
  JobCardPreferenceClosedMarksMaterialsAsUsed: "Manually closing a job will mark materials as used",
};

const maximumDisplayImages = 5;
const maximumAttachments = 10;
const minimumSessionTimeoutMinutes = 5;

const reloadVersionDebouncePeriodMS = 120000;

const maxFormWidth = "1140px";

const managerRefreshAPIIntervalMS = 900_000;
const permissionsRefreshIntervalMS = 900_000;
const debounceSearchPeriod = 500;

const signatureKeys = {
  FormSignature: "FormSign"
};

const features = {
  INVENTORY_SECTION_BUNDLE: "INVENTORY_SECTION_BUNDLE",
  STOCK_CONTROL: "STOCK_CONTROL",
  ASSET_LABEL_PRINTING: "ASSET_LABEL_PRINTING",
  COMMS_V2: "COMMS_V2",
  PO_GRV: "PO_GRV",
  CUSTOMER_CACHE_SEARCH: "CUSTOMER_CACHE_SEARCH",
  STOCK_TAKE: "STOCK_TAKE",
  VAN_STOCK: "VAN_STOCK",
  SCHEDULER_KENDO: "SCHEDULER_KENDO",
};
// Public routes that should be accessible without authentication
const PUBLIC_ROUTES_EXACT = new Set([
    '/login',
    '/reset-password',
    '/activate',
    '/debit-order',
    '/settings/subscription/peach',
]);

// Prefix-based public routes (entire sections available without auth)
const PUBLIC_ROUTE_PREFIXES = [
    '/webform', 
    '/customerzone', 
    '/tenantzone'
];

export default {
  appVersion,
  blockSubscriptionMessageDuration,
  mixpanelSettings,
  appStrings,
  templateIDs,
  clarityIDDev,
  clarityID,
  messageBarStrings,
  messageBarMargin,
  chatWidgetSafeArea,
  base64BitScalingFactor,
  optionKeys,
  maximumAttachments,
  minimumSessionTimeoutMinutes,
  mixPanelEvents,
  reloadVersionDebouncePeriodMS,
  maxFormWidth,
  managerRefreshAPIIntervalMS,
  permissionsRefreshIntervalMS,
  debounceSearchPeriod,
  whiteListedNewFeatureTenants,
  devTenants,
  defaultQuoteDepositPercentage,
  signatureKeys,
  features,
  maximumDisplayImages,
  PUBLIC_ROUTE_PREFIXES,
  PUBLIC_ROUTES_EXACT
};