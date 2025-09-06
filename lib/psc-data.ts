// PSC (Product Service Code) data structure
export interface PscCode {
  code: string
  title: string
  description: string
  category?: string
}

// Sample PSC codes commonly used in government contracting
export const PSC_CODES: PscCode[] = [
  // Information Technology and Software (D3xx series)
  {
    code: "D301",
    title: "IT and Telecom- IT and Telecom Solutions",
    description: "Information technology and telecommunications solutions, including software development, systems integration, and IT services.",
    category: "Information Technology"
  },
  {
    code: "D302", 
    title: "IT and Telecom- Software",
    description: "Software products and services including custom software development, software maintenance, and software licensing.",
    category: "Information Technology"
  },
  {
    code: "D306",
    title: "IT and Telecom- System Design Services", 
    description: "Computer system design services including network design, system architecture, and technical consulting.",
    category: "Information Technology"
  },
  {
    code: "D307",
    title: "IT and Telecom- IT Professional Services",
    description: "Information technology professional services including consulting, technical support, and IT project management.",
    category: "Information Technology"
  },
  {
    code: "D310",
    title: "IT and Telecom- Cyber Security and Data Protection",
    description: "Cybersecurity services, data protection, security assessments, and information assurance services.",
    category: "Information Technology"
  },

  // Research and Development (A1xx series)
  {
    code: "A111",
    title: "Research and Development- Studies and Analyses",
    description: "Research studies, data analysis, policy analysis, and technical assessments.",
    category: "Research & Development"
  },
  {
    code: "A112",
    title: "Research and Development- Engineering/Technical",
    description: "Engineering research, technical analysis, and scientific research services.",
    category: "Research & Development"
  },
  {
    code: "A113",
    title: "Research and Development- Engineering/Technical- Electronics and Communication",
    description: "Research and development in electronics, communications, and related technologies.",
    category: "Research & Development"  
  },

  // Professional Services (R4xx series)
  {
    code: "R408",
    title: "Professional Services- Program Management/Support Services",
    description: "Program management, project management, and administrative support services.",
    category: "Professional Services"
  },
  {
    code: "R425", 
    title: "Professional Services- Engineering/Technical",
    description: "Engineering consulting, technical advisory services, and specialized technical support.",
    category: "Professional Services"
  },
  {
    code: "R445",
    title: "Professional Services- Strategic Consulting Services",
    description: "Management consulting, strategic planning, and business advisory services.",
    category: "Professional Services"
  },

  // Administrative Support (B5xx series) 
  {
    code: "B501",
    title: "Administrative Support- General Administrative Services",
    description: "General administrative support including clerical services, data entry, and office support.",
    category: "Administrative Support"
  },
  {
    code: "B502",
    title: "Administrative Support- Typing, Word Processing, and Desktop Publishing",
    description: "Document preparation, word processing, desktop publishing, and document formatting services.",
    category: "Administrative Support"
  },

  // Construction (Y1xx series)
  {
    code: "Y1AA",
    title: "Construction- General Construction", 
    description: "General construction services including building construction and infrastructure development.",
    category: "Construction"
  },
  {
    code: "Y1BB",
    title: "Construction- Specialized Construction",
    description: "Specialized construction services including renovation, restoration, and specialized building systems.",
    category: "Construction"
  },

  // Transportation (V1xx series)
  {
    code: "V111",
    title: "Transportation- Motor Vehicle Transportation",
    description: "Motor vehicle transportation services including logistics, delivery, and vehicle services.",
    category: "Transportation"
  },

  // Medical Services (Q2xx series)
  {
    code: "Q201",
    title: "Medical Services- General Health Services",
    description: "General medical and health services including healthcare consulting and medical support.",
    category: "Medical Services"
  },

  // Training (T0xx series)
  {
    code: "T001", 
    title: "Training Services- General Training",
    description: "Training and educational services including professional development and skills training.",
    category: "Training Services"
  },
  {
    code: "T002",
    title: "Training Services- IT and Technical Training",
    description: "Information technology and technical training services including software training and technical education.",
    category: "Training Services"
  },

  // Maintenance (J0xx series)
  {
    code: "J001",
    title: "Maintenance/Repair- General Maintenance",
    description: "General maintenance and repair services for facilities, equipment, and systems.",
    category: "Maintenance & Repair"
  },

  // Security Services (U0xx series)
  {
    code: "U001",
    title: "Security Services- General Security",
    description: "Security services including physical security, security consulting, and protective services.",
    category: "Security Services"
  }
]

// Helper function to get PSC codes by category
export function getPscCodesByCategory(category: string): PscCode[] {
  return PSC_CODES.filter(code => code.category === category)
}

// Helper function to get all PSC categories  
export function getPscCategories(): string[] {
  const categories = new Set(PSC_CODES.map(code => code.category).filter((cat): cat is string => Boolean(cat)))
  return Array.from(categories).sort()
}

// Helper function to search PSC codes
export function searchPscCodes(query: string): PscCode[] {
  const searchTerm = query.toLowerCase()
  return PSC_CODES.filter(code => 
    code.code.toLowerCase().includes(searchTerm) ||
    code.title.toLowerCase().includes(searchTerm) ||
    code.description.toLowerCase().includes(searchTerm)
  )
}