export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          criteria: Json
          description: string
          icon_url: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          icon_url?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          icon_url?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_properties: Json | null
          event_type: string
          id: string
          ip_address: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_properties?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_properties?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_performance: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          method: string
          response_time_ms: number
          status_code: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          method: string
          response_time_ms: number
          status_code: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number
          status_code?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_categories: {
        Row: {
          daily_target: number
          description: string | null
          id: string
          name: string
        }
        Insert: {
          daily_target?: number
          description?: string | null
          id: string
          name: string
        }
        Update: {
          daily_target?: number
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      briefing_views: {
        Row: {
          briefing_id: string
          completed_reading: boolean | null
          id: string
          reading_mode: string | null
          reading_time_seconds: number | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          briefing_id: string
          completed_reading?: boolean | null
          id?: string
          reading_mode?: string | null
          reading_time_seconds?: number | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          briefing_id?: string
          completed_reading?: boolean | null
          id?: string
          reading_mode?: string | null
          reading_time_seconds?: number | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_views_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          academic_content: string
          category: string
          chart_config: Json | null
          created_at: string
          educational_principle: Json | null
          executive_summary: string
          id: string
          methodology_notes: string | null
          plain_speak_content: string
          publication_date: string
          published: boolean | null
          related_resources: string[] | null
          risk_disclaimers: string | null
          stocks_mentioned: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_content: string
          category: string
          chart_config?: Json | null
          created_at?: string
          educational_principle?: Json | null
          executive_summary: string
          id?: string
          methodology_notes?: string | null
          plain_speak_content: string
          publication_date: string
          published?: boolean | null
          related_resources?: string[] | null
          risk_disclaimers?: string | null
          stocks_mentioned?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_content?: string
          category?: string
          chart_config?: Json | null
          created_at?: string
          educational_principle?: Json | null
          executive_summary?: string
          id?: string
          methodology_notes?: string | null
          plain_speak_content?: string
          publication_date?: string
          published?: boolean | null
          related_resources?: string[] | null
          risk_disclaimers?: string | null
          stocks_mentioned?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_logs: {
        Row: {
          action_taken: string | null
          content_reviewed: Json | null
          created_at: string | null
          event_description: string
          event_type: string
          id: string
          reviewer: string | null
          risk_level: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          content_reviewed?: Json | null
          created_at?: string | null
          event_description: string
          event_type: string
          id?: string
          reviewer?: string | null
          risk_level?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          content_reviewed?: Json | null
          created_at?: string | null
          event_description?: string
          event_type?: string
          id?: string
          reviewer?: string | null
          risk_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          flag_reason: string
          flag_severity: string | null
          flagged_by: string | null
          id: string
          resolution: string | null
          resolved_at: string | null
          reviewed: boolean | null
          reviewer: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          flag_reason: string
          flag_severity?: string | null
          flagged_by?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          flag_reason?: string
          flag_severity?: string | null
          flagged_by?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
        }
        Relationships: []
      }
      daily_market_analysis: {
        Row: {
          analysis_data: Json | null
          analysis_date: string
          analysis_type: string
          created_at: string
          current_price: number | null
          id: string
          market_cap: number | null
          metric_name: string
          metric_value: number
          price_change_pct: number | null
          significance_score: number
          symbol: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          analysis_data?: Json | null
          analysis_date: string
          analysis_type: string
          created_at?: string
          current_price?: number | null
          id?: string
          market_cap?: number | null
          metric_name: string
          metric_value: number
          price_change_pct?: number | null
          significance_score?: number
          symbol: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          analysis_data?: Json | null
          analysis_date?: string
          analysis_type?: string
          created_at?: string
          current_price?: number | null
          id?: string
          market_cap?: number | null
          metric_name?: string
          metric_value?: number
          price_change_pct?: number | null
          significance_score?: number
          symbol?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          active_users: number | null
          briefings_delivered: number | null
          churn_rate: number | null
          created_at: string | null
          date: string
          id: string
          mrr: number | null
          new_signups: number | null
          subscription_conversions: number | null
          terminal_queries: number | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_users?: number | null
          briefings_delivered?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          mrr?: number | null
          new_signups?: number | null
          subscription_conversions?: number | null
          terminal_queries?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_users?: number | null
          briefings_delivered?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          mrr?: number | null
          new_signups?: number | null
          subscription_conversions?: number | null
          terminal_queries?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      educational_modules: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: string
          learning_objectives: string[] | null
          prerequisites: string[] | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      enhanced_daily_predictions: {
        Row: {
          algorithm_version: string
          all_signals: Json
          close_confidence: number | null
          company_name: string
          created_at: string | null
          data_quality_score: number | null
          estimated_high_time: string | null
          estimated_low_time: string | null
          expected_gain_dollars: number | null
          expected_gain_percentage: number
          explanation: string
          high_confidence: number | null
          id: string
          low_confidence: number | null
          market_context_strength: number | null
          market_phase_prediction: string | null
          methodology_notes: string | null
          microstructure_signal_strength: number | null
          model_agreement_score: number | null
          models_used: string[] | null
          news_sentiment_strength: number | null
          options_signal_strength: number | null
          overall_confidence: number | null
          predicted_close: number
          predicted_high: number
          predicted_low: number
          prediction_date: string
          premarket_price: number | null
          premarket_signal_strength: number | null
          premarket_volume: number | null
          previous_close: number
          primary_factors: Json
          processing_time_ms: number | null
          rank: number
          risk_score: number | null
          symbol: string
          technical_signal_strength: number | null
          volatility_estimate: number | null
        }
        Insert: {
          algorithm_version?: string
          all_signals: Json
          close_confidence?: number | null
          company_name: string
          created_at?: string | null
          data_quality_score?: number | null
          estimated_high_time?: string | null
          estimated_low_time?: string | null
          expected_gain_dollars?: number | null
          expected_gain_percentage: number
          explanation: string
          high_confidence?: number | null
          id?: string
          low_confidence?: number | null
          market_context_strength?: number | null
          market_phase_prediction?: string | null
          methodology_notes?: string | null
          microstructure_signal_strength?: number | null
          model_agreement_score?: number | null
          models_used?: string[] | null
          news_sentiment_strength?: number | null
          options_signal_strength?: number | null
          overall_confidence?: number | null
          predicted_close: number
          predicted_high: number
          predicted_low: number
          prediction_date: string
          premarket_price?: number | null
          premarket_signal_strength?: number | null
          premarket_volume?: number | null
          previous_close: number
          primary_factors: Json
          processing_time_ms?: number | null
          rank: number
          risk_score?: number | null
          symbol: string
          technical_signal_strength?: number | null
          volatility_estimate?: number | null
        }
        Update: {
          algorithm_version?: string
          all_signals?: Json
          close_confidence?: number | null
          company_name?: string
          created_at?: string | null
          data_quality_score?: number | null
          estimated_high_time?: string | null
          estimated_low_time?: string | null
          expected_gain_dollars?: number | null
          expected_gain_percentage?: number
          explanation?: string
          high_confidence?: number | null
          id?: string
          low_confidence?: number | null
          market_context_strength?: number | null
          market_phase_prediction?: string | null
          methodology_notes?: string | null
          microstructure_signal_strength?: number | null
          model_agreement_score?: number | null
          models_used?: string[] | null
          news_sentiment_strength?: number | null
          options_signal_strength?: number | null
          overall_confidence?: number | null
          predicted_close?: number
          predicted_high?: number
          predicted_low?: number
          prediction_date?: string
          premarket_price?: number | null
          premarket_signal_strength?: number | null
          premarket_volume?: number | null
          previous_close?: number
          primary_factors?: Json
          processing_time_ms?: number | null
          rank?: number
          risk_score?: number | null
          symbol?: string
          technical_signal_strength?: number | null
          volatility_estimate?: number | null
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string | null
          date: string
          feature_name: string
          id: string
          unique_users: number | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          feature_name: string
          id?: string
          unique_users?: number | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          feature_name?: string
          id?: string
          unique_users?: number | null
          usage_count?: number | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number | null
          post_count: number | null
          slug: string
          topic_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number | null
          post_count?: number | null
          slug: string
          topic_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          post_count?: number | null
          slug?: string
          topic_count?: number | null
        }
        Relationships: []
      }
      forum_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          post_number: number | null
          topic_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          post_number?: number | null
          topic_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          post_number?: number | null
          topic_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          last_post_at: string | null
          like_count: number | null
          reply_count: number | null
          slug: string
          title: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_post_at?: string | null
          like_count?: number | null
          reply_count?: number | null
          slug: string
          title: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_post_at?: string | null
          like_count?: number | null
          reply_count?: number | null
          slug?: string
          title?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_user_stats: {
        Row: {
          created_at: string | null
          likes_received: number | null
          post_count: number | null
          trust_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          likes_received?: number | null
          post_count?: number | null
          trust_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          likes_received?: number | null
          post_count?: number | null
          trust_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_briefings: {
        Row: {
          algorithm_version: string
          compliance_reviewed: boolean | null
          compliance_reviewer: string | null
          confidence_score: number | null
          content_academic: string
          content_plain_speak: string
          created_at: string | null
          data_sources: string[] | null
          id: string
          market_conditions: Json | null
          methodology_explanation: string | null
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          algorithm_version?: string
          compliance_reviewed?: boolean | null
          compliance_reviewer?: string | null
          confidence_score?: number | null
          content_academic: string
          content_plain_speak: string
          created_at?: string | null
          data_sources?: string[] | null
          id?: string
          market_conditions?: Json | null
          methodology_explanation?: string | null
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          algorithm_version?: string
          compliance_reviewed?: boolean | null
          compliance_reviewer?: string | null
          confidence_score?: number | null
          content_academic?: string
          content_plain_speak?: string
          created_at?: string | null
          data_sources?: string[] | null
          id?: string
          market_conditions?: Json | null
          methodology_explanation?: string | null
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          close_price: number | null
          created_at: string | null
          data_source: string | null
          id: string
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          close_price?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          symbol: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          close_price?: number | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      market_scan_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          parameters: Json
          scan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          parameters: Json
          scan_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          parameters?: Json
          scan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp: string | null
          unit: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp?: string | null
          unit?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          added_at: string | null
          allocation_percentage: number | null
          id: string
          portfolio_id: string
          quantity: number | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          added_at?: string | null
          allocation_percentage?: number | null
          id?: string
          portfolio_id: string
          quantity?: number | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          added_at?: string | null
          allocation_percentage?: number | null
          id?: string
          portfolio_id?: string
          quantity?: number | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          base_rate: number | null
          confidence: number | null
          created_at: string
          current_price: number | null
          id: number
          news_adjustment: number | null
          prediction_date: string | null
          probability: number | null
          reddit_adjustment: number | null
          symbol: string | null
        }
        Insert: {
          base_rate?: number | null
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          id?: number
          news_adjustment?: number | null
          prediction_date?: string | null
          probability?: number | null
          reddit_adjustment?: number | null
          symbol?: string | null
        }
        Update: {
          base_rate?: number | null
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          id?: number
          news_adjustment?: number | null
          prediction_date?: string | null
          probability?: number | null
          reddit_adjustment?: number | null
          symbol?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      query_patterns: {
        Row: {
          created_at: string | null
          frequency_count: number | null
          id: string
          implemented: boolean | null
          pattern_text: string
          priority_score: number | null
          suggested_feature: string | null
          updated_at: string | null
          user_intent_category: string | null
        }
        Insert: {
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          implemented?: boolean | null
          pattern_text: string
          priority_score?: number | null
          suggested_feature?: string | null
          updated_at?: string | null
          user_intent_category?: string | null
        }
        Update: {
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          implemented?: boolean | null
          pattern_text?: string
          priority_score?: number | null
          suggested_feature?: string | null
          updated_at?: string | null
          user_intent_category?: string | null
        }
        Relationships: []
      }
      terminal_queries: {
        Row: {
          ai_model_used: string | null
          compliance_notes: string | null
          created_at: string | null
          flagged_for_compliance: boolean | null
          id: string
          processing_time_ms: number | null
          query_intent: string | null
          query_text: string
          response_sources: string[] | null
          response_text: string | null
          satisfaction_rating: number | null
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          compliance_notes?: string | null
          created_at?: string | null
          flagged_for_compliance?: boolean | null
          id?: string
          processing_time_ms?: number | null
          query_intent?: string | null
          query_text: string
          response_sources?: string[] | null
          response_text?: string | null
          satisfaction_rating?: number | null
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          compliance_notes?: string | null
          created_at?: string | null
          flagged_for_compliance?: boolean | null
          id?: string
          processing_time_ms?: number | null
          query_intent?: string | null
          query_text?: string
          response_sources?: string[] | null
          response_text?: string | null
          satisfaction_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terminal_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminal_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          earned_at: string | null
          id: string
          shared_publicly: boolean | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          shared_publicly?: boolean | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          shared_publicly?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_briefings: {
        Row: {
          briefing_id: string | null
          created_at: string | null
          delivered_at: string | null
          feedback: string | null
          id: string
          personalized_content_academic: string | null
          personalized_content_plain_speak: string | null
          portfolio_id: string | null
          rating: number | null
          read_at: string | null
          symbols_analyzed: string[] | null
          user_id: string
        }
        Insert: {
          briefing_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          feedback?: string | null
          id?: string
          personalized_content_academic?: string | null
          personalized_content_plain_speak?: string | null
          portfolio_id?: string | null
          rating?: number | null
          read_at?: string | null
          symbols_analyzed?: string[] | null
          user_id: string
        }
        Update: {
          briefing_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          feedback?: string | null
          id?: string
          personalized_content_academic?: string | null
          personalized_content_plain_speak?: string | null
          portfolio_id?: string | null
          rating?: number | null
          read_at?: string | null
          symbols_analyzed?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_briefings_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "intelligence_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_briefings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_briefings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_briefings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_engagement_summary: {
        Row: {
          briefings_read: number | null
          created_at: string | null
          date: string
          id: string
          last_active_at: string | null
          pages_visited: number | null
          terminal_queries_made: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          briefings_read?: number | null
          created_at?: string | null
          date: string
          id?: string
          last_active_at?: string | null
          pages_visited?: number | null
          terminal_queries_made?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          briefings_read?: number | null
          created_at?: string | null
          date?: string
          id?: string
          last_active_at?: string | null
          pages_visited?: number | null
          terminal_queries_made?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_engagement_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          progress_percentage: number | null
          quiz_score: number | null
          started_at: string | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_primary: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          briefing_delivery_time: string | null
          briefing_timezone: string | null
          created_at: string | null
          email_notifications: boolean | null
          explanation_mode: string | null
          id: string
          privacy_level: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          briefing_delivery_time?: string | null
          briefing_timezone?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          explanation_mode?: string | null
          id?: string
          privacy_level?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          briefing_delivery_time?: string | null
          briefing_timezone?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          explanation_mode?: string | null
          id?: string
          privacy_level?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stock_follows: {
        Row: {
          followed_at: string
          id: string
          stock_symbol: string
          user_id: string
        }
        Insert: {
          followed_at?: string
          id?: string
          stock_symbol: string
          user_id: string
        }
        Update: {
          followed_at?: string
          id?: string
          stock_symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          compliance_acknowledged_at: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          investment_experience: string | null
          risk_tolerance: string | null
          role: string | null
          subscription_status: string | null
          subscription_tier: string | null
          terms_accepted_at: string
          updated_at: string | null
        }
        Insert: {
          compliance_acknowledged_at?: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          investment_experience?: string | null
          risk_tolerance?: string | null
          role?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          terms_accepted_at?: string
          updated_at?: string | null
        }
        Update: {
          compliance_acknowledged_at?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          investment_experience?: string | null
          risk_tolerance?: string | null
          role?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          terms_accepted_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_executive_summary: {
        Row: {
          briefings_today: number | null
          monthly_revenue: number | null
          paid_users: number | null
          queries_today: number | null
          total_users: number | null
          users_last_7_days: number | null
        }
        Relationships: []
      }
      admin_feature_usage: {
        Row: {
          feature: string | null
          total_usage: number | null
          unique_users: number | null
          usage_date: string | null
        }
        Relationships: []
      }
      admin_revenue_analytics: {
        Row: {
          avg_customer_age_days: number | null
          monthly_revenue: number | null
          subscriber_count: number | null
          subscription_tier: string | null
        }
        Relationships: []
      }
      admin_user_growth: {
        Row: {
          cumulative_users: number | null
          new_signups: number | null
          paid_signups: number | null
          signup_date: string | null
        }
        Relationships: []
      }
      business_metrics_summary: {
        Row: {
          active_users: number | null
          churn_rate: number | null
          date: string | null
          engagement_rate: number | null
          mrr: number | null
          mrr_growth_rate: number | null
          new_signups: number | null
          previous_mrr: number | null
          total_users: number | null
        }
        Relationships: []
      }
      query_intelligence_summary: {
        Row: {
          avg_satisfaction: number | null
          frequency_count: number | null
          implemented: boolean | null
          pattern_text: string | null
          priority_score: number | null
          suggested_feature: string | null
          unique_users_asking: number | null
          user_intent_category: string | null
        }
        Relationships: []
      }
      user_analytics_dashboard: {
        Row: {
          achievements_earned: number | null
          avg_briefing_rating: number | null
          email: string | null
          full_name: string | null
          id: string | null
          last_active: string | null
          signup_date: string | null
          subscription_tier: string | null
          total_briefings: number | null
          total_queries: number | null
          total_time_spent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_query_pattern: {
        Args: { query_text: string }
        Returns: undefined
      }
      check_and_award_achievements: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      check_terminal_query_limits: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      create_user_briefing: {
        Args: {
          p_briefing_id: string
          p_portfolio_id?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_daily_metrics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_subscription_tier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_latest_briefing: {
        Args: { p_user_id: string }
        Returns: {
          briefing_title: string
          content_academic: string
          content_plain_speak: string
          delivered_at: string
          user_rating: number
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      screen_content_compliance: {
        Args: { content_text: string }
        Returns: boolean
      }
      track_api_performance: {
        Args: {
          p_endpoint: string
          p_method: string
          p_response_time_ms: number
          p_status_code: number
          p_user_id?: string
        }
        Returns: undefined
      }
      track_user_event: {
        Args: {
          p_event_properties?: Json
          p_event_type: string
          p_session_id?: string
          p_user_id: string
        }
        Returns: string
      }
      update_user_engagement: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
