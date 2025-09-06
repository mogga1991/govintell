import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Sample RFQ data
const SAMPLE_RFQS = [
  {
    title: "IT Support Services for Federal Agency",
    description: "Comprehensive IT support and maintenance services for multiple federal facilities. This includes 24/7 help desk support, system administration, network management, cybersecurity monitoring, and hardware maintenance.",
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
    posted_date: new Date("2025-09-01"),
    deadline_date: new Date("2025-10-15"),
    response_date: new Date("2025-10-10"),
    solicitation_number: "DOC-IT-2025-001",
    source_url: "https://sam.gov/opp/doc-it-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Construction of Government Office Building",
    description: "New construction of a 50,000 square foot government office building with modern sustainable design features. The project includes site preparation, foundation work, structural construction, and interior finishing.",
    agency: "General Services Administration",
    naics_codes: "236220,238210",
    psc_codes: "Y1AA,Y1BB",
    location: "Austin, TX",
    state: "TX", 
    city: "Austin",
    contract_value_min: 12000000,
    contract_value_max: 15000000,
    contract_type: "FFP",
    set_aside_type: null,
    posted_date: new Date("2025-08-15"),
    deadline_date: new Date("2025-11-30"),
    response_date: new Date("2025-11-25"),
    solicitation_number: "GSA-CON-2025-TX-001",
    source_url: "https://sam.gov/opp/gsa-con-2025-tx-001",
    source_system: "SAM.gov"
  },
  {
    title: "Cybersecurity Consulting Services",
    description: "Comprehensive cybersecurity assessment and implementation services for Department of Homeland Security facilities. Services include penetration testing, vulnerability assessments, and security protocol development.",
    agency: "Department of Homeland Security",
    naics_codes: "541511,541690",
    psc_codes: "D310,R425",
    location: "Remote",
    state: null,
    city: null,
    contract_value_min: 750000,
    contract_value_max: 800000,
    contract_type: "Cost Plus",
    set_aside_type: "8(a)",
    posted_date: new Date("2025-08-20"),
    deadline_date: new Date("2025-09-20"),
    response_date: new Date("2025-09-15"),
    solicitation_number: "DHS-CYBER-2025-001",
    source_url: "https://sam.gov/opp/dhs-cyber-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Medical Equipment Maintenance Services",
    description: "Preventive and corrective maintenance services for medical equipment across 15 VA medical centers. Includes calibration, repairs, replacement parts, and 24/7 emergency support for critical care equipment.",
    agency: "Department of Veterans Affairs",
    naics_codes: "811219,621511",
    psc_codes: "J001,Q201",
    location: "Multi-State",
    state: "CA,TX,FL,NY,IL",
    city: null,
    contract_value_min: 5000000,
    contract_value_max: 7500000,
    contract_type: "IDIQ",
    set_aside_type: "VOSB",
    posted_date: new Date("2025-09-05"),
    deadline_date: new Date("2025-12-01"),
    response_date: new Date("2025-11-25"),
    solicitation_number: "VA-MED-2025-001",
    source_url: "https://sam.gov/opp/va-med-2025-001",
    source_system: "SAM.gov"
  },
  {
    title: "Environmental Consulting and Remediation",
    description: "Environmental assessment and remediation services for former military installations. Work includes soil and groundwater testing, contamination assessment, cleanup planning, and ongoing monitoring.",
    agency: "Department of Defense",
    naics_codes: "541620,562910",
    psc_codes: "A112,R425",
    location: "Multiple Locations",
    state: "CA,NV,AZ",
    city: null,
    contract_value_min: 3000000,
    contract_value_max: 4500000,
    contract_type: "Cost Plus",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-28"),
    deadline_date: new Date("2025-11-15"),
    response_date: new Date("2025-11-10"),
    solicitation_number: "DOD-ENV-2025-001",
    source_url: "https://sam.gov/opp/dod-env-2025-001",
    source_system: "SAM.gov"
  }
]

export async function POST() {
  try {
    // Check if RFQs already exist
    const existingCount = await db.rfq.count()
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: "RFQ data already exists",
        existing_count: existingCount
      }, { status: 200 })
    }
    
    // Create RFQs
    const results: any[] = []
    for (const rfqData of SAMPLE_RFQS) {
      const rfq = await db.rfq.create({
        data: rfqData
      })
      results.push(rfq)
    }
    
    return NextResponse.json({
      message: "Successfully seeded RFQ data",
      created_count: results.length,
      rfqs: results.map(r => ({
        id: r.id,
        title: r.title,
        agency: r.agency,
        deadline_date: r.deadline_date
      }))
    })
    
  } catch (error) {
    console.error("Error seeding RFQs:", error)
    return NextResponse.json({
      error: "Failed to seed RFQ data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}