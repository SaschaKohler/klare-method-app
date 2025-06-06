export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  klare_content: {
    Tables: {
      practical_exercises: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          sort_order: number
          step_id: string
          title: string
          translations: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number
          step_id: string
          title: string
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number
          step_id?: string
          title?: string
          translations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      supporting_questions: {
        Row: {
          created_at: string
          id: string
          question_text: string
          sort_order: number
          step_id: string
          translations: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_text: string
          sort_order?: number
          step_id: string
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_text?: string
          sort_order?: number
          step_id?: string
          translations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      transformation_paths: {
        Row: {
          created_at: string
          from_text: string
          id: string
          sort_order: number
          step_id: string
          to_text: string
          translations: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_text: string
          id?: string
          sort_order?: number
          step_id: string
          to_text: string
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_text?: string
          id?: string
          sort_order?: number
          step_id?: string
          to_text?: string
          translations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      translated_practical_exercises: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          duration_minutes: number | null
          id: string | null
          sort_order: number | null
          step_id: string | null
          title: string | null
          title_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: never
          duration_minutes?: number | null
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: never
          duration_minutes?: number | null
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translated_supporting_questions: {
        Row: {
          created_at: string | null
          id: string | null
          question_text: string | null
          question_text_en: string | null
          sort_order: number | null
          step_id: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          question_text?: string | null
          question_text_en?: never
          sort_order?: number | null
          step_id?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          question_text?: string | null
          question_text_en?: never
          sort_order?: number | null
          step_id?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translated_transformation_paths: {
        Row: {
          created_at: string | null
          from_text: string | null
          from_text_en: string | null
          id: string | null
          sort_order: number | null
          step_id: string | null
          to_text: string | null
          to_text_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_text?: string | null
          from_text_en?: never
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          to_text?: string | null
          to_text_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_text?: string | null
          from_text_en?: never
          id?: string | null
          sort_order?: number | null
          step_id?: string | null
          to_text?: string | null
          to_text_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_modules: {
        Row: {
          completed_at: string | null
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_modules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          media_url: string | null
          module_content_id: string
          order_index: number
          title: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          module_content_id: string
          order_index: number
          title: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          module_content_id?: string
          order_index?: number
          title?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_sections_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_steps: {
        Row: {
          created_at: string | null
          id: string
          instructions: string
          module_content_id: string
          options: Json | null
          order_index: number
          step_type: string
          title: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructions: string
          module_content_id: string
          options?: Json | null
          order_index: number
          step_type: string
          title: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructions?: string
          module_content_id?: string
          options?: Json | null
          order_index?: number
          step_type?: string
          title?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_steps_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_steps_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_template_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index: number
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
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
          id: string
          order_index: number
          prompt_questions: Json
          title: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          prompt_questions: Json
          title: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          prompt_questions?: Json
          title?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      life_wheel_areas: {
        Row: {
          created_at: string | null
          current_value: number
          id: string
          name: string
          target_value: number
          translations: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value: number
          id?: string
          name: string
          target_value: number
          translations?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number
          id?: string
          name?: string
          target_value?: number
          translations?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_wheel_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      module_contents: {
        Row: {
          content: Json | null
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          module_id: string
          order_index: number
          title: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_id: string
          order_index: number
          title: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string
          order_index?: number
          title?: string
          translations?: Json | null
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "personal_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: Json | null
          created_at: string | null
          explanation: string | null
          id: string
          module_content_id: string
          options: Json | null
          order_index: number
          question: string
          question_type: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          correct_answer?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          module_content_id: string
          options?: Json | null
          order_index: number
          question: string
          question_type: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          module_content_id?: string
          options?: Json | null
          order_index?: number
          question?: string
          question_type?: string
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
          {
            foreignKeyName: "quiz_questions_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          activation_tips: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          last_activated: string | null
          name: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activation_tips?: string | null
          category: string
          created_at?: string
          description?: string | null
          id: string
          last_activated?: string | null
          name: string
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activation_tips?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_activated?: string | null
          name?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exercise_results: {
        Row: {
          answer: Json | null
          completed_at: string | null
          exercise_step_id: string
          id: string
          user_id: string
        }
        Insert: {
          answer?: Json | null
          completed_at?: string | null
          exercise_step_id: string
          id?: string
          user_id: string
        }
        Update: {
          answer?: Json | null
          completed_at?: string | null
          exercise_step_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_results_exercise_step_id_fkey"
            columns: ["exercise_step_id"]
            isOneToOne: false
            referencedRelation: "exercise_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_results_exercise_step_id_fkey"
            columns: ["exercise_step_id"]
            isOneToOne: false
            referencedRelation: "translated_exercise_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journal_entries: {
        Row: {
          category: string | null
          clarity_rating: number | null
          created_at: string | null
          entry_content: string
          entry_date: string | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          mood_rating: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          clarity_rating?: number | null
          created_at?: string | null
          entry_content: string
          entry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          mood_rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          clarity_rating?: number | null
          created_at?: string | null
          entry_content?: string
          entry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          mood_rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_answers: {
        Row: {
          completed_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "translated_quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          completed_modules: string[] | null
          created_at: string | null
          email: string
          id: string
          join_date: string | null
          last_active: string | null
          name: string
          progress: number | null
          streak: number | null
        }
        Insert: {
          completed_modules?: string[] | null
          created_at?: string | null
          email: string
          id: string
          join_date?: string | null
          last_active?: string | null
          name: string
          progress?: number | null
          streak?: number | null
        }
        Update: {
          completed_modules?: string[] | null
          created_at?: string | null
          email?: string
          id?: string
          join_date?: string | null
          last_active?: string | null
          name?: string
          progress?: number | null
          streak?: number | null
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
        Relationships: [
          {
            foreignKeyName: "vision_board_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vision_board_items_vision_board_id_fkey"
            columns: ["vision_board_id"]
            isOneToOne: false
            referencedRelation: "vision_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_boards: {
        Row: {
          background_type: string
          background_value: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          layout_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          background_type: string
          background_value?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_type?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          background_type?: string
          background_value?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vision_boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      translated_content_sections: {
        Row: {
          content: string | null
          content_en: string | null
          created_at: string | null
          id: string | null
          media_url: string | null
          module_content_id: string | null
          order_index: number | null
          title: string | null
          title_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_en?: never
          created_at?: string | null
          id?: string | null
          media_url?: string | null
          module_content_id?: string | null
          order_index?: number | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_en?: never
          created_at?: string | null
          id?: string | null
          media_url?: string | null
          module_content_id?: string | null
          order_index?: number | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_sections_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      translated_exercise_steps: {
        Row: {
          created_at: string | null
          id: string | null
          instructions: string | null
          instructions_en: string | null
          module_content_id: string | null
          options: Json | null
          order_index: number | null
          step_type: string | null
          title: string | null
          title_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          instructions_en?: never
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          step_type?: string | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          instructions_en?: never
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          step_type?: string | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_steps_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "module_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_steps_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      translated_journal_template_categories: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          icon: string | null
          id: string | null
          name: string | null
          name_en: string | null
          order_index: number | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: never
          icon?: string | null
          id?: string | null
          name?: string | null
          name_en?: never
          order_index?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: never
          icon?: string | null
          id?: string | null
          name?: string | null
          name_en?: never
          order_index?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translated_journal_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string | null
          order_index: number | null
          prompt_questions: Json | null
          title: string | null
          title_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: never
          id?: string | null
          order_index?: number | null
          prompt_questions?: Json | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: never
          id?: string | null
          order_index?: number | null
          prompt_questions?: Json | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translated_life_wheel_areas: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string | null
          name: string | null
          name_en: string | null
          target_value: number | null
          translations: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string | null
          name?: string | null
          name_en?: never
          target_value?: number | null
          translations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string | null
          name?: string | null
          name_en?: never
          target_value?: number | null
          translations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "life_wheel_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      translated_module_contents: {
        Row: {
          content: Json | null
          content_type: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string | null
          module_id: string | null
          order_index: number | null
          title: string | null
          title_en: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: never
          id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: never
          id?: string | null
          module_id?: string | null
          order_index?: number | null
          title?: string | null
          title_en?: never
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translated_quiz_questions: {
        Row: {
          correct_answer: Json | null
          created_at: string | null
          explanation: string | null
          explanation_en: string | null
          id: string | null
          module_content_id: string | null
          options: Json | null
          order_index: number | null
          question: string | null
          question_en: string | null
          question_type: string | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          correct_answer?: Json | null
          created_at?: string | null
          explanation?: string | null
          explanation_en?: never
          id?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_en?: never
          question_type?: string | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: Json | null
          created_at?: string | null
          explanation?: string | null
          explanation_en?: never
          id?: string | null
          module_content_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_en?: never
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
          {
            foreignKeyName: "quiz_questions_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "translated_module_contents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_practical_exercises: {
        Args: { step: string }
        Returns: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          sort_order: number
          step_id: string
          title: string
          translations: Json | null
          updated_at: string
        }[]
      }
      get_supporting_questions: {
        Args: { step: string }
        Returns: {
          created_at: string
          id: string
          question_text: string
          sort_order: number
          step_id: string
          translations: Json | null
          updated_at: string
        }[]
      }
      get_transformation_paths: {
        Args: { step: string }
        Returns: {
          created_at: string
          from_text: string
          id: string
          sort_order: number
          step_id: string
          to_text: string
          translations: Json | null
          updated_at: string
        }[]
      }
      get_translated_content_sections: {
        Args: { p_module_content_id: string; p_lang?: string }
        Returns: {
          id: string
          module_content_id: string
          title: string
          content: string
          media_url: string
          order_index: number
        }[]
      }
      get_translated_life_wheel_areas: {
        Args: { p_user_id: string; p_lang?: string }
        Returns: {
          id: string
          user_id: string
          name: string
          current_value: number
          target_value: number
          created_at: string
          updated_at: string
          translations: Json
        }[]
      }
      get_translated_practical_exercises: {
        Args: { p_step_id: string; p_lang?: string }
        Returns: {
          id: string
          step_id: string
          title: string
          description: string
          duration_minutes: number
          sort_order: number
        }[]
      }
      get_translated_supporting_questions: {
        Args: { p_step_id: string; p_lang?: string }
        Returns: {
          id: string
          step_id: string
          question_text: string
          sort_order: number
        }[]
      }
      get_translated_text: {
        Args: {
          original_text: string
          translations: Json
          field_name: string
          lang_code?: string
        }
        Returns: string
      }
      get_translated_transformation_paths: {
        Args: { p_step_id: string; p_lang?: string }
        Returns: {
          id: string
          step_id: string
          from_text: string
          to_text: string
          sort_order: number
        }[]
      }
      import_translations_batch: {
        Args: {
          p_table_name: string
          p_schema_name?: string
          p_lang_code?: string
        }
        Returns: number
      }
      set_life_wheel_area_translation: {
        Args: { p_id: string; p_lang: string; p_field: string; p_value: string }
        Returns: boolean
      }
      set_life_wheel_area_translations: {
        Args: { p_id: string; p_lang: string; p_translations: Json }
        Returns: boolean
      }
      set_translation: {
        Args: {
          translations: Json
          lang_code: string
          field_name: string
          translated_text: string
        }
        Returns: Json
      }
      update_translations: {
        Args: {
          p_table_name: string
          p_id: string
          p_lang_code: string
          p_translations: Json
          p_schema_name?: string
        }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  klare_content: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
