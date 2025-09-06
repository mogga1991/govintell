import { ProductRequirement, ProductMatch } from '@/types/product-research'
import { RfqWithRelations } from '@/types/rfq'

export interface DetailedSpecification {
  category: string
  requirement: string
  value: string | number
  unit?: string
  isMandatory: boolean
  complianceStandard?: string
  toleranceAllowed: boolean
  exactMatchRequired: boolean
  govRegulation?: string
}

export interface ComplianceRequirement {
  type: 'certification' | 'standard' | 'regulation' | 'security' | 'environmental'
  name: string
  description: string
  mandatory: boolean
  verificationRequired: boolean
  documentationNeeded: string[]
}

export interface DeliveryRequirement {
  location: string
  timeframe: string
  installationRequired: boolean
  trainingRequired: boolean
  supportLevel: string
  warrantyMinimum: string
}

export class ComprehensiveRFQAnalyzer {
  
  /**
   * Performs deep, comprehensive analysis of entire RFQ text
   */
  async analyzeCompleteRFQ(rfq: RfqWithRelations): Promise<{
    requirements: ProductRequirement[]
    specifications: DetailedSpecification[]
    compliance: ComplianceRequirement[]
    delivery: DeliveryRequirement[]
    criticalKeywords: string[]
    exactPhrases: string[]
    governmentStandards: string[]
  }> {
    
    const fullText = this.extractAllRFQText(rfq)
    
    return {
      requirements: await this.extractDetailedRequirements(fullText, rfq),
      specifications: this.parseDetailedSpecifications(fullText),
      compliance: this.identifyComplianceRequirements(fullText),
      delivery: this.extractDeliveryRequirements(fullText),
      criticalKeywords: this.extractCriticalKeywords(fullText),
      exactPhrases: this.extractExactPhrases(fullText),
      governmentStandards: this.identifyGovernmentStandards(fullText)
    }
  }
  
  /**
   * Extract ALL text from RFQ - title, description, and any additional fields
   */
  private extractAllRFQText(rfq: RfqWithRelations): string {
    const textParts = [
      rfq.title,
      rfq.description,
      rfq.solicitation_number,
      rfq.agency,
      `Location: ${rfq.location}`,
      rfq.state ? `State: ${rfq.state}` : '',
      rfq.city ? `City: ${rfq.city}` : '',
      rfq.contract_type ? `Contract Type: ${rfq.contract_type}` : '',
      rfq.set_aside_type ? `Set Aside: ${rfq.set_aside_type}` : '',
      `NAICS: ${rfq.naics_codes}`,
      rfq.psc_codes ? `PSC: ${rfq.psc_codes}` : '',
      `Deadline: ${rfq.deadline_date}`,
      `Posted: ${rfq.posted_date}`,
      `Status: ${rfq.status}`
    ].filter(Boolean)
    
    return textParts.join('\n\n')
  }
  
