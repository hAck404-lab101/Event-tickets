export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          slug: string
          organizer_id: string
          title: string
          description: string
          category_id: string | null
          banner_url: string | null
          venue_id: string | null
          city: string
          starts_at: string
          ends_at: string | null
          status: 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'sold_out'
          is_featured: boolean
          instructions: string | null
          refund_policy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          organizer_id: string
          title: string
          description: string
          category_id?: string | null
          banner_url?: string | null
          venue_id?: string | null
          city: string
          starts_at: string
          ends_at?: string | null
          status?: 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'sold_out'
          is_featured?: boolean
          instructions?: string | null
          refund_policy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          organizer_id?: string
          title?: string
          description?: string
          category_id?: string | null
          banner_url?: string | null
          venue_id?: string | null
          city?: string
          starts_at?: string
          ends_at?: string | null
          status?: 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'sold_out'
          is_featured?: boolean
          instructions?: string | null
          refund_policy?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... Add other tables as needed. 
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_status: 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'sold_out'
      payment_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
    }
  }
}
