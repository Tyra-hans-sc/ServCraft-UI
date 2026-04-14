import * as Enums from './enums';
import PS from '../services/permission/permission-service';
import OS from '../services/option/option-service';
import constants from './constants';
import storage from './storage';

function permitLegacyDoc_Temp() {
  let tenantID = storage.getCookie(Enums.Cookie.tenantID);
  if (tenantID) {
    tenantID = tenantID.toLowerCase();
    return [
      '2DCE8A8C-59D0-46B9-9132-30BAAD32A6F3', //  PHILCO TESTING

      "0AD0F035-044B-4B8D-951D-92054FC12040", // ADR Engineering(PTY)Ltd
      "33D3B816-5E35-4F53-9346-A6DCA03AC657", // African Technopreneurs Pty Ltd
      "01A72C01-14A3-48A0-8FD9-C336192E3EBD", // ALPro PC Software Solutions
      "49BE95A2-2F15-414D-853F-27E6475D6BE8", // ALTO DOORS
      "ED23019D-FFF0-4839-8119-51476475253B", // Amcamino (PTY) LTD
      "C5ECF050-6FB6-422C-8C58-5274EF5BF31D", // Applewood Trading 86 (pty) Ltd
      "DD16CCAC-AC5C-4AD0-80FA-72C3511ECA3C", // ARMOURIT AFRICA (PTY) LTD
      "6FAAA531-C0FA-4F79-ACC2-ECBAC3C8CC5A", // Audio Visual Supreme
      "E508CDC6-E46C-4888-80AF-33901F00B76B", // Audiotech SA t/a Solved Technology Hub
      "C46E24E4-091F-4DBE-AB10-C599AD04DCCA", // Avoca Trading
      "1CD010EA-1D10-44AF-889C-012948135903", // AWX Projects (Pty) Ltd
      "66D30A5F-D316-4527-B1A1-6D574C7D81F1", // BB Vision Auto Repair
      "4FA82E20-C391-4ACF-832F-3CCBF6539AF5", // BGC WATER DRILLING AND TESTING PTY LTD
      "6F16FF18-54D8-49BE-BAD2-07915F72EF25", // Braamfontein Service Centre (Pty) Ltd.
      "4245C42B-8071-41B7-BA46-05462671C5BF", // BRS Electrical
      "40C0DEC2-528B-46E8-98AA-3A091E185D25", // Cape Transmissions
      "BCDA8A23-CA29-438E-87CF-DE95E9E4F10A", // Comfort Technologies PTY Ltd
      "1B75CA67-B5D5-47CE-A482-22F398018D4E", // Cynergi Landscaping and Gardening
      "9A5D6466-BF1C-47C0-9BD4-44A2047DA98E", // Datavision
      "863BB109-4117-43B5-96B6-CB2DAA34C5B1", // Disrupt Media
      "20B8E7C7-1CB4-49C1-BB08-11080FD7D886", // DroneTech co
      "7436D850-74EB-4C12-A14A-C6F455DAB9FD", // DW PC Corporation
      "CCCA2DBA-4265-40A3-A14C-19E9BD537E08", // ECC TECHNOLOGIES
      "618D2F64-8E35-4C0F-8601-C2696C77520D", // Evo Motors
      "37D6B574-3267-4089-9EAE-77B606184DD1", // Fedile Projects
      "287A1D0C-77AE-4618-9455-5D1DB95D869E", // Forensic Tools (Pty) Ltd
      "ABD29AAA-4B7F-4FCB-A402-2024D98BB349", // FRONTIER POWER PRODUCTS
      "37F6FE3E-5B0A-4659-B609-0FC4EC1FBBDD", // Full Circle Group
      "F395A9D9-FEA0-4462-A390-50664406BE1F", // GardenRoute communication
      "DF6E3E69-991F-4CCD-8394-978D555F5FD8", // Gibson Field Services
      "5CAB20C4-F2D8-4421-94F8-855329142CBE", // Gillies Technical and Consulting Services (Pty) Ltd
      "16BDD45A-F3E0-4BE5-80CF-21BD0F68EF85", // Glamour By Zahra
      "4B129D08-C615-4D08-9171-642972FC42FE", // Hendri van Greunen
      "F0A16BDD-035D-41F7-97AE-93BE9BA88CE2", // Illumico Security Consultants (Pty) Ltd
      "2B5ED792-4C3B-4B7B-9ECE-F08D9F46CF24", // Integrated home and office
      "B588569D-3A9C-4C6A-A836-AD5483941FED", // Internal Stock Loss Investigators and Security Services T/A SENFORCE SECURITY
      "9D95CDEB-E4B4-431E-AF98-4988637F8F45", // Jaco’s Handy Hands
      "9D52704F-02CE-4873-B929-ADE4DC80B146", // JDElliott
      "52BF1126-B0C7-4213-AFE8-87C7D4AB137A", // JONSEL PROJECTS t/a L.M. AIR SOLUTIONS
      "20DB9908-F51D-4803-8D30-97C7A39B18E1", // Kamba Communications
      "34D75A4E-3D55-429C-9B8A-04B02E7104AD", // Let it Accommodation
      "C6263E0A-AD18-49D5-AC90-0F756B24F94A", // MAC MAG PROJECTS
      "30AEC966-CE9F-428E-B1B7-8EE291CA10A7", // MC Roofing Solutions / Jet Pressure Cleaning Solutions
      "4A7FE7C2-EEAE-40B1-9B84-2EB68528DB04", // Metcalf Sahd IT (PTY) LTD
      "28296BA9-668C-48E1-AC44-98071FE208C1", // Mobilemacs
      "2AE0656B-70E9-4D1F-8F74-66F612E8189A", // Mogwele trading 89
      "7BEA27A3-2C4B-4796-8912-8BC7040FB12F", // Nelé Service Centre (Pty) LTD
      "94EDD88C-5E20-44BC-94C3-C5D074E30E7E", // Next Four CC
      "7E7B515F-F4B6-4393-AC2D-79BF734C3CB1", // NPE Medical
      "0F360BC2-E94D-4832-B820-2810F5571533", // Nsele Emergency Services
      "52340358-8B4B-461F-A18A-88D8C8ADC90E", // ODM HOLDINGS (PTY) LTD
      "F2FA8EAE-6AA4-47CE-8103-7A6E384E8A33", // Okhahlamba LM IT DEPARTMENT
      "87AFDCB8-B385-4CEA-9473-E4390CAA9DC8", // Online Integration & Cinema (Pty)Ltd
      "FEC73498-A3B6-46AB-9A17-E060323C57BF", // Open V Business Solutions
      "57F00AA3-803D-4739-B630-5A1BFE8FD05D", // Orange Renewables Company Pty Ltd.
      "B1CCBA91-F507-4352-88D7-A3991AB65288", // Orange Solar Technologies
      "CF1A3B5E-9ED5-48CE-B5C1-2F1FA48F314D", // PCSRUS Computers
      "5DE4EC31-8023-444C-9268-49402E539806", // Petrocon Swaziland
      "D6C5CBFA-E483-422E-959C-ABE3FE1F8AC9", // PIM Machine Tools
      "86C1D4DD-6418-458A-B18B-E11105173CE4", // Plastic Conversion Equipment SA (Pty) Ltd
      "65332011-CF9F-415E-9FE1-E6C33008B46F", // Pontus Electronics
      "74D180AF-D216-4F87-AC71-F8433EB33D87", // Premier View
      "3D447A1E-AB16-4FF1-920D-1BF2BDE008C0", // PWV Security
      "3038EF39-038E-4EC7-98F3-CF49D0661A0F", // Q SHOP PTA (Pty) Ltd
      "62849856-A7F5-4C97-852D-20750DEB77F5", // Qey Secure
      "59016C79-4C81-4871-8355-D4867B553559", // Red Networks
      "785F4216-9C3A-45BB-8345-FDE11A80670A", // Roadside Boyz
      "2E37FAE6-C32A-45A7-8C1D-8EA4624D0956", // SAVANNAH AIRCRAFT
      "B97BCF52-B5B8-4058-942C-2F6B72D13195", // Shap Plumbing
      "06FF574D-60A9-4C7C-AF67-B945387B6D58", // Smart Home 21
      "62597C98-18A5-4CD7-935B-A341A4948678", // Stallion Security
      "CC7818F4-0754-469B-B1A5-F3B4D1B63AE3", // Stanport Enterprise (PTY) LTD
      "360DF688-9852-4CF9-B97C-F49EA0396AEC", // Tareo
      "78EDB092-36B1-4517-A676-69349F561B54", // TECHNOCURE CENTER CC
      "093AA3AC-92CC-4A26-A4D2-567D33240B2D", // The DrainSurgeon Krugersdorp
      "7C6B0A70-0CF6-4937-8FB3-FD3F8A1FCA97", // The Fixpert
      "2D3DEB8E-664D-4C10-A128-BB74FE41F3F3", // The Gas Men / Prime Appliances
      "F52BBC38-7C74-4130-B993-A1FE39F36FD0", // The Go Group Foundation NPC
      "703BBC03-EA7C-473A-A560-BA25A13B1D6B", // The Pool Team
      "CE8A51E4-3438-4B8C-B406-A3E9D8C57D66", // Theratype CC
      "8BB0AA09-3057-491E-9C7F-C32DF419E02F", // TLM Corporation
      "DA1C7F02-0E76-4772-ABBF-B2ED41821537", // uMsinga LM IT DEPARTMENT
      "006C057C-7B1C-4B9A-A1D3-67D61C412517", // Vetus Schola
      "D01CE3E9-F005-4DB9-BBF7-DFF3036CBC67", // West Coast Garage Doors and Automation
      "155B6963-B6AE-4A68-B4DB-D6B6F316C3AD", // Winelands Compressors cc
      "559A557A-AC7E-48FD-A02F-540F8D4B245A", // Xecutronix
    ].map(x => x.toLowerCase()).includes(tenantID);
  }
  return false;
}

