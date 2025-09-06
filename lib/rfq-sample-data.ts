import { CreateRfqData } from "@/types/rfq"

// Extended RFQ sample data for comprehensive testing
const EXTENDED_SAMPLE_RFQS: CreateRfqData[] = [
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
  }
]

// Sample RFQ data for development and testing (original data)
const ORIGINAL_SAMPLE_RFQS: CreateRfqData[] = [
  {
    title: "IT Support Services for Federal Agency",
    description: "Comprehensive IT support and maintenance services for multiple federal facilities. This includes 24/7 help desk support, system administration, network management, cybersecurity monitoring, and hardware maintenance. The contractor will be responsible for maintaining 99.9% uptime across all systems and providing quarterly security assessments.",
    agency: "Department of Commerce",
    naics_codes: "541511,541512",
    psc_codes: "D301,D307",
    location: "Washington, DC",
    state: "DC",
    city: "Washington",
    contract_value_min: 2000000,
    contract_value_max: 2500000,
    contract_type: "T&M",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-01").toISOString(),
    deadline_date: new Date("2025-10-15").toISOString(),
    response_date: new Date("2025-10-10").toISOString(),
    solicitation_number: "DOC-IT-2025-001",
    source_url: "https://sam.gov/opp/doc-it-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Construction of Government Office Building",
    description: "New construction of a 50,000 square foot government office building with modern sustainable design features. The project includes site preparation, foundation work, structural construction, electrical and plumbing systems, HVAC installation, and interior finishing. Must meet LEED Gold certification requirements.",
    agency: "General Services Administration",
    naics_codes: "236220,238210",
    psc_codes: "Y1AA,Y1BB",
    location: "Austin, TX",
    state: "TX", 
    city: "Austin",
    contract_value_min: 12000000,
    contract_value_max: 15000000,
    contract_type: "FFP",
    set_aside_type: undefined,
    posted_date: new Date("2025-08-15").toISOString(),
    deadline_date: new Date("2025-11-30").toISOString(),
    response_date: new Date("2025-11-25").toISOString(),
    solicitation_number: "GSA-CON-2025-TX-001",
    source_url: "https://sam.gov/opp/gsa-con-2025-tx-001",
    source_system: "SAM.gov"
  },
  {
    title: "Cybersecurity Consulting Services",
    description: "Comprehensive cybersecurity assessment and implementation services for Department of Homeland Security facilities. Services include penetration testing, vulnerability assessments, security protocol development, staff training, and ongoing monitoring. Must have current security clearances.",
    agency: "Department of Homeland Security",
    naics_codes: "541511,541690",
    psc_codes: "D310,R425",
    location: "Remote",
    state: undefined,
    city: undefined,
    contract_value_min: 750000,
    contract_value_max: 800000,
    contract_type: "Cost Plus",
    set_aside_type: "8(a)",
    posted_date: new Date("2025-08-20").toISOString(),
    deadline_date: new Date("2025-09-20").toISOString(),
    response_date: new Date("2025-09-15").toISOString(),
    solicitation_number: "DHS-CYBER-2025-001",
    source_url: "https://sam.gov/opp/dhs-cyber-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Medical Equipment Maintenance Services",
    description: "Preventive and corrective maintenance services for medical equipment across 15 VA medical centers. Includes calibration, repairs, replacement parts, and 24/7 emergency support for critical care equipment. Contractor must be FDA certified and have experience with major medical equipment manufacturers.",
    agency: "Department of Veterans Affairs",
    naics_codes: "811219,621511",
    psc_codes: "J001,Q201",
    location: "Multi-State",
    state: "CA,TX,FL,NY,IL",
    city: undefined,
    contract_value_min: 5000000,
    contract_value_max: 7500000,
    contract_type: "IDIQ",
    set_aside_type: "VOSB",
    posted_date: new Date("2025-09-05").toISOString(),
    deadline_date: new Date("2025-12-01").toISOString(),
    response_date: new Date("2025-11-25").toISOString(),
    solicitation_number: "VA-MED-2025-001",
    source_url: "https://sam.gov/opp/va-med-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Environmental Consulting and Remediation",
    description: "Environmental assessment and remediation services for former military installations. Work includes soil and groundwater testing, contamination assessment, cleanup planning, and ongoing monitoring. Requires experience with hazardous materials and EPA regulations.",
    agency: "Department of Defense",
    naics_codes: "541620,562910",
    psc_codes: "A112,R425",
    location: "Multiple Locations",
    state: "CA,NV,AZ",
    city: undefined,
    contract_value_min: 3000000,
    contract_value_max: 4500000,
    contract_type: "Cost Plus",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-28").toISOString(),
    deadline_date: new Date("2025-11-15").toISOString(),
    response_date: new Date("2025-11-10").toISOString(),
    solicitation_number: "DOD-ENV-2025-001",
    source_url: "https://sam.gov/opp/dod-env-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Training and Professional Development Services",
    description: "Design and delivery of leadership training programs for federal employees. Services include curriculum development, instructor-led training, e-learning modules, and performance assessment. Must accommodate 500+ employees across multiple skill levels and departments.",
    agency: "Office of Personnel Management",
    naics_codes: "611430,541611",
    psc_codes: "T001,R408",
    location: "Washington, DC",
    state: "DC",
    city: "Washington",
    contract_value_min: 1200000,
    contract_value_max: 1800000,
    contract_type: "FFP",
    set_aside_type: "WOSB",
    posted_date: new Date("2025-09-02").toISOString(),
    deadline_date: new Date("2025-10-30").toISOString(),
    response_date: new Date("2025-10-25").toISOString(),
    solicitation_number: "OPM-TRAIN-2025-001",
    source_url: "https://sam.gov/opp/opm-train-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Data Analytics and Business Intelligence Platform",
    description: "Development and implementation of a comprehensive data analytics platform for Treasury Department operations. Includes data warehouse design, ETL processes, dashboard development, and user training. Must handle sensitive financial data with appropriate security measures.",
    agency: "Department of Treasury",
    naics_codes: "541511,541512",
    psc_codes: "D302,D306",
    location: "Remote/Hybrid",
    state: "DC,MD,VA",
    city: undefined,
    contract_value_min: 8000000,
    contract_value_max: 12000000,
    contract_type: "T&M",
    set_aside_type: undefined,
    posted_date: new Date("2025-08-25").toISOString(),
    deadline_date: new Date("2025-12-15").toISOString(),
    response_date: new Date("2025-12-10").toISOString(),
    solicitation_number: "TREAS-DATA-2025-001",
    source_url: "https://sam.gov/opp/treas-data-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Transportation and Logistics Services",
    description: "Comprehensive transportation and logistics support for Department of Agriculture field operations. Services include vehicle fleet management, supply chain coordination, warehouse operations, and distribution services across rural and urban locations.",
    agency: "Department of Agriculture",
    naics_codes: "484122,493110",
    psc_codes: "V111,B501",
    location: "Nationwide",
    state: "IA,IL,NE,KS,MO",
    city: undefined,
    contract_value_min: 6000000,
    contract_value_max: 9000000,
    contract_type: "IDIQ",
    set_aside_type: "HUBZone",
    posted_date: new Date("2025-09-03").toISOString(),
    deadline_date: new Date("2025-12-20").toISOString(),
    response_date: new Date("2025-12-15").toISOString(),
    solicitation_number: "USDA-TRANS-2025-001",
    source_url: "https://sam.gov/opp/usda-trans-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Research and Development - Advanced Materials",
    description: "Research and development services for advanced materials applications in aerospace and defense. Work includes laboratory testing, prototype development, technical documentation, and collaboration with university research partners. Requires PhD-level expertise in materials science.",
    agency: "National Aeronautics and Space Administration",
    naics_codes: "541712,541380",
    psc_codes: "A112,A113",
    location: "Houston, TX",
    state: "TX",
    city: "Houston",
    contract_value_min: 4500000,
    contract_value_max: 6500000,
    contract_type: "Cost Plus",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-30").toISOString(),
    deadline_date: new Date("2025-11-10").toISOString(),
    response_date: new Date("2025-11-05").toISOString(),
    solicitation_number: "NASA-RD-2025-001",
    source_url: "https://sam.gov/opp/nasa-rd-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Facilities Management and Maintenance",
    description: "Comprehensive facilities management for Department of Education headquarters and regional offices. Services include janitorial services, HVAC maintenance, landscaping, security coordination, and emergency response. Must coordinate with multiple service providers.",
    agency: "Department of Education",
    naics_codes: "561210,561730",
    psc_codes: "J001,B501",
    location: "Washington, DC + Regional",
    state: "DC,MD,VA,GA,TX,CA",
    city: undefined,
    contract_value_min: 3500000,
    contract_value_max: 5000000,
    contract_type: "FFP",
    set_aside_type: "SDVOSB",
    posted_date: new Date("2025-09-04").toISOString(),
    deadline_date: new Date("2025-12-05").toISOString(),
    response_date: new Date("2025-12-01").toISOString(),
    solicitation_number: "ED-FAC-2025-001",
    source_url: "https://sam.gov/opp/ed-fac-2025-001",
    source_system: "SAM.gov"
  }
]

