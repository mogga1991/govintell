"""
Data deduplication and standardization service for opportunity data
"""
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from difflib import SequenceMatcher
from app.models.opportunity import Opportunity
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

class OpportunityDeduplicator:
    """Service for identifying and managing duplicate opportunities across platforms"""
    
    def __init__(self):
        self.similarity_threshold = 0.85  # 85% similarity for duplicates
        self.title_weight = 0.4
        self.description_weight = 0.3
        self.agency_weight = 0.2
        self.dates_weight = 0.1
    
    def normalize_text(self, text: Optional[str]) -> str:
        """Normalize text for comparison"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove common solicitation prefixes/suffixes
        prefixes_to_remove = [
            "request for quote", "request for quotation", "rfq", "rfp", 
            "request for proposal", "solicitation", "notice", "announcement"
        ]
        
        for prefix in prefixes_to_remove:
            text = re.sub(rf'\b{prefix}\b\s*[-:]*\s*', '', text)
        
        # Remove solicitation numbers pattern
        text = re.sub(r'\b[A-Z0-9\-]{8,}\b', '', text)
        
        # Remove common government abbreviations
        gov_abbrevs = ['dept', 'department', 'gov', 'federal', 'agency', 'administration']
        for abbrev in gov_abbrevs:
            text = re.sub(rf'\b{abbrev}\b', '', text)
        
        return text.strip()
    
    def calculate_similarity(self, opp1: Opportunity, opp2: Opportunity) -> float:
        """Calculate overall similarity score between two opportunities"""
        
        # Title similarity
        title1 = self.normalize_text(opp1.title)
        title2 = self.normalize_text(opp2.title)
        title_sim = SequenceMatcher(None, title1, title2).ratio()
        
        # Description similarity
        desc1 = self.normalize_text(opp1.description)[:500]  # Limit for performance
        desc2 = self.normalize_text(opp2.description)[:500]
        desc_sim = SequenceMatcher(None, desc1, desc2).ratio()
        
        # Agency similarity
        agency1 = self.normalize_text(opp1.agency)
        agency2 = self.normalize_text(opp2.agency)
        agency_sim = 1.0 if agency1 == agency2 else 0.0
        
        # Date proximity (closer dates = higher similarity)
        date_sim = 0.0
        if opp1.posted_date and opp2.posted_date:
            date_diff = abs((opp1.posted_date - opp2.posted_date).days)
            # Max similarity if posted within 3 days
            date_sim = max(0, 1.0 - (date_diff / 7.0))  # Linear decay over 7 days
        
        # Weighted average
        overall_similarity = (
            title_sim * self.title_weight +
            desc_sim * self.description_weight +
            agency_sim * self.agency_weight +
            date_sim * self.dates_weight
        )
        
        return overall_similarity
    
    def find_potential_duplicates(self, session: Session, target_opp: Opportunity, 
                                days_window: int = 14) -> List[Tuple[Opportunity, float]]:
        """Find potential duplicates for a given opportunity"""
        
        # Query for opportunities in similar timeframe (excluding the target)
        query = session.query(Opportunity).filter(
            and_(
                Opportunity.id != target_opp.id,
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active'
            )
        )
        
        # Add date range filter if target has posted_date
        if target_opp.posted_date:
            start_date = target_opp.posted_date - timedelta(days=days_window)
            end_date = target_opp.posted_date + timedelta(days=days_window)
            query = query.filter(
                and_(
                    Opportunity.posted_date >= start_date,
                    Opportunity.posted_date <= end_date
                )
            )
        
        # Filter by same agency or related PSC codes if available
        filters = []
        if target_opp.agency:
            filters.append(Opportunity.agency.ilike(f"%{target_opp.agency[:20]}%"))
        if target_opp.psc_code:
            filters.append(Opportunity.psc_code == target_opp.psc_code)
        
        if filters:
            query = query.filter(or_(*filters))
        
        candidates = query.limit(50).all()  # Limit for performance
        
        # Calculate similarities
        duplicates = []
        for candidate in candidates:
            similarity = self.calculate_similarity(target_opp, candidate)
            if similarity >= self.similarity_threshold:
                duplicates.append((candidate, similarity))
        
        # Sort by similarity (highest first)
        duplicates.sort(key=lambda x: x[1], reverse=True)
        
        return duplicates
    
    def mark_as_duplicate(self, session: Session, duplicate_opp: Opportunity, 
                         master_opp: Opportunity, similarity_score: float):
        """Mark an opportunity as duplicate"""
        duplicate_opp.is_duplicate = True
        duplicate_opp.master_opportunity_id = master_opp.id
        duplicate_opp.updated_at = datetime.utcnow()
        
        # Add metadata about the duplication
        if not duplicate_opp.keywords_matched:
            duplicate_opp.keywords_matched = {}
        
        duplicate_opp.keywords_matched['duplicate_info'] = {
            'similarity_score': similarity_score,
            'marked_as_duplicate_at': datetime.utcnow().isoformat(),
            'master_solicitation_number': master_opp.solicitation_number
        }
        
        session.commit()
        
        logger.info(f"Marked opportunity {duplicate_opp.solicitation_number} as duplicate of {master_opp.solicitation_number} (similarity: {similarity_score:.3f})")
    
    def deduplicate_opportunities(self, session: Session, limit: int = 100) -> Dict[str, int]:
        """Run deduplication process on recent opportunities"""
        logger.info("Starting opportunity deduplication process...")
        
        # Get recent opportunities that haven't been checked for duplicates
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        opportunities = session.query(Opportunity).filter(
            and_(
                Opportunity.is_duplicate == False,
                Opportunity.status == 'active',
                Opportunity.created_at >= cutoff_date
            )
        ).order_by(Opportunity.created_at.desc()).limit(limit).all()
        
        duplicates_found = 0
        pairs_checked = 0
        
        for opp in opportunities:
            potential_duplicates = self.find_potential_duplicates(session, opp)
            
            for duplicate_candidate, similarity in potential_duplicates:
                pairs_checked += 1
                
                # Choose the "master" record (prefer earlier posted date, then SAM.gov)
                if self.should_be_master(opp, duplicate_candidate):
                    master_opp = opp
                    duplicate_opp = duplicate_candidate
                else:
                    master_opp = duplicate_candidate
                    duplicate_opp = opp
                
                # Mark as duplicate
                self.mark_as_duplicate(session, duplicate_opp, master_opp, similarity)
                duplicates_found += 1
        
        logger.info(f"Deduplication completed: {duplicates_found} duplicates found from {pairs_checked} pairs checked")
        
        return {
            'duplicates_found': duplicates_found,
            'pairs_checked': pairs_checked,
            'opportunities_processed': len(opportunities)
        }
    
    def should_be_master(self, opp1: Opportunity, opp2: Opportunity) -> bool:
        """Determine which opportunity should be the master record"""
        
        # Prefer SAM.gov as authoritative source
        if opp1.source_platform == 'SAM' and opp2.source_platform != 'SAM':
            return True
        if opp2.source_platform == 'SAM' and opp1.source_platform != 'SAM':
            return False
        
        # Prefer earlier posted date
        if opp1.posted_date and opp2.posted_date:
            return opp1.posted_date <= opp2.posted_date
        
        # Prefer the one with more complete data
        opp1_completeness = self.calculate_data_completeness(opp1)
        opp2_completeness = self.calculate_data_completeness(opp2)
        
        return opp1_completeness >= opp2_completeness
    
    def calculate_data_completeness(self, opp: Opportunity) -> int:
        """Calculate data completeness score"""
        score = 0
        fields_to_check = [
            'description', 'agency', 'office', 'psc_code', 'naics_code',
            'response_deadline', 'contact_email', 'set_aside'
        ]
        
        for field in fields_to_check:
            if getattr(opp, field, None):
                score += 1
        
        return score

class DataStandardizer:
    """Service for standardizing opportunity data across platforms"""
    
    def __init__(self):
        self.agency_mappings = self.load_agency_mappings()
        self.psc_mappings = self.load_psc_mappings()
    
    def load_agency_mappings(self) -> Dict[str, str]:
        """Load agency name standardization mappings"""
        return {
            # Common agency abbreviations and variations
            'dept of defense': 'Department of Defense',
            'dod': 'Department of Defense',
            'department of the army': 'Department of Defense - Army',
            'us army': 'Department of Defense - Army',
            'dept of navy': 'Department of Defense - Navy',
            'us navy': 'Department of Defense - Navy',
            'air force': 'Department of Defense - Air Force',
            'usaf': 'Department of Defense - Air Force',
            'gsa': 'General Services Administration',
            'gen svc admin': 'General Services Administration',
            'dla': 'Defense Logistics Agency',
            'defense logistics agency': 'Defense Logistics Agency',
            'va': 'Department of Veterans Affairs',
            'veterans admin': 'Department of Veterans Affairs',
            'dept veterans affairs': 'Department of Veterans Affairs'
        }
    
    def load_psc_mappings(self) -> Dict[str, Dict[str, str]]:
        """Load PSC code standardization mappings"""
        return {
            # Map related PSC codes to standard categories
            'electronics': ['58', '59', '60', '61'],
            'vehicles': ['23', '24', '25', '26'],
            'medical': ['65', '66', '67'],
            'office_supplies': ['75', '76', '77'],
            'hardware': ['53', '54', '55']
        }
    
    def standardize_agency_name(self, agency_name: Optional[str]) -> Optional[str]:
        """Standardize agency name"""
        if not agency_name:
            return None
        
        normalized = agency_name.lower().strip()
        return self.agency_mappings.get(normalized, agency_name)
    
    def standardize_opportunity(self, session: Session, opportunity: Opportunity) -> bool:
        """Standardize a single opportunity's data"""
        changes_made = False
        
        # Standardize agency name
        if opportunity.agency:
            standardized_agency = self.standardize_agency_name(opportunity.agency)
            if standardized_agency != opportunity.agency:
                opportunity.agency = standardized_agency
                changes_made = True
        
        # Clean up title
        if opportunity.title:
            clean_title = self.clean_title(opportunity.title)
            if clean_title != opportunity.title:
                opportunity.title = clean_title
                changes_made = True
        
        # Standardize PSC codes (ensure proper format)
        if opportunity.psc_code:
            clean_psc = self.clean_psc_code(opportunity.psc_code)
            if clean_psc != opportunity.psc_code:
                opportunity.psc_code = clean_psc
                changes_made = True
        
        if changes_made:
            opportunity.updated_at = datetime.utcnow()
            session.commit()
        
        return changes_made
    
    def clean_title(self, title: str) -> str:
        """Clean and standardize opportunity title"""
        # Remove extra whitespace
        title = ' '.join(title.split())
        
        # Ensure proper capitalization
        title = title.title()
        
        # Handle common abbreviations
        abbreviations = {
            'Rfq': 'RFQ',
            'Rfp': 'RFP',
            'Usa': 'USA',
            'Us ': 'US ',
            'Dod': 'DoD',
            'Gsa': 'GSA'
        }
        
        for abbrev, replacement in abbreviations.items():
            title = title.replace(abbrev, replacement)
        
        return title
    
    def clean_psc_code(self, psc_code: str) -> str:
        """Clean and standardize PSC code format"""
        # Remove whitespace and convert to uppercase
        psc_code = psc_code.strip().upper()
        
        # Ensure 4-character format (pad with zeros if needed)
        if len(psc_code) == 2:
            psc_code = psc_code + '00'
        elif len(psc_code) == 3:
            psc_code = psc_code + '0'
        
        return psc_code

# Global instances
deduplicator = OpportunityDeduplicator()
standardizer = DataStandardizer()