const updateMessageBar = async (subscriptionInfo, messageBarContext) => {
  const customerStatus = subscriptionInfo.CustomerStatus;
  const accessStatus = subscriptionInfo.AccessStatus;
  const message = PS.hasPermission(Enums.PermissionName.Owner) ? subscriptionInfo.MessageOwner : subscriptionInfo.MessageNonOwner;
  let legacyDocMessage = "";

  let legacyDocValue = window.localStorage.getItem(Enums.LocalStorage.LegacyDocumentValue);
  if (!legacyDocValue) {
    legacyDocValue = await OS.getOptionValue(constants.optionKeys.LegacyDocuments);
    // Ensure value is stored as string in localStorage
    window.localStorage.setItem(Enums.LocalStorage.LegacyDocumentValue, String(legacyDocValue));
  }

  // Convert to string and lowercase for comparison (handles both string and boolean values)
  const legacyDocString = String(legacyDocValue || '').toLowerCase();
  if (legacyDocString === "true" && permitLegacyDoc_Temp()) {
    legacyDocMessage = "Urgent Attention Required: Starting from May 8th, 2023, your jobcards, quotes, invoices, and PO PDF legacy documents will be automatically be upgraded to our new documents with the default settings. Chat to your system administrator to upgrade now to ensure that you have full control over your PDFs.";
    if (PS.hasPermission([Enums.PermissionName.Owner, Enums.PermissionName.MasterOfficeAdmin])) {
      legacyDocMessage = "Urgent Attention Required: Starting from May 8th, 2023, your jobcards, quotes, invoices, and PO PDF legacy documents will be automatically be upgraded to our new documents with the default settings. It is highly recommended that you upgrade now to ensure that you have full control over your PDFs.[Document:Upgrade]"
    }
  }

  let setActiveMessage = false;

  if(message) {
    if (customerStatus === Enums.getEnumStringValue(Enums.CustomerStatus, Enums.CustomerStatus.SignUp)
        || customerStatus === Enums.getEnumStringValue(Enums.CustomerStatus, Enums.CustomerStatus.Trial)) {
      if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      } else {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Warning);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      }
    } else if (customerStatus === Enums.getEnumStringValue(Enums.CustomerStatus, Enums.CustomerStatus.Live)) {
      if (accessStatus === Enums.AccessStatus.LockedWithOutAccess || accessStatus === Enums.AccessStatus.LiveAndOwing) {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      }
    } else if (customerStatus === Enums.getEnumStringValue(Enums.CustomerStatus, Enums.CustomerStatus.Cancelled)) {
      if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      } else if (accessStatus === Enums.AccessStatus.Live) {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Warning);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      }
    } else {
      if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
        messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
        messageBarContext.setMessage(message);
        setActiveMessage = true;
      }
    }

    // legacy doc start
    if (legacyDocMessage && !setActiveMessage) {
      messageBarContext.setIsActive(true);
      messageBarContext.setMessageBarType(Enums.MessageBarType.Warning);
      messageBarContext.setMessage(legacyDocMessage);
      setActiveMessage = true;
    }
    // legacy doc end
  }

  if (!setActiveMessage) {
    messageBarContext.setIsActive(false);
    messageBarContext.setMessageBarType(Enums.MessageBarType.Warning);
    messageBarContext.setMessage('');
  }

  // messageBarContext.setIsActive(true);
  // messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
  // messageBarContext.setMessage("Your ServCraft trial has expired. Visit the Subscription page to resubscribe. [Subscription:Subscribe Now]");
}

export default {
  updateMessageBar
};
