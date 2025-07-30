export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      blood_requests: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          patient_identity: string;
          reason: string;
          blood_group: string;
          bags_needed: number;
          collection_date: string;
          collection_time: string;
          collection_place: string;
          contact: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          patient_identity: string;
          reason: string;
          blood_group: string;
          bags_needed: number;
          collection_date: string;
          collection_time: string;
          collection_place: string;
          contact: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          patient_identity?: string;
          reason?: string;
          blood_group?: string;
          bags_needed?: number;
          collection_date?: string;
          collection_time?: string;
          collection_place?: string;
          contact?: string;
        };
      };
      donations: {
        Row: {
          id: number;
          created_at: string;
          user_id: string | null;
          email: string;
          amount: number;
          donation_type: string;
          name: string;
          message: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string | null;
          email: string;
          amount: number;
          donation_type: string;
          name: string;
          message?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          email?: string;
          amount?: number;
          donation_type?: string;
          name?: string;
          message?: string | null;
        };
      };
      donation_types: {
        Row: {
          id: number;
          created_at: string;
          name: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
        };
      };
      for_rent: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          title: string;
          address: string;
          description: string | null;
          rent: number;
          contact: string;
          image_url: string | null;
          is_approved: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          title: string;
          address: string;
          description?: string | null;
          rent: number;
          contact: string;
          image_url?: string | null;
          is_approved?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          title?: string;
          address?: string;
          description?: string | null;
          rent?: number;
          contact?: string;
          image_url?: string | null;
          is_approved?: boolean;
        };
      };
      general_info: {
        Row: {
          id: number;
          created_at: string;
          user_id: string | null;
          category: string;
          title: string;
          description: string;
          contact: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string | null;
          category: string;
          title: string;
          description: string;
          contact: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          category?: string;
          title?: string;
          description?: string;
          contact?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          is_admin?: boolean;
        };
      };
      reports: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          landlord_name: string;
          property_address: string;
          area: string;
          issue_type: string;
          description: string;
          map_url: string | null;
          evidence_url: string | null;
          votes: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          landlord_name: string;
          property_address: string;
          area: string;
          issue_type: string;
          description: string;
          map_url?: string | null;
          evidence_url?: string | null;
          votes?: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          landlord_name?: string;
          property_address?: string;
          area?: string;
          issue_type?: string;
          description?: string;
          map_url?: string | null;
          evidence_url?: string | null;
          votes?: number;
        };
      };
      report_comments: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          report_id: number;
          text: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          report_id: number;
          text: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          report_id?: number;
          text?: string;
        };
      };
      site_content: {
        Row: {
          key: string;
          value: Json;
          created_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          created_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          created_at?: string;
        };
      };
      sponsors: {
        Row: {
          id: number;
          created_at: string;
          image_url: string;
          link_url: string;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          image_url: string;
          link_url: string;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          image_url?: string;
          link_url?: string;
          is_active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}