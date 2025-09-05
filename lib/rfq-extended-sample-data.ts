import { CreateRfqData } from "@/types/rfq"
import { SAMPLE_RFQS } from './rfq-sample-data'

// Extended RFQ sample data for comprehensive testing
export const EXTENDED_SAMPLE_RFQS: CreateRfqData[] = [
  // Technology & IT Services
  {
    title: "Cloud Migration and Infrastructure Modernization",
    description: "Complete migration of legacy systems to cloud infrastructure for Department of Energy operations. Includes assessment, planning, execution, and post-migration support. Must support hybrid cloud architecture with AWS GovCloud certification.",
    agency: "Department of Energy",
    naics_codes: "541511,541512",
    psc_codes: "D302,D306",
    location: "Washington, DC",
    state: "DC",
    city: "Washington",
    contract_value_min: 15000000,
    contract_value_max: 20000000,
    contract_type: "T&M",
    set_aside_type: undefined,
    posted_date: new Date("2025-09-01").toISOString(),
    deadline_date: new Date("2025-12-01").toISOString(),
    response_date: new Date("2025-11-25").toISOString(),
    solicitation_number: "DOE-CLOUD-2025-001",
    source_url: "https://sam.gov/opp/doe-cloud-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Mobile Application Development for Field Operations",
    description: "Development of mobile applications for field agents to collect and transmit data in real-time. Must support offline functionality, secure data transmission, and integration with existing databases. iOS and Android platforms required.",
    agency: "Department of Commerce",
    naics_codes: "541511,541512",
    psc_codes: "D301,D316",
    location: "Remote",
    state: undefined,
    city: undefined,
    contract_value_min: 800000,
    contract_value_max: 1200000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-02").toISOString(),
    deadline_date: new Date("2025-10-20").toISOString(),
    response_date: new Date("2025-10-15").toISOString(),
    solicitation_number: "DOC-MOBILE-2025-001",
    source_url: "https://sam.gov/opp/doc-mobile-2025-001",
    source_system: "SAM.gov"
  },

  // Construction & Engineering
  {
    title: "Bridge Inspection and Structural Assessment",
    description: "Comprehensive structural assessment of 25 bridges across three states. Includes detailed inspection reports, load capacity analysis, and renovation recommendations. Must comply with Federal Highway Administration standards.",
    agency: "Department of Transportation",
    naics_codes: "541330,237310",
    psc_codes: "Y1EA,R425",
    location: "Multi-State",
    state: "PA,OH,WV",
    city: undefined,
    contract_value_min: 2500000,
    contract_value_max: 3500000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-28").toISOString(),
    deadline_date: new Date("2025-11-15").toISOString(),
    response_date: new Date("2025-11-10").toISOString(),
    solicitation_number: "DOT-BRIDGE-2025-001",
    source_url: "https://sam.gov/opp/dot-bridge-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Solar Panel Installation for Military Bases",
    description: "Design and installation of solar panel systems across 5 military installations. Project includes site assessment, permitting, installation, grid integration, and 10-year maintenance contract. Must achieve 30% energy reduction target.",
    agency: "Department of Defense",
    naics_codes: "238220,541330",
    psc_codes: "Y1EA,Z2A9",
    location: "Multiple Military Bases",
    state: "CA,TX,FL,GA,NC",
    city: undefined,
    contract_value_min: 25000000,
    contract_value_max: 35000000,
    contract_type: "IDIQ",
    set_aside_type: "VOSB",
    posted_date: new Date("2025-08-25").toISOString(),
    deadline_date: new Date("2025-12-10").toISOString(),
    response_date: new Date("2025-12-05").toISOString(),
    solicitation_number: "DOD-SOLAR-2025-001",
    source_url: "https://sam.gov/opp/dod-solar-2025-001",
    source_system: "SAM.gov"
  },

  // Professional Services & Consulting
  {
    title: "Financial Management System Implementation",
    description: "Implementation of modern financial management system for Treasury operations. Includes system configuration, data migration, user training, and change management. Must integrate with existing procurement and HR systems.",
    agency: "Department of Treasury",
    naics_codes: "541511,541611",
    psc_codes: "D302,R408",
    location: "Washington, DC",
    state: "DC",
    city: "Washington",
    contract_value_min: 5000000,
    contract_value_max: 7500000,
    contract_type: "T&M",
    set_aside_type: "8(a)",
    posted_date: new Date("2025-09-03").toISOString(),
    deadline_date: new Date("2025-11-30").toISOString(),
    response_date: new Date("2025-11-25").toISOString(),
    solicitation_number: "TREAS-FIN-2025-001",
    source_url: "https://sam.gov/opp/treas-fin-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Human Resources Consulting and Process Improvement",
    description: "Comprehensive HR consulting services to modernize personnel management processes. Includes policy review, workflow optimization, employee engagement surveys, and performance management system design.",
    agency: "Office of Personnel Management",
    naics_codes: "541612,541611",
    psc_codes: "R408,R417",
    location: "Remote/Hybrid",
    state: "DC,MD,VA",
    city: undefined,
    contract_value_min: 1500000,
    contract_value_max: 2200000,
    contract_type: "Cost Plus",
    set_aside_type: "WOSB",
    posted_date: new Date("2025-09-04").toISOString(),
    deadline_date: new Date("2025-10-25").toISOString(),
    response_date: new Date("2025-10-20").toISOString(),
    solicitation_number: "OPM-HR-2025-001",
    source_url: "https://sam.gov/opp/opm-hr-2025-001",
    source_system: "SAM.gov"
  },

  // Healthcare & Medical Services
  {
    title: "Telemedicine Platform Development and Support",
    description: "Development and maintenance of telemedicine platform for rural VA clinics. Must support video consultations, electronic prescriptions, remote monitoring integration, and HIPAA compliance. 24/7 technical support required.",
    agency: "Department of Veterans Affairs",
    naics_codes: "541511,621111",
    psc_codes: "D301,Q201",
    location: "Nationwide",
    state: "MT,ND,SD,WY,ID",
    city: undefined,
    contract_value_min: 8000000,
    contract_value_max: 12000000,
    contract_type: "IDIQ",
    set_aside_type: "VOSB",
    posted_date: new Date("2025-08-30").toISOString(),
    deadline_date: new Date("2025-12-15").toISOString(),
    response_date: new Date("2025-12-10").toISOString(),
    solicitation_number: "VA-TELE-2025-001",
    source_url: "https://sam.gov/opp/va-tele-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Medical Equipment Procurement and Installation",
    description: "Procurement and installation of advanced diagnostic equipment for 3 military hospitals. Includes MRI machines, CT scanners, X-ray systems, and associated infrastructure upgrades. Staff training and warranty included.",
    agency: "Department of Defense",
    naics_codes: "423450,811219",
    psc_codes: "J002,J001",
    location: "Military Medical Centers",
    state: "TX,CA,MD",
    city: "San Antonio,San Diego,Bethesda",
    contract_value_min: 18000000,
    contract_value_max: 25000000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-01").toISOString(),
    deadline_date: new Date("2025-11-20").toISOString(),
    response_date: new Date("2025-11-15").toISOString(),
    solicitation_number: "DOD-MEDEQUIP-2025-001",
    source_url: "https://sam.gov/opp/dod-medequip-2025-001",
    source_system: "SAM.gov"
  },

  // Environmental & Scientific Services
  {
    title: "Climate Data Analysis and Modeling Services",
    description: "Advanced climate data analysis and predictive modeling for NOAA weather forecasting systems. Requires expertise in machine learning, atmospheric science, and high-performance computing. Integration with satellite data systems.",
    agency: "National Oceanic and Atmospheric Administration",
    naics_codes: "541712,541380",
    psc_codes: "A112,R425",
    location: "Boulder, CO",
    state: "CO",
    city: "Boulder",
    contract_value_min: 3200000,
    contract_value_max: 4800000,
    contract_type: "Cost Plus",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-27").toISOString(),
    deadline_date: new Date("2025-11-08").toISOString(),
    response_date: new Date("2025-11-03").toISOString(),
    solicitation_number: "NOAA-CLIMATE-2025-001",
    source_url: "https://sam.gov/opp/noaa-climate-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Hazardous Waste Management and Disposal",
    description: "Comprehensive hazardous waste management services for EPA Superfund sites. Includes waste characterization, treatment planning, transportation, and disposal. Must comply with all federal and state environmental regulations.",
    agency: "Environmental Protection Agency",
    naics_codes: "562211,562910",
    psc_codes: "W045,A112",
    location: "Multi-Site Operations",
    state: "NJ,PA,DE,MD",
    city: undefined,
    contract_value_min: 6500000,
    contract_value_max: 9500000,
    contract_type: "Cost Plus",
    set_aside_type: "HUBZone",
    posted_date: new Date("2025-09-05").toISOString(),
    deadline_date: new Date("2025-12-20").toISOString(),
    response_date: new Date("2025-12-15").toISOString(),
    solicitation_number: "EPA-WASTE-2025-001",
    source_url: "https://sam.gov/opp/epa-waste-2025-001",
    source_system: "SAM.gov"
  },

  // Education & Training
  {
    title: "Online Learning Platform Development for Federal Training",
    description: "Development of comprehensive online learning management system for federal employee training programs. Must support multimedia content, assessments, certification tracking, and integration with HR systems. SCORM compliance required.",
    agency: "Office of Personnel Management",
    naics_codes: "541511,611420",
    psc_codes: "D301,T001",
    location: "Remote",
    state: undefined,
    city: undefined,
    contract_value_min: 4500000,
    contract_value_max: 6800000,
    contract_type: "T&M",
    set_aside_type: "SDVOSB",
    posted_date: new Date("2025-09-02").toISOString(),
    deadline_date: new Date("2025-12-05").toISOString(),
    response_date: new Date("2025-11-30").toISOString(),
    solicitation_number: "OPM-LEARN-2025-001",
    source_url: "https://sam.gov/opp/opm-learn-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "STEM Education Program Support Services",
    description: "Support services for nationwide STEM education initiatives in underserved communities. Includes program coordination, teacher training, curriculum development, and student mentorship programs. Must reach 10,000+ students annually.",
    agency: "Department of Education",
    naics_codes: "611710,541611",
    psc_codes: "T001,R408",
    location: "Nationwide",
    state: "All States",
    city: undefined,
    contract_value_min: 12000000,
    contract_value_max: 18000000,
    contract_type: "IDIQ",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-29").toISOString(),
    deadline_date: new Date("2025-11-25").toISOString(),
    response_date: new Date("2025-11-20").toISOString(),
    solicitation_number: "ED-STEM-2025-001",
    source_url: "https://sam.gov/opp/ed-stem-2025-001",
    source_system: "SAM.gov"
  },

  // Transportation & Logistics
  {
    title: "Supply Chain Management System Upgrade",
    description: "Modernization of supply chain management systems for Defense Logistics Agency. Includes inventory management, procurement optimization, vendor management, and real-time tracking capabilities. Integration with existing ERP systems required.",
    agency: "Defense Logistics Agency",
    naics_codes: "541511,493110",
    psc_codes: "D302,B505",
    location: "Richmond, VA",
    state: "VA",
    city: "Richmond",
    contract_value_min: 22000000,
    contract_value_max: 30000000,
    contract_type: "T&M",
    set_aside_type: undefined,
    posted_date: new Date("2025-08-26").toISOString(),
    deadline_date: new Date("2025-12-12").toISOString(),
    response_date: new Date("2025-12-07").toISOString(),
    solicitation_number: "DLA-SUPPLY-2025-001",
    source_url: "https://sam.gov/opp/dla-supply-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Fleet Vehicle Maintenance and Management Services",
    description: "Comprehensive fleet management services for USDA field operations. Includes preventive maintenance, repairs, fuel management, driver training, and vehicle replacement planning. Coverage for 2,500+ vehicles nationwide.",
    agency: "Department of Agriculture",
    naics_codes: "811111,532120",
    psc_codes: "V111,V112",
    location: "Regional Service Centers",
    state: "CA,TX,IL,NY,FL",
    city: undefined,
    contract_value_min: 45000000,
    contract_value_max: 65000000,
    contract_type: "IDIQ",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-06").toISOString(),
    deadline_date: new Date("2025-12-22").toISOString(),
    response_date: new Date("2025-12-17").toISOString(),
    solicitation_number: "USDA-FLEET-2025-001",
    source_url: "https://sam.gov/opp/usda-fleet-2025-001",
    source_system: "SAM.gov"
  },

  // Research & Development
  {
    title: "Artificial Intelligence Research for Defense Applications",
    description: "Advanced AI research focused on autonomous systems, machine learning algorithms, and decision support systems for military applications. Requires top-secret clearance and collaboration with academic institutions.",
    agency: "Defense Advanced Research Projects Agency",
    naics_codes: "541712,541511",
    psc_codes: "A112,D302",
    location: "Arlington, VA",
    state: "VA",
    city: "Arlington",
    contract_value_min: 50000000,
    contract_value_max: 75000000,
    contract_type: "Cost Plus",
    set_aside_type: undefined,
    posted_date: new Date("2025-08-31").toISOString(),
    deadline_date: new Date("2025-11-18").toISOString(),
    response_date: new Date("2025-11-13").toISOString(),
    solicitation_number: "DARPA-AI-2025-001",
    source_url: "https://sam.gov/opp/darpa-ai-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Space Technology Development and Testing",
    description: "Development and testing of next-generation space technologies including propulsion systems, life support equipment, and communication arrays. Includes laboratory testing, prototype development, and flight readiness certification.",
    agency: "National Aeronautics and Space Administration",
    naics_codes: "336414,541712",
    psc_codes: "A007,A112",
    location: "Houston, TX / Kennedy Space Center, FL",
    state: "TX,FL",
    city: "Houston,Cape Canaveral",
    contract_value_min: 85000000,
    contract_value_max: 120000000,
    contract_type: "Cost Plus",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-07").toISOString(),
    deadline_date: new Date("2025-12-30").toISOString(),
    response_date: new Date("2025-12-25").toISOString(),
    solicitation_number: "NASA-SPACE-2025-001",
    source_url: "https://sam.gov/opp/nasa-space-2025-001",
    source_system: "SAM.gov"
  }
]

