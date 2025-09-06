"""
Opportunity service for managing RFQ/opportunity data and operations
"""
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from uuid import uuid4

from app.models.rfq import RFQ, RFQStatus, RFQSource
from app.services.sam_service import sam_service

logger = logging.getLogger(__name__)

class OpportunityService:
    """Service for managing opportunity data and operations"""
    
    async def bulk_save_opportunities(
        self, 
        db: Session, 
        opportunities: List[Dict], 
        source: str = "sam_gov"
    ) -> int:
        """
        Save multiple opportunities to database, avoiding duplicates
        
        Args:
            db: Database session
            opportunities: List of opportunity dictionaries from SAM.gov
            source: Source identifier for tracking
            
        Returns:
            Number of opportunities actually saved (excluding duplicates)
        """
        saved_count = 0
        
        for opp_data in opportunities:
            try:
                # Check if opportunity already exists
                notice_id = opp_data.get('noticeId')
                if not notice_id:
                    continue
                
                existing = db.query(RFQ).filter(
                    RFQ.source_url.contains(notice_id)
                ).first()
                
                if existing:
                    continue  # Skip duplicates
                
                # Create new RFQ record
                rfq = self._create_rfq_from_opportunity(opp_data, source)
                db.add(rfq)
                saved_count += 1
                
            except Exception as e:
                logger.error(f"Error saving opportunity {opp_data.get('noticeId', 'unknown')}: {str(e)}")
                continue
        
        try:
            db.commit()
            logger.info(f"Successfully saved {saved_count} opportunities to database")
        except Exception as e:
            logger.error(f"Database commit failed: {str(e)}")
            db.rollback()
            saved_count = 0
        
        return saved_count
    
    def _create_rfq_from_opportunity(self, opp_data: Dict, source: str) -> RFQ:
        """
        Create RFQ model instance from SAM.gov opportunity data
        
        Args:
            opp_data: Opportunity data from SAM.gov API
            source: Source identifier
            
        Returns:
            RFQ model instance
        """
        notice_id = opp_data.get('noticeId')
        
        # Parse dates
        posted_date = self._parse_sam_date(opp_data.get('postedDate'))
        response_deadline = self._parse_sam_date(opp_data.get('responseDeadLine'))
        
        # Build SAM.gov URL
        sam_url = sam_service.build_sam_url(notice_id) if notice_id else None
        
        rfq = RFQ(
            id=uuid4(),
            user_id=None,  # System-generated opportunities don't belong to specific user
            
            # RFQ Identification
            solicitation_number=opp_data.get('solicitationNumber'),
            title=opp_data.get('title', ''),
            agency=opp_data.get('organizationFullName'),
            office=opp_data.get('officeAddress', {}).get('city') if isinstance(opp_data.get('officeAddress'), dict) else None,
            
            # Source Information
            source=RFQSource.SAM_GOV,
            source_url=sam_url,
            
            # RFQ Details
            description=opp_data.get('description', ''),
            deadline=response_deadline,
            contact_email=self._extract_contact_email(opp_data),
            contact_phone=self._extract_contact_phone(opp_data),
            
            # Processing Status
            status=RFQStatus.NEW,
            
            # Store raw SAM.gov data for reference
            extracted_requirements=json.dumps({
                'sam_data': opp_data,
                'notice_type': opp_data.get('type'),
                'classification_code': opp_data.get('classificationCode'),
                'department': opp_data.get('departmentFullName'),
                'award_amount': opp_data.get('awardAmount'),
                'place_of_performance': opp_data.get('placeOfPerformance'),
                'sync_source': source
            }),
            
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        return rfq
    
    def _parse_sam_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse SAM.gov date string to datetime"""
        if not date_str:
            return None
        
        try:
            # SAM.gov dates are typically in format: "2024-09-03"
            return datetime.strptime(date_str.split('T')[0], '%Y-%m-%d')
        except (ValueError, AttributeError):
            try:
                # Try alternative format: "09/03/2024"
                return datetime.strptime(date_str, '%m/%d/%Y')
            except (ValueError, AttributeError):
                logger.warning(f"Could not parse date: {date_str}")
                return None
    
    def _extract_contact_email(self, opp_data: Dict) -> Optional[str]:
        """Extract contact email from opportunity data"""
        # SAM.gov might have contact info in various fields
        contact_info = opp_data.get('pointOfContact', [])
        
        if isinstance(contact_info, list) and contact_info:
            return contact_info[0].get('email')
        elif isinstance(contact_info, dict):
            return contact_info.get('email')
        
        return None
    
    def _extract_contact_phone(self, opp_data: Dict) -> Optional[str]:
        """Extract contact phone from opportunity data"""
        contact_info = opp_data.get('pointOfContact', [])
        
        if isinstance(contact_info, list) and contact_info:
            return contact_info[0].get('phone')
        elif isinstance(contact_info, dict):
            return contact_info.get('phone')
        
        return None
    
    def search_opportunities(
        self,
        db: Session,
        keyword: Optional[str] = None,
        agency: Optional[str] = None,
        status: Optional[RFQStatus] = None,
        deadline_after: Optional[datetime] = None,
        deadline_before: Optional[datetime] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[RFQ]:
        """
        Search stored opportunities with filters
        
        Args:
            db: Database session
            keyword: Search in title and description
            agency: Filter by agency name
            status: Filter by RFQ status
            deadline_after: Only opportunities with deadline after this date
            deadline_before: Only opportunities with deadline before this date
            limit: Maximum results
            offset: Results offset for pagination
            
        Returns:
            List of RFQ objects
        """
        query = db.query(RFQ)
        
        # Apply filters
        if keyword:
            search_term = f"%{keyword}%"
            query = query.filter(
                or_(
                    RFQ.title.ilike(search_term),
                    RFQ.description.ilike(search_term),
                    RFQ.solicitation_number.ilike(search_term)
                )
            )
        
        if agency:
            agency_term = f"%{agency}%"
            query = query.filter(RFQ.agency.ilike(agency_term))
        
        if status:
            query = query.filter(RFQ.status == status)
        
        if deadline_after:
            query = query.filter(RFQ.deadline >= deadline_after)
        
        if deadline_before:
            query = query.filter(RFQ.deadline <= deadline_before)
        
        # Order by creation date (newest first)
        query = query.order_by(desc(RFQ.created_at))
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        return query.all()
    
    def get_opportunity_by_notice_id(self, db: Session, notice_id: str) -> Optional[RFQ]:
        """
        Get opportunity by SAM.gov notice ID
        
        Args:
            db: Database session
            notice_id: SAM.gov notice ID
            
        Returns:
            RFQ object or None
        """
        return db.query(RFQ).filter(
            RFQ.source_url.contains(notice_id)
        ).first()
    
    async def import_opportunity_from_url(self, db: Session, url: str, user_id: int) -> Optional[RFQ]:
        """
        Import opportunity from SAM.gov URL
        
        Args:
            db: Database session
            url: SAM.gov opportunity URL
            user_id: User importing the opportunity
            
        Returns:
            RFQ object or None if not found
        """
        try:
            # Extract notice ID from URL
            notice_id = sam_service.extract_notice_id_from_url(url)
            
            if not notice_id:
                logger.warning(f"Could not extract notice ID from URL: {url}")
                return None
            
            # Check if already exists
            existing = self.get_opportunity_by_notice_id(db, notice_id)
            if existing:
                # Associate with user if not already
                if not existing.user_id:
                    existing.user_id = user_id
                    db.commit()
                return existing
            
            # Fetch from SAM.gov API
            opp_data = await sam_service.get_opportunity_by_id(notice_id)
            
            if not opp_data:
                logger.warning(f"Opportunity not found in SAM.gov: {notice_id}")
                return None
            
            # Create RFQ record
            rfq = self._create_rfq_from_opportunity(opp_data, "url_import")
            rfq.user_id = user_id
            
            db.add(rfq)
            db.commit()
            
            logger.info(f"Successfully imported opportunity from URL: {notice_id}")
            return rfq
            
        except Exception as e:
            logger.error(f"Error importing opportunity from URL {url}: {str(e)}")
            db.rollback()
            return None
    
    async def cleanup_old_opportunities(self, db: Session, cutoff_date: datetime) -> int:
        """
        Clean up old opportunities that are no longer relevant
        
        Args:
            db: Database session
            cutoff_date: Remove opportunities created before this date
            
        Returns:
            Number of opportunities deleted
        """
        try:
            # Delete opportunities that are old and not user-associated
            deleted = db.query(RFQ).filter(
                and_(
                    RFQ.created_at < cutoff_date,
                    RFQ.user_id.is_(None),  # Only delete system-synced opportunities
                    RFQ.deadline < datetime.utcnow()  # Only delete expired opportunities
                )
            ).delete()
            
            db.commit()
            return deleted
            
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            db.rollback()
            return 0

# Global service instance
opportunity_service = OpportunityService()