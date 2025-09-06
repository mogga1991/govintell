#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import { seedExtendedRfqData, SAMPLE_DATA_STATS } from '../lib/rfq-sample-data'

const db = new PrismaClient()

// Command line argument parsing
const args = process.argv.slice(2)
const CLEAR_FLAG = args.includes('--clear') || args.includes('-c')
const FORCE_FLAG = args.includes('--force') || args.includes('-f')
const VERBOSE_FLAG = args.includes('--verbose') || args.includes('-v')

async function seedMatchingScores(userId: string = 'sample-user-1') {
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

async function seedUserRfqTracking(userId: string = 'sample-user-1') {
  console.log('\n💾 Seeding sample user RFQ tracking data...')
  
  try {
    const rfqs = await db.rfq.findMany({ take: 8 })
    const statuses = ['watched', 'applied', 'submitted', 'won', 'lost'] as const
    
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
            priority: ['High', 'Medium', 'Low'][i % 3] as any
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
  
  if (VERBOSE_FLAG) {
    console.log('Flags:', { clear: CLEAR_FLAG, force: FORCE_FLAG, verbose: VERBOSE_FLAG })
  }
  
  try {
    // Check existing data
    const existingCount = await db.rfq.count()
    console.log(`📊 Current RFQs in database: ${existingCount}`)
    
    if (existingCount > 0 && !CLEAR_FLAG && !FORCE_FLAG) {
      console.log('\n⚠️  RFQs already exist!')
      console.log('Use --clear to delete existing data, or --force to add more data')
      console.log('Example: npm run seed-rfqs -- --clear')
      return
    }
    
    // Seed RFQ data
    console.log('\n🚀 Creating comprehensive RFQ dataset...')
    const seedResult = await seedExtendedRfqData(db, { 
      clearExisting: CLEAR_FLAG,
      batchSize: 5
    })
    
    console.log('\n📈 Enhanced Sample Data Statistics:')
    console.log(`- Total RFQs: ${SAMPLE_DATA_STATS.total_rfqs}`)
    console.log(`- Unique Agencies: ${SAMPLE_DATA_STATS.agencies.length}`)
    console.log(`- States Covered: ${SAMPLE_DATA_STATS.states.length}`)
    console.log(`- Contract Types: ${SAMPLE_DATA_STATS.contract_types.length}`)
    console.log(`- Set-Aside Types: ${SAMPLE_DATA_STATS.set_aside_types.length}`)
    console.log(`- NAICS Codes: ${SAMPLE_DATA_STATS.naics_codes.length}`)
    console.log(`- PSC Codes: ${SAMPLE_DATA_STATS.psc_codes.length}`)
    console.log(`- Value Range: $${(SAMPLE_DATA_STATS.total_value_range.min / 1000000).toFixed(1)}M - $${(SAMPLE_DATA_STATS.total_value_range.max / 1000000).toFixed(1)}M`)
    
    console.log('\n💰 Value Distribution:')
    console.log(`- Under $1M: ${SAMPLE_DATA_STATS.value_distribution.under_1m} RFQs`)
    console.log(`- $1M-$5M: ${SAMPLE_DATA_STATS.value_distribution['1m_5m']} RFQs`)
    console.log(`- $5M-$20M: ${SAMPLE_DATA_STATS.value_distribution['5m_20m']} RFQs`)
    console.log(`- Over $20M: ${SAMPLE_DATA_STATS.value_distribution.over_20m} RFQs`)
    
    // Seed related data
    if (seedResult.stats.created > 0) {
      await seedMatchingScores()
      await seedUserRfqTracking()
    }
    
    // Show sample RFQs
    const sampleRfqs = await db.rfq.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        agency: true,
        naics_codes: true,
        psc_codes: true,
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
      if (rfq.psc_codes) console.log(`   PSC: ${rfq.psc_codes}`)
      console.log(`   Value: ${valueRange}`)
      if (rfq.set_aside_type) console.log(`   Set-Aside: ${rfq.set_aside_type}`)
      console.log(`   Deadline: ${rfq.deadline_date.toDateString()}`)
      console.log('')
    })
    
    // Summary
    console.log('🎉 Seeding Summary:')
    console.log(`- RFQs Created: ${seedResult.stats.created}/${seedResult.stats.total}`)
    if (seedResult.stats.failed > 0) {
      console.log(`- Failures: ${seedResult.stats.failed}`)
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

export default main