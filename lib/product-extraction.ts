import { ProductRequirement, ProductResearchResult } from '@/types/product-research'
import { RfqWithRelations } from '@/types/rfq'

export class ProductExtractionService {
  /**
   * Extract product requirements from RFQ description using AI analysis
   */
  async extractProductRequirements(rfq: RfqWithRelations): Promise<ProductRequirement[]> {
    const requirements: ProductRequirement[] = []
    
    const text = `${rfq.title}\n\n${rfq.description}`.toLowerCase()
    
    // Technology & Software products
    if (this.containsAnyKeywords(text, ['software', 'application', 'system', 'platform', 'cloud', 'saas', 'license'])) {
      requirements.push(...this.extractTechRequirements(rfq))
    }
    
    // Hardware & Equipment
    if (this.containsAnyKeywords(text, ['hardware', 'equipment', 'device', 'server', 'computer', 'laptop', 'tablet'])) {
      requirements.push(...this.extractHardwareRequirements(rfq))
    }
    
    // Medical Equipment
    if (this.containsAnyKeywords(text, ['medical', 'healthcare', 'diagnostic', 'patient', 'clinical', 'hospital'])) {
      requirements.push(...this.extractMedicalRequirements(rfq))
    }
    
    // Construction Materials
    if (this.containsAnyKeywords(text, ['construction', 'building', 'material', 'concrete', 'steel', 'lumber'])) {
      requirements.push(...this.extractConstructionRequirements(rfq))
    }
    
    // Office Supplies
    if (this.containsAnyKeywords(text, ['office', 'supplies', 'furniture', 'desk', 'chair', 'paper', 'printer'])) {
      requirements.push(...this.extractOfficeRequirements(rfq))
    }
    
    // Vehicles & Transportation
    if (this.containsAnyKeywords(text, ['vehicle', 'truck', 'car', 'van', 'fleet', 'transportation'])) {
      requirements.push(...this.extractVehicleRequirements(rfq))
    }
    
    // If no specific requirements found, create generic ones
    if (requirements.length === 0) {
      requirements.push(...this.extractGenericRequirements(rfq))
    }
    
    return requirements.map((req, index) => ({
      ...req,
      id: `req-${rfq.id}-${index + 1}`,
      keywords: [...new Set(req.keywords)] // Remove duplicates
    }))
  }
  
  private extractTechRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Cloud Services
    if (this.containsAnyKeywords(text, ['cloud', 'aws', 'azure', 'gcp', 'migration', 'hosting'])) {
      requirements.push({
        id: '',
        name: 'Cloud Infrastructure Services',
        description: 'Cloud hosting and infrastructure services for application migration',
        category: 'Cloud Services',
        specifications: {
          'Service Type': 'IaaS/PaaS',
          'Compliance': 'FedRAMP, SOC 2',
          'Support Level': '24/7'
        },
        quantity: 1,
        unitType: 'service',
        keywords: ['cloud', 'infrastructure', 'hosting', 'aws', 'azure', 'migration'],
        priority: 'high'
      })
    }
    
    // Software Development Tools
    if (this.containsAnyKeywords(text, ['development', 'programming', 'coding', 'ide', 'devops'])) {
      requirements.push({
        id: '',
        name: 'Software Development Platform',
        description: 'Development tools and platform licenses',
        category: 'Software',
        specifications: {
          'License Type': 'Enterprise',
          'Users': '50-500',
          'Support': 'Premium'
        },
        quantity: this.extractQuantity(text, ['license', 'user', 'seat']) || 50,
        unitType: 'license',
        keywords: ['development', 'ide', 'devops', 'programming', 'software'],
        priority: 'high'
      })
    }
    
    // Cybersecurity Solutions
    if (this.containsAnyKeywords(text, ['security', 'cyber', 'firewall', 'antivirus', 'protection'])) {
      requirements.push({
        id: '',
        name: 'Cybersecurity Solution',
        description: 'Enterprise cybersecurity and protection software',
        category: 'Security Software',
        specifications: {
          'Protection Level': 'Enterprise',
          'Compliance': 'FISMA, NIST',
          'Deployment': 'On-premise/Cloud'
        },
        quantity: 1,
        unitType: 'license',
        keywords: ['cybersecurity', 'firewall', 'antivirus', 'security', 'protection'],
        priority: 'high'
      })
    }
    
