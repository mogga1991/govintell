#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

export {}

const db = new PrismaClient()

// Enhanced RFQ sample data  
const SAMPLE_RFQS = [
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
    posted_date: new Date("2025-09-01"),
    deadline_date: new Date("2025-10-15"),
    response_date: new Date("2025-10-10"),
    solicitation_number: "DOC-IT-2025-001",
    source_url: "https://sam.gov/opp/doc-it-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
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
    set_aside_type: null,
    posted_date: new Date("2025-09-01"),
    deadline_date: new Date("2025-12-01"),
    response_date: new Date("2025-11-25"),
    solicitation_number: "DOE-CLOUD-2025-001",
    source_url: "https://sam.gov/opp/doe-cloud-2025-001",
    source_system: "SAM.gov",
    status: "Open"
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
    set_aside_type: null,
    posted_date: new Date("2025-08-15"),
    deadline_date: new Date("2025-11-30"),
    response_date: new Date("2025-11-25"),
    solicitation_number: "GSA-CON-2025-TX-001",
    source_url: "https://sam.gov/opp/gsa-con-2025-tx-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Cybersecurity Consulting Services",
    description: "Comprehensive cybersecurity assessment and implementation services for Department of Homeland Security facilities. Services include penetration testing, vulnerability assessments, security protocol development, staff training, and ongoing monitoring. Must have current security clearances.",
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
    source_system: "SAM.gov",
    status: "Open"
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
    set_aside_type: null,
    posted_date: new Date("2025-08-31"),
    deadline_date: new Date("2025-11-18"),
    response_date: new Date("2025-11-13"),
    solicitation_number: "DARPA-AI-2025-001",
    source_url: "https://sam.gov/opp/darpa-ai-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Medical Equipment Maintenance Services", 
    description: "Preventive and corrective maintenance services for medical equipment across 15 VA medical centers. Includes calibration, repairs, replacement parts, and 24/7 emergency support for critical care equipment. Contractor must be FDA certified and have experience with major medical equipment manufacturers.",
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
    source_system: "SAM.gov",
    status: "Open"
  },
  {
    title: "Environmental Consulting and Remediation",
    description: "Environmental assessment and remediation services for former military installations. Work includes soil and groundwater testing, contamination assessment, cleanup planning, and ongoing monitoring. Requires experience with hazardous materials and EPA regulations.",
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
    source_system: "SAM.gov",
    status: "Open"
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
    set_aside_type: null,
    posted_date: new Date("2025-08-26"),
    deadline_date: new Date("2025-12-12"),
    response_date: new Date("2025-12-07"),
    solicitation_number: "DLA-SUPPLY-2025-001",
    source_url: "https://sam.gov/opp/dla-supply-2025-001",
    source_system: "SAM.gov",
    status: "Open"
  }
]

async function seedMatchingScores(userId = 'sample-user-1') {
  console.log('\n🎯 Seeding sample matching scores...')
  
  try {
    const rfqs = await db.rfq.findMany({ take: 10 })
    
    for (const rfq of rfqs) {
      // Generate realistic matching scores based on RFQ characteristics
      const baseScore = Math.floor(Math.random() * 40) + 60 // 60-100 range
      
      await db.rfqMatchScore.upsert({
        where: {
          userId_rfqId: {
            userId: userId,
            rfqId: rfq.id
          }
        },
        update: {},
        create: {
          userId: userId,
          rfqId: rfq.id,
          overall_score: baseScore,
          naics_score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
          psc_score: Math.min(100, baseScore + Math.floor(Math.random() * 15) - 7),
          location_score: Math.floor(Math.random() * 40) + 60,
          value_score: Math.floor(Math.random() * 30) + 70,
          experience_score: Math.floor(Math.random() * 35) + 65
        }
      })
    }
    
    console.log(`✅ Created matching scores for ${rfqs.length} RFQs`)
  } catch (error) {
    console.error('❌ Error seeding matching scores:', error)
  }
}