// Combine with existing sample data
export const ALL_SAMPLE_RFQS = [
  // Import existing sample data
  ...SAMPLE_RFQS,
  // Add extended sample data
  ...EXTENDED_SAMPLE_RFQS
]

// Enhanced seeding function with better error handling
export async function seedExtendedRfqData(db: any, options = { clearExisting: false, batchSize: 5 }) {
  const results: any[] = []
  const errors: any[] = []
  
  try {
    // Clear existing data if requested
    if (options.clearExisting) {
      console.log('🗑️  Clearing existing RFQ data...')
      await db.rfqMatchScore.deleteMany({})
      await db.rfqStatus.deleteMany({})
      await db.savedRfq.deleteMany({})
      await db.rfq.deleteMany({})
      console.log('✅ Existing data cleared')
    }

    console.log(`📝 Creating ${ALL_SAMPLE_RFQS.length} RFQs in batches of ${options.batchSize}...`)
    
    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < ALL_SAMPLE_RFQS.length; i += options.batchSize) {
      const batch = ALL_SAMPLE_RFQS.slice(i, i + options.batchSize)
      const batchResults: any[] = []
      
      for (const rfqData of batch) {
        try {
          // Check if RFQ already exists
          const existing = await db.rfq.findUnique({
            where: { solicitation_number: rfqData.solicitation_number }
          })
          
          if (existing) {
            console.log(`⏭️  Skipping existing RFQ: ${rfqData.solicitation_number}`)
            continue
          }

          const rfq = await db.rfq.create({
            data: {
              ...rfqData,
              posted_date: new Date(rfqData.posted_date),
              deadline_date: new Date(rfqData.deadline_date),
              response_date: rfqData.response_date ? new Date(rfqData.response_date) : null,
              status: 'Open' // Default status for all seeded RFQs
            }
          })
          
          batchResults.push(rfq)
          console.log(`✅ Created: ${rfq.title} (${rfq.solicitation_number})`)
          
        } catch (error) {
          const errorMsg = `Error creating RFQ ${rfqData.solicitation_number}: ${rfqData.title}`
          console.error(`❌ ${errorMsg}`, error)
          errors.push({ rfq: rfqData.solicitation_number, error: errorMsg })
        }
      }
      
      results.push(...batchResults)
      
      // Small delay between batches
      if (i + options.batchSize < ALL_SAMPLE_RFQS.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`\n🎉 Successfully created ${results.length} RFQs`)
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred during seeding`)
    }
    
    return {
      success: results,
      errors,
      stats: {
        created: results.length,
        failed: errors.length,
        total: ALL_SAMPLE_RFQS.length
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
    throw error
  }
}

// Enhanced statistics
export const EXTENDED_SAMPLE_DATA_STATS = {
  total_rfqs: ALL_SAMPLE_RFQS.length,
  agencies: [...new Set(ALL_SAMPLE_RFQS.map(rfq => rfq.agency))],
  states: [...new Set(ALL_SAMPLE_RFQS.map(rfq => rfq.state).filter(Boolean))],
  contract_types: [...new Set(ALL_SAMPLE_RFQS.map(rfq => rfq.contract_type).filter(Boolean))],
  set_aside_types: [...new Set(ALL_SAMPLE_RFQS.map(rfq => rfq.set_aside_type).filter(Boolean))],
  naics_codes: [...new Set(ALL_SAMPLE_RFQS.flatMap(rfq => rfq.naics_codes.split(',')).map(code => code.trim()))],
  psc_codes: [...new Set(ALL_SAMPLE_RFQS.flatMap(rfq => rfq.psc_codes?.split(',') || []).map(code => code.trim()))],
  total_value_range: {
    min: Math.min(...ALL_SAMPLE_RFQS.map(rfq => rfq.contract_value_min || 0)),
    max: Math.max(...ALL_SAMPLE_RFQS.map(rfq => rfq.contract_value_max || 0))
  },
  value_distribution: {
    under_1m: ALL_SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) < 1000000).length,
    '1m_5m': ALL_SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 1000000 && (rfq.contract_value_max || 0) < 5000000).length,
    '5m_20m': ALL_SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 5000000 && (rfq.contract_value_max || 0) < 20000000).length,
    over_20m: ALL_SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 20000000).length
  },
  deadline_distribution: {
    next_30_days: ALL_SAMPLE_RFQS.filter(rfq => {
      const deadline = new Date(rfq.deadline_date)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000
    }).length,
    next_60_days: ALL_SAMPLE_RFQS.filter(rfq => {
      const deadline = new Date(rfq.deadline_date)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      return diff > 30 * 24 * 60 * 60 * 1000 && diff <= 60 * 24 * 60 * 60 * 1000
    }).length,
    next_90_days: ALL_SAMPLE_RFQS.filter(rfq => {
      const deadline = new Date(rfq.deadline_date)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      return diff > 60 * 24 * 60 * 60 * 1000 && diff <= 90 * 24 * 60 * 60 * 1000
    }).length
  }
}