"""
Enhanced API endpoints for comprehensive opportunity management
Supports multi-platform data collection from SAM.gov, GSA eBuy, and DIBBS
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.database import get_db
from app.models.opportunity import Opportunity, CollectionRun, PSCCode
from app.services.data_collector import data_collector
from app.services.data_deduplication import deduplicator, standardizer
from app.services.scheduler import scheduler_service

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

# Pydantic models for request/response
class OpportunitySearchV2(BaseModel):
    keyword: Optional[str] = None
    agency: Optional[str] = None
    psc_codes: Optional[List[str]] = None
    products_only: bool = True  # Filter to product-related opportunities
    posted_days_ago: Optional[int] = 30
    size: int = 20
    page: int = 0
    sort_by: str = "posted_date"  # posted_date, relevance, deadline
    sort_order: str = "desc"  # desc, asc

class OpportunityResponse(BaseModel):
    id: int
    title: str
    solicitation_number: str
    agency: Optional[str] = None
    office: Optional[str] = None
    description: Optional[str] = None
    posted_date: Optional[datetime] = None
    response_deadline: Optional[datetime] = None
    psc_code: Optional[str] = None
    psc_name: Optional[str] = None
    naics_code: Optional[str] = None
    opportunity_type: Optional[str] = None
    set_aside: Optional[str] = None
    contract_value: Optional[float] = None
    source_platform: Optional[str] = None
    source_url: Optional[str] = None
    relevance_score: Optional[float] = None
    is_product_related: bool = False
    status: str = "active"
    
    class Config:
        from_attributes = True

class CollectionStatus(BaseModel):
    total_opportunities: int
    new_today: int
    product_related: int
    platforms: Dict[str, int]
    last_collection: Optional[datetime] = None

class ManualCollectionRequest(BaseModel):
    platforms: Optional[List[str]] = None  # ["SAM", "GSA_EBUY", "DIBBS"]
    force_refresh: bool = False

@router.get("/search", response_model=Dict[str, Any])
async def search_opportunities_v2(
    keyword: Optional[str] = Query(None, description="Search in title and description"),
    agency: Optional[str] = Query(None, description="Filter by agency name"),
    psc_codes: Optional[str] = Query(None, description="Comma-separated PSC codes"),
    products_only: bool = Query(True, description="Filter to product-related opportunities only"),
    posted_days_ago: Optional[int] = Query(30, description="Posted within last N days"),
    size: int = Query(20, description="Number of results per page"),
    page: int = Query(0, description="Page number (0-indexed)"),
    sort_by: str = Query("posted_date", description="Sort by: posted_date, relevance, deadline"),
    sort_order: str = Query("desc", description="Sort order: desc, asc"),
    db: Session = Depends(get_db)
):
    """
    Advanced opportunity search with multi-platform data
    Returns real RFQ and product solicitation data from government platforms
    """
    try:
        # Build base query
        query = db.query(Opportunity).filter(
            and_(
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        )
        
        # Filter to products only if requested
        if products_only:
            query = query.filter(Opportunity.is_product_related == True)
        
        # Keyword search
        if keyword:
            keyword_filter = or_(
                Opportunity.title.ilike(f"%{keyword}%"),
                Opportunity.description.ilike(f"%{keyword}%"),
                Opportunity.solicitation_number.ilike(f"%{keyword}%")
            )
            query = query.filter(keyword_filter)
        
        # Agency filter
        if agency:
            query = query.filter(Opportunity.agency.ilike(f"%{agency}%"))
        
        # PSC codes filter
        if psc_codes:
            psc_list = [code.strip() for code in psc_codes.split(",")]
            query = query.filter(Opportunity.psc_code.in_(psc_list))
        
        # Date range filter
        if posted_days_ago:
            cutoff_date = datetime.utcnow() - timedelta(days=posted_days_ago)
            query = query.filter(Opportunity.posted_date >= cutoff_date)
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply sorting
        if sort_by == "posted_date":
            sort_column = Opportunity.posted_date
        elif sort_by == "deadline":
            sort_column = Opportunity.response_deadline
        elif sort_by == "relevance":
            sort_column = Opportunity.relevance_score
        else:
            sort_column = Opportunity.posted_date
        
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(sort_column)
        
        # Apply pagination
        offset = page * size
        opportunities = query.offset(offset).limit(size).all()
        
        # Format response
        formatted_opportunities = []
        for opp in opportunities:
            formatted_opportunities.append({
                'id': opp.id,
                'title': opp.title,
                'solicitation_number': opp.solicitation_number,
                'agency': opp.agency,
                'office': opp.office,
                'description': opp.description[:500] if opp.description else None,  # Truncate for performance
                'posted_date': opp.posted_date.isoformat() if opp.posted_date else None,
                'response_deadline': opp.response_deadline.isoformat() if opp.response_deadline else None,
                'psc_code': opp.psc_code,
                'psc_name': opp.psc_name,
                'naics_code': opp.naics_code,
                'opportunity_type': opp.opportunity_type,
                'set_aside': opp.set_aside,
                'contract_value': opp.contract_value,
                'source_platform': opp.source_platform,
                'source_url': opp.source_url,
                'relevance_score': opp.relevance_score,
                'is_product_related': opp.is_product_related,
                'status': opp.status,
                'last_sync_at': opp.last_sync_at.isoformat() if opp.last_sync_at else None
            })
        
        return {
            'opportunities': formatted_opportunities,
            'total_results': total_count,
            'page': page,
            'size': size,
            'total_pages': (total_count + size - 1) // size,
            'search_params': {
                'keyword': keyword,
                'agency': agency,
                'psc_codes': psc_codes,
                'products_only': products_only,
                'posted_days_ago': posted_days_ago,
                'sort_by': sort_by,
                'sort_order': sort_order
            },
            'filters_applied': {
                'products_only': products_only,
                'exclude_duplicates': True,
                'active_only': True
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/collection-status", response_model=CollectionStatus)
async def get_collection_status(db: Session = Depends(get_db)):
    """Get status of data collection from all platforms"""
    try:
        # Get total opportunities count
        total_opportunities = db.query(func.count(Opportunity.id)).filter(
            and_(
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        ).scalar()
        
        # Get today's new opportunities
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        new_today = db.query(func.count(Opportunity.id)).filter(
            and_(
                Opportunity.created_at >= today_start,
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        ).scalar()
        
        # Get product-related count
        product_related = db.query(func.count(Opportunity.id)).filter(
            and_(
                Opportunity.is_product_related == True,
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        ).scalar()
        
        # Get platform breakdown
        platform_results = db.query(
            Opportunity.source_platform,
            func.count(Opportunity.id)
        ).filter(
            and_(
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        ).group_by(Opportunity.source_platform).all()
        
        platforms = {platform: count for platform, count in platform_results}
        
        # Get last successful collection run
        last_run = db.query(CollectionRun).filter(
            CollectionRun.status == 'completed'
        ).order_by(desc(CollectionRun.completed_at)).first()
        
        return CollectionStatus(
            total_opportunities=total_opportunities,
            new_today=new_today,
            product_related=product_related,
            platforms=platforms,
            last_collection=last_run.completed_at if last_run else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get collection status: {str(e)}")

@router.post("/manual-collection")
async def trigger_manual_collection(
    request: ManualCollectionRequest = ManualCollectionRequest(),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """Manually trigger data collection from government platforms"""
    try:
        # Add collection task to background
        background_tasks.add_task(run_manual_collection, request.platforms, request.force_refresh)
        
        return {
            'success': True,
            'message': 'Manual collection started',
            'platforms': request.platforms or ['SAM', 'GSA_EBUY'],
            'force_refresh': request.force_refresh,
            'estimated_completion': '5-15 minutes'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start collection: {str(e)}")

async def run_manual_collection(platforms: Optional[List[str]], force_refresh: bool):
    """Background task for manual collection"""
    try:
        results = await data_collector.run_daily_collection()
        # Log results or send notification
        print(f"Manual collection completed: {results}")
    except Exception as e:
        print(f"Manual collection failed: {str(e)}")

@router.get("/scheduler-status")
async def get_scheduler_status():
    """Get status of scheduled data collection jobs"""
    try:
        return scheduler_service.get_job_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scheduler status: {str(e)}")

@router.post("/deduplication")
async def run_deduplication(
    background_tasks: BackgroundTasks = BackgroundTasks(),
    limit: int = Query(100, description="Number of opportunities to process"),
    db: Session = Depends(get_db)
):
    """Manually trigger deduplication process"""
    try:
        background_tasks.add_task(run_deduplication_task, limit)
        
        return {
            'success': True,
            'message': 'Deduplication process started',
            'processing_limit': limit,
            'estimated_completion': '2-5 minutes'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start deduplication: {str(e)}")

async def run_deduplication_task(limit: int):
    """Background task for deduplication"""
    try:
        with SessionLocal() as db:
            results = deduplicator.deduplicate_opportunities(db, limit)
            print(f"Deduplication completed: {results}")
    except Exception as e:
        print(f"Deduplication failed: {str(e)}")

@router.get("/platforms")
async def get_supported_platforms():
    """Get list of supported government platforms"""
    return {
        'platforms': [
            {
                'name': 'SAM',
                'full_name': 'SAM.gov',
                'description': 'System for Award Management - Primary federal contracting platform',
                'data_types': ['RFQ', 'RFP', 'Solicitations', 'Contract Awards'],
                'classification_system': 'PSC Codes',
                'update_frequency': 'Daily at 6:00 AM EST',
                'status': 'active'
            },
            {
                'name': 'GSA_EBUY',
                'full_name': 'GSA eBuy',
                'description': 'GSA electronic Request for Quote system',
                'data_types': ['RFQ', 'RFP'],
                'classification_system': 'SIN Numbers',
                'update_frequency': 'Daily at 6:00 AM EST',
                'status': 'active'
            },
            {
                'name': 'DIBBS',
                'full_name': 'DLA Internet Bid Board System',
                'description': 'Defense Logistics Agency procurement platform',
                'data_types': ['RFQ', 'IFB'],
                'classification_system': 'NSN/FSC Codes',
                'update_frequency': 'Pending API access',
                'status': 'pending'
            }
        ],
        'total_platforms': 3,
        'active_platforms': 2
    }

@router.get("/psc-codes")
async def get_psc_codes(
    is_product_only: bool = Query(True, description="Filter to product-related PSC codes only"),
    db: Session = Depends(get_db)
):
    """Get list of Product Service Codes used for filtering"""
    try:
        query = db.query(PSCCode).filter(PSCCode.status == 'active')
        
        if is_product_only:
            query = query.filter(PSCCode.is_product_code == True)
        
        psc_codes = query.order_by(PSCCode.psc_code).all()
        
        formatted_codes = []
        for psc in psc_codes:
            formatted_codes.append({
                'code': psc.psc_code,
                'name': psc.psc_name,
                'full_name': psc.psc_full_name,
                'is_product_code': psc.is_product_code,
                'keywords': psc.keywords
            })
        
        return {
            'psc_codes': formatted_codes,
            'total_codes': len(formatted_codes),
            'filter_applied': 'product_codes_only' if is_product_only else 'all_codes'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get PSC codes: {str(e)}")

@router.get("/{opportunity_id}", response_model=Dict[str, Any])
async def get_opportunity_details(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific opportunity"""
    try:
        opportunity = db.query(Opportunity).filter(
            Opportunity.id == opportunity_id
        ).first()
        
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Get master record if this is marked as duplicate
        master_opportunity = None
        if opportunity.is_duplicate and opportunity.master_opportunity_id:
            master_opportunity = db.query(Opportunity).filter(
                Opportunity.id == opportunity.master_opportunity_id
            ).first()
        
        return {
            'opportunity': OpportunityResponse.from_orm(opportunity).dict(),
            'is_duplicate': opportunity.is_duplicate,
            'master_opportunity': OpportunityResponse.from_orm(master_opportunity).dict() if master_opportunity else None,
            'keywords_matched': opportunity.keywords_matched,
            'collection_info': {
                'collected_at': opportunity.created_at.isoformat(),
                'last_updated': opportunity.updated_at.isoformat(),
                'last_synced': opportunity.last_sync_at.isoformat() if opportunity.last_sync_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get opportunity details: {str(e)}")

from app.core.database import SessionLocal