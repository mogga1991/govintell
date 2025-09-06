from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum
import uuid

class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    SUBMITTED = "submitted"
    AWARDED = "awarded"
    REJECTED = "rejected"

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Quote Details
    quote_number = Column(String, unique=True, index=True)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.DRAFT)
    
    # Pricing
    subtotal = Column(Numeric(12, 2), nullable=False)
    profit_margin_percentage = Column(Numeric(5, 2))  # e.g., 15.50 for 15.5%
    profit_amount = Column(Numeric(12, 2))
    total_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String, default="USD")
    
    # Additional Costs
    shipping_cost = Column(Numeric(10, 2), default=0)
    handling_cost = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    
    # Export Information
    csv_file_path = Column(String)
    exported_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    rfq = relationship("RFQ", back_populates="quotes")
    user = relationship("User")
    line_items = relationship("QuoteLineItem", back_populates="quote")

class QuoteLineItem(Base):
    __tablename__ = "quote_line_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Line Item Details
    line_number = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
    
    # Product Information (snapshot at time of quote)
    product_name = Column(String, nullable=False)
    product_description = Column(Text)
    manufacturer = Column(String)
    part_number = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quote = relationship("Quote", back_populates="line_items")
    product = relationship("Product")