async function seedUserRfqTracking(userId = 'sample-user-1') {
  console.log('\n💾 Seeding sample user RFQ tracking data...')
  
  try {
    const rfqs = await db.rfq.findMany({ take: 8 })
    const statuses = ['watched', 'applied', 'submitted', 'won', 'lost']
    
    for (let i = 0; i < rfqs.length; i++) {
      const rfq = rfqs[i]
      const status = statuses[i % statuses.length]
      
      await db.rfqStatus.upsert({
        where: {
          userId_rfqId: {
            userId: userId,
            rfqId: rfq.id
          }
        },
        update: {},
        create: {
          userId: userId,
          rfqId: rfq.id,
          status: status,
          notes: `Sample tracking for ${rfq.title}`,
          applied_date: status !== 'watched' ? new Date() : null,
          submission_date: ['submitted', 'won', 'lost'].includes(status) ? new Date() : null,
          award_date: status === 'won' ? new Date() : null,
          contract_value: status === 'won' ? rfq.contract_value_min : null,
          confidence_score: Math.floor(Math.random() * 5) + 6 // 6-10 range
        }
      })
      
      // Also create saved RFQ entries for some items
      if (i < 5) {
        await db.savedRfq.upsert({
          where: {
            userId_rfqId: {
              userId: userId,
              rfqId: rfq.id
            }
          },
          update: {},
          create: {
            userId: userId,
            rfqId: rfq.id,
            folder: i < 2 ? 'High Priority' : i < 4 ? 'Research' : null,
            notes: `Saved: ${rfq.title}`,
            priority: ['High', 'Medium', 'Low'][i % 3]
          }
        })
      }
    }
    
    console.log(`✅ Created tracking data for ${rfqs.length} RFQs`)
  } catch (error) {
    console.error('❌ Error seeding user tracking:', error)
  }
}

async function main() {
  console.log('🌱 Enhanced RFQ Database Seeding')
  console.log('================================')
  
  const args = process.argv.slice(2)
  const CLEAR_FLAG = args.includes('--clear') || args.includes('-c')
  
  try {
    // Check existing data
    const existingCount = await db.rfq.count()
    console.log(`📊 Current RFQs in database: ${existingCount}`)
    
    if (existingCount > 0 && !CLEAR_FLAG) {
      console.log('\n⚠️  RFQs already exist!')
      console.log('Use --clear to delete existing data')
      console.log('Example: node scripts/seed-rfqs-simple.js --clear')
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
    
    // Seed RFQ data
    console.log(`\n🚀 Creating ${SAMPLE_RFQS.length} sample RFQs...`)
    
    const results: any[] = []
    const errors: any[] = []
    
    for (const rfqData of SAMPLE_RFQS) {
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
          data: rfqData
        })
        
        results.push(rfq)
        console.log(`✅ Created: ${rfq.title} (${rfq.solicitation_number})`)
        
      } catch (error) {
        const errorMsg = `Error creating RFQ ${rfqData.solicitation_number}: ${rfqData.title}`
        console.error(`❌ ${errorMsg}`, error)
        errors.push({ rfq: rfqData.solicitation_number, error: errorMsg })
      }
    }
    
    console.log(`\n🎉 Successfully created ${results.length} RFQs`)
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred during seeding`)
    }
    
    // Seed related data
    if (results.length > 0) {
      await seedMatchingScores()
      await seedUserRfqTracking()
    }
    
    // Show sample RFQs
    const sampleRfqs = await db.rfq.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        agency: true,
        naics_codes: true,
        deadline_date: true,
        contract_value_min: true,
        contract_value_max: true,
        set_aside_type: true,
        location: true
      },
      orderBy: { deadline_date: 'asc' }
    })
    
    console.log('\n📋 Sample RFQs Created:')
    sampleRfqs.forEach((rfq, index) => {
      const valueRange = rfq.contract_value_min && rfq.contract_value_max 
        ? `$${(Number(rfq.contract_value_min) / 1000000).toFixed(1)}M-$${(Number(rfq.contract_value_max) / 1000000).toFixed(1)}M`
        : 'Value TBD'
      console.log(`${index + 1}. ${rfq.title}`)
      console.log(`   Agency: ${rfq.agency}`)
      console.log(`   Location: ${rfq.location}`)
      console.log(`   NAICS: ${rfq.naics_codes}`)
      console.log(`   Value: ${valueRange}`)
      if (rfq.set_aside_type) console.log(`   Set-Aside: ${rfq.set_aside_type}`)
      console.log(`   Deadline: ${rfq.deadline_date.toDateString()}`)
      console.log('')
    })
    
    // Summary
    console.log('🎉 Seeding Summary:')
    console.log(`- RFQs Created: ${results.length}/${SAMPLE_RFQS.length}`)
    if (errors.length > 0) {
      console.log(`- Failures: ${errors.length}`)
    }
    console.log('- Sample matching scores created')
    console.log('- Sample user tracking data created')
    console.log('\n✅ Database ready for testing!')
    
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
      console.log('✅ Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { main }