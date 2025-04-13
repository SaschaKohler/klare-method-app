export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value: number
          id?: string
          name: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number
          id?: string
          name?: string
          target_value?: number
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
          updated_at?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
