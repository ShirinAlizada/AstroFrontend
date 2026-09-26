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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          body: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tag: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          body: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tag?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tag?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      astrologers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          languages: string[]
          price_azn: number
          rating: number
          specialties: string[]
          title: string | null
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          languages?: string[]
          price_azn?: number
          rating?: number
          specialties?: string[]
          title?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          languages?: string[]
          price_azn?: number
          rating?: number
          specialties?: string[]
          title?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      bookings: {
        Row: {
          astrologer_id: string
          created_at: string
          id: string
          note: string | null
          scheduled_at: string
          session_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          astrologer_id: string
          created_at?: string
          id?: string
          note?: string | null
          scheduled_at: string
          session_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          astrologer_id?: string
          created_at?: string
          id?: string
          note?: string | null
          scheduled_at?: string
          session_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role?: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          topic_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          topic_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_name: string
          body: string
          category: string
          created_at: string
          id: string
          is_hidden: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body: string
          category?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      horoscopes: {
        Row: {
          career: number
          content: string
          created_at: string
          finance: number
          id: string
          love: number
          period: string
          period_start: string
          sign: string
        }
        Insert: {
          career?: number
          content: string
          created_at?: string
          finance?: number
          id?: string
          love?: number
          period: string
          period_start: string
          sign: string
        }
        Update: {
          career?: number
          content?: string
          created_at?: string
          finance?: number
          id?: string
          love?: number
          period?: string
          period_start?: string
          sign?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          mood: number
          title: string | null
          transit_note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: number
          title?: string | null
          transit_note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: number
          title?: string | null
          transit_note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      natal_charts: {
        Row: {
          chart: Json
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chart: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chart?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ascendant: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          birth_lat: number | null
          birth_lon: number | null
          birth_place: string | null
          birth_time: string | null
          created_at: string
          full_name: string | null
          id: string
          moon_sign: string | null
          sun_sign: string | null
          tz_offset: number | null
          updated_at: string
        }
        Insert: {
          ascendant?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          moon_sign?: string | null
          sun_sign?: string | null
          tz_offset?: number | null
          updated_at?: string
        }
        Update: {
          ascendant?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          moon_sign?: string | null
          sun_sign?: string | null
          tz_offset?: number | null
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: { Args: { _slug: string }; Returns: undefined }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "astrologer" | "user" | "super_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "astrologer", "user", "super_admin"],
    },
  },
} as const
