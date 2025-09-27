import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BibleSection {
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  tags: string[];
  metadata: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Atomic Company Bible structured content
    const bibleSections: BibleSection[] = [
      // Executive Summary
      {
        category: 'strategy',
        subcategory: 'overview',
        title: 'Executive Summary',
        content: `Company Name: Atomic (formerly TubeAmp)
Mission: Democratize institutional-quality financial intelligence through radical transparency and open-source innovation
Vision: Create the world's first fully transparent, community-driven algorithmic trading ecosystem
Founded: 2025
Headquarters: United States
Stage: Pre-launch MVP (Q1 2026 Beta Launch Target)

The Opportunity:
The retail trading market exploded from 10% to 25% of daily volume post-2020, yet retail traders still lack access to institutional-quality tools and transparent methodologies. Atomic bridges this gap through a phased approach: starting with educational intelligence to build trust, then evolving into the first open-source algorithmic trading platform.

The Strategy:
- Phase 1 (Months 1-6): Launch compliant educational platform with probability briefings and paper trading
- Phase 2 (Months 6-18): Open-source core algorithms, build community
- Phase 3 (Months 18-36): Launch Atomic Open marketplace with broker integrations

Funding Targets:
- Pre-Seed Target: $500K at 500 MAU milestone
- Seed Target: $2M at 5,000 paying subscribers
- Series A Target: $10M at $3M ARR`,
        tags: ['mission', 'vision', 'strategy', 'funding', 'milestones'],
        metadata: {
          phase: 'all',
          priority: 'critical',
          stakeholders: ['founders', 'investors', 'board']
        }
      },
      
      // Core Mission
      {
        category: 'strategy',
        subcategory: 'mission',
        title: 'Core Mission Statement',
        content: `"Make algorithmic trading accessible, transparent, and educational for everyone—from curious beginners to sophisticated traders."

Atomic exists to solve three critical problems:
1. Trust Deficit: Retail traders don't trust "black box" algorithms
2. Information Asymmetry: Institutional tools remain inaccessible to retail
3. Education Gap: Most platforms teach what to trade, not how to analyze

Our solution is transparency-first approach with full algorithm disclosure and community-driven development.`,
        tags: ['mission', 'problems', 'solution', 'transparency'],
        metadata: {
          phase: 'all',
          priority: 'critical'
        }
      },

      // Phase 1: Atomic Educational
      {
        category: 'product',
        subcategory: 'phase1',
        title: 'Phase 1: Atomic Educational (Q1-Q2 2026)',
        content: `Educational intelligence platform avoiding investment adviser registration

Core Features:
- Daily Probability Briefings: 10 educational market analysis briefings daily at 7:30 AM ET
- Paper Trading Simulator: Risk-free practice environment with real market data
- Daily Movers Analysis: Educational breakdown of significant price movements
- Options Analyzer: Educational tool for understanding options mechanics
- Dual-Mode Content: Academic (formulas, technical) + Plain-Speak (analogies, simple)

Compliance Strategy:
- Publisher's exclusion from IA registration through:
  - General, non-personalized content
  - Educational framing with prominent disclaimers
  - No specific buy/sell/hold recommendations
  - Methodology transparency without individualized advice

Target Metrics:
- 500 MAU for Pre-Seed funding
- $29-49/month pricing for Learning Traders
- $79-149/month for Semi-Pro Traders`,
        tags: ['phase1', 'education', 'compliance', 'features', 'pricing'],
        metadata: {
          phase: 'phase1',
          priority: 'critical',
          timeline: 'Q1-Q2 2026'
        }
      },

      // Phase 2: Open Source
      {
        category: 'product',
        subcategory: 'phase2',
        title: 'Phase 2: Atomic Open Foundation (Q3 2026-Q2 2027)',
        content: `Open-source algorithms with community collaboration

Core Features:
- GitHub-First Algorithms: Core analysis algorithms published as open source
- Community Portal: Fork, customize, and contribute improvements
- Educational Backtesting: Historical performance analysis (non-advisory)
- Methodology Marketplace: Community-contributed analysis modules
- "Sourdough Starter" Model: Base algorithm + community enhancements

Revenue Model Evolution:
- Platform subscriptions continue
- Community marketplace commissions
- Enterprise API licensing
- Premium algorithm modules

Why This Works:
- Network effects from community contributions
- Transparency builds unbreakable trust
- Open source creates distribution moat`,
        tags: ['phase2', 'opensource', 'community', 'marketplace'],
        metadata: {
          phase: 'phase2',
          priority: 'high',
          timeline: 'Q3 2026-Q2 2027'
        }
      },

      // Phase 3: Trading Platform
      {
        category: 'product',
        subcategory: 'phase3',
        title: 'Phase 3: Atomic Trading Ecosystem (Q3 2027+)',
        content: `Full algorithmic trading platform with broker integrations

Core Features:
- Direct Broker Integration: Alpaca, IBKR, TradeStation, Schwab
- Live Algorithm Marketplace: Buy/sell/license trading strategies
- Enterprise API: White-label solutions for RIAs and family offices
- Compliance Infrastructure: RIA registration if required by feature set

Revenue Model Maturity:
- Platform subscriptions (Free, Pro $79/mo, Enterprise custom)
- Marketplace commissions on strategy sales
- Execution fees/rebates from broker partnerships
- Enterprise licensing and white-label deals

Regulatory Approach:
- RIA registration when crossing advisory threshold
- Full compliance infrastructure built by Phase 3
- Legal budget allocated for regulatory expansion`,
        tags: ['phase3', 'trading', 'brokers', 'enterprise', 'ria'],
        metadata: {
          phase: 'phase3',
          priority: 'medium',
          timeline: 'Q3 2027+'
        }
      },

      // Market Opportunity
      {
        category: 'marketing',
        subcategory: 'market',
        title: 'Market Opportunity & Size',
        content: `Total Addressable Market (TAM): $52B+
- US Retail Trading Market: $28B (2024)
- Algorithmic Trading Software: $19B globally
- Financial Education & Tools: $5B+

Serviceable Addressable Market (SAM): $8.2B
- Retail algo traders: 2.8M users × $150/month average = $5B
- Semi-professional traders: 450K users × $500/month = $2.7B
- Small RIAs/Family Offices: 10K firms × $50K/year = $500M

Serviceable Obtainable Market (SOM): $870M by Year 3
- Conservative 10% market penetration in addressable segments
- Focus on US market initially

Market Trends Driving Opportunity:
1. Retail Trading Explosion: Volume grew from 10% → 25% of daily trading (2020-2024)
2. Demand for Transparency: 73% of millennial investors want to understand methodology
3. Open Source Validation: 40% growth in GitHub developers, 90% of companies use OSS
4. Regulatory Tailwinds: SEC pushing for algorithm transparency`,
        tags: ['market', 'tam', 'sam', 'som', 'trends', 'opportunity'],
        metadata: {
          phase: 'all',
          priority: 'high',
          audience: ['investors', 'executives']
        }
      },

      // Customer Personas
      {
        category: 'marketing',
        subcategory: 'personas',
        title: 'Primary Customer Personas',
        content: `1. "The Learning Trader" (60% of target market)
Demographics: Age 25-42, Income $60K-120K, College degree, 1-3 years trading experience
Psychographics: Values learning, transparency, independence. Fears manipulation and losses.
Pain Points: Overwhelmed by information, emotional decisions, coding barriers, black box frustration
How Atomic Solves: Daily briefings, paper trading, dual-mode content, open algorithms
Value Proposition: "Learn to trade like an algorithm, with the algorithm teaching you"
Acquisition: Reddit, YouTube, TikTok, financial education content
Willingness to Pay: $29-49/month

2. "The Semi-Pro Trader" (25% of target market)
Demographics: Age 32-55, Income $100K-250K, 5+ years experience, $100K-$1M portfolio
Psychographics: Values edge, efficiency, data-driven decisions. Fears missing opportunities.
Pain Points: Expensive black box tools, time-consuming algorithm building, need for edge
How Atomic Solves: Advanced algorithms with code access, backtesting, community strategies
Value Proposition: "Institutional-quality algorithms without institutional costs—inspect every line"
Acquisition: Algo trading forums, LinkedIn, developer communities, conferences
Willingness to Pay: $79-149/month

3. "The RIA/Family Office Analyst" (10% of target market)
Demographics: Age 30-50, Portfolio Manager/CIO, $100M-$2B AUM, 3-15 investment professionals
Pain Points: $500K+ cost for in-house algorithms, vendor opacity, client explanation requirements
How Atomic Solves: Transparent methodology, white-label solutions, compliance documentation
Value Proposition: "Institutional tools with full transparency for client confidence"
Willingness to Pay: $500-2000/month per seat`,
        tags: ['personas', 'customers', 'segmentation', 'pricing', 'acquisition'],
        metadata: {
          phase: 'all',
          priority: 'critical',
          audience: ['marketing', 'product', 'sales']
        }
      },

      // Financial Projections
      {
        category: 'financial',
        subcategory: 'projections',
        title: 'Financial Projections & Unit Economics',
        content: `Year 1 (Phase 1): Educational Platform
- Target: 500 MAU, 100 paying subscribers
- MRR: $4,900 (avg $49/month)
- Annual Revenue: $58,800
- Monthly Burn: $15,000 (team + infrastructure)
- Runway: 18 months with current funding

Year 2 (Phase 2): Open Source Launch
- Target: 5,000 MAU, 1,200 paying subscribers  
- MRR: $84,000 (mix of tiers)
- Annual Revenue: $1,008,000
- Monthly Burn: $35,000 (expanded team)
- Seed Funding Target: $2M

Year 3 (Phase 3): Trading Platform
- Target: 15,000 MAU, 3,500 paying subscribers
- MRR: $250,000 (higher-tier conversions)
- Annual Revenue: $3,000,000
- Monthly Burn: $75,000 (full team + compliance)
- Series A Target: $10M at $3M ARR

Unit Economics (Steady State):
- Customer Acquisition Cost (CAC): $45-125 depending on channel
- Lifetime Value (LTV): $1,800-4,200 depending on tier
- LTV:CAC Ratio: 15:1 to 40:1 (excellent)
- Gross Margin: 85-90% (software business)
- Payback Period: 3-8 months`,
        tags: ['financials', 'projections', 'mrr', 'unit-economics', 'funding'],
        metadata: {
          phase: 'all',
          priority: 'critical',
          audience: ['investors', 'founders', 'board'],
          updated: 'quarterly'
        }
      },

      // Go-to-Market Strategy
      {
        category: 'marketing',
        subcategory: 'gtm',
        title: 'Go-to-Market Strategy',
        content: `Phase 1 GTM: Educational Content & Community
Launch Strategy:
1. Product Hunt launch with transparency angle
2. Reddit AMAs in r/algotrading, r/SecurityAnalysis, r/investing
3. YouTube educational series: "Building Trading Algorithms in Public"
4. Twitter/X thought leadership on market transparency

Content Marketing:
- Daily market analysis blog posts (SEO-optimized)
- Algorithm methodology explanations
- "Learning Journey" user stories
- Comparison content vs. existing platforms

Community Building:
- Discord server for algorithm discussions
- GitHub repository for community contributions
- Weekly live algorithm review sessions
- User-generated content program

Pricing Strategy:
- 14-day free trial (no credit card required)
- Freemium tier with limited briefings
- Essential ($29/mo): Full briefings + paper trading
- Pro ($79/mo): Advanced analysis + API access

Partnership Strategy:
- Financial education influencers
- Trading education platforms
- Open source algorithm communities
- University finance programs`,
        tags: ['gtm', 'marketing', 'launch', 'pricing', 'partnerships'],
        metadata: {
          phase: 'phase1',
          priority: 'critical',
          owner: 'marketing',
          timeline: 'pre-launch'
        }
      },

      // Technical Architecture
      {
        category: 'product',
        subcategory: 'technology',
        title: 'Technical Architecture & Infrastructure',
        content: `Core Technology Stack:
Frontend: React/TypeScript with Tailwind CSS
Backend: Supabase (PostgreSQL + Edge Functions)
Real-time: Supabase Realtime for live updates
Authentication: Supabase Auth with RLS
AI/ML: OpenAI GPT-4 for content generation
Data Sources: Polygon.io for market data
Infrastructure: Vercel for frontend, Supabase cloud

Algorithm Architecture:
- Microservices approach for different signal types
- Event-driven architecture for real-time processing
- PostgreSQL for structured data storage
- Redis for caching and session management
- Edge functions for computationally intensive operations

Data Pipeline:
1. Market data ingestion (Polygon.io)
2. Signal processing (multiple algorithms)
3. Probability calculation and ranking
4. Content generation (AI-assisted)
5. Compliance review and publication

Security & Compliance:
- SOC 2 Type II compliance preparation
- End-to-end encryption for sensitive data
- Rate limiting and DDoS protection
- Audit logging for all user actions
- GDPR compliance for EU users

Scalability Considerations:
- Horizontal scaling via edge functions
- CDN for global content delivery
- Database read replicas for query performance
- Auto-scaling based on usage patterns`,
        tags: ['technology', 'architecture', 'infrastructure', 'security', 'scalability'],
        metadata: {
          phase: 'all',
          priority: 'high',
          owner: 'engineering',
          technical: true
        }
      },

      // Legal & Compliance Framework
      {
        category: 'legal',
        subcategory: 'compliance',
        title: 'Legal & Compliance Framework',
        content: `Regulatory Strategy by Phase:

Phase 1: Publisher's Exclusion
- Educational content only (no investment advice)
- General, non-personalized information
- Prominent disclaimers on all content
- No specific buy/sell/hold recommendations
- Methodology transparency without individual advice
- Regular legal review of all content

Phase 2: Continuing Publisher Status
- Open source algorithms maintain educational framing
- Community contributions treated as general information
- No individualized recommendations in marketplace
- Terms of service updated for community features
- DMCA compliance for user-generated content

Phase 3: Investment Adviser Registration
- RIA registration when crossing advisory threshold
- Form ADV filing and ongoing compliance
- Chief Compliance Officer hire
- Written compliance policies and procedures
- Regular compliance audits and reviews

Key Legal Documents:
- Terms of Service (comprehensive)
- Privacy Policy (GDPR compliant)
- Risk Disclaimers (prominent placement)
- Subscription Agreements
- Community Guidelines
- Developer Terms (for open source)
- Enterprise Customer Agreements

Ongoing Legal Budget:
- Phase 1: $2,000/month (basic compliance)
- Phase 2: $5,000/month (expanded platform)
- Phase 3: $15,000/month (full RIA compliance)

Legal Team Requirements:
- Phase 1: External securities counsel (retained)
- Phase 2: Part-time compliance consultant
- Phase 3: Full-time Chief Compliance Officer`,
        tags: ['legal', 'compliance', 'ria', 'regulation', 'disclaimers'],
        metadata: {
          phase: 'all',
          priority: 'critical',
          owner: 'legal',
          review_frequency: 'monthly'
        }
      }
    ];

    console.log(`Starting Bible import with ${bibleSections.length} sections`);

    // Clear existing Bible content
    const { error: deleteError } = await supabaseClient
      .from('playbook_knowledge')
      .delete()
      .eq('source', 'bible');

    if (deleteError) {
      console.error('Error clearing existing Bible content:', deleteError);
    }

    // Insert new Bible content
    let successCount = 0;
    let errorCount = 0;

    for (const section of bibleSections) {
      try {
        const { error } = await supabaseClient
          .from('playbook_knowledge')
          .insert({
            category: section.category,
            subcategory: section.subcategory,
            title: section.title,
            content: section.content,
            source: 'bible',
            tags: section.tags,
            metadata: section.metadata,
            created_by: user.id
          });

        if (error) {
          console.error(`Error inserting section "${section.title}":`, error);
          errorCount++;
        } else {
          successCount++;
          console.log(`✓ Imported: ${section.title}`);
        }
      } catch (err) {
        console.error(`Exception inserting section "${section.title}":`, err);
        errorCount++;
      }
    }

    console.log(`Bible import completed: ${successCount} success, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      message: `Bible import completed successfully`,
      stats: {
        totalSections: bibleSections.length,
        imported: successCount,
        errors: errorCount
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Bible import error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})