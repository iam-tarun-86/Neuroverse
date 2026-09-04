// Curated Mock Indian Standards (BIS) Dataset for Procurement Matching
export const MOCK_STANDARDS_BY_SECTOR = {
  Electrical: [
    {
      standard_id: 'IS 1554 (Part 1): 1988',
      title: 'PVC Insulated (Heavy Duty) Electric Cables — Part 1: For Working Voltages Up to and Including 1100 V',
      confidence: 96,
      status: 'Active',
      explanation: 'Directly matches procurement criteria: heavy-duty PVC insulation, multi-core copper conductor, and 1.1kV rated outdoor power distribution. Mandatory BIS certification under Quality Control Order (QCO).'
    },
    {
      standard_id: 'IS 694: 2010',
      title: 'Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables/Cords for Working Voltages up to and including 450/750 V',
      confidence: 72,
      status: 'Active',
      explanation: 'Matches general PVC cable construction, but rated only up to 750V. Specification flagged: tender demands 1.1kV operation, so voltage rating mismatch requires buyer confirmation.'
    },
    {
      standard_id: 'IS 1554 (Part 1): 1976',
      title: 'PVC Insulated (Heavy Duty) Electric Cables (First Revision)',
      confidence: 41,
      status: 'Superseded',
      explanation: 'Identified historically relevant standard code, but flagged by Rule-Based Engine as Superseded by the 1988/2020 revision. Citing this version in live tenders causes non-compliance.'
    }
  ],
  'Civil/Construction': [
    {
      standard_id: 'IS 1489 (Part 1): 2015',
      title: 'Portland Pozzolana Cement — Specification — Part 1: Fly Ash Based (Third Revision)',
      confidence: 94,
      status: 'Active',
      explanation: 'Directly aligns with tender specification for fly-ash based PPC cement used in structural RCC and foundation works with sulphate resistance characteristics.'
    },
    {
      standard_id: 'IS 456: 2000',
      title: 'Plain and Reinforced Concrete — Code of Practice (Fourth Revision)',
      confidence: 78,
      status: 'Active',
      explanation: 'Governing structural design and construction standard. Applicable for execution methodology and mix design, but secondary to direct material supply specification.'
    },
    {
      standard_id: 'IS 269: 1989',
      title: 'Ordinary Portland Cement, 33 Grade — Specification',
      confidence: 35,
      status: 'Superseded',
      explanation: 'Historical 33-grade OPC specification superseded by unified IS 269:2015. Contains no pozzolanic material; does not satisfy fly-ash tender requirement.'
    }
  ],
  'IT/Electronics': [
    {
      standard_id: 'IS 13252 (Part 1): 2010',
      title: 'Information Technology Equipment — Safety — Part 1: General Requirements',
      confidence: 92,
      status: 'Active',
      explanation: 'Mandatory BIS CRS registration standard for electronic IT peripherals, ensuring electrical safety, thermal resistance, and power supply compliance.'
    },
    {
      standard_id: 'IS/ISO/IEC 19794-2: 2005',
      title: 'Information Technology — Biometric Data Interchange Formats — Part 2: Finger Minutiae Data',
      confidence: 68,
      status: 'Active',
      explanation: 'Relevant for biometric template interchange format, but tender specifically requires physical device certification rather than only data schema compliance.'
    },
    {
      standard_id: 'IS 13252: 2003',
      title: 'Safety of Information Technology Equipment (First Edition)',
      confidence: 29,
      status: 'Superseded',
      explanation: 'Superseded legacy standard. All IT procurement under MeitY / BIS Compulsory Registration Scheme requires IS 13252 (Part 1): 2010 or IS 16333.'
    }
  ]
}

// Extracted Requirements Mock Data parsed by Fine-Tuned Procurement LLM
export const MOCK_EXTRACTED_REQUIREMENTS = {
  Electrical: {
    fields: [
      { label: 'Voltage', value: '1.1 kV' },
      { label: 'Material', value: 'PVC / Copper Conductor' },
      { label: 'Environment', value: 'Outdoor Industrial' },
      { label: 'Application', value: 'Power Distribution' }
    ],
    missing: {
      label: 'Missing: Operating Temperature',
      detail: 'Operating thermal rating (e.g. 70°C / 85°C) omitted in tender text. Required for derating verification.'
    }
  },
  'Civil/Construction': {
    fields: [
      { label: 'Material', value: 'Portland Pozzolana Cement' },
      { label: 'Additive', value: 'Fly Ash Based' },
      { label: 'Environment', value: 'Coastal / Sulphate Marine' },
      { label: 'Application', value: 'RCC Columns & Foundation' }
    ],
    missing: {
      label: 'Missing: Operating Temperature',
      detail: 'Ambient placement temperature range and curing window unstated.'
    }
  },
  'IT/Electronics': {
    fields: [
      { label: 'Device Class', value: 'Optical Fingerprint Scanner' },
      { label: 'Interface', value: 'USB 2.0' },
      { label: 'Environment', value: 'IP54 Dust & Splash' },
      { label: 'Application', value: 'Aadhaar L1 Biometrics' }
    ],
    missing: {
      label: 'Missing: Operating Temperature',
      detail: 'Operating temperature range (-10°C to +50°C) not defined for field deployment.'
    }
  }
}

// Default fallback 3-item array matching the exact prompt requirements
export const DEFAULT_MOCK_RESULTS = MOCK_STANDARDS_BY_SECTOR.Electrical
