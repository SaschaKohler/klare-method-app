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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          ai_model: string | null
          conversation_type: string
          created_at: string | null
          generation_metadata: Json | null
          id: string
          message_content: string
          message_type: string
          prompt_template_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          conversation_type: string
          created_at?: string | null
          generation_metadata?: Json | null
          id?: string
          message_content: string
          message_type: string
          prompt_template_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          ai_model?: string | null
          conversation_type?: string
          created_at?: string | null
          generation_metadata?: Json | null
          id?: string
          message_content?: string
          message_type?: string
          prompt_template_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_prompt_templates: {
        Row: {
          created_at: string | null
          difficulty_range: number[] | null
          id: string
          is_active: boolean | null
          model_settings: Json | null
          module_reference: string | null
          personalization_factors: string[] | null
          priority: number | null
          prompt_template: string
          prompt_type: string
          safety_filters: string[] | null
          target_user_profiles: Json | null
          template_name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          difficulty_range?: number[] | null
          id?: string
          is_active?: boolean | null
          model_settings?: Json | null
          module_reference?: string | null
          personalization_factors?: string[] | null
          priority?: number | null
          prompt_template: string
          prompt_type: string
          safety_filters?: string[] | null
          target_user_profiles?: Json | null
          template_name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          difficulty_range?: number[] | null
          id?: string
          is_active?: boolean | null
          model_settings?: Json | null
          module_reference?: string | null
          personalization_factors?: string[] | null
          priority?: number | null
          prompt_template?: string
          prompt_type?: string
          safety_filters?: string[] | null
          target_user_profiles?: Json | null
          template_name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      ai_service_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          operation_type: string
          output_data: Json | null
          response_time_ms: number | null
          service_name: string
          success: boolean
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          operation_type: string
          output_data?: Json | null
          response_time_ms?: number | null
          service_name: string
          success: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          operation_type?: string
          output_data?: Json | null
          response_time_ms?: number | null
          service_name?: string
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      completed_modules: {
        Row: {
          action_items: string[] | null
          challenges_faced: string[] | null
          completed_at: string | null
          difficulty_experienced: number | null
          id: string | null
          key_insights: string[] | null
          module_id: string | null
          responses: Json | null
          satisfaction_rating: number | null
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          action_items?: string[] | null
          challenges_faced?: string[] | null
          completed_at?: string | null
          difficulty_experienced?: number | null
          id?: string | null
          key_insights?: string[] | null
          module_id?: string | null
          responses?: Json | null
          satisfaction_rating?: number | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          action_items?: string[] | null
          challenges_faced?: string[] | null
          completed_at?: string | null
          difficulty_experienced?: number | null
          id?: string | null
          key_insights?: string[] | null
          module_id?: string | null
          responses?: Json | null
          satisfaction_rating?: number | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          content: Json | null
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string | null
          module_id: string | null
          order_index: number | null
          title: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      excercise_steps: {
        Row: {
          created_at: string | null
          id: string | null
          instructions: string | null
          module_content_id: string | null
          options: Json | null
          order_index: number | null
          step_type: string | null
          title: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          step_type?: string | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          step_type?: string | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "excercise_steps_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          ai_model: string
          cache_expires_at: string | null
          content_type: string
          created_at: string | null
          generated_content: Json
          generated_title: string | null
          generation_timestamp: string | null
          id: string
          personalization_context: Json | null
          prompt_used: string | null
          template_id: string
          usage_count: number | null
          user_feedback: string | null
          user_id: string
          user_rating: number | null
          was_helpful: boolean | null
        }
        Insert: {
          ai_model: string
          cache_expires_at?: string | null
          content_type: string
          created_at?: string | null
          generated_content: Json
          generated_title?: string | null
          generation_timestamp?: string | null
          id?: string
          personalization_context?: Json | null
          prompt_used?: string | null
          template_id: string
          usage_count?: number | null
          user_feedback?: string | null
          user_id: string
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Update: {
          ai_model?: string
          cache_expires_at?: string | null
          content_type?: string
          created_at?: string | null
          generated_content?: Json
          generated_title?: string | null
          generation_timestamp?: string | null
          id?: string
          personalization_context?: Json | null
          prompt_used?: string | null
          template_id?: string
          usage_count?: number | null
          user_feedback?: string | null
          user_id?: string
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_insights: Json | null
          content: string
          created_at: string | null
          growth_indicators: string[] | null
          id: string
          is_private: boolean | null
          mood_rating: number | null
          tags: string[] | null
          template_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          content: string
          created_at?: string | null
          growth_indicators?: string[] | null
          id?: string
          is_private?: boolean | null
          mood_rating?: number | null
          tags?: string[] | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          content?: string
          created_at?: string | null
          growth_indicators?: string[] | null
          id?: string
          is_private?: boolean | null
          mood_rating?: number | null
          tags?: string[] | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_template_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          name: string | null
          order_index: number | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          order_index?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          order_index?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string | null
          klare_steps: string[] | null
          order_index: number | null
          prompt_questions: Json | null
          suitable_for_profiles: Json | null
          title: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string | null
          klare_steps?: string[] | null
          order_index?: number | null
          prompt_questions?: Json | null
          suitable_for_profiles?: Json | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string | null
          klare_steps?: string[] | null
          order_index?: number | null
          prompt_questions?: Json | null
          suitable_for_profiles?: Json | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_module_mapping: {
        Row: {
          created_at: string
          legacy_module_content_id: string
          module_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          legacy_module_content_id: string
          module_id: string
          slug: string
        }
        Update: {
          created_at?: string
          legacy_module_content_id?: string
          module_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_module_mapping_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      life_wheel_areas: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          improvement_actions: string[] | null
          name: string | null
          notes: string | null
          priority_level: number | null
          target_value: number | null
          translations: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          improvement_actions?: string[] | null
          name?: string | null
          notes?: string | null
          priority_level?: number | null
          target_value?: number | null
          translations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          improvement_actions?: string[] | null
          name?: string | null
          notes?: string | null
          priority_level?: number | null
          target_value?: number | null
          translations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      life_wheel_snapshots: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          improvements: Json | null
          insights: string[] | null
          priority_areas: string[] | null
          snapshot_data: Json
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          insights?: string[] | null
          priority_areas?: string[] | null
          snapshot_data: Json
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          insights?: string[] | null
          priority_areas?: string[] | null
          snapshot_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      module_contents: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          media_url: string | null
          module_content_id: string | null
          module_id: string | null
          order_index: number | null
          title: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id: string
          media_url?: string | null
          module_content_id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          module_content_id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          klare_step: string
          learning_objectives: string[] | null
          metadata: Json | null
          order_index: number
          prerequisites: string[] | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          klare_step: string
          learning_objectives?: string[] | null
          metadata?: Json | null
          order_index: number
          prerequisites?: string[] | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          klare_step?: string
          learning_objectives?: string[] | null
          metadata?: Json | null
          order_index?: number
          prerequisites?: string[] | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_insights: {
        Row: {
          ai_model: string | null
          confidence_score: number | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          is_active: boolean | null
          related_areas: string[] | null
          related_modules: string[] | null
          source: string
          supporting_evidence: string[] | null
          title: string
          updated_at: string | null
          user_acknowledged: boolean | null
          user_id: string
          user_notes: string | null
          user_rating: number | null
        }
        Insert: {
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          is_active?: boolean | null
          related_areas?: string[] | null
          related_modules?: string[] | null
          source: string
          supporting_evidence?: string[] | null
          title: string
          updated_at?: string | null
          user_acknowledged?: boolean | null
          user_id: string
          user_notes?: string | null
          user_rating?: number | null
        }
        Update: {
          ai_model?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_active?: boolean | null
          related_areas?: string[] | null
          related_modules?: string[] | null
          source?: string
          supporting_evidence?: string[] | null
          title?: string
          updated_at?: string | null
          user_acknowledged?: boolean | null
          user_id?: string
          user_notes?: string | null
          user_rating?: number | null
        }
        Relationships: []
      }
      personal_values: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          rank: number | null
          updated_at: string | null
          user_id: string
          value_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          rank?: number | null
          updated_at?: string | null
          user_id: string
          value_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          rank?: number | null
          updated_at?: string | null
          user_id?: string
          value_name?: string
        }
        Relationships: []
      }
      practical_excercises: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: string | null
          id: string | null
          sort_order: number | null
          step_id: string | null
          title: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          title?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string | null
          module_content_id: string | null
          options: Json | null
          order_index: number | null
          question: string | null
          question_type: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_type?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_type?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      static_content: {
        Row: {
          content: string
          content_format: string | null
          content_type: string
          created_at: string | null
          estimated_reading_time: number | null
          id: string
          interaction_config: Json | null
          interaction_type: string | null
          is_interactive: boolean | null
          media_urls: string[] | null
          module_id: string | null
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_format?: string | null
          content_type: string
          created_at?: string | null
          estimated_reading_time?: number | null
          id?: string
          interaction_config?: Json | null
          interaction_type?: string | null
          is_interactive?: boolean | null
          media_urls?: string[] | null
          module_id?: string | null
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_format?: string | null
          content_type?: string
          created_at?: string | null
          estimated_reading_time?: number | null
          id?: string
          interaction_config?: Json | null
          interaction_type?: string | null
          is_interactive?: boolean | null
          media_urls?: string[] | null
          module_id?: string | null
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "static_content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      supporting_questions: {
        Row: {
          created_at: string | null
          id: string | null
          question_text: string | null
          sort_order: number | null
          step_id: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          question_text?: string | null
          sort_order?: number | null
          step_id?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          question_text?: string | null
          sort_order?: number | null
          step_id?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          language_code: string
          translated_text: string
          translation_quality: string | null
          translator_notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          language_code: string
          translated_text: string
          translation_quality?: string | null
          translator_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          language_code?: string
          translated_text?: string
          translation_quality?: string | null
          translator_notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answer_category: string | null
          answer_data: Json
          content_reference: string | null
          content_type: string
          created_at: string | null
          emotional_tone: string | null
          id: string
          key_themes: string[] | null
          klare_step: string | null
          question_text: string
          response_time_seconds: number | null
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          answer_category?: string | null
          answer_data: Json
          content_reference?: string | null
          content_type: string
          created_at?: string | null
          emotional_tone?: string | null
          id?: string
          key_themes?: string[] | null
          klare_step?: string | null
          question_text: string
          response_time_seconds?: number | null
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          answer_category?: string | null
          answer_data?: Json
          content_reference?: string | null
          content_type?: string
          created_at?: string | null
          emotional_tone?: string | null
          id?: string
          key_themes?: string[] | null
          klare_step?: string | null
          question_text?: string
          response_time_seconds?: number | null
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          device_info: Json | null
          event_data: Json | null
          event_type: string
          id: string
          page_or_module: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_or_module?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_or_module?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          first_detected: string | null
          id: string
          is_active: boolean | null
          last_confirmed: string | null
          pattern_description: string
          pattern_type: string
          supporting_events: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          first_detected?: string | null
          id?: string
          is_active?: boolean | null
          last_confirmed?: string | null
          pattern_description: string
          pattern_type: string
          supporting_events?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          first_detected?: string | null
          id?: string
          is_active?: boolean | null
          last_confirmed?: string | null
          pattern_description?: string
          pattern_type?: string
          supporting_events?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_preferences: {
        Row: {
          ai_enabled: boolean | null
          ai_personalization_level: string | null
          allows_ai_questions: boolean | null
          auto_translate: boolean | null
          consent_version: string | null
          created_at: string | null
          data_sharing_level: string | null
          id: string
          intimate_data_local_only: boolean | null
          last_consent_update: string | null
          preferred_language: string | null
          prefers_static_questions: boolean | null
          sensitive_data_local_only: boolean | null
          updated_at: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          ai_personalization_level?: string | null
          allows_ai_questions?: boolean | null
          auto_translate?: boolean | null
          consent_version?: string | null
          created_at?: string | null
          data_sharing_level?: string | null
          id: string
          intimate_data_local_only?: boolean | null
          last_consent_update?: string | null
          preferred_language?: string | null
          prefers_static_questions?: boolean | null
          sensitive_data_local_only?: boolean | null
          updated_at?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          ai_personalization_level?: string | null
          allows_ai_questions?: boolean | null
          auto_translate?: boolean | null
          consent_version?: string | null
          created_at?: string | null
          data_sharing_level?: string | null
          id?: string
          intimate_data_local_only?: boolean | null
          last_consent_update?: string | null
          preferred_language?: string | null
          prefers_static_questions?: boolean | null
          sensitive_data_local_only?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          age_range: string | null
          communication_style: string | null
          created_at: string | null
          current_challenges: string[] | null
          experience_level: string | null
          first_name: string | null
          goals: Json | null
          id: string
          last_assessment_date: string | null
          learning_style: string | null
          life_priorities: string[] | null
          location: string | null
          occupation: string | null
          onboarding_completed_at: string | null
          personality_profile: Json | null
          preferences: Json | null
          preferred_name: string | null
          primary_goals: string[] | null
          privacy_settings: Json | null
          profile_completeness: number | null
          relationship_status: string | null
          time_commitment: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          age_range?: string | null
          communication_style?: string | null
          created_at?: string | null
          current_challenges?: string[] | null
          experience_level?: string | null
          first_name?: string | null
          goals?: Json | null
          id?: string
          last_assessment_date?: string | null
          learning_style?: string | null
          life_priorities?: string[] | null
          location?: string | null
          occupation?: string | null
          onboarding_completed_at?: string | null
          personality_profile?: Json | null
          preferences?: Json | null
          preferred_name?: string | null
          primary_goals?: string[] | null
          privacy_settings?: Json | null
          profile_completeness?: number | null
          relationship_status?: string | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          age_range?: string | null
          communication_style?: string | null
          created_at?: string | null
          current_challenges?: string[] | null
          experience_level?: string | null
          first_name?: string | null
          goals?: Json | null
          id?: string
          last_assessment_date?: string | null
          learning_style?: string | null
          life_priorities?: string[] | null
          location?: string | null
          occupation?: string | null
          onboarding_completed_at?: string | null
          personality_profile?: Json | null
          preferences?: Json | null
          preferred_name?: string | null
          primary_goals?: string[] | null
          privacy_settings?: Json | null
          profile_completeness?: number | null
          relationship_status?: string | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          ai_mode_enabled: boolean | null
          completed_modules: Json | null
          created_at: string | null
          email: string | null
          id: string
          join_date: string | null
          last_active: string | null
          name: string | null
          personalization_level: string | null
          preferred_language: string | null
          progress: string | null
          streak: string | null
          updated_at: string | null
        }
        Insert: {
          ai_mode_enabled?: boolean | null
          completed_modules?: Json | null
          created_at?: string | null
          email?: string | null
          id: string
          join_date?: string | null
          last_active?: string | null
          name?: string | null
          personalization_level?: string | null
          preferred_language?: string | null
          progress?: string | null
          streak?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_mode_enabled?: boolean | null
          completed_modules?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          last_active?: string | null
          name?: string | null
          personalization_level?: string | null
          preferred_language?: string | null
          progress?: string | null
          streak?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vision_board_items: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          height: number | null
          id: string
          image_url: string | null
          life_area: string
          position_x: number | null
          position_y: number | null
          rotation: number | null
          scale: number | null
          title: string
          updated_at: string | null
          user_id: string
          vision_board_id: string | null
          width: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          life_area: string
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          scale?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          vision_board_id?: string | null
          width?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          life_area?: string
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          scale?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vision_board_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_storage_objects: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_translated_text: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_field_name: string
          p_language_code?: string
        }
        Returns: string
      }
      get_user_storage_path: {
        Args: { bucket_name: string }
        Returns: string
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
