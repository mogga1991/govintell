#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

export {}

const db = new PrismaClient()

// Realistic PRODUCT RFQs with proper PSC codes
const PRODUCT_RFQS = [
  {
    title: "Medical Surgical Gloves - Nitrile Examination Gloves",
    description: "Request for quotation for 500,000 pairs of nitrile examination gloves, powder-free, non-sterile. Size medium, blue color preferred. Must meet FDA requirements for medical examination gloves. Gloves must be latex-free and provide superior chemical resistance. Packaging: 100 gloves per box, 10 boxes per case. Delivery required within 30 days of award.",
    agency: "Department of Veterans Affairs",
    naics_codes: "339113,424450",
    psc_codes: "6515",  // Medical/Surgical Instruments, Equipment, and Supplies
    location: "Nationwide Distribution",
    state: "DC,MD,VA,GA,TX,CA",
    city: null,
    contract_value_min: 125000,
    contract_value_max: 150000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-03"),
    deadline_date: new Date("2025-09-25"),
    response_date: new Date("2025-09-20"),
    solicitation_number: "VA-MED-GLOVES-2025-001",
    source_url: "https://sam.gov/opp/va-med-gloves-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Desktop Computers - All-in-One Workstations",
    description: "Procurement of 250 all-in-one desktop computers for government offices. Minimum specifications: Intel i7 processor, 16GB RAM, 512GB SSD, 24-inch display, Windows 11 Pro, webcam, wireless keyboard/mouse. Must include 3-year warranty and on-site support. Energy Star certified required. Compatible with existing network infrastructure.",
    agency: "General Services Administration",
    naics_codes: "334111,423430",
    psc_codes: "7021",  // Automatic Data Processing Equipment (Computers, Computer Storage Devices, etc.)
    location: "Washington, DC",
    state: "DC",
    city: "Washington",
    contract_value_min: 350000,
    contract_value_max: 425000,
    contract_type: "FFP",
    set_aside_type: null,
    posted_date: new Date("2025-09-01"),
    deadline_date: new Date("2025-10-01"),
    response_date: new Date("2025-09-26"),
    solicitation_number: "GSA-IT-DESKTOP-2025-001",
    source_url: "https://sam.gov/opp/gsa-it-desktop-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Office Furniture - Ergonomic Task Chairs",
    description: "Purchase of 150 ergonomic task chairs for federal office building. Chairs must feature adjustable height, lumbar support, armrests, and breathable mesh back. Black or gray color. Weight capacity minimum 300 lbs. GREENGUARD Gold certified for low chemical emissions. Assembly and delivery to 5th floor required. Warranty: minimum 10 years.",
    agency: "Department of Education",
    naics_codes: "337214,442110",
    psc_codes: "7105",  // Household and Commercial Furniture and Appliances
    location: "Atlanta, GA",
    state: "GA",
    city: "Atlanta",
    contract_value_min: 85000,
    contract_value_max: 105000,
    contract_type: "FFP",
    set_aside_type: "WOSB",
    posted_date: new Date("2025-08-28"),
    deadline_date: new Date("2025-09-30"),
    response_date: new Date("2025-09-25"),
    solicitation_number: "ED-FURN-CHAIR-2025-001",
    source_url: "https://sam.gov/opp/ed-furn-chair-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Security Equipment - X-Ray Baggage Scanners",
    description: "Procurement of 8 X-ray baggage screening systems for TSA checkpoints. Single-view tunnel size 24\" x 16\". Must meet TSA certification requirements. Include threat detection algorithms, network connectivity, and operator training. System must detect organic and inorganic materials. Delivery, installation, and 2-year maintenance contract included.",
    agency: "Department of Homeland Security",
    naics_codes: "334290,561621",
    psc_codes: "5895",  // Miscellaneous Communication Equipment
    location: "Multiple Airports",
    state: "FL,TX,CA",
    city: null,
    contract_value_min: 2400000,
    contract_value_max: 2800000,
    contract_type: "FFP",
    set_aside_type: null,
    posted_date: new Date("2025-08-15"),
    deadline_date: new Date("2025-11-15"),
    response_date: new Date("2025-11-10"),
    solicitation_number: "DHS-TSA-XRAY-2025-001",
    source_url: "https://sam.gov/opp/dhs-tsa-xray-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Laboratory Equipment - Digital Microscopes",
    description: "Purchase of 12 digital microscopes for CDC laboratory use. Magnification range 40x to 1000x, trinocular head with digital camera, LED illumination, motorized stage. Must include image analysis software and network connectivity for remote viewing. Calibration certificates and annual maintenance included. Budget includes training for 4 technicians.",
    agency: "Centers for Disease Control and Prevention",
    naics_codes: "334516,423450",
    psc_codes: "6640",  // Laboratory Equipment and Supplies
    location: "Atlanta, GA",
    state: "GA",
    city: "Atlanta",
    contract_value_min: 180000,
    contract_value_max: 220000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-02"),
    deadline_date: new Date("2025-10-10"),
    response_date: new Date("2025-10-05"),
    solicitation_number: "CDC-LAB-MICRO-2025-001",
    source_url: "https://sam.gov/opp/cdc-lab-micro-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Fleet Vehicles - Hybrid Sedans",
    description: "Procurement of 25 hybrid sedan vehicles for federal fleet replacement. Model year 2025, 4-door, automatic transmission, minimum 45 MPG combined. Must meet Federal Vehicle Standards and be E85 capable. Interior: cloth seats, air conditioning, power windows/locks. Safety features: backup camera, stability control, airbags. White exterior color preferred.",
    agency: "Department of Agriculture",
    naics_codes: "336111,441110",
    psc_codes: "2310",  // Passenger Motor Vehicles
    location: "Des Moines, IA",
    state: "IA,IL,NE,KS,MO",
    city: "Des Moines",
    contract_value_min: 650000,
    contract_value_max: 750000,
    contract_type: "FFP",
    set_aside_type: null,
    posted_date: new Date("2025-08-25"),
    deadline_date: new Date("2025-10-25"),
    response_date: new Date("2025-10-20"),
    solicitation_number: "USDA-FLEET-HYB-2025-001",
    source_url: "https://sam.gov/opp/usda-fleet-hyb-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Construction Materials - Steel Beams and Structural Components",
    description: "Purchase of structural steel for federal building renovation. Includes: 50 I-beams (W24x76, 20 ft length), 75 steel plates (1/2\" x 48\" x 96\"), 200 angle irons (L4x4x1/2\", 12 ft length). All materials must meet ASTM A992 Grade 50 specifications. Mill test certificates required. Delivery to construction site with 48-hour advance notice.",
    agency: "General Services Administration",
    naics_codes: "331110,423310",
    psc_codes: "5610",  // Bars, Shapes, and Forms
    location: "Denver, CO",
    state: "CO",
    city: "Denver",
    contract_value_min: 125000,
    contract_value_max: 155000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-09-04"),
    deadline_date: new Date("2025-10-04"),
    response_date: new Date("2025-09-29"),
    solicitation_number: "GSA-CONSTR-STEEL-2025-001",
    source_url: "https://sam.gov/opp/gsa-constr-steel-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Communication Equipment - Two-Way Radios",
    description: "Procurement of 100 handheld two-way radios for National Park Service. VHF frequency 136-174 MHz, minimum 5-watt output, 16 channels, LCD display, weatherproof (IP67 rating). Include desktop chargers, belt clips, and earpiece accessories. Battery life minimum 12 hours. Programming and frequency coordination included.",
    agency: "Department of the Interior",
    naics_codes: "334220,423690",
    psc_codes: "5820",  // Radio and Television Communication Equipment, Except Airborne
    location: "Multiple National Parks",
    state: "MT,ND,SD,WY,ID",
    city: null,
    contract_value_min: 45000,
    contract_value_max: 55000,
    contract_type: "FFP",
    set_aside_type: "HUBZone",
    posted_date: new Date("2025-08-30"),
    deadline_date: new Date("2025-09-28"),
    response_date: new Date("2025-09-23"),
    solicitation_number: "DOI-NPS-RADIO-2025-001",
    source_url: "https://sam.gov/opp/doi-nps-radio-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Cleaning Supplies - Janitorial Products",
    description: "Annual contract for janitorial supplies for federal building maintenance. Items include: all-purpose cleaners (500 gallons), disinfectants (300 gallons), floor wax (200 gallons), paper towels (2000 rolls), toilet paper (1500 rolls), trash bags (5000 count). All products must be EPA certified green cleaning products. Monthly delivery schedule.",
    agency: "General Services Administration",
    naics_codes: "325612,424690",
    psc_codes: "7930",  // Cleaning Equipment and Supplies
    location: "Seattle, WA",
    state: "WA",
    city: "Seattle",
    contract_value_min: 85000,
    contract_value_max: 105000,
    contract_type: "IDIQ",
    set_aside_type: "SDVOSB",
    posted_date: new Date("2025-09-01"),
    deadline_date: new Date("2025-09-29"),
    response_date: new Date("2025-09-24"),
    solicitation_number: "GSA-CLEAN-SUPP-2025-001",
    source_url: "https://sam.gov/opp/gsa-clean-supp-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Fire Safety Equipment - Portable Fire Extinguishers",
    description: "Purchase of 50 portable fire extinguishers for federal facilities. Type ABC dry chemical, 5-lb capacity, UL listed, wall-mounting brackets included. Annual inspection and maintenance service for 3 years included. Must comply with NFPA standards. Delivery and installation at 5 different buildings. Certification training for facility staff included.",
    agency: "General Services Administration",
    naics_codes: "332999,423850",
    psc_codes: "4210",  // Fire Fighting Equipment
    location: "Phoenix, AZ",
    state: "AZ",
    city: "Phoenix",
    contract_value_min: 18000,
    contract_value_max: 25000,
    contract_type: "FFP",
    set_aside_type: "Small Business",
    posted_date: new Date("2025-08-29"),
    deadline_date: new Date("2025-09-26"),
    response_date: new Date("2025-09-21"),
    solicitation_number: "GSA-FIRE-EXT-2025-001",
    source_url: "https://sam.gov/opp/gsa-fire-ext-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  }
]

async function main() {
  console.log('🛒 Product RFQ Database Seeding')
  console.log('===============================')
  
  const args = process.argv.slice(2)
  const CLEAR_FLAG = args.includes('--clear') || args.includes('-c')
  
  try {
    // Check existing data
    const existingCount = await db.rfq.count()
    console.log(`📊 Current RFQs in database: ${existingCount}`)
    
    if (existingCount > 0 && !CLEAR_FLAG) {
      console.log('\n⚠️  RFQs already exist!')
      console.log('Use --clear to replace with product RFQs')
      console.log('Example: npx tsx scripts/seed-product-rfqs.ts --clear')
      return
    }
    
    // Clear existing data if requested
    if (CLEAR_FLAG) {
      console.log('🗑️  Clearing existing RFQ data...')
      await db.rfqMatchScore.deleteMany({})
      await db.rfqStatus.deleteMany({})
      await db.savedRfq.deleteMany({})
      await db.rfq.deleteMany({})
      console.log('✅ Existing data cleared')
    }
    
    // Seed Product RFQ data
    console.log(`\n🚀 Creating ${PRODUCT_RFQS.length} product RFQs...`)
    
    const results: any[] = []
    const errors: any[] = []
    
    for (const rfqData of PRODUCT_RFQS) {
      try {
        const rfq = await db.rfq.create({
          data: rfqData
        })
        
        results.push(rfq)
        console.log(`✅ Created: ${rfq.title} (PSC: ${rfq.psc_codes})`)
        
      } catch (error) {
        const errorMsg = `Error creating product RFQ: ${rfqData.title}`
        console.error(`❌ ${errorMsg}`, error)
        errors.push({ rfq: rfqData.title, error: errorMsg })
      }
    }
    
    console.log(`\n🎉 Successfully created ${results.length} product RFQs`)
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred during seeding`)
    }
    
    // Show sample Product RFQs
    const sampleRfqs = await db.rfq.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        agency: true,
        psc_codes: true,
        deadline_date: true,
        contract_value_min: true,
        contract_value_max: true,
        location: true
      },
      orderBy: { contract_value_max: 'desc' }
    })
    
    console.log('\n🛒 Sample Product RFQs Created:')
    sampleRfqs.forEach((rfq, index) => {
      const valueRange = rfq.contract_value_min && rfq.contract_value_max 
        ? `$${(Number(rfq.contract_value_min) / 1000).toFixed(0)}K-$${(Number(rfq.contract_value_max) / 1000).toFixed(0)}K`
        : 'Value TBD'
      console.log(`${index + 1}. ${rfq.title}`)
      console.log(`   Agency: ${rfq.agency}`)
      console.log(`   PSC Code: ${rfq.psc_codes} (Product Code)`)
      console.log(`   Value: ${valueRange}`)
      console.log(`   Location: ${rfq.location}`)
      console.log(`   Deadline: ${rfq.deadline_date.toDateString()}`)
      console.log('')
    })
    
    console.log('✅ Product RFQ database ready!')
    console.log('\n🎯 These are now REAL product RFQs with proper PSC codes:')
    console.log('- 6515: Medical/Surgical Supplies')
    console.log('- 7021: Computer Equipment') 
    console.log('- 7105: Office Furniture')
    console.log('- 5895: Security Equipment')
    console.log('- 6640: Laboratory Equipment')
    console.log('- 2310: Vehicles')
    console.log('- 5610: Construction Materials')
    console.log('- 5820: Communication Equipment')
    console.log('- 7930: Cleaning Supplies')
    console.log('- 4210: Fire Safety Equipment')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run the seed function
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Product RFQ seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Product RFQ seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { main }