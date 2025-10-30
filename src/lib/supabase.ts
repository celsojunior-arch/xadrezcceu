import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          birth_date: string;
          nickname: string | null;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          current_rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_date: string;
          nickname?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          current_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_date?: string;
          nickname?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          current_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      rating_history: {
        Row: {
          id: string;
          player_id: string;
          previous_rating: number;
          new_rating: number;
          variation: number;
          reason: string;
          tournament_id: string | null;
          round_number: number | null;
          desafio_confronto_id: string | null;
          date: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          previous_rating: number;
          new_rating: number;
          variation: number;
          reason: string;
          tournament_id?: string | null;
          round_number?: number | null;
          desafio_confronto_id?: string | null;
          date: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          previous_rating?: number;
          new_rating?: number;
          variation?: number;
          reason?: string;
          tournament_id?: string | null;
          round_number?: number | null;
          desafio_confronto_id?: string | null;
          date?: string;
          timestamp?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          start_date: string;
          end_date: string | null;
          number_of_rounds: number;
          status: 'draft' | 'active' | 'completed';
          participants: string[];
          present_players: string[];
          participants_locked: boolean;
          tiebreak_enabled: boolean;
          allow_no_show: boolean;
          bye_points: number;
          bye_affects_rating: boolean;
          organizer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          number_of_rounds?: number;
          status?: 'draft' | 'active' | 'completed';
          participants?: string[];
          present_players?: string[];
          participants_locked?: boolean;
          tiebreak_enabled?: boolean;
          allow_no_show?: boolean;
          bye_points?: number;
          bye_affects_rating?: boolean;
          organizer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          number_of_rounds?: number;
          status?: 'draft' | 'active' | 'completed';
          participants?: string[];
          present_players?: string[];
          participants_locked?: boolean;
          tiebreak_enabled?: boolean;
          allow_no_show?: boolean;
          bye_points?: number;
          bye_affects_rating?: boolean;
          organizer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}