// Combined sample data (original + extended)
export const SAMPLE_RFQS: CreateRfqData[] = [
  ...ORIGINAL_SAMPLE_RFQS,
  ...EXTENDED_SAMPLE_RFQS
]

// Helper function to create RFQs in database  
export async function seedRfqData(db: any) {
  const results: any[] = []
  
  for (const rfqData of SAMPLE_RFQS) {
    try {
      const rfq = await db.rfq.create({
        data: {
          ...rfqData,
          posted_date: new Date(rfqData.posted_date),
          deadline_date: new Date(rfqData.deadline_date),
          response_date: rfqData.response_date ? new Date(rfqData.response_date) : null,
        }
      })
      results.push(rfq)
    } catch (error) {
      console.error(`Error creating RFQ: ${rfqData.title}`, error)
    }
  }
  
  return results
}

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

    console.log(`📝 Creating ${SAMPLE_RFQS.length} RFQs in batches of ${options.batchSize}...`)
    
    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < SAMPLE_RFQS.length; i += options.batchSize) {
      const batch = SAMPLE_RFQS.slice(i, i + options.batchSize)
      
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
          
          results.push(rfq)
          console.log(`✅ Created: ${rfq.title} (${rfq.solicitation_number})`)
          
        } catch (error) {
          const errorMsg = `Error creating RFQ ${rfqData.solicitation_number}: ${rfqData.title}`
          console.error(`❌ ${errorMsg}`, error)
          errors.push({ rfq: rfqData.solicitation_number, error: errorMsg })
        }
      }
      
      // Small delay between batches
      if (i + options.batchSize < SAMPLE_RFQS.length) {
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
        total: SAMPLE_RFQS.length
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
    throw error
  }
}