  /**
   * Enhanced requirement extraction with exact specification focus
   */
  private async extractDetailedRequirements(fullText: string, rfq: RfqWithRelations): Promise<ProductRequirement[]> {
    const requirements: ProductRequirement[] = []
    const text = fullText.toLowerCase()
    
    // Technology Requirements - Enhanced with exact specs
    if (this.containsExactPhrases(text, ['cloud migration', 'infrastructure modernization', 'system upgrade'])) {
      const specs = this.extractTechnicalSpecifications(fullText)
      requirements.push({
        id: '',
        name: this.extractExactProductName(fullText, 'cloud') || 'Cloud Infrastructure Services',
        description: this.extractDetailedDescription(fullText, 'cloud'),
        category: 'Cloud Services',
        specifications: specs,
        quantity: this.extractExactQuantity(fullText, ['instance', 'server', 'license']) || 1,
        unitType: this.extractExactUnit(fullText) || 'service',
        keywords: this.extractExactTerms(fullText, 'cloud'),
        priority: this.determinePriority(fullText, 'cloud')
      })
    }
    
    // Software Requirements - Exact version matching
    if (this.containsExactPhrases(text, ['software', 'application', 'license', 'platform'])) {
      const softwareSpecs = this.extractSoftwareSpecifications(fullText)
      requirements.push({
        id: '',
        name: this.extractExactProductName(fullText, 'software') || 'Software Application',
        description: this.extractDetailedDescription(fullText, 'software'),
        category: 'Software',
        specifications: {
          ...softwareSpecs,
          'Exact Version': this.extractVersionRequirements(fullText),
          'License Type': this.extractLicenseType(fullText),
          'User Count': this.extractUserCount(fullText),
          'Deployment Model': this.extractDeploymentModel(fullText)
        },
        quantity: this.extractExactQuantity(fullText, ['license', 'user', 'seat']) || 1,
        unitType: 'license',
        keywords: this.extractExactTerms(fullText, 'software'),
        priority: this.determinePriority(fullText, 'software')
      })
    }
    
    // Hardware Requirements - Exact model specifications
    if (this.containsExactPhrases(text, ['server', 'computer', 'hardware', 'equipment'])) {
      const hardwareSpecs = this.extractHardwareSpecifications(fullText)
      requirements.push({
        id: '',
        name: this.extractExactProductName(fullText, 'hardware') || 'Hardware Equipment',
        description: this.extractDetailedDescription(fullText, 'hardware'),
        category: 'Hardware',
        specifications: {
          ...hardwareSpecs,
          'Exact Model': this.extractModelNumbers(fullText),
          'CPU Requirements': this.extractCPUSpecs(fullText),
          'Memory Requirements': this.extractMemorySpecs(fullText),
          'Storage Requirements': this.extractStorageSpecs(fullText),
          'Form Factor': this.extractFormFactor(fullText)
        },
        quantity: this.extractExactQuantity(fullText, ['unit', 'each', 'device']) || 1,
        unitType: 'each',
        keywords: this.extractExactTerms(fullText, 'hardware'),
        priority: this.determinePriority(fullText, 'hardware')
      })
    }
    
    // Medical Equipment - FDA compliance critical
    if (this.containsExactPhrases(text, ['medical', 'healthcare', 'patient', 'clinical', 'diagnostic'])) {
      const medicalSpecs = this.extractMedicalSpecifications(fullText)
      requirements.push({
        id: '',
        name: this.extractExactProductName(fullText, 'medical') || 'Medical Equipment',
        description: this.extractDetailedDescription(fullText, 'medical'),
        category: 'Medical Equipment',
        specifications: {
          ...medicalSpecs,
          'FDA Approval Number': this.extractFDAApproval(fullText),
          'Medical Device Class': this.extractDeviceClass(fullText),
          'HIPAA Compliance': 'Required',
          'Calibration Requirements': this.extractCalibrationSpecs(fullText),
          'Sterilization Method': this.extractSterilizationReqs(fullText)
        },
        quantity: this.extractExactQuantity(fullText, ['unit', 'device', 'system']) || 1,
        unitType: 'each',
        keywords: this.extractExactTerms(fullText, 'medical'),
        priority: 'high'
      })
    }
    
    // Construction Materials - Exact building codes
    if (this.containsExactPhrases(text, ['construction', 'building', 'material', 'structural'])) {
      const constructionSpecs = this.extractConstructionSpecifications(fullText)
      requirements.push({
        id: '',
        name: this.extractExactProductName(fullText, 'construction') || 'Construction Materials',
        description: this.extractDetailedDescription(fullText, 'construction'),
        category: 'Construction Materials',
        specifications: {
          ...constructionSpecs,
          'Building Code Compliance': this.extractBuildingCodes(fullText),
          'Material Grade': this.extractMaterialGrade(fullText),
          'Load Requirements': this.extractLoadSpecs(fullText),
          'Environmental Rating': this.extractEnvironmentalRating(fullText),
          'Fire Rating': this.extractFireRating(fullText)
        },
        quantity: this.extractExactQuantity(fullText, ['ton', 'cubic', 'linear', 'square']) || 1,
        unitType: this.extractConstructionUnit(fullText),
        keywords: this.extractExactTerms(fullText, 'construction'),
        priority: this.determinePriority(fullText, 'construction')
      })
    }
    
    return requirements.map((req, index) => ({
      ...req,
      id: `detailed-req-${rfq.id}-${index + 1}`
    }))
  }
  
