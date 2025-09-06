from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Product Identification
    name = Column(String, nullable=False)
    description = Column(Text)
    manufacturer = Column(String)
    part_number = Column(String, index=True)
    nsn = Column(String, index=True)  # National Stock Number
    
    # Supplier Information
    supplier_name = Column(String)
    supplier_part_number = Column(String)
    supplier_url = Column(String)
    
    # Pricing
    unit_price = Column(Numeric(10, 2))
    currency = Column(String, default="USD")
    price_last_updated = Column(DateTime(timezone=True))
    
    # Product Details
    unit_of_measure = Column(String)
    minimum_order_quantity = Column(Integer)
    lead_time_days = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RFQProduct(Base):
    __tablename__ = "rfq_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Requirements from RFQ
    required_quantity = Column(Integer, nullable=False)
    required_specifications = Column(Text)  # JSON string
    
    # Match Information
    match_confidence = Column(Numeric(3, 2))  # 0.00 to 1.00
    alternative_options = Column(Text)  # JSON string of alternative products
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    rfq = relationship("RFQ", back_populates="products")
    product = relationship("Product")