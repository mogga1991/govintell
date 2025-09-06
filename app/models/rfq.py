from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum
import uuid

class RFQSource(str, enum.Enum):
    SAM_GOV = "sam_gov"
    DIBBS = "dibbs"
    UPLOAD = "upload"
    URL_SCRAPE = "url_scrape"

class RFQStatus(str, enum.Enum):
    NEW = "new"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    SOURCING = "sourcing"
    SOURCED = "sourced"
    QUOTED = "quoted"
    FAILED = "failed"

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # RFQ Identification
    solicitation_number = Column(String, index=True)
    title = Column(String, nullable=False)
    agency = Column(String)
    office = Column(String)
    
    # Source Information
    source = Column(Enum(RFQSource), nullable=False)
    source_url = Column(String)
    original_document_path = Column(String)
    
    # RFQ Details
    description = Column(Text)
    deadline = Column(DateTime(timezone=True))
    contact_email = Column(String)
    contact_phone = Column(String)
    
    # Processing Status
    status = Column(Enum(RFQStatus), default=RFQStatus.NEW)
    
    # AI Analysis Results
    extracted_requirements = Column(Text)  # JSON string
    compliance_requirements = Column(Text)  # JSON string
    risk_assessment = Column(Text)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    products = relationship("RFQProduct", back_populates="rfq")
    quotes = relationship("Quote", back_populates="rfq")