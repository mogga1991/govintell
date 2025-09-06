import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity, CollectionRun, PSCCode
from app.core.database import SessionLocal
from app.core.config import settings
import re

logger = logging.getLogger(__name__)

class BaseCollector:
    """Base class for all data collectors"""
    
    def __init__(self, platform_name: str):
        self.platform_name = platform_name
        self.session = SessionLocal()
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()
        
    def create_collection_run(self) -> CollectionRun:
        """Create a new collection run record"""
        run = CollectionRun(
            platform=self.platform_name,
            status="running",
            started_at=datetime.utcnow(),
            filters_applied=self.get_filters_config()
        )
        self.session.add(run)
        self.session.commit()
        return run
        
    def update_collection_run(self, run: CollectionRun, status: str, **kwargs):
        """Update collection run with results"""
        run.status = status
        run.completed_at = datetime.utcnow()
        for key, value in kwargs.items():
            setattr(run, key, value)
        self.session.commit()
        
    def get_filters_config(self) -> Dict[str, Any]:
        """Override in subclasses to return platform-specific filters"""
        return {}
        
    def is_product_related(self, opportunity_data: Dict[str, Any]) -> bool:
        """Determine if opportunity is product-related"""
        # Check PSC codes for products (typically start with certain numbers)
        psc_code = opportunity_data.get('psc_code', '')
        if psc_code:
            # Product PSC codes typically: 10-99 (supplies), exclude 70-99 (services)
            if psc_code[:2].isdigit():
                code_num = int(psc_code[:2])
                if 10 <= code_num <= 69:  # Product range, excluding services (70-99)
                    return True
                    
        # Check keywords in title and description
        product_keywords = [
            'equipment', 'supplies', 'hardware', 'parts', 'components', 'materials',
            'products', 'goods', 'items', 'tools', 'devices', 'instruments',
            'machinery', 'computers', 'furniture', 'vehicles', 'uniforms'
        ]
        
        text_to_check = f"{opportunity_data.get('title', '')} {opportunity_data.get('description', '')}".lower()
        
        for keyword in product_keywords:
            if keyword in text_to_check:
                return True
                
        return False

