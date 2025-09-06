#!/usr/bin/env python3
"""
Simple script to create the SQLite database with all tables
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.models.opportunity import Base
from app.core.config import settings

def create_database():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    print(f"Database created successfully at: {settings.DATABASE_URL}")
    print("Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")

if __name__ == "__main__":
    create_database()