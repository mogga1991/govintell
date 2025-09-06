from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    title = Column(String(500), nullable=False, index=True)
    solicitation_number = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    
    # Dates
    posted_date = Column(DateTime)
    response_deadline = Column(DateTime)
    award_date = Column(DateTime)
    
    # Agency Information
    agency = Column(String(200))
    office = Column(String(200))
    contact_name = Column(String(200))
    contact_email = Column(String(200))
    contact_phone = Column(String(50))
    
    # Classification Codes
    psc_code = Column(String(10))  # Product Service Code (SAM.gov)
    psc_name = Column(String(200))
    naics_code = Column(String(10))  # North American Industry Classification System
    naics_name = Column(String(200))
    nsn = Column(String(20))  # NATO Stock Number (DIBBS)
    fsc = Column(String(10))  # Federal Supply Class (DIBBS)
    sin = Column(String(20))  # Special Item Number (GSA eBuy)
    
    # Opportunity Details
    opportunity_type = Column(String(50))  # RFQ, RFP, IFB, etc.
    set_aside = Column(String(100))  # Small Business, 8(a), WOSB, etc.
    contract_value = Column(Float)  # Estimated value
    place_of_performance = Column(String(500))
    
    # Source Information
    source_platform = Column(String(50))  # SAM, DIBBS, GSA_EBUY
    source_url = Column(String(1000))
    source_id = Column(String(100))  # Original ID from source platform
    
    # Processing Information
    is_product_related = Column(Boolean, default=False)  # Filtered for products vs services
    keywords_matched = Column(JSON)  # Array of keywords that matched
    relevance_score = Column(Float)  # AI-generated relevance score
    
    # Status
    status = Column(String(50), default="active")  # active, closed, awarded, cancelled
    is_duplicate = Column(Boolean, default=False)
    master_opportunity_id = Column(Integer)  # Points to main record if duplicate
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_sync_at = Column(DateTime)
    
    def __repr__(self):
        return f"<Opportunity(id={self.id}, title='{self.title[:50]}...', source='{self.source_platform}')>"

class CollectionRun(Base):
    __tablename__ = "collection_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Run Information
    run_date = Column(DateTime, default=datetime.utcnow)
    platform = Column(String(50))  # SAM, DIBBS, GSA_EBUY
    status = Column(String(20))  # running, completed, failed
    
    # Statistics
    total_fetched = Column(Integer, default=0)
    new_opportunities = Column(Integer, default=0)
    updated_opportunities = Column(Integer, default=0)
    duplicates_found = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)
    
    # Details
    error_messages = Column(JSON)
    processing_time_seconds = Column(Float)
    filters_applied = Column(JSON)
    
    # Metadata
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    def __repr__(self):
        return f"<CollectionRun(id={self.id}, platform='{self.platform}', status='{self.status}')>"

# Product Service Code mapping for better filtering
class PSCCode(Base):
    __tablename__ = "psc_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    psc_code = Column(String(10), unique=True, nullable=False, index=True)
    psc_name = Column(String(200))
    psc_full_name = Column(String(500))
    parent_psc_code = Column(String(10))
    is_product_code = Column(Boolean, default=False)  # True for products, False for services
    keywords = Column(JSON)  # Related keywords for matching
    status = Column(String(20), default="active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PSCCode(code='{self.psc_code}', name='{self.psc_name}', is_product={self.is_product_code})>"