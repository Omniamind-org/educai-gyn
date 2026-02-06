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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          created_at: string
          region_id: string | null
          total_students: number | null
          permanence: number | null
          average_grade: number | null
          attendance: number | null
          risk_level: string | null
          teacher_count: number | null
          teacher_satisfaction: number | null
          continued_education: number | null
          infrastructure: Json | null
          alerts: string[] | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          region_id?: string | null
          total_students?: number | null
          permanence?: number | null
          average_grade?: number | null
          attendance?: number | null
          risk_level?: string | null
          teacher_count?: number | null
          teacher_satisfaction?: number | null
          continued_education?: number | null
          infrastructure?: Json | null
          alerts?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          region_id?: string | null
          total_students?: number | null
          permanence?: number | null
          average_grade?: number | null
          attendance?: number | null
          risk_level?: string | null
          teacher_count?: number | null
          teacher_satisfaction?: number | null
          continued_education?: number | null
          infrastructure?: Json | null
          alerts?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      boletos: {
        Row: {
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          reference: string
          status: string
          student_id: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          reference: string
          status?: string
          student_id: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          reference?: string
          status?: string
          student_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "boletos_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_attendance: {
        Row: {
          class_id: string
          created_at: string
          created_by: string | null
          date: string
          id: string
          present_students: Json | null
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          present_students?: Json | null
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          present_students?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      climate_surveys: {
        Row: {
          campaign_id: string
          created_at: string
          feedback: string | null
          id: string
          nps_score: number
          teacher_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          nps_score: number
          teacher_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          nps_score?: number
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "climate_surveys_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "climate_surveys_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          school_id: string
          score: number | null
          term: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          school_id: string
          score?: number | null
          term: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          school_id?: string
          score?: number | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_surveys_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_campaigns: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          target_role: Database["public"]["Enums"]["app_role"]
          title: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          target_role: Database["public"]["Enums"]["app_role"]
          title: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_role?: Database["public"]["Enums"]["app_role"]
          title?: string
        }
        Relationships: []
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          class_id: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          grade: string
          id: string
          name: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          name: string
          updated_at?: string
          year?: number
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          name?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_lists: {
        Row: {
          bncc_objective: string | null
          content: string
          created_at: string
          id: string
          series: string | null
          teacher_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          bncc_objective?: string | null
          content: string
          created_at?: string
          id?: string
          series?: string | null
          teacher_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          bncc_objective?: string | null
          content?: string
          created_at?: string
          id?: string
          series?: string | null
          teacher_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_lists_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          bncc_objective: string | null
          content: string
          created_at: string
          id: string
          series: string | null
          teacher_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          bncc_objective?: string | null
          content: string
          created_at?: string
          id?: string
          series?: string | null
          teacher_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          bncc_objective?: string | null
          content?: string
          created_at?: string
          id?: string
          series?: string | null
          teacher_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          school_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_grades: {
        Row: {
          created_at: string
          feedback: string | null
          graded_at: string | null
          id: string
          score: number | null
          student_id: string
          submitted_at: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id: string
          submitted_at?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id?: string
          submitted_at?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grades_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          cpf: string
          created_at: string
          grade: string
          id: string
          name: string
          password: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf: string
          created_at?: string
          grade: string
          id?: string
          name: string
          password?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string
          grade?: string
          id?: string
          name?: string
          password?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          discipline_id: string | null
          due_date: string | null
          id: string
          max_score: number
          status: string
          teacher_id: string
          title: string
          updated_at: string
          type: 'exam' | 'assignment' | 'project' | null
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          discipline_id?: string | null
          due_date?: string | null
          id?: string
          max_score?: number
          status?: string
          teacher_id: string
          title: string
          updated_at?: string
          type?: 'exam' | 'assignment' | 'project' | null
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          discipline_id?: string | null
          due_date?: string | null
          id?: string
          max_score?: number
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string
          type?: 'exam' | 'assignment' | 'project' | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_disciplines: {
        Row: {
          created_at: string
          discipline_id: string
          id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          discipline_id: string
          id?: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          discipline_id?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_disciplines_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_disciplines_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          cpf: string
          created_at: string
          id: string
          name: string
          password: string | null
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf: string
          created_at?: string
          id?: string
          name: string
          password?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string
          id?: string
          name?: string
          password?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      role_from_email: {
        Args: { _email: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role:
        | "aluno"
        | "professor"
        | "coordenacao"
        | "diretor"
        | "secretaria"
        | "regional"
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
    Enums: {
      app_role: [
        "aluno",
        "professor",
        "coordenacao",
        "diretor",
        "secretaria",
        "regional",
      ],
    },
  },
} as const