class SAMGovCollector(BaseCollector):
    """Collector for SAM.gov opportunities"""
    
    def __init__(self):
        super().__init__("SAM")
        self.base_url = "https://api.sam.gov/prod/opportunities/v2/search"
        self.api_key = settings.SAM_GOV_API_KEY
        
    def get_filters_config(self) -> Dict[str, Any]:
        return {
            "notice_types": ["o", "k"],  # Solicitation, Combined Synopsis/Solicitation
            "psc_codes": self.get_product_psc_codes(),
            "posted_from": (datetime.now() - timedelta(days=30)).strftime("%m/%d/%Y"),
            "posted_to": datetime.now().strftime("%m/%d/%Y")
        }
        
    def get_product_psc_codes(self) -> List[str]:
        """Get list of product-related PSC codes"""
        # These are major product categories from PSC manual
        product_psc_ranges = [
            "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",  # Weapons, ammunition
            "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",  # Ship/marine equipment
            "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",  # Mechanical parts
            "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",  # Hardware, electrical
            "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",  # Vehicles, engines
            "60", "61", "62", "63", "64", "65", "66", "67", "68", "69"   # Medical, office supplies
        ]
        return product_psc_ranges
        
    async def collect_opportunities(self) -> Dict[str, Any]:
        """Collect opportunities from SAM.gov API"""
        run = self.create_collection_run()
        results = {"total_fetched": 0, "new_opportunities": 0, "errors": []}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get opportunities with product PSC codes
                for psc_code in self.get_product_psc_codes():
                    try:
                        params = {
                            "api_key": self.api_key,
                            "psc": psc_code,
                            "postedFrom": (datetime.now() - timedelta(days=30)).strftime("%m/%d/%Y"),
                            "postedTo": datetime.now().strftime("%m/%d/%Y"),
                            "noticeType": "o,k",  # Solicitation types
                            "limit": 1000
                        }
                        
                        response = await client.get(self.base_url, params=params)
                        response.raise_for_status()
                        
                        data = response.json()
                        opportunities = data.get("opportunitiesData", [])
                        
                        for opp_data in opportunities:
                            if self.process_opportunity(opp_data):
                                results["new_opportunities"] += 1
                            results["total_fetched"] += 1
                            
                    except Exception as e:
                        error_msg = f"Error fetching PSC {psc_code}: {str(e)}"
                        results["errors"].append(error_msg)
                        logger.error(error_msg)
                        
            self.update_collection_run(run, "completed", **results, errors_count=len(results["errors"]))
            
        except Exception as e:
            error_msg = f"SAM.gov collection failed: {str(e)}"
            results["errors"].append(error_msg)
            self.update_collection_run(run, "failed", error_messages=results["errors"])
            logger.error(error_msg)
            
        return results
        
    def process_opportunity(self, opp_data: Dict[str, Any]) -> bool:
        """Process and store a single opportunity"""
        try:
            solicitation_number = opp_data.get("solicitationNumber", "")
            if not solicitation_number:
                return False
                
            # Check if already exists
            existing = self.session.query(Opportunity).filter(
                Opportunity.solicitation_number == solicitation_number
            ).first()
            
            if existing:
                # Update if needed
                existing.last_sync_at = datetime.utcnow()
                self.session.commit()
                return False
                
            # Create new opportunity
            opportunity = Opportunity(
                title=opp_data.get("title", "")[:500],
                solicitation_number=solicitation_number,
                description=opp_data.get("description", ""),
                posted_date=self.parse_date(opp_data.get("postedDate")),
                response_deadline=self.parse_date(opp_data.get("responseDeadLine")),
                agency=opp_data.get("departmentName", ""),
                office=opp_data.get("officeAddress", {}).get("city", ""),
                psc_code=opp_data.get("classificationCode", ""),
                naics_code=opp_data.get("naicsCode", ""),
                opportunity_type=opp_data.get("type", ""),
                set_aside=opp_data.get("typeOfSetAside", ""),
                source_platform="SAM",
                source_url=f"https://sam.gov/opp/{opp_data.get('noticeId', '')}/view",
                source_id=opp_data.get("noticeId", ""),
                is_product_related=self.is_product_related(opp_data),
                last_sync_at=datetime.utcnow()
            )
            
            self.session.add(opportunity)
            self.session.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error processing SAM opportunity: {str(e)}")
            self.session.rollback()
            return False
            
    def parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse date string to datetime object"""
        if not date_str:
            return None
        try:
            # SAM.gov uses format like "Dec 31, 2024 11:59 pm EST"
            return datetime.strptime(date_str[:10], "%b %d, %Y")
        except:
            return None

class DIBBSCollector(BaseCollector):
    """Collector for DIBBS opportunities"""
    
    def __init__(self):
        super().__init__("DIBBS")
        # DIBBS doesn't have public API, would need web scraping or special access
        # This is a placeholder structure
        
    async def collect_opportunities(self) -> Dict[str, Any]:
        """Collect opportunities from DIBBS"""
        # Placeholder - DIBBS requires special access
        logger.info("DIBBS collection requires special DLA access - implementing placeholder")
        return {"total_fetched": 0, "new_opportunities": 0, "errors": ["DIBBS API access not available"]}

class GSAeBuyCollector(BaseCollector):
    """Collector for GSA eBuy opportunities"""
    
    def __init__(self):
        super().__init__("GSA_EBUY")
        # GSA eBuy data comes through SAM.gov API
        
    async def collect_opportunities(self) -> Dict[str, Any]:
        """Collect GSA eBuy opportunities via SAM.gov API"""
        run = self.create_collection_run()
        results = {"total_fetched": 0, "new_opportunities": 0, "errors": []}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "api_key": settings.SAM_GOV_API_KEY,
                    "postedFrom": (datetime.now() - timedelta(days=30)).strftime("%m/%d/%Y"),
                    "postedTo": datetime.now().strftime("%m/%d/%Y"),
                    "noticeType": "o,k",
                    "limit": 1000,
                    "orgType": "GSA"  # Filter for GSA opportunities
                }
                
                response = await client.get("https://api.sam.gov/prod/opportunities/v2/search", params=params)
                response.raise_for_status()
                
                data = response.json()
                opportunities = data.get("opportunitiesData", [])
                
                for opp_data in opportunities:
                    if self.process_gsa_opportunity(opp_data):
                        results["new_opportunities"] += 1
                    results["total_fetched"] += 1
                    
            self.update_collection_run(run, "completed", **results)
            
        except Exception as e:
            error_msg = f"GSA eBuy collection failed: {str(e)}"
            results["errors"].append(error_msg)
            self.update_collection_run(run, "failed", error_messages=results["errors"])
            
        return results
        
    def process_gsa_opportunity(self, opp_data: Dict[str, Any]) -> bool:
        """Process GSA eBuy opportunity"""
        # Similar to SAM processing but with GSA-specific fields
        return self.process_opportunity(opp_data)

class DataCollectionOrchestrator:
    """Orchestrates data collection from multiple sources"""
    
    def __init__(self):
        self.collectors = [
            SAMGovCollector(),
            GSAeBuyCollector(),
            # DIBBSCollector(),  # Enable when API access is available
        ]
        
    async def run_daily_collection(self) -> Dict[str, Any]:
        """Run daily data collection from all sources"""
        logger.info("Starting daily opportunity collection")
        
        total_results = {
            "total_fetched": 0,
            "new_opportunities": 0,
            "errors": [],
            "platform_results": {}
        }
        
        for collector in self.collectors:
            try:
                with collector:
                    platform_results = await collector.collect_opportunities()
                    total_results["platform_results"][collector.platform_name] = platform_results
                    total_results["total_fetched"] += platform_results["total_fetched"]
                    total_results["new_opportunities"] += platform_results["new_opportunities"]
                    total_results["errors"].extend(platform_results.get("errors", []))
                    
            except Exception as e:
                error_msg = f"Error in {collector.platform_name} collection: {str(e)}"
                total_results["errors"].append(error_msg)
                logger.error(error_msg)
                
        logger.info(f"Daily collection completed: {total_results['new_opportunities']} new opportunities")
        return total_results

# Singleton instance
data_collector = DataCollectionOrchestrator()