// Enhanced stats about sample data
export const SAMPLE_DATA_STATS = {
  total_rfqs: SAMPLE_RFQS.length,
  agencies: [...new Set(SAMPLE_RFQS.map(rfq => rfq.agency))],
  states: [...new Set(SAMPLE_RFQS.map(rfq => rfq.state).filter(Boolean))],
  contract_types: [...new Set(SAMPLE_RFQS.map(rfq => rfq.contract_type).filter(Boolean))],
  set_aside_types: [...new Set(SAMPLE_RFQS.map(rfq => rfq.set_aside_type).filter(Boolean))],
  naics_codes: [...new Set(SAMPLE_RFQS.flatMap(rfq => rfq.naics_codes.split(',')).map(code => code.trim()))],
  psc_codes: [...new Set(SAMPLE_RFQS.flatMap(rfq => rfq.psc_codes?.split(',') || []).map(code => code.trim()))],
  total_value_range: {
    min: Math.min(...SAMPLE_RFQS.map(rfq => rfq.contract_value_min || 0)),
    max: Math.max(...SAMPLE_RFQS.map(rfq => rfq.contract_value_max || 0))
  },
  value_distribution: {
    under_1m: SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) < 1000000).length,
    '1m_5m': SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 1000000 && (rfq.contract_value_max || 0) < 5000000).length,
    '5m_20m': SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 5000000 && (rfq.contract_value_max || 0) < 20000000).length,
    over_20m: SAMPLE_RFQS.filter(rfq => (rfq.contract_value_max || 0) >= 20000000).length
  }
}