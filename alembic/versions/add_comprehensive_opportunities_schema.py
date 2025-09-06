"""Add comprehensive opportunities schema

Revision ID: add_comprehensive_opportunities_schema
Revises: 725362d8468a
Create Date: 2025-09-06 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_comprehensive_opportunities_schema'
down_revision = '725362d8468a_initial_database_schema'
branch_labels = None
depends_on = None

def upgrade():
    # Create opportunities table
    op.create_table('opportunities',
        sa.Column('id', sa.Integer(), nullable=False),
        
        # Basic Information
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('solicitation_number', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        
        # Dates
        sa.Column('posted_date', sa.DateTime(), nullable=True),
        sa.Column('response_deadline', sa.DateTime(), nullable=True),
        sa.Column('award_date', sa.DateTime(), nullable=True),
        
        # Agency Information
        sa.Column('agency', sa.String(length=200), nullable=True),
        sa.Column('office', sa.String(length=200), nullable=True),
        sa.Column('contact_name', sa.String(length=200), nullable=True),
        sa.Column('contact_email', sa.String(length=200), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        
        # Classification Codes
        sa.Column('psc_code', sa.String(length=10), nullable=True),
        sa.Column('psc_name', sa.String(length=200), nullable=True),
        sa.Column('naics_code', sa.String(length=10), nullable=True),
        sa.Column('naics_name', sa.String(length=200), nullable=True),
        sa.Column('nsn', sa.String(length=20), nullable=True),
        sa.Column('fsc', sa.String(length=10), nullable=True),
        sa.Column('sin', sa.String(length=20), nullable=True),
        
        # Opportunity Details
        sa.Column('opportunity_type', sa.String(length=50), nullable=True),
        sa.Column('set_aside', sa.String(length=100), nullable=True),
        sa.Column('contract_value', sa.Float(), nullable=True),
        sa.Column('place_of_performance', sa.String(length=500), nullable=True),
        
        # Source Information
        sa.Column('source_platform', sa.String(length=50), nullable=True),
        sa.Column('source_url', sa.String(length=1000), nullable=True),
        sa.Column('source_id', sa.String(length=100), nullable=True),
        
        # Processing Information
        sa.Column('is_product_related', sa.Boolean(), default=False),
        sa.Column('keywords_matched', sa.JSON(), nullable=True),
        sa.Column('relevance_score', sa.Float(), nullable=True),
        
        # Status
        sa.Column('status', sa.String(length=50), default='active'),
        sa.Column('is_duplicate', sa.Boolean(), default=False),
        sa.Column('master_opportunity_id', sa.Integer(), nullable=True),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_sync_at', sa.DateTime(), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('solicitation_number')
    )
    
    # Create indexes for performance
    op.create_index('ix_opportunities_id', 'opportunities', ['id'])
    op.create_index('ix_opportunities_title', 'opportunities', ['title'])
    op.create_index('ix_opportunities_solicitation_number', 'opportunities', ['solicitation_number'])
    op.create_index('ix_opportunities_posted_date', 'opportunities', ['posted_date'])
    op.create_index('ix_opportunities_agency', 'opportunities', ['agency'])
    op.create_index('ix_opportunities_psc_code', 'opportunities', ['psc_code'])
    op.create_index('ix_opportunities_source_platform', 'opportunities', ['source_platform'])
    op.create_index('ix_opportunities_status', 'opportunities', ['status'])
    op.create_index('ix_opportunities_is_product_related', 'opportunities', ['is_product_related'])
    op.create_index('ix_opportunities_is_duplicate', 'opportunities', ['is_duplicate'])
    
    # Create collection_runs table
    op.create_table('collection_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('run_date', sa.DateTime(), nullable=True),
        sa.Column('platform', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('total_fetched', sa.Integer(), default=0),
        sa.Column('new_opportunities', sa.Integer(), default=0),
        sa.Column('updated_opportunities', sa.Integer(), default=0),
        sa.Column('duplicates_found', sa.Integer(), default=0),
        sa.Column('errors_count', sa.Integer(), default=0),
        sa.Column('error_messages', sa.JSON(), nullable=True),
        sa.Column('processing_time_seconds', sa.Float(), nullable=True),
        sa.Column('filters_applied', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_collection_runs_id', 'collection_runs', ['id'])
    op.create_index('ix_collection_runs_platform', 'collection_runs', ['platform'])
    op.create_index('ix_collection_runs_status', 'collection_runs', ['status'])
    op.create_index('ix_collection_runs_run_date', 'collection_runs', ['run_date'])
    
    # Create psc_codes table
    op.create_table('psc_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('psc_code', sa.String(length=10), nullable=False),
        sa.Column('psc_name', sa.String(length=200), nullable=True),
        sa.Column('psc_full_name', sa.String(length=500), nullable=True),
        sa.Column('parent_psc_code', sa.String(length=10), nullable=True),
        sa.Column('is_product_code', sa.Boolean(), default=False),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=20), default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('psc_code')
    )
    
    op.create_index('ix_psc_codes_id', 'psc_codes', ['id'])
    op.create_index('ix_psc_codes_psc_code', 'psc_codes', ['psc_code'])
    op.create_index('ix_psc_codes_is_product_code', 'psc_codes', ['is_product_code'])

def downgrade():
    # Drop indexes first
    op.drop_index('ix_psc_codes_is_product_code', table_name='psc_codes')
    op.drop_index('ix_psc_codes_psc_code', table_name='psc_codes')
    op.drop_index('ix_psc_codes_id', table_name='psc_codes')
    
    op.drop_index('ix_collection_runs_run_date', table_name='collection_runs')
    op.drop_index('ix_collection_runs_status', table_name='collection_runs')
    op.drop_index('ix_collection_runs_platform', table_name='collection_runs')
    op.drop_index('ix_collection_runs_id', table_name='collection_runs')
    
    op.drop_index('ix_opportunities_is_duplicate', table_name='opportunities')
    op.drop_index('ix_opportunities_is_product_related', table_name='opportunities')
    op.drop_index('ix_opportunities_status', table_name='opportunities')
    op.drop_index('ix_opportunities_source_platform', table_name='opportunities')
    op.drop_index('ix_opportunities_psc_code', table_name='opportunities')
    op.drop_index('ix_opportunities_agency', table_name='opportunities')
    op.drop_index('ix_opportunities_posted_date', table_name='opportunities')
    op.drop_index('ix_opportunities_solicitation_number', table_name='opportunities')
    op.drop_index('ix_opportunities_title', table_name='opportunities')
    op.drop_index('ix_opportunities_id', table_name='opportunities')
    
    # Drop tables
    op.drop_table('psc_codes')
    op.drop_table('collection_runs')
    op.drop_table('opportunities')