    return requirements
  }
  
  private extractHardwareRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Servers
    if (this.containsAnyKeywords(text, ['server', 'rack', 'blade', 'compute'])) {
      requirements.push({
        id: '',
        name: 'Enterprise Server',
        description: 'High-performance server for enterprise applications',
        category: 'Server Hardware',
        specifications: {
          'CPU': '2x Intel Xeon',
          'RAM': '64GB+',
          'Storage': '2TB SSD',
          'Form Factor': 'Rack Mount'
        },
        quantity: this.extractQuantity(text, ['server', 'unit', 'rack']) || 3,
        unitType: 'each',
        keywords: ['server', 'enterprise', 'rack', 'compute', 'hardware'],
        priority: 'high'
      })
    }
    
    // Computers/Laptops
    if (this.containsAnyKeywords(text, ['computer', 'laptop', 'desktop', 'workstation'])) {
      requirements.push({
        id: '',
        name: 'Business Laptops',
        description: 'Professional laptops for office workers',
        category: 'Computing Devices',
        specifications: {
          'CPU': 'Intel i5/i7 or AMD equivalent',
          'RAM': '16GB',
          'Storage': '512GB SSD',
          'OS': 'Windows 11 Pro'
        },
        quantity: this.extractQuantity(text, ['laptop', 'computer', 'unit', 'employee']) || 25,
        unitType: 'each',
        keywords: ['laptop', 'computer', 'business', 'workstation'],
        priority: 'medium'
      })
    }
    
    // Network Equipment
    if (this.containsAnyKeywords(text, ['network', 'switch', 'router', 'firewall', 'wifi'])) {
      requirements.push({
        id: '',
        name: 'Network Infrastructure',
        description: 'Network switches, routers, and wireless equipment',
        category: 'Network Hardware',
        specifications: {
          'Type': 'Managed Switch/Router',
          'Ports': '24-48 ports',
          'Speed': 'Gigabit',
          'Features': 'VLAN, QoS, Security'
        },
        quantity: this.extractQuantity(text, ['switch', 'router', 'unit']) || 5,
        unitType: 'each',
        keywords: ['network', 'switch', 'router', 'infrastructure', 'connectivity'],
        priority: 'medium'
      })
    }
    
    return requirements
  }
  
  private extractMedicalRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Medical Devices
    if (this.containsAnyKeywords(text, ['monitor', 'diagnostic', 'scanner', 'x-ray', 'mri'])) {
      requirements.push({
        id: '',
        name: 'Medical Monitoring Equipment',
        description: 'Patient monitoring and diagnostic equipment',
        category: 'Medical Devices',
        specifications: {
          'FDA Approval': 'Required',
          'Compliance': 'HIPAA, FDA 510(k)',
          'Warranty': '3-5 years',
          'Training': 'Included'
        },
        quantity: this.extractQuantity(text, ['unit', 'device', 'monitor']) || 10,
        unitType: 'each',
        keywords: ['medical', 'monitor', 'diagnostic', 'patient', 'healthcare'],
        priority: 'high'
      })
    }
    
    // Medical Supplies
    if (this.containsAnyKeywords(text, ['supplies', 'consumable', 'disposable', 'surgical'])) {
      requirements.push({
        id: '',
        name: 'Medical Supplies',
        description: 'Disposable medical supplies and consumables',
        category: 'Medical Supplies',
        specifications: {
          'Sterility': 'Sterile',
          'Packaging': 'Individual/Bulk',
          'Shelf Life': '2+ years',
          'Certification': 'FDA Approved'
        },
        quantity: this.extractQuantity(text, ['unit', 'box', 'case', 'supply']) || 100,
        unitType: 'case',
        keywords: ['medical', 'supplies', 'consumable', 'disposable', 'surgical'],
        priority: 'medium'
      })
    }
    
    return requirements
  }
  
  private extractConstructionRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Building Materials
    if (this.containsAnyKeywords(text, ['concrete', 'steel', 'lumber', 'material', 'structural'])) {
      requirements.push({
        id: '',
        name: 'Construction Materials',
        description: 'Structural building materials for construction project',
        category: 'Building Materials',
        specifications: {
          'Grade': 'Commercial/Industrial',
          'Compliance': 'Building Codes',
          'Delivery': 'Job Site',
          'Quality': 'Grade A'
        },
        quantity: this.extractQuantity(text, ['ton', 'cubic', 'linear', 'square']) || 100,
        unitType: 'ton',
        keywords: ['construction', 'materials', 'building', 'structural', 'commercial'],
        priority: 'high'
      })
    }
    
    // Tools & Equipment
    if (this.containsAnyKeywords(text, ['tools', 'equipment', 'machinery', 'crane', 'excavator'])) {
      requirements.push({
        id: '',
        name: 'Construction Equipment',
        description: 'Heavy machinery and construction equipment',
        category: 'Construction Equipment',
        specifications: {
          'Condition': 'New/Like New',
          'Warranty': '1-2 years',
          'Service': 'Included',
          'Training': 'Operator Training'
        },
        quantity: this.extractQuantity(text, ['unit', 'machine', 'equipment']) || 3,
        unitType: 'each',
        keywords: ['construction', 'equipment', 'machinery', 'tools', 'heavy'],
        priority: 'medium'
      })
    }
    
    return requirements
  }
  
  private extractOfficeRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Office Furniture
    if (this.containsAnyKeywords(text, ['furniture', 'desk', 'chair', 'table', 'cabinet'])) {
      requirements.push({
        id: '',
        name: 'Office Furniture',
        description: 'Professional office furniture and workstations',
        category: 'Office Furniture',
        specifications: {
          'Style': 'Modern/Professional',
          'Material': 'Commercial Grade',
          'Warranty': '5-10 years',
          'Assembly': 'Professional Installation'
        },
        quantity: this.extractQuantity(text, ['desk', 'chair', 'workstation', 'employee']) || 50,
        unitType: 'each',
        keywords: ['office', 'furniture', 'desk', 'chair', 'professional'],
        priority: 'medium'
      })
    }
    
    // Office Supplies
    if (this.containsAnyKeywords(text, ['supplies', 'paper', 'printer', 'ink', 'stationery'])) {
      requirements.push({
        id: '',
        name: 'Office Supplies',
        description: 'General office supplies and consumables',
        category: 'Office Supplies',
        specifications: {
          'Quality': 'Commercial Grade',
          'Packaging': 'Bulk/Individual',
          'Delivery': 'Monthly/Quarterly',
          'Brand': 'Name Brand Preferred'
        },
        quantity: this.extractQuantity(text, ['case', 'box', 'ream', 'pack']) || 50,
        unitType: 'case',
        keywords: ['office', 'supplies', 'paper', 'consumables', 'business'],
        priority: 'low'
      })
    }
    
    return requirements
  }
  
  private extractVehicleRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    if (this.containsAnyKeywords(text, ['vehicle', 'truck', 'car', 'van', 'fleet'])) {
      requirements.push({
        id: '',
        name: 'Fleet Vehicles',
        description: 'Government fleet vehicles for official use',
        category: 'Vehicles',
        specifications: {
          'Type': 'Sedan/SUV/Truck',
          'Fuel': 'Hybrid/Electric Preferred',
          'Features': 'Government Package',
          'Warranty': '3-5 years/60k miles'
        },
        quantity: this.extractQuantity(text, ['vehicle', 'car', 'truck', 'unit']) || 10,
        unitType: 'each',
        keywords: ['vehicle', 'fleet', 'government', 'transportation', 'automotive'],
        priority: 'high'
      })
    }
    
    return requirements
  }
  
  private extractGenericRequirements(rfq: RfqWithRelations): ProductRequirement[] {
    const requirements: ProductRequirement[] = []
    const text = `${rfq.title} ${rfq.description}`.toLowerCase()
    
    // Create a generic requirement based on the RFQ title
    const keywords = this.extractKeywords(text)
    const category = this.determineCategory(keywords)
    
    requirements.push({
      id: '',
      name: rfq.title.length > 50 ? rfq.title.substring(0, 47) + '...' : rfq.title,
      description: `Products and services required for: ${rfq.title}`,
      category: category,
      specifications: {
        'Quality': 'Commercial/Government Grade',
        'Compliance': 'Government Standards',
        'Delivery': 'As Required',
        'Documentation': 'Full Documentation Required'
      },
      quantity: 1,
      unitType: 'lot',
      keywords: keywords.slice(0, 8),
      priority: 'medium'
    })
    
    return requirements
  }
  
  private containsAnyKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword))
  }
  
  private extractQuantity(text: string, units: string[]): number | undefined {
    for (const unit of units) {
      const patterns = [
        new RegExp(`(\\d+)\\s*${unit}`, 'i'),
        new RegExp(`${unit}[s]?[:\\s]+(\\d+)`, 'i'),
        new RegExp(`(\\d+)\\s*${unit}[s]?`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          return parseInt(match[1])
        }
      }
    }
    return undefined
  }
  
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'])
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10)
  }
  
  private determineCategory(keywords: string[]): string {
    const categories = {
      'Technology': ['software', 'system', 'computer', 'digital', 'data', 'cloud', 'platform'],
      'Medical': ['medical', 'health', 'patient', 'clinical', 'diagnostic', 'healthcare'],
      'Construction': ['building', 'construction', 'facility', 'infrastructure', 'renovation'],
      'Transportation': ['vehicle', 'transportation', 'logistics', 'delivery', 'fleet'],
      'Security': ['security', 'protection', 'surveillance', 'access', 'safety'],
      'Training': ['training', 'education', 'development', 'learning', 'curriculum'],
      'Consulting': ['consulting', 'advisory', 'professional', 'services', 'support'],
      'Equipment': ['equipment', 'machinery', 'tools', 'instruments', 'devices']
    }
    
    for (const [category, categoryKeywords] of Object.entries(categories)) {
      if (keywords.some(keyword => categoryKeywords.includes(keyword))) {
        return category
      }
    }
    
    return 'General Services'
  }
}

export const productExtractionService = new ProductExtractionService()