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
      abuse_reports: {
        Row: {
          alert_id: string | null
          created_at: string | null
          description: string
          id: string
          report_type: string
          reported_user_id: string | null
          reporter_user_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          alert_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          report_type: string
          reported_user_id?: string | null
          reporter_user_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          alert_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          report_type?: string
          reported_user_id?: string | null
          reporter_user_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abuse_reports_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_votes: {
        Row: {
          answer_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_helpful: boolean | null
          question_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_helpful?: boolean | null
          question_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_helpful?: boolean | null
          question_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_event_attendees: {
        Row: {
          event_id: string
          id: string
          payment_status: string | null
          registered_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          payment_status?: string | null
          registered_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          payment_status?: string | null
          registered_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "circle_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_events: {
        Row: {
          circle_id: string
          created_at: string | null
          creator_id: string
          current_attendees: number | null
          description: string
          duration_minutes: number
          event_date: string
          event_time: string
          event_type: string
          id: string
          max_attendees: number | null
          meeting_url: string | null
          platform: string | null
          price: number | null
          recording_url: string | null
          status: string
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          circle_id: string
          created_at?: string | null
          creator_id: string
          current_attendees?: number | null
          description: string
          duration_minutes: number
          event_date: string
          event_time: string
          event_type: string
          id?: string
          max_attendees?: number | null
          meeting_url?: string | null
          platform?: string | null
          price?: number | null
          recording_url?: string | null
          status?: string
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          circle_id?: string
          created_at?: string | null
          creator_id?: string
          current_attendees?: number | null
          description?: string
          duration_minutes?: number
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          max_attendees?: number | null
          meeting_url?: string | null
          platform?: string | null
          price?: number | null
          recording_url?: string | null
          status?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_events_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_resources: {
        Row: {
          circle_id: string
          created_at: string | null
          description: string
          downloads_count: number | null
          file_size_mb: number | null
          file_url: string
          id: string
          is_premium: boolean | null
          rating: number | null
          resource_type: string
          title: string
          updated_at: string | null
          uploader_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string | null
          description: string
          downloads_count?: number | null
          file_size_mb?: number | null
          file_url: string
          id?: string
          is_premium?: boolean | null
          rating?: number | null
          resource_type: string
          title: string
          updated_at?: string | null
          uploader_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string | null
          description?: string
          downloads_count?: number | null
          file_size_mb?: number | null
          file_url?: string
          id?: string
          is_premium?: boolean | null
          rating?: number | null
          resource_type?: string
          title?: string
          updated_at?: string | null
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_resources_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_resources_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_service_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          id: string
          member_email: string
          member_name: string
          member_phone: string | null
          notes: string | null
          payment_status: string
          service_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          id?: string
          member_email: string
          member_name: string
          member_phone?: string | null
          notes?: string | null
          payment_status?: string
          service_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          id?: string
          member_email?: string
          member_name?: string
          member_phone?: string | null
          notes?: string | null
          payment_status?: string
          service_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "circle_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_services: {
        Row: {
          category: string
          circle_id: string
          created_at: string | null
          description: string
          duration_minutes: number
          id: string
          is_active: boolean | null
          price: number
          provider_id: string
          rating: number | null
          reviews_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          circle_id: string
          created_at?: string | null
          description: string
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          price: number
          provider_id: string
          rating?: number | null
          reviews_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          circle_id?: string
          created_at?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price?: number
          provider_id?: string
          rating?: number | null
          reviews_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_services_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_stats: {
        Row: {
          circle_id: string
          created_at: string | null
          events_count: number | null
          members_count: number | null
          monthly_activity: number | null
          posts_count: number | null
          resources_count: number | null
          services_count: number | null
          updated_at: string | null
        }
        Insert: {
          circle_id: string
          created_at?: string | null
          events_count?: number | null
          members_count?: number | null
          monthly_activity?: number | null
          posts_count?: number | null
          resources_count?: number | null
          services_count?: number | null
          updated_at?: string | null
        }
        Update: {
          circle_id?: string
          created_at?: string | null
          events_count?: number | null
          members_count?: number | null
          monthly_activity?: number | null
          posts_count?: number | null
          resources_count?: number | null
          services_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_stats_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: true
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_subscriptions: {
        Row: {
          circle_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_subscriptions_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_tips: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          post_id: string
          recipient_id: string
          status: string
          tipper_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          post_id: string
          recipient_id: string
          status?: string
          tipper_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          post_id?: string
          recipient_id?: string
          status?: string
          tipper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_tips_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_tips_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_tips_tipper_id_fkey"
            columns: ["tipper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          about_text: string | null
          avatar_url: string | null
          category: string
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string
          guidelines: string[] | null
          id: string
          is_active: boolean | null
          is_expert: boolean | null
          is_premium: boolean | null
          is_private: boolean | null
          location: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          about_text?: string | null
          avatar_url?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description: string
          guidelines?: string[] | null
          id?: string
          is_active?: boolean | null
          is_expert?: boolean | null
          is_premium?: boolean | null
          is_private?: boolean | null
          location?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          about_text?: string | null
          avatar_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string
          guidelines?: string[] | null
          id?: string
          is_active?: boolean | null
          is_expert?: boolean | null
          is_premium?: boolean | null
          is_private?: boolean | null
          location?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          is_primary: boolean | null
          relationship: string | null
          user_id: string
        }
        Insert: {
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          user_id: string
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expert_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          featured_answer_id: string | null
          id: string
          is_verified: boolean | null
          specialty: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          featured_answer_id?: string | null
          id?: string
          is_verified?: boolean | null
          specialty: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          featured_answer_id?: string | null
          id?: string
          is_verified?: boolean | null
          specialty?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_profiles_featured_answer_id_fkey"
            columns: ["featured_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_profiles: {
        Row: {
          availability_status: string | null
          average_rating: number | null
          average_response_time_minutes: number | null
          completion_count: number | null
          created_at: string
          current_streak_days: number | null
          helper_badge: string | null
          is_available: boolean | null
          last_active_at: string | null
          last_response_date: string | null
          location_lat: number | null
          location_lng: number | null
          response_count: number | null
          skills: string[] | null
          total_stars: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          average_rating?: number | null
          average_response_time_minutes?: number | null
          completion_count?: number | null
          created_at?: string
          current_streak_days?: number | null
          helper_badge?: string | null
          is_available?: boolean | null
          last_active_at?: string | null
          last_response_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
          response_count?: number | null
          skills?: string[] | null
          total_stars?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string | null
          average_rating?: number | null
          average_response_time_minutes?: number | null
          completion_count?: number | null
          created_at?: string
          current_streak_days?: number | null
          helper_badge?: string | null
          is_available?: boolean | null
          last_active_at?: string | null
          last_response_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
          response_count?: number | null
          skills?: string[] | null
          total_stars?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_messages: {
        Row: {
          created_at: string | null
          id: string
          message_text: string
          message_type: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_text: string
          message_type?: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_text?: string
          message_type?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          circle_id: string | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          location_visible: boolean | null
          peak_viewers: number | null
          started_at: string
          status: string
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          viewer_count: number | null
        }
        Insert: {
          circle_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          location_visible?: boolean | null
          peak_viewers?: number | null
          started_at?: string
          status?: string
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          viewer_count?: number | null
        }
        Update: {
          circle_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          location_visible?: boolean | null
          peak_viewers?: number | null
          started_at?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_viewers: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_ping: string | null
          stream_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_ping?: string | null
          stream_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_ping?: string | null
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_viewers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          alert_updates: boolean | null
          created_at: string | null
          emergency_contact_alerts: boolean | null
          enabled: boolean | null
          helper_responses: boolean | null
          id: string
          max_distance_km: number | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sos_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_updates?: boolean | null
          created_at?: string | null
          emergency_contact_alerts?: boolean | null
          enabled?: boolean | null
          helper_responses?: boolean | null
          id?: string
          max_distance_km?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sos_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_updates?: boolean | null
          created_at?: string | null
          emergency_contact_alerts?: boolean | null
          enabled?: boolean | null
          helper_responses?: boolean | null
          id?: string
          max_distance_km?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sos_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_stats: {
        Row: {
          comments_count: number | null
          created_at: string | null
          likes_count: number | null
          post_id: string
          saves_count: number | null
          shares_count: number | null
          updated_at: string | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          likes_count?: number | null
          post_id: string
          saves_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          likes_count?: number | null
          post_id?: string
          saves_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_stats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          circle_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          has_tips_enabled: boolean | null
          id: string
          is_premium: boolean | null
          is_sponsored: boolean | null
          media_alt: string | null
          media_color_from: string | null
          media_color_to: string | null
          media_url: string | null
          media_urls: string[] | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          circle_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          has_tips_enabled?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_sponsored?: boolean | null
          media_alt?: string | null
          media_color_from?: string | null
          media_color_to?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          has_tips_enabled?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_sponsored?: boolean | null
          media_alt?: string | null
          media_color_from?: string | null
          media_color_to?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_stats: {
        Row: {
          created_at: string | null
          followers_count: number | null
          following_count: number | null
          posts_count: number | null
          replies_count: number | null
          saves_count: number | null
          updated_at: string | null
          user_id: string
          videos_count: number | null
        }
        Insert: {
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          posts_count?: number | null
          replies_count?: number | null
          saves_count?: number | null
          updated_at?: string | null
          user_id: string
          videos_count?: number | null
        }
        Update: {
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          posts_count?: number | null
          replies_count?: number | null
          saves_count?: number | null
          updated_at?: string | null
          user_id?: string
          videos_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          email: string
          fcm_token: string | null
          id: string
          initials: string
          is_online: boolean | null
          is_verified: boolean | null
          joined_date: string | null
          location: string | null
          name: string
          subtitle: string | null
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email: string
          fcm_token?: string | null
          id: string
          initials: string
          is_online?: boolean | null
          is_verified?: boolean | null
          joined_date?: string | null
          location?: string | null
          name: string
          subtitle?: string | null
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          email?: string
          fcm_token?: string | null
          id?: string
          initials?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          joined_date?: string | null
          location?: string | null
          name?: string
          subtitle?: string | null
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          notification_type: string
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_votes: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          ai_response: string | null
          anonymous_name: string | null
          category: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_thread: boolean | null
          question: string
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          ai_response?: string | null
          anonymous_name?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_thread?: boolean | null
          question: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          ai_response?: string | null
          anonymous_name?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_thread?: boolean | null
          question?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_alerts: {
        Row: {
          conscious_level: string | null
          created_at: string
          description: string
          id: string
          injury_type: string | null
          last_seen: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          person_age: string | null
          person_description: string | null
          photo_urls: string[] | null
          resolved_at: string | null
          share_live_location: boolean | null
          sos_type: string
          status: string
          sub_category: string | null
          threat_active: boolean | null
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          conscious_level?: string | null
          created_at?: string
          description: string
          id?: string
          injury_type?: string | null
          last_seen?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          person_age?: string | null
          person_description?: string | null
          photo_urls?: string[] | null
          resolved_at?: string | null
          share_live_location?: boolean | null
          sos_type: string
          status?: string
          sub_category?: string | null
          threat_active?: boolean | null
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          conscious_level?: string | null
          created_at?: string
          description?: string
          id?: string
          injury_type?: string | null
          last_seen?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          person_age?: string | null
          person_description?: string | null
          photo_urls?: string[] | null
          resolved_at?: string | null
          share_live_location?: boolean | null
          sos_type?: string
          status?: string
          sub_category?: string | null
          threat_active?: boolean | null
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      sos_helpers: {
        Row: {
          accepted_at: string
          alert_id: string
          arrived_at: string | null
          completed_at: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          estimated_arrival_minutes: number | null
          helper_user_id: string
          id: string
          status: string
        }
        Insert: {
          accepted_at?: string
          alert_id: string
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          estimated_arrival_minutes?: number | null
          helper_user_id: string
          id?: string
          status?: string
        }
        Update: {
          accepted_at?: string
          alert_id?: string
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          estimated_arrival_minutes?: number | null
          helper_user_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_helpers_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_messages: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          is_system_message: boolean | null
          message_text: string
          sender_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          message_text: string
          sender_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          message_text?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_messages_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_reviews: {
        Row: {
          alert_id: string
          created_at: string
          helper_user_id: string
          id: string
          rating: number
          review_text: string | null
          reviewer_user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          helper_user_id: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          helper_user_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_reviews_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          media_type: string | null
          media_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          media_type?: string | null
          media_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          media_type?: string | null
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_update_votes: {
        Row: {
          created_at: string | null
          id: string
          thread_update_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          thread_update_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          thread_update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_update_votes_thread_update_id_fkey"
            columns: ["thread_update_id"]
            isOneToOne: false
            referencedRelation: "thread_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_updates: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          update_number: number
          update_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          update_number?: number
          update_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          update_number?: number
          update_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_updates_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_saves: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_saves_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_stats: {
        Row: {
          comments_count: number | null
          created_at: string | null
          likes_count: number | null
          saves_count: number | null
          shares_count: number | null
          updated_at: string | null
          video_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          likes_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          video_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          likes_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          video_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_stats_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_circle_feed: {
        Args: { _circle_id: string; page_num?: number; page_size?: number }
        Returns: {
          avatar_color: string
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          initials: string
          is_sponsored: boolean
          is_verified: boolean
          likes_count: number
          media_alt: string
          media_color_from: string
          media_color_to: string
          media_url: string
          media_urls: string[]
          name: string
          post_id: string
          saves_count: number
          shares_count: number
          tags: string[]
          user_has_liked: boolean
          user_id: string
          username: string
        }[]
      }
      get_feed_posts: {
        Args: { page_num?: number; page_size?: number }
        Returns: {
          avatar_color: string
          avatar_url: string
          circle_avatar_url: string
          circle_id: string
          circle_name: string
          comments_count: number
          content: string
          cover_image_url: string
          created_at: string
          initials: string
          is_sponsored: boolean
          is_verified: boolean
          likes_count: number
          media_alt: string
          media_color_from: string
          media_color_to: string
          media_url: string
          media_urls: string[]
          name: string
          post_id: string
          saves_count: number
          shares_count: number
          tags: string[]
          user_has_liked: boolean
          user_id: string
          username: string
        }[]
      }
      get_live_streams: {
        Args: { page_num?: number; page_size?: number }
        Returns: {
          avatar_url: string
          circle_id: string
          circle_name: string
          description: string
          is_verified: boolean
          name: string
          started_at: string
          stream_id: string
          thumbnail_url: string
          title: string
          type: string
          user_id: string
          user_is_viewing: boolean
          username: string
          viewer_count: number
        }[]
      }
      get_nearby_alerts: {
        Args: { radius_miles?: number; user_lat: number; user_lng: number }
        Returns: {
          conscious_level: string
          created_at: string
          description: string
          distance_miles: number
          helper_count: number
          id: string
          injury_type: string
          last_seen: string
          location_address: string
          location_lat: number
          location_lng: number
          person_age: string
          person_description: string
          photo_urls: string[]
          resolved_at: string
          share_live_location: boolean
          sos_type: string
          status: string
          sub_category: string
          threat_active: boolean
          updated_at: string
          urgency: string
          user_id: string
        }[]
      }
      get_post_comments: {
        Args: { _post_id: string }
        Returns: {
          avatar_color: string
          avatar_url: string
          comment_id: string
          content: string
          created_at: string
          initials: string
          likes_count: number
          name: string
          parent_id: string
          user_has_liked: boolean
          user_id: string
          username: string
        }[]
      }
      get_video_comments: {
        Args: { _video_id: string }
        Returns: {
          avatar_color: string
          avatar_url: string
          comment_id: string
          content: string
          created_at: string
          initials: string
          likes_count: number
          name: string
          parent_id: string
          user_has_liked: boolean
          user_id: string
          username: string
        }[]
      }
      get_video_feed: {
        Args: { page_num?: number; page_size?: number }
        Returns: {
          avatar_color: string
          avatar_url: string
          comments_count: number
          created_at: string
          description: string
          initials: string
          is_verified: boolean
          likes_count: number
          name: string
          saves_count: number
          shares_count: number
          tags: string[]
          thumbnail_url: string
          title: string
          user_has_liked: boolean
          user_has_saved: boolean
          user_id: string
          username: string
          video_id: string
          video_url: string
          views_count: number
        }[]
      }
      has_circle_subscription: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
      is_circle_member: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
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
