"""
SAM.gov API service for fetching opportunities and managing data sync
"""
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SAMService:
    """Service for interacting with SAM.gov API"""
    
    def __init__(self):
        self.base_url = "https://api.sam.gov/opportunities/v2/search"
        self.headers = {
            'X-Api-Key': settings.SAM_GOV_API_KEY,
            'Content-Type': 'application/json'
        }
    
    async def search_opportunities(
        self,
        keyword: Optional[str] = None,
        department: Optional[str] = None,
        notice_types: Optional[List[str]] = None,
        psc_codes: Optional[List[str]] = None,
        posted_from: Optional[datetime] = None,
        posted_to: Optional[datetime] = None,
        size: int = 20,
        page: int = 0
    ) -> Dict:
        """
        Search opportunities with multiple filters
        
        Args:
            keyword: Search term (for products/services)
            department: Department/agency name filter
            notice_types: List of notice types (o, s, p, k, etc.)
            psc_codes: List of PSC (Product Service Codes)
            posted_from: Start date for posting range
            posted_to: End date for posting range
            size: Number of results per page
            page: Page number (0-based)
        
        Returns:
            Dictionary with opportunities data and metadata
        """
        params = {
            'size': size,
            'page': page,
            'includeCount': 'true'
        }
        
        # Add search filters
        if keyword:
            params['keyword'] = keyword
        
        if notice_types:
            params['noticeType'] = ','.join(notice_types)
        
        if posted_from:
            params['postedFrom'] = posted_from.strftime('%m/%d/%Y')
        
        if posted_to:
            params['postedTo'] = posted_to.strftime('%m/%d/%Y')
        
        # Note: Department and PSC filtering might need to be done post-query
        # as the API parameters may be different than expected
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    self.base_url,
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Post-process filtering if needed
                opportunities = data.get('opportunitiesData', [])
                
                if department:
                    opportunities = [
                        opp for opp in opportunities 
                        if department.lower() in opp.get('organizationFullName', '').lower()
                        or department.lower() in opp.get('departmentFullName', '').lower()
                    ]
                
                if psc_codes:
                    opportunities = [
                        opp for opp in opportunities 
                        if opp.get('classificationCode') in psc_codes
                    ]
                
                # Return filtered results
                return {
                    'opportunities': opportunities,
                    'totalRecords': len(opportunities) if (department or psc_codes) else data.get('totalRecords', 0),
                    'page': page,
                    'size': size,
                    'totalPages': (len(opportunities) + size - 1) // size if (department or psc_codes) else (data.get('totalRecords', 0) + size - 1) // size
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"SAM.gov API HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"SAM.gov API error: {str(e)}")
            raise
    
    async def get_opportunity_by_id(self, notice_id: str) -> Optional[Dict]:
        """
        Get specific opportunity by notice ID
        
        Args:
            notice_id: The opportunity notice ID
            
        Returns:
            Opportunity data or None if not found
        """
        params = {
            'opportunityIds': notice_id,
            'size': 1
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    self.base_url,
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                opportunities = data.get('opportunitiesData', [])
                
                return opportunities[0] if opportunities else None
                
        except Exception as e:
            logger.error(f"Error fetching opportunity {notice_id}: {str(e)}")
            return None
    
    async def get_opportunity_by_solicitation_number(self, sol_number: str) -> Optional[Dict]:
        """
        Get opportunity by solicitation number
        
        Args:
            sol_number: Solicitation number
            
        Returns:
            Opportunity data or None if not found
        """
        params = {
            'solNumber': sol_number,
            'size': 1
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    self.base_url,
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                opportunities = data.get('opportunitiesData', [])
                
                return opportunities[0] if opportunities else None
                
        except Exception as e:
            logger.error(f"Error fetching solicitation {sol_number}: {str(e)}")
            return None
    
    async def get_daily_opportunities(self, target_date: Optional[datetime] = None) -> List[Dict]:
        """
        Get all opportunities posted on a specific date (for daily sync)
        
        Args:
            target_date: Date to fetch opportunities for (defaults to yesterday)
            
        Returns:
            List of opportunity dictionaries
        """
        if not target_date:
            target_date = datetime.now() - timedelta(days=1)
        
        # SAM.gov typically posts opportunities in the morning
        start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        all_opportunities = []
        page = 0
        size = 100  # Larger size for bulk sync
        
        while True:
            try:
                params = {
                    'postedFrom': start_date.strftime('%m/%d/%Y'),
                    'postedTo': end_date.strftime('%m/%d/%Y'),
                    'size': size,
                    'page': page,
                    'includeCount': 'true'
                }
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.get(
                        self.base_url,
                        headers=self.headers,
                        params=params
                    )
                    response.raise_for_status()
                    
                    data = response.json()
                    opportunities = data.get('opportunitiesData', [])
                    
                    if not opportunities:
                        break
                    
                    all_opportunities.extend(opportunities)
                    
                    # Check if we have more pages
                    total_records = data.get('totalRecords', 0)
                    if len(all_opportunities) >= total_records:
                        break
                    
                    page += 1
                    
                    # Add small delay to be respectful to API
                    await asyncio.sleep(0.1)
                    
            except Exception as e:
                logger.error(f"Error fetching daily opportunities page {page}: {str(e)}")
                break
        
        logger.info(f"Fetched {len(all_opportunities)} opportunities for {target_date.strftime('%Y-%m-%d')}")
        return all_opportunities
    
    def extract_notice_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract notice ID from SAM.gov URL
        
        Args:
            url: SAM.gov opportunity URL
            
        Returns:
            Notice ID or None if not found
        """
        try:
            # Common SAM.gov URL patterns:
            # https://sam.gov/opp/{noticeId}/view
            # https://www.sam.gov/opp/{noticeId}
            import re
            
            patterns = [
                r'sam\.gov/opp/([a-f0-9]{32})',
                r'sam\.gov/opp/([a-f0-9]{32})/view',
                r'opportunities/v\d+/search\?.*opportunityIds=([a-f0-9]{32})'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, url, re.IGNORECASE)
                if match:
                    return match.group(1)
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting notice ID from URL {url}: {str(e)}")
            return None
    
    def build_sam_url(self, notice_id: str) -> str:
        """
        Build SAM.gov URL from notice ID
        
        Args:
            notice_id: Opportunity notice ID
            
        Returns:
            SAM.gov URL
        """
        return f"https://sam.gov/opp/{notice_id}/view"

# Create global instance
sam_service = SAMService()