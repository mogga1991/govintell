"""
API endpoints for opportunity management and search
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.database import get_db
from app.services.sam_service import sam_service
from app.services.opportunity_service import opportunity_service
from app.models.rfq import RFQ, RFQStatus

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

# Pydantic models for request/response
class OpportunitySearch(BaseModel):
    keyword: Optional[str] = None
    department: Optional[str] = None
    notice_types: Optional[List[str]] = None
    psc_codes: Optional[List[str]] = None
    posted_days_ago: Optional[int] = 30  # Search last N days
    size: int = 20
    page: int = 0

class OpportunityImport(BaseModel):
    url: str

class OpportunityResponse(BaseModel):
    id: str
    title: str
    solicitation_number: Optional[str]
    agency: Optional[str]
    description: str
    deadline: Optional[datetime]
    sam_url: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/search", response_model=dict)
async def search_opportunities(
    search: OpportunitySearch = Depends(),
    db: Session = Depends(get_db)
):
    """
    Search opportunities using multiple methods:
    1. Live search via SAM.gov API
    2. Search stored/cached opportunities
    
    Supports keyword search, department filtering, and date ranges.
    """
    try:
        # Calculate date range
        posted_from = None
        posted_to = None
        
        if search.posted_days_ago:
            posted_to = datetime.now()
            posted_from = posted_to - timedelta(days=search.posted_days_ago)
        
        # Focus on RFQ-related notice types if not specified
        rfq_notice_types = search.notice_types or ['o', 's']  # Combined Synopsis/Solicitation, Solicitation
        
        # Search via SAM.gov API for live results
        api_results = await sam_service.search_opportunities(
            keyword=search.keyword,
            department=search.department,
            notice_types=rfq_notice_types,
            psc_codes=search.psc_codes,
            posted_from=posted_from,
            posted_to=posted_to,
            size=search.size,
            page=search.page
        )
        
        # Also search local database for cached/imported opportunities
        local_results = opportunity_service.search_opportunities(
            db=db,
            keyword=search.keyword,
            agency=search.department,
            limit=search.size,
            offset=search.page * search.size
        )
        
        # Format response
        formatted_opportunities = []
        
        # Add SAM.gov API results
        for opp in api_results.get('opportunities', []):
            formatted_opportunities.append({
                'id': opp.get('noticeId', ''),
                'title': opp.get('title', ''),
                'solicitation_number': opp.get('solicitationNumber'),
                'agency': opp.get('organizationFullName'),
                'department': opp.get('departmentFullName'),
                'description': opp.get('description', ''),
                'deadline': opp.get('responseDeadLine'),
                'posted_date': opp.get('postedDate'),
                'sam_url': sam_service.build_sam_url(opp.get('noticeId', '')),
                'source': 'sam_gov_api',
                'notice_type': opp.get('type'),
                'classification_code': opp.get('classificationCode')
            })
        
        # Add local database results (avoiding duplicates)
        api_notice_ids = set(opp.get('noticeId', '') for opp in api_results.get('opportunities', []))
        
        for rfq in local_results:
            # Extract notice ID from source URL to check for duplicates
            notice_id = sam_service.extract_notice_id_from_url(rfq.source_url or '')
            
            if notice_id not in api_notice_ids:
                formatted_opportunities.append({
                    'id': str(rfq.id),
                    'title': rfq.title,
                    'solicitation_number': rfq.solicitation_number,
                    'agency': rfq.agency,
                    'department': None,
                    'description': rfq.description,
                    'deadline': rfq.deadline.isoformat() if rfq.deadline else None,
                    'posted_date': rfq.created_at.isoformat(),
                    'sam_url': rfq.source_url,
                    'source': 'local_db',
                    'status': rfq.status.value if rfq.status else None
                })
        
        return {
            'opportunities': formatted_opportunities,
            'total_results': api_results.get('totalRecords', 0) + len(local_results),
            'page': search.page,
            'size': search.size,
            'search_params': {
                'keyword': search.keyword,
                'department': search.department,
                'posted_days_ago': search.posted_days_ago
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/import-url")
async def import_from_url(
    import_request: OpportunityImport,
    db: Session = Depends(get_db)
):
    """
    Import opportunity from SAM.gov URL
    Extracts notice ID and fetches full opportunity data
    """
    try:
        # For now, using user_id=1 (in real app, get from JWT token)
        user_id = 1
        
        rfq = await opportunity_service.import_opportunity_from_url(
            db=db,
            url=import_request.url,
            user_id=user_id
        )
        
        if not rfq:
            raise HTTPException(
                status_code=404, 
                detail="Opportunity not found or invalid URL"
            )
        
        return {
            'success': True,
            'opportunity': {
                'id': str(rfq.id),
                'title': rfq.title,
                'solicitation_number': rfq.solicitation_number,
                'agency': rfq.agency,
                'sam_url': rfq.source_url,
                'status': rfq.status.value
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.post("/upload-rfp")
async def upload_rfp_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload RFP/RFQ document for processing
    Supports PDF and DOCX files
    """
    try:
        # Validate file type
        allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are supported"
            )
        
        # Save uploaded file (implement proper file storage)
        file_content = await file.read()
        
        # TODO: Implement document processing
        # 1. Save file to storage
        # 2. Extract text content
        # 3. Try to match with existing SAM.gov opportunities
        # 4. Create RFQ record
        
        return {
            'success': True,
            'message': f'File {file.filename} uploaded successfully',
            'file_size': len(file_content),
            'file_type': file.content_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/sync-status")
async def get_sync_status():
    """
    Get status of daily opportunity sync scheduler
    TODO: Implement scheduler service integration
    """
    return {
        'running': False,
        'message': 'Scheduler service not yet integrated',
        'jobs': []
    }

@router.post("/manual-sync")
async def manual_sync(
    target_date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Trigger manual opportunity sync for specific date
    Useful for catching up or testing
    """
    try:
        sync_date = None
        if target_date:
            sync_date = datetime.strptime(target_date, '%Y-%m-%d')
        else:
            sync_date = datetime.now() - timedelta(days=1)
        
        # Get opportunities for the date
        from app.services.sam_service import sam_service
        opportunities = await sam_service.get_daily_opportunities(sync_date)
        
        # Save to database
        count = await opportunity_service.bulk_save_opportunities(
            db, opportunities, source="manual_sync"
        )
        
        return {
            'success': True,
            'synced_count': count,
            'target_date': sync_date.strftime('%Y-%m-%d')
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual sync failed: {str(e)}")

@router.get("/{opportunity_id}")
async def get_opportunity_details(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed opportunity information
    Supports both local DB IDs and SAM.gov notice IDs
    """
    try:
        # Try to get from local database first
        if len(opportunity_id) == 32:  # SAM.gov notice ID format
            rfq = opportunity_service.get_opportunity_by_notice_id(db, opportunity_id)
        else:
            # Try UUID format for local database
            try:
                from uuid import UUID
                UUID(opportunity_id)
                rfq = db.query(RFQ).filter(RFQ.id == opportunity_id).first()
            except ValueError:
                rfq = None
        
        # If not found locally, try SAM.gov API
        if not rfq and len(opportunity_id) == 32:
            opp_data = await sam_service.get_opportunity_by_id(opportunity_id)
            if opp_data:
                return {
                    'source': 'sam_gov_api',
                    'opportunity': opp_data
                }
        
        if not rfq:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        return {
            'source': 'local_db',
            'opportunity': {
                'id': str(rfq.id),
                'title': rfq.title,
                'solicitation_number': rfq.solicitation_number,
                'agency': rfq.agency,
                'office': rfq.office,
                'description': rfq.description,
                'deadline': rfq.deadline.isoformat() if rfq.deadline else None,
                'contact_email': rfq.contact_email,
                'contact_phone': rfq.contact_phone,
                'sam_url': rfq.source_url,
                'status': rfq.status.value,
                'created_at': rfq.created_at.isoformat(),
                'updated_at': rfq.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get opportunity details: {str(e)}")