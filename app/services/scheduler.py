"""
Enhanced scheduler service for comprehensive government opportunity data collection
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.executors.pool import ThreadPoolExecutor
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.data_collector import data_collector

logger = logging.getLogger(__name__)

class SchedulerService:
    """Enhanced service for managing multi-platform data collection tasks"""
    
    def __init__(self):
        # Configure scheduler with thread pool executor
        executors = {
            'default': ThreadPoolExecutor(20),
        }
        job_defaults = {
            'coalesce': False,
            'max_instances': 1,  # Prevent overlapping runs
            'misfire_grace_time': 300  # 5 minutes
        }
        
        self.scheduler = AsyncIOScheduler(executors=executors, job_defaults=job_defaults)
        self._setup_jobs()
    
    def _setup_jobs(self):
        """Setup all scheduled jobs for comprehensive data collection"""
        
        # Primary morning collection at 6:00 AM EST - Most government platforms post overnight
        self.scheduler.add_job(
            func=self.morning_data_collection,
            trigger=CronTrigger(hour=6, minute=0, timezone='America/New_York'),
            id='morning_data_collection',
            name='Morning Multi-Platform Data Collection',
            replace_existing=True
        )
        
        # Midday supplementary check at 2:00 PM EST
        self.scheduler.add_job(
            func=self.midday_opportunity_check,
            trigger=CronTrigger(hour=14, minute=0, timezone='America/New_York'),
            id='midday_opportunity_check',
            name='Midday Opportunity Check',
            replace_existing=True
        )
        
        # Evening data processing and deduplication at 6:00 PM EST
        self.scheduler.add_job(
            func=self.evening_data_processing,
            trigger=CronTrigger(hour=18, minute=0, timezone='America/New_York'),
            id='evening_data_processing',
            name='Evening Data Processing & Deduplication',
            replace_existing=True
        )
        
        # Weekly cleanup on Sundays at 2:00 AM EST
        self.scheduler.add_job(
            func=self.weekly_cleanup,
            trigger=CronTrigger(day_of_week='sun', hour=2, minute=0, timezone='America/New_York'),
            id='weekly_cleanup',
            name='Weekly Data Cleanup',
            replace_existing=True
        )
        
        # Monthly PSC codes and metadata update on 1st at 3:00 AM EST
        self.scheduler.add_job(
            func=self.monthly_metadata_update,
            trigger=CronTrigger(day=1, hour=3, minute=0, timezone='America/New_York'),
            id='monthly_metadata_update',
            name='Monthly Metadata Update',
            replace_existing=True
        )
    
    async def morning_data_collection(self):
        """
        Comprehensive morning data collection from all government platforms
        Collects RFQs and product solicitations from SAM.gov, GSA eBuy, and available DIBBS data
        """
        logger.info("Starting comprehensive morning data collection...")
        
        try:
            start_time = datetime.now()
            
            # Run multi-platform data collection
            results = await data_collector.run_daily_collection()
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # Log comprehensive results
            logger.info(f"Morning data collection completed in {duration:.2f} seconds")
            logger.info(f"Total results: {results['new_opportunities']} new from {results['total_fetched']} fetched")
            
            # Log platform-specific results
            for platform, platform_results in results['platform_results'].items():
                logger.info(f"  {platform}: {platform_results['new_opportunities']} new from {platform_results['total_fetched']} fetched")
            
            if results['errors']:
                logger.warning(f"Collection had {len(results['errors'])} errors")
                for error in results['errors']:
                    logger.warning(f"  Error: {error}")
            
            # Send notifications
            await self._notify_collection_results(results, "morning")
                
        except Exception as e:
            logger.error(f"Morning data collection failed: {str(e)}")
            await self._notify_sync_error(f"Morning collection: {str(e)}")
    
    async def midday_opportunity_check(self):
        """
        Midday check for any additional opportunities posted during the day
        Less comprehensive than morning sync, focuses on today's postings
        """
        logger.info("Starting midday opportunity check...")
        
        try:
            today = datetime.now()
            
            # Check for opportunities posted today
            opportunities = await sam_service.get_daily_opportunities(today)
            
            if opportunities:
                db: Session = SessionLocal()
                try:
                    saved_count = await opportunity_service.bulk_save_opportunities(
                        db, opportunities, source="midday_check"
                    )
                    
                    if saved_count > 0:
                        logger.info(f"Midday check completed: {saved_count} additional opportunities saved")
                    else:
                        logger.info("Midday check completed: no new opportunities")
                        
                finally:
                    db.close()
            else:
                logger.info("Midday check completed: no opportunities found")
                
        except Exception as e:
            logger.error(f"Midday opportunity check failed: {str(e)}")
    
    async def cleanup_old_opportunities(self):
        """
        Weekly cleanup of old opportunities to manage database size
        Removes opportunities older than 90 days that are no longer active
        """
        logger.info("Starting weekly opportunity cleanup...")
        
        try:
            cutoff_date = datetime.now() - timedelta(days=90)
            
            db: Session = SessionLocal()
            try:
                deleted_count = await opportunity_service.cleanup_old_opportunities(
                    db, cutoff_date
                )
                
                logger.info(f"Weekly cleanup completed: {deleted_count} old opportunities removed")
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Weekly cleanup failed: {str(e)}")
    
    async def manual_sync(self, target_date: Optional[datetime] = None) -> int:
        """
        Manual sync for specific date (for testing or catching up)
        
        Args:
            target_date: Specific date to sync (defaults to yesterday)
            
        Returns:
            Number of opportunities synced
        """
        if not target_date:
            target_date = datetime.now() - timedelta(days=1)
        
        logger.info(f"Starting manual sync for {target_date.strftime('%Y-%m-%d')}...")
        
        try:
            opportunities = await sam_service.get_daily_opportunities(target_date)
            
            if not opportunities:
                logger.info(f"No opportunities found for {target_date.strftime('%Y-%m-%d')}")
                return 0
            
            db: Session = SessionLocal()
            try:
                saved_count = await opportunity_service.bulk_save_opportunities(
                    db, opportunities, source="manual_sync"
                )
                
                logger.info(f"Manual sync completed: {saved_count} opportunities saved for {target_date.strftime('%Y-%m-%d')}")
                return saved_count
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Manual sync failed for {target_date.strftime('%Y-%m-%d')}: {str(e)}")
            return 0
    
    async def _notify_new_opportunities(self, count: int, date: datetime):
        """
        Send notification about new opportunities (placeholder for future implementation)
        
        Args:
            count: Number of new opportunities
            date: Date of opportunities
        """
        # TODO: Implement notification system (email, webhook, etc.)
        logger.info(f"Notification: {count} new opportunities synced for {date.strftime('%Y-%m-%d')}")
    
    async def _notify_sync_error(self, error_message: str):
        """
        Send error notification (placeholder for future implementation)
        
        Args:
            error_message: Error details
        """
        # TODO: Implement error notification system
        logger.error(f"Sync error notification: {error_message}")
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.start()
        logger.info("Opportunity scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Opportunity scheduler stopped")
    
    def get_job_status(self) -> dict:
        """Get status of all scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })
        
        return {
            'running': self.scheduler.running,
            'jobs': jobs
        }

# Global scheduler instance
scheduler_service = SchedulerService()