  /**
   * Parse detailed specifications from text with exact values
   */
  private parseDetailedSpecifications(text: string): DetailedSpecification[] {
    const specs: DetailedSpecification[] = []
    
    // Technical specifications patterns
    const specPatterns = [
      // CPU specifications
      /(?:cpu|processor):\s*([^\n\r.]+)/gi,
      /(?:minimum|min)\s+(?:cpu|processor):\s*([^\n\r.]+)/gi,
      
      // Memory specifications  
      /(?:memory|ram):\s*(\d+\s*(?:gb|mb|tb))/gi,
      /(?:minimum|min)\s+(?:memory|ram):\s*(\d+\s*(?:gb|mb|tb))/gi,
      
      // Storage specifications
      /(?:storage|disk|hard drive):\s*(\d+\s*(?:gb|mb|tb))/gi,
      /(?:ssd|solid state):\s*(\d+\s*(?:gb|mb|tb))/gi,
      
      // Version requirements
      /(?:version|ver\.?)\s*(\d+\.?\d*\.?\d*)/gi,
      /(?:minimum|min)\s+version:\s*([^\n\r.]+)/gi,
      
      // Compliance requirements
      /(?:fda|510\(k\)|ce mark|ul listed|nist|fips|common criteria)[\s:]([^\n\r.]+)/gi,
      
      // Performance specifications
      /(?:performance|speed|throughput):\s*([^\n\r.]+)/gi,
      /(?:minimum|max|maximum)\s+([^\n\r:]+):\s*([^\n\r.]+)/gi
    ]
    
    specPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        specs.push({
          category: this.categorizeSpec(match[0]),
          requirement: match[0].split(':')[0].trim(),
          value: match[1].trim(),
          isMandatory: this.isMandatorySpec(match[0]),
          toleranceAllowed: this.allowsTolerance(match[0]),
          exactMatchRequired: this.requiresExactMatch(match[0])
        })
      }
    })
    
    return specs
  }
  
  /**
   * Identify all compliance requirements
   */
  private identifyComplianceRequirements(text: string): ComplianceRequirement[] {
    const compliance: ComplianceRequirement[] = []
    
    // Security clearance requirements
    if (/secret|top secret|confidential|security clearance/i.test(text)) {
      compliance.push({
        type: 'security',
        name: 'Security Clearance Required',
        description: this.extractSecurityLevel(text),
        mandatory: true,
        verificationRequired: true,
        documentationNeeded: ['Personnel Security Investigation', 'Clearance Certificate']
      })
    }
    
    // FISMA compliance
    if (/fisma|federal information security/i.test(text)) {
      compliance.push({
        type: 'security',
        name: 'FISMA Compliance',
        description: 'Federal Information Security Management Act compliance required',
        mandatory: true,
        verificationRequired: true,
        documentationNeeded: ['FISMA Compliance Certificate', 'Security Assessment Report']
      })
    }
    
    // FedRAMP compliance
    if (/fedramp/i.test(text)) {
      compliance.push({
        type: 'security',
        name: 'FedRAMP Authorization',
        description: this.extractFedRAMPLevel(text),
        mandatory: true,
        verificationRequired: true,
        documentationNeeded: ['FedRAMP Authorization Letter', 'Security Package']
      })
    }
    
    // HIPAA compliance
    if (/hipaa/i.test(text)) {
      compliance.push({
        type: 'regulation',
        name: 'HIPAA Compliance',
        description: 'Health Insurance Portability and Accountability Act compliance',
        mandatory: true,
        verificationRequired: true,
        documentationNeeded: ['HIPAA Compliance Assessment', 'Business Associate Agreement']
      })
    }
    
    // FDA approval requirements
    if (/fda|510\(k\)|medical device/i.test(text)) {
      compliance.push({
        type: 'certification',
        name: 'FDA Approval',
        description: this.extractFDARequirements(text),
        mandatory: true,
        verificationRequired: true,
        documentationNeeded: ['FDA 510(k) Clearance', 'Quality System Certificate']
      })
    }
    
    return compliance
  }
  
  /**
   * Extract exact delivery and performance requirements
   */
  private extractDeliveryRequirements(text: string): DeliveryRequirement[] {
    const deliveries: DeliveryRequirement[] = []
    
    // Extract delivery locations
    const locations = this.extractDeliveryLocations(text)
    const timeframes = this.extractDeliveryTimeframes(text)
    
    locations.forEach((location, index) => {
      deliveries.push({
        location,
        timeframe: timeframes[index] || this.extractGeneralTimeframe(text),
        installationRequired: /installation|install|setup|deploy/i.test(text),
        trainingRequired: /training|instruction|education/i.test(text),
        supportLevel: this.extractSupportLevel(text),
        warrantyMinimum: this.extractWarrantyRequirements(text)
      })
    })
    
    return deliveries
  }
  
  // Helper methods for exact extraction
  private containsExactPhrases(text: string, phrases: string[]): boolean {
    return phrases.some(phrase => {
      const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'i')
      return regex.test(text)
    })
  }
  
  private extractExactProductName(text: string, category: string): string | null {
    // Look for exact product names in quotes or after "shall be" patterns
    const patterns = [
      new RegExp(`"([^"]*${category}[^"]*)"`, 'i'),
      new RegExp(`shall be\\s+([^.]+${category}[^.]+)`, 'i'),
      new RegExp(`must be\\s+([^.]+${category}[^.]+)`, 'i'),
      new RegExp(`required:\\s*([^.\\n]+${category}[^.\\n]+)`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    
    return null
  }
  
  private extractDetailedDescription(text: string, keyword: string): string {
    // Extract surrounding context for detailed description
    const sentences = text.split(/[.!?]+/)
    const relevantSentences = sentences.filter(sentence => 
      sentence.toLowerCase().includes(keyword)
    )
    
    return relevantSentences.slice(0, 3).join('. ').trim()
  }
  
  private extractExactQuantity(text: string, units: string[]): number | undefined {
    for (const unit of units) {
      const patterns = [
        new RegExp(`exactly\\s+(\\d+)\\s+${unit}`, 'i'),
        new RegExp(`precisely\\s+(\\d+)\\s+${unit}`, 'i'),
        new RegExp(`(\\d+)\\s+${unit}\\s+(?:required|needed|shall|must)`, 'i'),
        new RegExp(`quantity[:\\s]+(\\d+)\\s+${unit}`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) return parseInt(match[1])
      }
    }
    
    return undefined
  }
  
  private extractVersionRequirements(text: string): string {
    const versionPatterns = [
      /version\s+(\d+\.?\d*\.?\d*)/i,
      /v(\d+\.?\d*\.?\d*)/i,
      /minimum version:\s*([^\n\r.]+)/i,
      /latest version/i
    ]
    
    for (const pattern of versionPatterns) {
      const match = text.match(pattern)
      if (match) return match[1] || match[0]
    }
    
    return 'Latest stable version'
  }
  
  private extractModelNumbers(text: string): string {
    const modelPatterns = [
      /model\s+([A-Z0-9\-]+)/i,
      /part number\s*[:\s]+([A-Z0-9\-]+)/i,
      /p\/n[:\s]+([A-Z0-9\-]+)/i,
      /sku[:\s]+([A-Z0-9\-]+)/i
    ]
    
    for (const pattern of modelPatterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    
    return 'As specified in solicitation'
  }
  
  private extractCPUSpecs(text: string): string {
    const cpuPatterns = [
      /cpu:\s*([^\n\r.]+)/i,
      /processor:\s*([^\n\r.]+)/i,
      /minimum\s+(\d+\.?\d*\s*ghz)/i,
      /(intel|amd)\s+([^\n\r.]+)/i
    ]
    
    for (const pattern of cpuPatterns) {
      const match = text.match(pattern)
      if (match) return match[1] || `${match[1]} ${match[2]}`
    }
    
    return 'As specified in solicitation'
  }
  
  private extractMemorySpecs(text: string): string {
    const memoryMatch = text.match(/(?:memory|ram):\s*(\d+\s*(?:gb|mb|tb))/i)
    return memoryMatch ? memoryMatch[1] : 'As specified in solicitation'
  }
  
  private extractStorageSpecs(text: string): string {
    const storageMatch = text.match(/(?:storage|disk):\s*(\d+\s*(?:gb|mb|tb))/i)
    return storageMatch ? storageMatch[1] : 'As specified in solicitation'
  }
  
  private isMandatorySpec(spec: string): boolean {
    return /shall|must|required|mandatory/i.test(spec)
  }
  
  private requiresExactMatch(spec: string): boolean {
    return /exact|precisely|specifically|only|solely/i.test(spec)
  }
  
  private allowsTolerance(spec: string): boolean {
    return /approximately|about|around|±|tolerance|acceptable range/i.test(spec)
  }
  
  private determinePriority(text: string, keyword: string): 'high' | 'medium' | 'low' {
    const context = this.getContextAround(text, keyword, 100)
    if (/critical|essential|mandatory|required|shall|must/i.test(context)) {
      return 'high'
    } else if (/preferred|desired|should/i.test(context)) {
      return 'medium'
    }
    return 'low'
  }
  
  private getContextAround(text: string, keyword: string, chars: number): string {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase())
    if (index === -1) return ''
    
    const start = Math.max(0, index - chars)
    const end = Math.min(text.length, index + keyword.length + chars)
    
    return text.slice(start, end)
  }
  
  private extractExactTerms(text: string, category: string): string[] {
    // Extract terms that appear in context with category
    const words = text.toLowerCase().split(/\s+/)
    const categoryIndex = words.findIndex(word => word.includes(category))
    
    if (categoryIndex === -1) return [category]
    
    const contextWords = words.slice(
      Math.max(0, categoryIndex - 5),
      Math.min(words.length, categoryIndex + 5)
    )
    
    return contextWords
      .filter(word => word.length > 3)
      .filter(word => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word))
      .slice(0, 8)
  }
  
  // Additional extraction methods would continue here for all specific requirements...
  private categorizeSpec(spec: string): string {
    if (/cpu|processor/i.test(spec)) return 'Performance'
    if (/memory|ram/i.test(spec)) return 'Hardware'
    if (/version/i.test(spec)) return 'Software'
    if (/fda|compliance/i.test(spec)) return 'Regulatory'
    return 'General'
  }
  
  private extractCriticalKeywords(text: string): string[] {
    // Extract words that appear with mandatory language
    const criticalPhrases = text.match(/(?:shall|must|required|mandatory)[^.!?]*[.!?]/gi) || []
    
    const keywords = criticalPhrases
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !/^(shall|must|required|mandatory|the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word))
    
    // Return unique keywords
    return [...new Set(keywords)]
  }
  
  private extractExactPhrases(text: string): string[] {
    // Extract phrases in quotes or after "exactly" or "specifically"
    const quotedPhrases = text.match(/"([^"]+)"/g) || []
    const exactPhrases = text.match(/(?:exactly|specifically|precisely)\s+([^.!?]+)/gi) || []
    
    return [...quotedPhrases, ...exactPhrases]
      .map(phrase => phrase.replace(/^["']|["']$/g, ''))
      .map(phrase => phrase.replace(/^(exactly|specifically|precisely)\s+/i, ''))
  }
  
  private identifyGovernmentStandards(text: string): string[] {
    const standards = []
    const standardPatterns = [
      /FIPS\s+\d+/gi,
      /NIST\s+[\w\-]+/gi,
      /ISO\s+\d+/gi,
      /ANSI\s+[\w\-]+/gi,
      /IEEE\s+[\w\-]+/gi,
      /FedRAMP/gi,
      /FISMA/gi,
      /HIPAA/gi,
      /SOX/gi,
      /510\(k\)/gi
    ]
    
    standardPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) standards.push(...matches)
    })
    
    return [...new Set(standards)]
  }
  
  // Placeholder methods for additional extraction functionality
  private extractTechnicalSpecifications(text: string): Record<string, string> { return {} }
  private extractSoftwareSpecifications(text: string): Record<string, string> { return {} }
  private extractHardwareSpecifications(text: string): Record<string, string> { return {} }
  private extractMedicalSpecifications(text: string): Record<string, string> { return {} }
  private extractConstructionSpecifications(text: string): Record<string, string> { return {} }
  private extractExactUnit(text: string): string { return 'each' }
  private extractLicenseType(text: string): string { return 'Enterprise' }
  private extractUserCount(text: string): string { return 'As specified' }
  private extractDeploymentModel(text: string): string { return 'As specified' }
  private extractFormFactor(text: string): string { return 'As specified' }
  private extractFDAApproval(text: string): string { return 'Required' }
  private extractDeviceClass(text: string): string { return 'As specified' }
  private extractCalibrationSpecs(text: string): string { return 'As specified' }
  private extractSterilizationReqs(text: string): string { return 'As specified' }
  private extractBuildingCodes(text: string): string { return 'Local building codes' }
  private extractMaterialGrade(text: string): string { return 'Commercial grade' }
  private extractLoadSpecs(text: string): string { return 'As specified' }
  private extractEnvironmentalRating(text: string): string { return 'As specified' }
  private extractFireRating(text: string): string { return 'As specified' }
  private extractConstructionUnit(text: string): string { return 'unit' }
  private extractSecurityLevel(text: string): string { return 'As specified in solicitation' }
  private extractFedRAMPLevel(text: string): string { return 'As specified' }
  private extractFDARequirements(text: string): string { return 'FDA approval required' }
  private extractDeliveryLocations(text: string): string[] { return ['As specified'] }
  private extractDeliveryTimeframes(text: string): string[] { return ['As specified'] }
  private extractGeneralTimeframe(text: string): string { return 'As specified' }
  private extractSupportLevel(text: string): string { return 'As specified' }
  private extractWarrantyRequirements(text: string): string { return 'As specified' }
}

export const comprehensiveRFQAnalyzer = new ComprehensiveRFQAnalyzer()