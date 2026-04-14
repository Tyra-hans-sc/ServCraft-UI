// Readonly mappings for industry-based defaults used in Job Card Wizard
// Keep this module free of React imports. Export plain constants only.

export type MaterialPresetItem = {
  key: string;
  tempId: string;
  description: string;
  quantity: number;
  isNew: true;
};

// Hardcoded tenant industry for now (until tenant profile is wired up)
export const DEFAULT_SELECTED_INDUSTRY = 'Security & Automation' as const;

// Default step 1 description per industry
export const INDUSTRY_DEFAULT_DESCRIPTION: Record<string, string> = {
  'Security & Automation': 'Install and configure alarm system with motion sensors and door contacts.',
  'Audio Visual': 'Mount TV and configure AV receiver with surround speakers.',
  'Engineering': 'Site assessment and commissioning of mechanical assembly.',
  'Property Management': 'Routine inspection and minor maintenance on common areas.',
  'Printing & Signage': 'Design, print, and install exterior signage.',
  'General Contractor': 'On-site assessment and general building works.',
  'Property Maintenance': 'Scheduled maintenance visit and punch list completion.',
  'Telecommunications': 'Install network cabling and terminate patch panel.',
  'Automotive': 'Diagnose and repair reported vehicle electrical issue.',
  'IT & Cellular Services': 'Set up workstation and configure network access.',
  'Medical': 'Service and calibrate clinical equipment as requested.',
  'Electrical': 'Install new distribution board and circuit breakers.',
  'HVAC & Refrigeration': 'Install split-unit air conditioner and commission.',
  'Plumbing': 'Replace faulty geyser valves and repair leaks.',
  'Appliance Repair': 'Diagnose and repair household appliance fault.',
  'Other': 'Perform requested works as per client brief.',
  'Health & Beauty': 'Install salon equipment and verify electrical safety.',
  'Maintenance': 'General maintenance tasks as per request.',
  'Agriculture': 'Install irrigation controller and test zones.',
  'Aluminum & Glass': 'Measure, fabricate and install aluminum sliding doors.',
  'Carpentry': 'Build and install custom cabinetry.',
  'Cleaning': 'Deep clean per requested service areas.',
  'Fire': 'Install fire detection devices and test system.',
  'Gas & Air': 'Install gas line and perform leak tests.',
  'Retail': 'Install point-of-sale counter and shelving.',
  'Solar & Energy': 'Install PV panels and connect inverter system.',
  'Utilities & Water Management': 'Service pumps and test water meters.',
  'Pool': 'Service pool pump and balance water chemistry.',
};

// Default materials/services for step 2 per industry (non-existing, local-only structure)
export const INDUSTRY_DEFAULT_MATERIALS: Record<string, MaterialPresetItem[]> = {
  'Security & Automation': [
    { key: 'tmp_sec_ctrl_panel', tempId: 'tmp_sec_ctrl_panel', description: 'Alarm control panel', quantity: 1, isNew: true },
    { key: 'tmp_sec_pir', tempId: 'tmp_sec_pir', description: 'PIR motion sensor', quantity: 3, isNew: true },
    { key: 'tmp_sec_contact', tempId: 'tmp_sec_contact', description: 'Magnetic door contact', quantity: 2, isNew: true },
    { key: 'tmp_sec_batt', tempId: 'tmp_sec_batt', description: '12V 7Ah backup battery', quantity: 1, isNew: true },
    { key: 'tmp_sec_labour', tempId: 'tmp_sec_labour', description: 'Labour – installation and commissioning', quantity: 1, isNew: true },
  ],
  'Electrical': [
    { key: 'tmp_el_db', tempId: 'tmp_el_db', description: 'Mini DB board with breakers', quantity: 1, isNew: true },
    { key: 'tmp_el_wire', tempId: 'tmp_el_wire', description: 'Twin & earth cable (per meter)', quantity: 15, isNew: true },
    { key: 'tmp_el_labour', tempId: 'tmp_el_labour', description: 'Labour – electrical install', quantity: 1, isNew: true },
  ],
  'Plumbing': [
    { key: 'tmp_pl_valve', tempId: 'tmp_pl_valve', description: 'Geyser pressure relief valve', quantity: 1, isNew: true },
    { key: 'tmp_pl_ptape', tempId: 'tmp_pl_ptape', description: 'PTFE tape', quantity: 1, isNew: true },
    { key: 'tmp_pl_labour', tempId: 'tmp_pl_labour', description: 'Labour – plumbing repair', quantity: 1, isNew: true },
  ],
  'HVAC & Refrigeration': [
    { key: 'tmp_hvac_unit', tempId: 'tmp_hvac_unit', description: '12k BTU split unit (supply only)', quantity: 1, isNew: true },
    { key: 'tmp_hvac_brackets', tempId: 'tmp_hvac_brackets', description: 'Outdoor brackets and fixings', quantity: 1, isNew: true },
    { key: 'tmp_hvac_labour', tempId: 'tmp_hvac_labour', description: 'Labour – install and commission', quantity: 1, isNew: true },
  ],
  'Solar & Energy': [
    { key: 'tmp_solar_panel', tempId: 'tmp_solar_panel', description: 'PV panel 550W', quantity: 2, isNew: true },
    { key: 'tmp_solar_inverter', tempId: 'tmp_solar_inverter', description: 'Inverter 5kW', quantity: 1, isNew: true },
    { key: 'tmp_solar_cable', tempId: 'tmp_solar_cable', description: 'Solar cable (per meter)', quantity: 20, isNew: true },
  ],
};

export const getIndustryDefaultDescription = (industry?: string) => {
  // const key = industry && INDUSTRY_DEFAULT_DESCRIPTION[industry] ? industry : DEFAULT_SELECTED_INDUSTRY;
  // return INDUSTRY_DEFAULT_DESCRIPTION[key] || 'Describe the work to be done';
  return '';
};

export const getIndustryDefaultMaterials = (industry?: string) => {
  // const key = industry && INDUSTRY_DEFAULT_MATERIALS[industry] ? industry : DEFAULT_SELECTED_INDUSTRY;
  // return INDUSTRY_DEFAULT_MATERIALS[key] || [];
  return [];
};
