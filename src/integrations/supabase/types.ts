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
      algorithm_performance: {
        Row: {
          algorithm_version: string
          average_confidence: number | null
          best_performing_signal: string | null
          choppy_market_accuracy: number | null
          close_accuracy_avg: number | null
          close_within_half_percent: number | null
          confidence_accuracy_correlation: number | null
          confidence_calibration: number | null
          created_at: string | null
          date: string
          directional_accuracy: number | null
          high_accuracy_avg: number | null
          high_time_accuracy_minutes: number | null
          high_volatility_accuracy: number | null
          high_within_half_percent: number | null
          id: string
          low_accuracy_avg: number | null
          low_time_accuracy_minutes: number | null
          low_volatility_accuracy: number | null
          low_within_half_percent: number | null
          pattern_performance: Json | null
          signal_performance: Json | null
          total_predictions: number | null
          trending_market_accuracy: number | null
          worst_performing_signal: string | null
        }
        Insert: {
          algorithm_version: string
          average_confidence?: number | null
          best_performing_signal?: string | null
          choppy_market_accuracy?: number | null
          close_accuracy_avg?: number | null
          close_within_half_percent?: number | null
          confidence_accuracy_correlation?: number | null
          confidence_calibration?: number | null
          created_at?: string | null
          date: string
          directional_accuracy?: number | null
          high_accuracy_avg?: number | null
          high_time_accuracy_minutes?: number | null
          high_volatility_accuracy?: number | null
          high_within_half_percent?: number | null
          id?: string
          low_accuracy_avg?: number | null
          low_time_accuracy_minutes?: number | null
          low_volatility_accuracy?: number | null
          low_within_half_percent?: number | null
          pattern_performance?: Json | null
          signal_performance?: Json | null
          total_predictions?: number | null
          trending_market_accuracy?: number | null
          worst_performing_signal?: string | null
        }
        Update: {
          algorithm_version?: string
          average_confidence?: number | null
          best_performing_signal?: string | null
          choppy_market_accuracy?: number | null
          close_accuracy_avg?: number | null
          close_within_half_percent?: number | null
          confidence_accuracy_correlation?: number | null
          confidence_calibration?: number | null
          created_at?: string | null
          date?: string
          directional_accuracy?: number | null
          high_accuracy_avg?: number | null
          high_time_accuracy_minutes?: number | null
          high_volatility_accuracy?: number | null
          high_within_half_percent?: number | null
          id?: string
          low_accuracy_avg?: number | null
          low_time_accuracy_minutes?: number | null
          low_volatility_accuracy?: number | null
          low_within_half_percent?: number | null
          pattern_performance?: Json | null
          signal_performance?: Json | null
          total_predictions?: number | null
          trending_market_accuracy?: number | null
          worst_performing_signal?: string | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          post_count: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          post_count?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          post_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_bio: string | null
          author_id: string | null
          author_name: string
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          keywords: string[] | null
          like_count: number | null
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string | null
          reading_time_minutes: number | null
          seo_schema: Json | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name: string
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_schema?: Json | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_avatar_url?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_schema?: Json | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      blog_views: {
        Row: {
          id: string
          ip_address: string | null
          post_id: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          post_id: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          post_id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string
          created_by: string
          filename: string
          id: string
          image_data: string | null
          image_url: string
          is_featured: boolean | null
          prompt: string
          tags: string[] | null
          updated_at: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          filename: string
          id?: string
          image_data?: string | null
          image_url: string
          is_featured?: boolean | null
          prompt: string
          tags?: string[] | null
          updated_at?: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          filename?: string
          id?: string
          image_data?: string | null
          image_url?: string
          is_featured?: boolean | null
          prompt?: string
          tags?: string[] | null
          updated_at?: string
          usage_notes?: string | null
        }
        Relationships: []
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
      kg_edges: {
        Row: {
          created_at: string | null
          id: string
          properties: Json | null
          relationship_type: string
          source_node_id: string | null
          strength: number | null
          target_node_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          properties?: Json | null
          relationship_type: string
          source_node_id?: string | null
          strength?: number | null
          target_node_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          properties?: Json | null
          relationship_type?: string
          source_node_id?: string | null
          strength?: number | null
          target_node_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kg_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_insights_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string
          id: string
          insight_result: Json
          query_text: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at: string
          id?: string
          insight_result: Json
          query_text: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          insight_result?: Json
          query_text?: string
        }
        Relationships: []
      }
      kg_nodes: {
        Row: {
          created_at: string | null
          entity_id: string
          id: string
          node_type: string
          properties: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          id?: string
          node_type: string
          properties?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          id?: string
          node_type?: string
          properties?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      kg_pattern_accuracy: {
        Row: {
          accuracy_score: number | null
          actual_outcome: string | null
          confidence_at_detection: number | null
          created_at: string | null
          detected_at: string
          id: string
          metadata: Json | null
          pattern_name: string
          pattern_node_id: string | null
          predicted_outcome: string
          symbol: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: string | null
          confidence_at_detection?: number | null
          created_at?: string | null
          detected_at: string
          id?: string
          metadata?: Json | null
          pattern_name: string
          pattern_node_id?: string | null
          predicted_outcome: string
          symbol: string
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: string | null
          confidence_at_detection?: number | null
          created_at?: string | null
          detected_at?: string
          id?: string
          metadata?: Json | null
          pattern_name?: string
          pattern_node_id?: string | null
          predicted_outcome?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_pattern_accuracy_pattern_node_id_fkey"
            columns: ["pattern_node_id"]
            isOneToOne: false
            referencedRelation: "kg_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      kg_signal_validation: {
        Row: {
          confidence_adjustment: number | null
          created_at: string | null
          graph_evidence: Json | null
          id: string
          prediction_id: string | null
          symbol: string
          validation_result: Json
          validation_type: string
        }
        Insert: {
          confidence_adjustment?: number | null
          created_at?: string | null
          graph_evidence?: Json | null
          id?: string
          prediction_id?: string | null
          symbol: string
          validation_result: Json
          validation_type: string
        }
        Update: {
          confidence_adjustment?: number | null
          created_at?: string | null
          graph_evidence?: Json | null
          id?: string
          prediction_id?: string | null
          symbol?: string
          validation_result?: Json
          validation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "kg_signal_validation_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "enhanced_daily_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_checklist_activity: {
        Row: {
          action_type: string
          created_at: string | null
          field_changed: string | null
          id: string
          new_value: string | null
          old_value: string | null
          page_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          page_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          page_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_checklist_activity_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "launch_checklist_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_checklist_pages: {
        Row: {
          compliance_status: string | null
          copy_status: string | null
          created_at: string | null
          functionality_status: string | null
          id: string
          last_updated_by: string | null
          layout_status: string | null
          notes: string | null
          page_name: string
          page_path: string | null
          page_section: string
          parent_page_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          compliance_status?: string | null
          copy_status?: string | null
          created_at?: string | null
          functionality_status?: string | null
          id?: string
          last_updated_by?: string | null
          layout_status?: string | null
          notes?: string | null
          page_name: string
          page_path?: string | null
          page_section: string
          parent_page_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          compliance_status?: string | null
          copy_status?: string | null
          created_at?: string | null
          functionality_status?: string | null
          id?: string
          last_updated_by?: string | null
          layout_status?: string | null
          notes?: string | null
          page_name?: string
          page_path?: string | null
          page_section?: string
          parent_page_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_checklist_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "launch_checklist_pages"
            referencedColumns: ["id"]
          },
        ]
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
      option_legs: {
        Row: {
          action: string | null
          ask: number | null
          bid: number | null
          created_at: string | null
          delta: number | null
          expiration_date: string
          gamma: number | null
          id: string
          implied_volatility: number | null
          last_price: number | null
          leg_number: number
          mid_price: number | null
          open_interest: number | null
          opportunity_id: string | null
          option_symbol: string
          option_type: string | null
          quantity: number
          strike_price: number
          theta: number | null
          vega: number | null
          volume: number | null
        }
        Insert: {
          action?: string | null
          ask?: number | null
          bid?: number | null
          created_at?: string | null
          delta?: number | null
          expiration_date: string
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          last_price?: number | null
          leg_number: number
          mid_price?: number | null
          open_interest?: number | null
          opportunity_id?: string | null
          option_symbol: string
          option_type?: string | null
          quantity: number
          strike_price: number
          theta?: number | null
          vega?: number | null
          volume?: number | null
        }
        Update: {
          action?: string | null
          ask?: number | null
          bid?: number | null
          created_at?: string | null
          delta?: number | null
          expiration_date?: string
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          last_price?: number | null
          leg_number?: number
          mid_price?: number | null
          open_interest?: number | null
          opportunity_id?: string | null
          option_symbol?: string
          option_type?: string | null
          quantity?: number
          strike_price?: number
          theta?: number | null
          vega?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "option_legs_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "options_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      options_algorithm_performance: {
        Row: {
          average_roi: number | null
          best_roi: number | null
          best_signal_type: string | null
          combinations_accuracy: number | null
          created_at: string | null
          date: string
          directional_accuracy: number | null
          id: string
          income_accuracy: number | null
          loss_count: number | null
          probability_calibration: number | null
          profitable_count: number | null
          sharpe_ratio: number | null
          signal_performance: Json | null
          spreads_accuracy: number | null
          total_opportunities: number | null
          win_rate: number | null
          worst_roi: number | null
          worst_signal_type: string | null
        }
        Insert: {
          average_roi?: number | null
          best_roi?: number | null
          best_signal_type?: string | null
          combinations_accuracy?: number | null
          created_at?: string | null
          date: string
          directional_accuracy?: number | null
          id?: string
          income_accuracy?: number | null
          loss_count?: number | null
          probability_calibration?: number | null
          profitable_count?: number | null
          sharpe_ratio?: number | null
          signal_performance?: Json | null
          spreads_accuracy?: number | null
          total_opportunities?: number | null
          win_rate?: number | null
          worst_roi?: number | null
          worst_signal_type?: string | null
        }
        Update: {
          average_roi?: number | null
          best_roi?: number | null
          best_signal_type?: string | null
          combinations_accuracy?: number | null
          created_at?: string | null
          date?: string
          directional_accuracy?: number | null
          id?: string
          income_accuracy?: number | null
          loss_count?: number | null
          probability_calibration?: number | null
          profitable_count?: number | null
          sharpe_ratio?: number | null
          signal_performance?: Json | null
          spreads_accuracy?: number | null
          total_opportunities?: number | null
          win_rate?: number | null
          worst_roi?: number | null
          worst_signal_type?: string | null
        }
        Relationships: []
      }
      options_market_data: {
        Row: {
          ask: number | null
          bid: number | null
          delta: number | null
          expiration_date: string
          gamma: number | null
          id: string
          implied_volatility: number | null
          last_price: number | null
          open_interest: number | null
          option_type: string | null
          rho: number | null
          strike_price: number
          symbol: string
          theta: number | null
          updated_at: string | null
          vega: number | null
          volume: number | null
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          delta?: number | null
          expiration_date: string
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          last_price?: number | null
          open_interest?: number | null
          option_type?: string | null
          rho?: number | null
          strike_price: number
          symbol: string
          theta?: number | null
          updated_at?: string | null
          vega?: number | null
          volume?: number | null
        }
        Update: {
          ask?: number | null
          bid?: number | null
          delta?: number | null
          expiration_date?: string
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          last_price?: number | null
          open_interest?: number | null
          option_type?: string | null
          rho?: number | null
          strike_price?: number
          symbol?: string
          theta?: number | null
          updated_at?: string | null
          vega?: number | null
          volume?: number | null
        }
        Relationships: []
      }
      options_opportunities: {
        Row: {
          after_hours_change: number | null
          algorithm_version: string | null
          analysis_date: string
          breakeven_points: Json | null
          category: string
          confidence_score: number | null
          cost_basis: number
          created_at: string | null
          days_to_expiration: number
          delta: number | null
          educational_explanation: string
          expected_value: number | null
          expiration_date: string
          flow_signal: number | null
          gamma: number | null
          historical_volatility: number | null
          id: string
          implied_volatility: number | null
          iv_percentile: number | null
          legs: Json
          margin_requirement: number | null
          max_loss: number
          max_profit: number
          model_agreement: number | null
          primary_factors: Json
          probability_of_max_loss: number | null
          probability_of_max_profit: number | null
          probability_of_profit: number | null
          probability_weighted_return: number | null
          processing_time_ms: number | null
          rank: number
          rho: number | null
          risk_adjusted_return: number | null
          risk_category: string | null
          risk_discussion: string
          risk_score: number | null
          roi_percentage: number | null
          strategy_mechanics: string
          strategy_name: string
          strategy_type: string
          technical_signal: number | null
          theta: number | null
          underlying_iv_rank: number | null
          underlying_price: number
          underlying_symbol: string
          underlying_volume: number | null
          value_signal: number | null
          vega: number | null
          volatility_signal: number | null
          volatility_skew: number | null
          volume_signal: number | null
        }
        Insert: {
          after_hours_change?: number | null
          algorithm_version?: string | null
          analysis_date: string
          breakeven_points?: Json | null
          category: string
          confidence_score?: number | null
          cost_basis: number
          created_at?: string | null
          days_to_expiration: number
          delta?: number | null
          educational_explanation: string
          expected_value?: number | null
          expiration_date: string
          flow_signal?: number | null
          gamma?: number | null
          historical_volatility?: number | null
          id?: string
          implied_volatility?: number | null
          iv_percentile?: number | null
          legs: Json
          margin_requirement?: number | null
          max_loss: number
          max_profit: number
          model_agreement?: number | null
          primary_factors: Json
          probability_of_max_loss?: number | null
          probability_of_max_profit?: number | null
          probability_of_profit?: number | null
          probability_weighted_return?: number | null
          processing_time_ms?: number | null
          rank: number
          rho?: number | null
          risk_adjusted_return?: number | null
          risk_category?: string | null
          risk_discussion: string
          risk_score?: number | null
          roi_percentage?: number | null
          strategy_mechanics: string
          strategy_name: string
          strategy_type: string
          technical_signal?: number | null
          theta?: number | null
          underlying_iv_rank?: number | null
          underlying_price: number
          underlying_symbol: string
          underlying_volume?: number | null
          value_signal?: number | null
          vega?: number | null
          volatility_signal?: number | null
          volatility_skew?: number | null
          volume_signal?: number | null
        }
        Update: {
          after_hours_change?: number | null
          algorithm_version?: string | null
          analysis_date?: string
          breakeven_points?: Json | null
          category?: string
          confidence_score?: number | null
          cost_basis?: number
          created_at?: string | null
          days_to_expiration?: number
          delta?: number | null
          educational_explanation?: string
          expected_value?: number | null
          expiration_date?: string
          flow_signal?: number | null
          gamma?: number | null
          historical_volatility?: number | null
          id?: string
          implied_volatility?: number | null
          iv_percentile?: number | null
          legs?: Json
          margin_requirement?: number | null
          max_loss?: number
          max_profit?: number
          model_agreement?: number | null
          primary_factors?: Json
          probability_of_max_loss?: number | null
          probability_of_max_profit?: number | null
          probability_of_profit?: number | null
          probability_weighted_return?: number | null
          processing_time_ms?: number | null
          rank?: number
          rho?: number | null
          risk_adjusted_return?: number | null
          risk_category?: string | null
          risk_discussion?: string
          risk_score?: number | null
          roi_percentage?: number | null
          strategy_mechanics?: string
          strategy_name?: string
          strategy_type?: string
          technical_signal?: number | null
          theta?: number | null
          underlying_iv_rank?: number | null
          underlying_price?: number
          underlying_symbol?: string
          underlying_volume?: number | null
          value_signal?: number | null
          vega?: number | null
          volatility_signal?: number | null
          volatility_skew?: number | null
          volume_signal?: number | null
        }
        Relationships: []
      }
      options_performance: {
        Row: {
          created_at: string | null
          current_delta: number | null
          current_gamma: number | null
          current_theta: number | null
          current_vega: number | null
          days_since_entry: number | null
          days_to_expiration: number | null
          early_exit_signal: boolean | null
          final_status: string | null
          hit_profit_target: boolean | null
          hit_stop_loss: boolean | null
          id: string
          is_expired: boolean | null
          opportunity_id: string | null
          realized_pnl: number | null
          realized_roi: number | null
          strategy_value: number | null
          track_date: string
          underlying_price: number | null
          unrealized_pnl: number | null
          unrealized_pnl_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          current_delta?: number | null
          current_gamma?: number | null
          current_theta?: number | null
          current_vega?: number | null
          days_since_entry?: number | null
          days_to_expiration?: number | null
          early_exit_signal?: boolean | null
          final_status?: string | null
          hit_profit_target?: boolean | null
          hit_stop_loss?: boolean | null
          id?: string
          is_expired?: boolean | null
          opportunity_id?: string | null
          realized_pnl?: number | null
          realized_roi?: number | null
          strategy_value?: number | null
          track_date: string
          underlying_price?: number | null
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          current_delta?: number | null
          current_gamma?: number | null
          current_theta?: number | null
          current_vega?: number | null
          days_since_entry?: number | null
          days_to_expiration?: number | null
          early_exit_signal?: boolean | null
          final_status?: string | null
          hit_profit_target?: boolean | null
          hit_stop_loss?: boolean | null
          id?: string
          is_expired?: boolean | null
          opportunity_id?: string | null
          realized_pnl?: number | null
          realized_roi?: number | null
          strategy_value?: number | null
          track_date?: string
          underlying_price?: number | null
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "options_performance_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "options_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      options_user_interactions: {
        Row: {
          education_module_suggested: boolean | null
          id: string
          interaction_time: string | null
          interaction_type: string | null
          opportunity_id: string | null
          risk_disclaimer_accepted: boolean | null
          user_id: string | null
        }
        Insert: {
          education_module_suggested?: boolean | null
          id?: string
          interaction_time?: string | null
          interaction_type?: string | null
          opportunity_id?: string | null
          risk_disclaimer_accepted?: boolean | null
          user_id?: string | null
        }
        Update: {
          education_module_suggested?: boolean | null
          id?: string
          interaction_time?: string | null
          interaction_type?: string | null
          opportunity_id?: string | null
          risk_disclaimer_accepted?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "options_user_interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "options_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "options_user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_accounts: {
        Row: {
          account_name: string | null
          account_type: string | null
          average_loss: number | null
          average_win: number | null
          buying_power: number
          created_at: string | null
          current_cash: number
          day_trades_count: number | null
          day_trades_reset_date: string | null
          id: string
          is_active: boolean | null
          is_pattern_day_trader: boolean | null
          last_reset_date: string | null
          losing_trades: number | null
          maintenance_requirement: number | null
          margin_call_price: number | null
          margin_used: number | null
          market_value_long: number | null
          market_value_short: number | null
          max_drawdown: number | null
          max_drawdown_date: string | null
          options_level: number | null
          profit_factor: number | null
          reset_count: number | null
          sharpe_ratio: number | null
          starting_capital: number
          total_equity: number
          total_realized_pnl: number | null
          total_trades: number | null
          total_unrealized_pnl: number | null
          updated_at: string | null
          user_id: string | null
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          account_name?: string | null
          account_type?: string | null
          average_loss?: number | null
          average_win?: number | null
          buying_power: number
          created_at?: string | null
          current_cash: number
          day_trades_count?: number | null
          day_trades_reset_date?: string | null
          id?: string
          is_active?: boolean | null
          is_pattern_day_trader?: boolean | null
          last_reset_date?: string | null
          losing_trades?: number | null
          maintenance_requirement?: number | null
          margin_call_price?: number | null
          margin_used?: number | null
          market_value_long?: number | null
          market_value_short?: number | null
          max_drawdown?: number | null
          max_drawdown_date?: string | null
          options_level?: number | null
          profit_factor?: number | null
          reset_count?: number | null
          sharpe_ratio?: number | null
          starting_capital: number
          total_equity: number
          total_realized_pnl?: number | null
          total_trades?: number | null
          total_unrealized_pnl?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          account_name?: string | null
          account_type?: string | null
          average_loss?: number | null
          average_win?: number | null
          buying_power?: number
          created_at?: string | null
          current_cash?: number
          day_trades_count?: number | null
          day_trades_reset_date?: string | null
          id?: string
          is_active?: boolean | null
          is_pattern_day_trader?: boolean | null
          last_reset_date?: string | null
          losing_trades?: number | null
          maintenance_requirement?: number | null
          margin_call_price?: number | null
          margin_used?: number | null
          market_value_long?: number | null
          market_value_short?: number | null
          max_drawdown?: number | null
          max_drawdown_date?: string | null
          options_level?: number | null
          profit_factor?: number | null
          reset_count?: number | null
          sharpe_ratio?: number | null
          starting_capital?: number
          total_equity?: number
          total_realized_pnl?: number | null
          total_trades?: number | null
          total_unrealized_pnl?: number | null
          updated_at?: string | null
          user_id?: string | null
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
      paper_achievements: {
        Row: {
          badge_icon: string | null
          category: string | null
          created_at: string | null
          criteria_type: string | null
          criteria_value: number | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          points: number | null
        }
        Insert: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          criteria_type?: string | null
          criteria_value?: number | null
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
        }
        Update: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          criteria_type?: string | null
          criteria_value?: number | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      paper_leaderboards: {
        Row: {
          account_id: string | null
          created_at: string | null
          id: string
          period: string | null
          rank: number | null
          return_percentage: number | null
          sharpe_ratio: number | null
          total_points: number | null
          total_trades: number | null
          win_rate: number | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          period?: string | null
          rank?: number | null
          return_percentage?: number | null
          sharpe_ratio?: number | null
          total_points?: number | null
          total_trades?: number | null
          win_rate?: number | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          period?: string | null
          rank?: number | null
          return_percentage?: number | null
          sharpe_ratio?: number | null
          total_points?: number | null
          total_trades?: number | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_leaderboards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_orders: {
        Row: {
          account_id: string | null
          asset_type: string
          average_fill_price: number | null
          cancelled_at: string | null
          commission: number | null
          created_at: string | null
          executed_at: string | null
          expiration_date: string | null
          fill_time: string | null
          filled_quantity: number | null
          id: string
          import_id: string | null
          import_source: string | null
          is_multi_leg: boolean | null
          leg_number: number | null
          limit_price: number | null
          option_type: string | null
          order_type: string
          parent_order_id: string | null
          quantity: number
          side: string
          slippage: number | null
          status: string | null
          stop_loss_price: number | null
          stop_price: number | null
          strategy_type: string | null
          strike_price: number | null
          symbol: string
          take_profit_price: number | null
          trade_rationale: string | null
        }
        Insert: {
          account_id?: string | null
          asset_type: string
          average_fill_price?: number | null
          cancelled_at?: string | null
          commission?: number | null
          created_at?: string | null
          executed_at?: string | null
          expiration_date?: string | null
          fill_time?: string | null
          filled_quantity?: number | null
          id?: string
          import_id?: string | null
          import_source?: string | null
          is_multi_leg?: boolean | null
          leg_number?: number | null
          limit_price?: number | null
          option_type?: string | null
          order_type: string
          parent_order_id?: string | null
          quantity: number
          side: string
          slippage?: number | null
          status?: string | null
          stop_loss_price?: number | null
          stop_price?: number | null
          strategy_type?: string | null
          strike_price?: number | null
          symbol: string
          take_profit_price?: number | null
          trade_rationale?: string | null
        }
        Update: {
          account_id?: string | null
          asset_type?: string
          average_fill_price?: number | null
          cancelled_at?: string | null
          commission?: number | null
          created_at?: string | null
          executed_at?: string | null
          expiration_date?: string | null
          fill_time?: string | null
          filled_quantity?: number | null
          id?: string
          import_id?: string | null
          import_source?: string | null
          is_multi_leg?: boolean | null
          leg_number?: number | null
          limit_price?: number | null
          option_type?: string | null
          order_type?: string
          parent_order_id?: string | null
          quantity?: number
          side?: string
          slippage?: number | null
          status?: string | null
          stop_loss_price?: number | null
          stop_price?: number | null
          strategy_type?: string | null
          strike_price?: number | null
          symbol?: string
          take_profit_price?: number | null
          trade_rationale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "paper_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_performance_snapshots: {
        Row: {
          account_id: string | null
          beta: number | null
          cash_balance: number | null
          correlation_to_spy: number | null
          created_at: string | null
          cumulative_pnl: number | null
          cumulative_return: number | null
          daily_pnl: number | null
          daily_pnl_percentage: number | null
          daily_var: number | null
          id: string
          largest_position_size: number | null
          market_value: number | null
          positions_count: number | null
          sector_concentration: Json | null
          snapshot_date: string
          total_equity: number | null
        }
        Insert: {
          account_id?: string | null
          beta?: number | null
          cash_balance?: number | null
          correlation_to_spy?: number | null
          created_at?: string | null
          cumulative_pnl?: number | null
          cumulative_return?: number | null
          daily_pnl?: number | null
          daily_pnl_percentage?: number | null
          daily_var?: number | null
          id?: string
          largest_position_size?: number | null
          market_value?: number | null
          positions_count?: number | null
          sector_concentration?: Json | null
          snapshot_date: string
          total_equity?: number | null
        }
        Update: {
          account_id?: string | null
          beta?: number | null
          cash_balance?: number | null
          correlation_to_spy?: number | null
          created_at?: string | null
          cumulative_pnl?: number | null
          cumulative_return?: number | null
          daily_pnl?: number | null
          daily_pnl_percentage?: number | null
          daily_var?: number | null
          id?: string
          largest_position_size?: number | null
          market_value?: number | null
          positions_count?: number | null
          sector_concentration?: Json | null
          snapshot_date?: string
          total_equity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_performance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_positions: {
        Row: {
          account_id: string | null
          asset_type: string
          average_cost: number
          cost_basis: number
          current_price: number | null
          daily_pnl: number | null
          delta: number | null
          expiration_date: string | null
          gamma: number | null
          id: string
          implied_volatility: number | null
          market_value: number | null
          opened_at: string | null
          option_type: string | null
          quantity: number
          rho: number | null
          side: string
          strike_price: number | null
          symbol: string
          theta: number | null
          unrealized_pnl: number | null
          unrealized_pnl_percentage: number | null
          updated_at: string | null
          vega: number | null
        }
        Insert: {
          account_id?: string | null
          asset_type: string
          average_cost: number
          cost_basis: number
          current_price?: number | null
          daily_pnl?: number | null
          delta?: number | null
          expiration_date?: string | null
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          market_value?: number | null
          opened_at?: string | null
          option_type?: string | null
          quantity: number
          rho?: number | null
          side: string
          strike_price?: number | null
          symbol: string
          theta?: number | null
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
          updated_at?: string | null
          vega?: number | null
        }
        Update: {
          account_id?: string | null
          asset_type?: string
          average_cost?: number
          cost_basis?: number
          current_price?: number | null
          daily_pnl?: number | null
          delta?: number | null
          expiration_date?: string | null
          gamma?: number | null
          id?: string
          implied_volatility?: number | null
          market_value?: number | null
          opened_at?: string | null
          option_type?: string | null
          quantity?: number
          rho?: number | null
          side?: string
          strike_price?: number | null
          symbol?: string
          theta?: number | null
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
          updated_at?: string | null
          vega?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_trade_journal: {
        Row: {
          account_id: string | null
          ai_feedback: string | null
          ai_suggestions: string | null
          common_mistakes_detected: Json | null
          confidence_level: number | null
          created_at: string | null
          emotional_state: string | null
          entry_reason: string | null
          exit_reason: string | null
          id: string
          lessons_learned: string | null
          mistakes_made: string | null
          order_id: string | null
          risk_reward_ratio: number | null
          trade_grade: string | null
          trade_setup: string | null
          updated_at: string | null
          what_went_well: string | null
        }
        Insert: {
          account_id?: string | null
          ai_feedback?: string | null
          ai_suggestions?: string | null
          common_mistakes_detected?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          emotional_state?: string | null
          entry_reason?: string | null
          exit_reason?: string | null
          id?: string
          lessons_learned?: string | null
          mistakes_made?: string | null
          order_id?: string | null
          risk_reward_ratio?: number | null
          trade_grade?: string | null
          trade_setup?: string | null
          updated_at?: string | null
          what_went_well?: string | null
        }
        Update: {
          account_id?: string | null
          ai_feedback?: string | null
          ai_suggestions?: string | null
          common_mistakes_detected?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          emotional_state?: string | null
          entry_reason?: string | null
          exit_reason?: string | null
          id?: string
          lessons_learned?: string | null
          mistakes_made?: string | null
          order_id?: string | null
          risk_reward_ratio?: number | null
          trade_grade?: string | null
          trade_setup?: string | null
          updated_at?: string | null
          what_went_well?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_trade_journal_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_trade_journal_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "paper_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_transactions: {
        Row: {
          account_id: string | null
          asset_type: string
          commission: number | null
          cost_basis_adjustment: number | null
          executed_at: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          option_type: string | null
          order_id: string | null
          other_fees: number | null
          price: number
          quantity: number
          realized_pnl: number | null
          settlement_date: string | null
          slippage: number | null
          strike_price: number | null
          symbol: string
          total_amount: number
          transaction_type: string
        }
        Insert: {
          account_id?: string | null
          asset_type: string
          commission?: number | null
          cost_basis_adjustment?: number | null
          executed_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          option_type?: string | null
          order_id?: string | null
          other_fees?: number | null
          price: number
          quantity: number
          realized_pnl?: number | null
          settlement_date?: string | null
          slippage?: number | null
          strike_price?: number | null
          symbol: string
          total_amount: number
          transaction_type: string
        }
        Update: {
          account_id?: string | null
          asset_type?: string
          commission?: number | null
          cost_basis_adjustment?: number | null
          executed_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          option_type?: string | null
          order_id?: string | null
          other_fees?: number | null
          price?: number
          quantity?: number
          realized_pnl?: number | null
          settlement_date?: string | null
          slippage?: number | null
          strike_price?: number | null
          symbol?: string
          total_amount?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "paper_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_user_achievements: {
        Row: {
          account_id: string | null
          achievement_id: string | null
          earned_at: string | null
          id: string
          points_earned: number | null
        }
        Insert: {
          account_id?: string | null
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          points_earned?: number | null
        }
        Update: {
          account_id?: string | null
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          points_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_user_achievements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "paper_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_watchlist_items: {
        Row: {
          asset_type: string
          created_at: string | null
          expiration_date: string | null
          id: string
          import_id: string | null
          import_source: string | null
          imported_at: string | null
          notes: string | null
          option_type: string | null
          strike_price: number | null
          symbol: string
          watchlist_id: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          import_id?: string | null
          import_source?: string | null
          imported_at?: string | null
          notes?: string | null
          option_type?: string | null
          strike_price?: number | null
          symbol: string
          watchlist_id?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          import_id?: string | null
          import_source?: string | null
          imported_at?: string | null
          notes?: string | null
          option_type?: string | null
          strike_price?: number | null
          symbol?: string
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "paper_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_watchlists: {
        Row: {
          account_id: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_watchlists_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      playbook_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          permissions: Json | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      playbook_ai_history: {
        Row: {
          context: Json | null
          created_at: string | null
          helpful: boolean | null
          id: string
          query: string
          response: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          helpful?: boolean | null
          id?: string
          query: string
          response: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          helpful?: boolean | null
          id?: string
          query?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      playbook_campaigns: {
        Row: {
          actual_metrics: Json | null
          actual_spend: number | null
          budget: number | null
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          playbook_template: string | null
          start_date: string | null
          status: string | null
          target_metrics: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          actual_metrics?: Json | null
          actual_spend?: number | null
          budget?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          playbook_template?: string | null
          start_date?: string | null
          status?: string | null
          target_metrics?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_metrics?: Json | null
          actual_spend?: number | null
          budget?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          playbook_template?: string | null
          start_date?: string | null
          status?: string | null
          target_metrics?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      playbook_financials: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          currency: string | null
          description: string
          end_date: string | null
          id: string
          notes: string | null
          recurring_interval: string | null
          start_date: string | null
          type: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          end_date?: string | null
          id?: string
          notes?: string | null
          recurring_interval?: string | null
          start_date?: string | null
          type: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          recurring_interval?: string | null
          start_date?: string | null
          type?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      playbook_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          source: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      playbook_metrics: {
        Row: {
          category: string | null
          created_at: string | null
          date: string
          id: string
          metric_name: string
          notes: string | null
          unit: string | null
          value: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date: string
          id?: string
          metric_name: string
          notes?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string
          id?: string
          metric_name?: string
          notes?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      playbook_projects: {
        Row: {
          assigned_to: string | null
          bible_reference: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          id: string
          milestone_id: string | null
          name: string
          phase: string | null
          priority: string | null
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          bible_reference?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          name: string
          phase?: string | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          bible_reference?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          name?: string
          phase?: string | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      playbook_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "playbook_projects"
            referencedColumns: ["id"]
          },
        ]
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
      prediction_results: {
        Row: {
          actual_close: number | null
          actual_high: number | null
          actual_high_time: string | null
          actual_low: number | null
          actual_low_time: string | null
          actual_open: number | null
          actual_volume: number | null
          close_accuracy: number | null
          confidence_score: number | null
          direction_correct: boolean | null
          high_accuracy: number | null
          hit_predicted_close: boolean | null
          hit_predicted_high: boolean | null
          hit_predicted_low: boolean | null
          id: string
          low_accuracy: number | null
          market_condition: string | null
          predicted_close: number | null
          predicted_high: number | null
          predicted_low: number | null
          prediction_date: string | null
          prediction_id: string | null
          rank: number | null
          recorded_at: string | null
          sector_performance: number | null
          spy_performance: number | null
          symbol: string | null
        }
        Insert: {
          actual_close?: number | null
          actual_high?: number | null
          actual_high_time?: string | null
          actual_low?: number | null
          actual_low_time?: string | null
          actual_open?: number | null
          actual_volume?: number | null
          close_accuracy?: number | null
          confidence_score?: number | null
          direction_correct?: boolean | null
          high_accuracy?: number | null
          hit_predicted_close?: boolean | null
          hit_predicted_high?: boolean | null
          hit_predicted_low?: boolean | null
          id?: string
          low_accuracy?: number | null
          market_condition?: string | null
          predicted_close?: number | null
          predicted_high?: number | null
          predicted_low?: number | null
          prediction_date?: string | null
          prediction_id?: string | null
          rank?: number | null
          recorded_at?: string | null
          sector_performance?: number | null
          spy_performance?: number | null
          symbol?: string | null
        }
        Update: {
          actual_close?: number | null
          actual_high?: number | null
          actual_high_time?: string | null
          actual_low?: number | null
          actual_low_time?: string | null
          actual_open?: number | null
          actual_volume?: number | null
          close_accuracy?: number | null
          confidence_score?: number | null
          direction_correct?: boolean | null
          high_accuracy?: number | null
          hit_predicted_close?: boolean | null
          hit_predicted_high?: boolean | null
          hit_predicted_low?: boolean | null
          id?: string
          low_accuracy?: number | null
          market_condition?: string | null
          predicted_close?: number | null
          predicted_high?: number | null
          predicted_low?: number | null
          prediction_date?: string | null
          prediction_id?: string | null
          rank?: number | null
          recorded_at?: string | null
          sector_performance?: number | null
          spy_performance?: number | null
          symbol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_results_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: true
            referencedRelation: "enhanced_daily_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_views: {
        Row: {
          id: string
          interaction_type: string | null
          prediction_date: string
          predictions_viewed: number[] | null
          upgraded_during_session: boolean | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          interaction_type?: string | null
          prediction_date: string
          predictions_viewed?: number[] | null
          upgraded_during_session?: boolean | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          interaction_type?: string | null
          prediction_date?: string
          predictions_viewed?: number[] | null
          upgraded_during_session?: boolean | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
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
      system_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_by_admin: boolean | null
          severity: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_by_admin?: boolean | null
          severity?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_by_admin?: boolean | null
          severity?: string | null
          title?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      unusual_options_activity: {
        Row: {
          aggressor: string | null
          created_at: string | null
          detection_date: string
          expiration_date: string | null
          id: string
          option_symbol: string
          option_type: string | null
          sentiment: string | null
          significance_score: number | null
          strike_price: number | null
          symbol: string
          trade_price: number | null
          trade_size: number | null
          volume_oi_ratio: number | null
          volume_ratio: number | null
        }
        Insert: {
          aggressor?: string | null
          created_at?: string | null
          detection_date: string
          expiration_date?: string | null
          id?: string
          option_symbol: string
          option_type?: string | null
          sentiment?: string | null
          significance_score?: number | null
          strike_price?: number | null
          symbol: string
          trade_price?: number | null
          trade_size?: number | null
          volume_oi_ratio?: number | null
          volume_ratio?: number | null
        }
        Update: {
          aggressor?: string | null
          created_at?: string | null
          detection_date?: string
          expiration_date?: string | null
          id?: string
          option_symbol?: string
          option_type?: string | null
          sentiment?: string | null
          significance_score?: number | null
          strike_price?: number | null
          symbol?: string
          trade_price?: number | null
          trade_size?: number | null
          volume_oi_ratio?: number | null
          volume_ratio?: number | null
        }
        Relationships: []
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      analyze_query_pattern: {
        Args: { query_text: string }
        Returns: undefined
      }
      calculate_daily_algorithm_performance: {
        Args: { target_date?: string }
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
      clean_expired_insights_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_briefing: {
        Args: {
          p_briefing_id: string
          p_portfolio_id?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_blog_slug: {
        Args: { title_text: string }
        Returns: string
      }
      generate_daily_metrics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      get_admin_executive_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          briefings_today: number
          monthly_revenue: number
          paid_users: number
          queries_today: number
          total_users: number
          users_last_7_days: number
        }[]
      }
      get_admin_feature_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          feature: string
          total_usage: number
          unique_users: number
          usage_date: string
        }[]
      }
      get_admin_revenue_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_customer_age_days: number
          monthly_revenue: number
          subscriber_count: number
          subscription_tier: string
        }[]
      }
      get_admin_user_growth: {
        Args: Record<PropertyKey, never>
        Returns: {
          cumulative_users: number
          new_signups: number
          paid_signups: number
          signup_date: string
        }[]
      }
      get_business_metrics_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users: number
          churn_rate: number
          date: string
          engagement_rate: number
          mrr: number
          mrr_growth_rate: number
          new_signups: number
          previous_mrr: number
          total_users: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_subscription_tier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_app_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_features: string[]
          last_updated: string
          status: string
        }[]
      }
      get_query_intelligence_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_satisfaction: number
          frequency_count: number
          implemented: boolean
          pattern_text: string
          priority_score: number
          suggested_feature: string
          unique_users_asking: number
          user_intent_category: string
        }[]
      }
      get_user_analytics_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          achievements_earned: number
          avg_briefing_rating: number
          email: string
          full_name: string
          id: string
          last_active: string
          signup_date: string
          subscription_tier: string
          total_briefings: number
          total_queries: number
          total_time_spent: number
        }[]
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
      update_paper_account_equity: {
        Args: { account_uuid: string }
        Returns: undefined
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
