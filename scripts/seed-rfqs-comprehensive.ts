import { PrismaClient } from '@prisma/client'
import { SAMPLE_RFQS, seedExtendedRfqData } from '../lib/rfq-sample-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive RFQ seeding...')
  
  try {
    // Seed RFQs using the enhanced seeding function
    const result = await seedExtendedRfqData(prisma, {
      clearExisting: process.argv.includes('--clear'),
      batchSize: 3
    })
    
    console.log('\n📊 Seeding Summary:')
    console.log(`✅ Successfully created: ${result.stats.created} RFQs`)
    console.log(`❌ Failed: ${result.stats.failed} RFQs`)
    console.log(`📝 Total processed: ${result.stats.total} RFQs`)
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:')
      result.errors.forEach(error => {
        console.log(`  - ${error.error}`)
      })
    }
    
    console.log('\n🎉 RFQ seeding completed!')
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('💥 Unexpected error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })