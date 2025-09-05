# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-05-rfq-management-enhancement/spec.md

> Created: 2025-09-05
> Version: 1.0.0

## Technical Requirements

### Performance Requirements
- RFQ search results must load within 2 seconds for queries returning up to 1000 results
- Matching algorithm calculations must complete within 500ms per RFQ
- Email alerts must be delivered within 15 minutes of new matching RFQs being available
- System must support concurrent usage by up to 1000 active users

### Scalability Requirements
- Database must efficiently handle up to 100,000 active RFQs
- Search system must scale to support 10,000+ daily searches
- Email notification system must handle up to 5,000 daily alert emails
- Matching algorithm must process profile updates for 10,000+ users

### Security Requirements
- All RFQ data access must be authenticated and authorized
- User tracking data must be isolated per user account
- Email preferences must be encrypted and secure
- API endpoints must implement rate limiting to prevent abuse

## Approach

### Database Architecture

#### Core Tables

```sql
-- RFQs table with comprehensive indexing
CREATE TABLE rfqs (
  id SERIAL PRIMARY KEY,
  solicitation_number VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  agency VARCHAR(255) NOT NULL,
  office VARCHAR(255),
  naics_codes TEXT[], -- Array of NAICS codes
  psc_codes TEXT[], -- Array of PSC codes
  set_aside_type VARCHAR(100),
  contract_value_min DECIMAL(15,2),
  contract_value_max DECIMAL(15,2),
  location_city VARCHAR(255),
  location_state VARCHAR(2),
  location_country VARCHAR(3) DEFAULT 'USA',
  response_deadline TIMESTAMP NOT NULL,
  posted_date TIMESTAMP NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  source_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rfqs_naics ON rfqs USING GIN(naics_codes);
CREATE INDEX idx_rfqs_psc ON rfqs USING GIN(psc_codes);
CREATE INDEX idx_rfqs_location ON rfqs (location_state, location_city);
CREATE INDEX idx_rfqs_value ON rfqs (contract_value_min, contract_value_max);
CREATE INDEX idx_rfqs_deadline ON rfqs (response_deadline);
CREATE INDEX idx_rfqs_posted ON rfqs (posted_date);
CREATE INDEX idx_rfqs_status ON rfqs (status);

-- User RFQ tracking
CREATE TABLE user_rfq_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
  status VARCHAR(50) NOT NULL, -- 'saved', 'watching', 'applied', 'won', 'lost'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, rfq_id)
);

CREATE INDEX idx_user_rfq_tracking_user ON user_rfq_tracking (user_id);
CREATE INDEX idx_user_rfq_tracking_status ON user_rfq_tracking (user_id, status);

-- User saved searches
CREATE TABLE user_saved_searches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  search_criteria JSONB NOT NULL, -- Flexible search parameters
  alert_enabled BOOLEAN DEFAULT false,
  alert_frequency VARCHAR(50) DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user ON user_saved_searches (user_id);
CREATE INDEX idx_saved_searches_alerts ON user_saved_searches (alert_enabled, alert_frequency);

-- RFQ matching scores cache
CREATE TABLE rfq_matching_scores (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  naics_match_score INTEGER DEFAULT 0,
  location_match_score INTEGER DEFAULT 0,
  capability_match_score INTEGER DEFAULT 0,
  size_match_score INTEGER DEFAULT 0,
  profile_completeness_bonus INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, rfq_id)
);

CREATE INDEX idx_matching_scores_user ON rfq_matching_scores (user_id);
CREATE INDEX idx_matching_scores_score ON rfq_matching_scores (user_id, overall_score DESC);

-- Email alert queue
CREATE TABLE email_alert_queue (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  alert_type VARCHAR(100) NOT NULL, -- 'high_match', 'saved_search', 'deadline_reminder'
  rfq_id INTEGER REFERENCES rfqs(id),
  email_subject VARCHAR(255) NOT NULL,
  email_body TEXT NOT NULL,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

CREATE INDEX idx_email_queue_pending ON email_alert_queue (status, scheduled_at);
```

#### Extensions to Existing Schema

```sql
-- Add RFQ-related preferences to user_profiles table
ALTER TABLE user_profiles ADD COLUMN rfq_alert_threshold INTEGER DEFAULT 70;
ALTER TABLE user_profiles ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN digest_frequency VARCHAR(50) DEFAULT 'weekly';
ALTER TABLE user_profiles ADD COLUMN max_travel_distance INTEGER DEFAULT 50; -- miles
```

### API Endpoints

#### RFQ Search and Retrieval

```typescript
// GET /api/rfqs/search
interface RFQSearchParams {
  query?: string;
  naics_codes?: string[];
  psc_codes?: string[];
  location_state?: string;
  location_city?: string;
  max_distance?: number; // miles from user location
  contract_value_min?: number;
  contract_value_max?: number;
  set_aside_type?: string;
  deadline_after?: string; // ISO date
  deadline_before?: string; // ISO date
  posted_after?: string; // ISO date
  sort_by?: 'relevance' | 'deadline' | 'value' | 'posted_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface RFQSearchResponse {
  rfqs: RFQWithMatchingScore[];
  total_count: number;
  page: number;
  limit: number;
  has_next_page: boolean;
}

// GET /api/rfqs/:id
interface RFQDetailResponse extends RFQ {
  matching_score?: RFQMatchingScore;
  user_tracking?: UserRFQTracking;
  related_rfqs?: RFQWithMatchingScore[];
}
```

#### User RFQ Management

```typescript
// POST /api/user/rfqs/:id/track
interface TrackRFQRequest {
  status: 'saved' | 'watching' | 'applied' | 'won' | 'lost';
  notes?: string;
}

// GET /api/user/rfqs
interface UserRFQsParams {
  status?: string;
  sort_by?: 'created_at' | 'rfq_deadline' | 'matching_score';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// POST /api/user/saved-searches
interface SavedSearchRequest {
  name: string;
  search_criteria: RFQSearchParams;
  alert_enabled?: boolean;
  alert_frequency?: 'immediate' | 'daily' | 'weekly';
}
```

#### Matching and Recommendations

```typescript
// GET /api/user/rfq-recommendations
interface RecommendationsParams {
  limit?: number;
  min_score?: number;
}

interface RecommendationsResponse {
  high_match_rfqs: RFQWithMatchingScore[];
  trending_opportunities: RFQWithMatchingScore[];
  deadline_alerts: RFQWithMatchingScore[];
}

// POST /api/rfqs/:id/calculate-match
interface MatchingScoreResponse {
  overall_score: number;
  breakdown: {
    naics_match: { score: number; explanation: string };
    location_match: { score: number; explanation: string };
    capability_match: { score: number; explanation: string };
    size_match: { score: number; explanation: string };
    profile_completeness_bonus: { score: number; explanation: string };
  };
  recommendations: string[];
}
```

### Component Architecture

#### Core Components Structure

```
components/rfq/
├── search/
│   ├── RFQSearchInterface.tsx        # Main search component
│   ├── RFQFilters.tsx               # Advanced filtering panel
│   ├── RFQSearchResults.tsx         # Results grid/list
│   ├── RFQCard.tsx                  # Individual RFQ preview
│   └── SearchSaveModal.tsx          # Save search functionality
├── details/
│   ├── RFQDetailPage.tsx            # Full RFQ information
│   ├── RFQMatchingBreakdown.tsx     # Matching score explanation
│   ├── RFQActionPanel.tsx           # Save, track, apply actions
│   └── RFQRelatedItems.tsx          # Similar opportunities
├── dashboard/
│   ├── RFQDashboard.tsx             # Personal RFQ overview
│   ├── RFQCollections.tsx           # Saved RFQ folders
│   ├── RFQPipeline.tsx              # Status tracking interface
│   └── RFQRecommendations.tsx       # Personalized suggestions
└── alerts/
    ├── AlertSettings.tsx            # Email notification preferences
    ├── SavedSearches.tsx            # Manage saved searches
    └── AlertHistory.tsx             # View past notifications
```

#### Key Component Specifications

```typescript
// RFQSearchInterface Component
interface RFQSearchInterfaceProps {
  initialQuery?: string;
  initialFilters?: RFQSearchParams;
  onResultsChange?: (results: RFQSearchResponse) => void;
  embedded?: boolean; // For use in dashboard widgets
}

// RFQCard Component
interface RFQCardProps {
  rfq: RFQWithMatchingScore;
  showMatchingScore?: boolean;
  showSaveButton?: boolean;
  onSave?: (rfqId: number) => void;
  onStatusChange?: (rfqId: number, status: string) => void;
  compact?: boolean;
}

// RFQDetailPage Component  
interface RFQDetailPageProps {
  rfqId: number;
  showMatchingBreakdown?: boolean;
  showRelatedRFQs?: boolean;
  enableTracking?: boolean;
}
```

### Search and Filtering Algorithms

#### Full-Text Search Implementation

```typescript
// PostgreSQL full-text search with ranking
const buildSearchQuery = (searchParams: RFQSearchParams) => {
  let query = `
    SELECT r.*, 
           ts_rank(to_tsvector('english', r.title || ' ' || r.description), 
                   plainto_tsquery('english', $1)) as search_rank,
           ms.overall_score as matching_score
    FROM rfqs r
    LEFT JOIN rfq_matching_scores ms ON r.id = ms.rfq_id AND ms.user_id = $2
    WHERE 1=1
  `;
  
  const conditions = [];
  const params = [searchParams.query || '', userId];
  
  if (searchParams.query) {
    conditions.push(`to_tsvector('english', r.title || ' ' || r.description) @@ plainto_tsquery('english', $1)`);
  }
  
  if (searchParams.naics_codes?.length) {
    conditions.push(`r.naics_codes && $${params.length + 1}`);
    params.push(searchParams.naics_codes);
  }
  
  // Add other filter conditions...
  
  if (conditions.length > 0) {
    query += ` AND (${conditions.join(' AND ')})`;
  }
  
  // Sort by relevance, matching score, or other criteria
  query += ` ORDER BY ${getSortClause(searchParams)} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  
  return { query, params: [...params, searchParams.limit, searchParams.page * searchParams.limit] };
};
```

#### Matching Algorithm Implementation

```typescript
// RFQ Matching Score Calculator
class RFQMatchingCalculator {
  async calculateMatchingScore(userId: string, rfq: RFQ): Promise<RFQMatchingScore> {
    const userProfile = await getUserProfile(userId);
    
    const naicsMatch = this.calculateNAICSMatch(userProfile.naics_codes, rfq.naics_codes);
    const locationMatch = this.calculateLocationMatch(userProfile.location, rfq.location_city, rfq.location_state);
    const capabilityMatch = this.calculateCapabilityMatch(userProfile.capabilities, rfq.description);
    const sizeMatch = this.calculateSizeMatch(userProfile.business_size, rfq.set_aside_type);
    const completenessBonus = this.calculateCompletenessBonus(userProfile.completion_percentage);
    
    const overallScore = Math.min(100, Math.round(
      (naicsMatch * 0.35) +
      (locationMatch * 0.20) +
      (capabilityMatch * 0.25) +
      (sizeMatch * 0.15) +
      (completenessBonus * 0.05)
    ));
    
    return {
      overall_score: overallScore,
      naics_match_score: naicsMatch,
      location_match_score: locationMatch,
      capability_match_score: capabilityMatch,
      size_match_score: sizeMatch,
      profile_completeness_bonus: completenessBonus
    };
  }
  
  private calculateNAICSMatch(userNAICS: string[], rfqNAICS: string[]): number {
    if (!userNAICS?.length || !rfqNAICS?.length) return 0;
    
    const exactMatches = userNAICS.filter(code => rfqNAICS.includes(code));
    if (exactMatches.length > 0) return 100;
    
    // Check for partial matches (same industry group)
    const partialMatches = userNAICS.some(userCode => 
      rfqNAICS.some(rfqCode => userCode.substring(0, 3) === rfqCode.substring(0, 3))
    );
    
    return partialMatches ? 60 : 0;
  }
  
  private calculateLocationMatch(userLocation: Location, rfqCity: string, rfqState: string): number {
    if (!userLocation?.state || !rfqState) return 50; // Neutral if no location data
    
    if (userLocation.state === rfqState) {
      if (userLocation.city === rfqCity) return 100;
      return 80; // Same state, different city
    }
    
    // Calculate distance-based scoring for different states
    const distance = this.calculateDistance(userLocation, { city: rfqCity, state: rfqState });
    if (distance <= 50) return 90;
    if (distance <= 100) return 70;
    if (distance <= 250) return 50;
    return 20;
  }
}
```

### Email Notification System Design

#### Notification Architecture

```typescript
// Email Service with Queue Processing
class EmailNotificationService {
  async processAlertQueue(): Promise<void> {
    const pendingAlerts = await db.query(`
      SELECT * FROM email_alert_queue 
      WHERE status = 'pending' AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
      LIMIT 100
    `);
    
    for (const alert of pendingAlerts) {
      try {
        await this.sendEmail(alert);
        await this.markEmailSent(alert.id);
      } catch (error) {
        await this.markEmailFailed(alert.id, error.message);
      }
    }
  }
  
  async queueHighMatchAlert(userId: string, rfq: RFQ, matchingScore: number): Promise<void> {
    const user = await getUserById(userId);
    if (!user.email_notifications_enabled || matchingScore < user.rfq_alert_threshold) {
      return;
    }
    
    const emailContent = await this.generateHighMatchEmail(user, rfq, matchingScore);
    
    await db.query(`
      INSERT INTO email_alert_queue (user_id, alert_type, rfq_id, email_subject, email_body)
      VALUES ($1, 'high_match', $2, $3, $4)
    `, [userId, rfq.id, emailContent.subject, emailContent.body]);
  }
  
  async processSavedSearchAlerts(): Promise<void> {
    const alertEnabledSearches = await db.query(`
      SELECT * FROM user_saved_searches 
      WHERE alert_enabled = true 
      AND (last_run_at IS NULL OR last_run_at <= NOW() - INTERVAL '1 day')
    `);
    
    for (const search of alertEnabledSearches) {
      const newRFQs = await this.runSavedSearch(search);
      if (newRFQs.length > 0) {
        await this.queueSavedSearchAlert(search.user_id, search, newRFQs);
      }
      
      await this.updateLastRunTime(search.id);
    }
  }
}

// Email Templates
const emailTemplates = {
  highMatch: (user: User, rfq: RFQ, score: number) => ({
    subject: `High Match Alert: ${score}% match for "${rfq.title}"`,
    body: `
      Hi ${user.name},
      
      We found a high-match opportunity that aligns with your business profile:
      
      **${rfq.title}** (${score}% match)
      Agency: ${rfq.agency}
      Deadline: ${formatDate(rfq.response_deadline)}
      Value: ${formatCurrency(rfq.contract_value_min)} - ${formatCurrency(rfq.contract_value_max)}
      
      [View Full Details](${getAFQUrl(rfq.id)})
      
      This opportunity matches your business because:
      ${generateMatchingExplanation(score)}
      
      Best regards,
      The GovIntelligence Team
    `
  })
};
```

## External Dependencies

### Required Third-Party Services
- **Email Service**: SendGrid or AWS SES for reliable email delivery
- **Search Engine**: PostgreSQL full-text search with potential Redis caching
- **Background Job Processing**: Bull Queue with Redis for email processing
- **Monitoring**: Datadog or similar for performance monitoring

### Integration Points
- **User Profile System**: Existing profile completion and NAICS code data
- **Authentication**: NextAuth.js integration for user session management
- **Database**: Current PostgreSQL instance with additional tables
- **UI Components**: Existing shadcn/ui component library

### Data Sources
- **RFQ Data**: External feed from government contracting databases (assumed to be provided)
- **NAICS Code Mapping**: Integration with existing NAICS taxonomy system
- **Location Data**: US geographic data for distance calculations

### Performance Monitoring Requirements
- **Database Query Performance**: Monitor search query execution times
- **Matching Algorithm Performance**: Track calculation times per user/RFQ pair
- **Email Delivery Rates**: Monitor successful delivery and bounce rates
- **User Engagement Metrics**: Track search usage, save rates, and conversion metrics