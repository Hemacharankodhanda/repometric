export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Grade = 'excellent' | 'good' | 'needs-work' | 'at-risk';

export interface Database {
  public: {
    Tables: {
      repos: {
        Row: {
          id: string;
          owner: string;
          name: string;
          default_branch: string | null;
          last_analyzed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner: string;
          name: string;
          default_branch?: string | null;
          last_analyzed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner?: string;
          name?: string;
          default_branch?: string | null;
          last_analyzed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          repo_id: string;
          commit_sha: string;
          score: number;
          grade: Grade;
          category_scores: Json;
          fixes: Json;
          projected_score: number;
          core_version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          repo_id: string;
          commit_sha: string;
          score: number;
          grade: Grade;
          category_scores: Json;
          fixes: Json;
          projected_score: number;
          core_version: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          repo_id?: string;
          commit_sha?: string;
          score?: number;
          grade?: Grade;
          category_scores?: Json;
          fixes?: Json;
          projected_score?: number;
          core_version?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'analyses_repo_id_fkey';
            columns: ['repo_id'];
            referencedRelation: 'repos';
            referencedColumns: ['id'];
          },
        ];
      };
      graphs: {
        Row: {
          analysis_id: string;
          nodes: Json;
          edges: Json;
          stats: Json;
          truncated: boolean;
          created_at: string;
        };
        Insert: {
          analysis_id: string;
          nodes: Json;
          edges: Json;
          stats: Json;
          truncated?: boolean;
          created_at?: string;
        };
        Update: {
          analysis_id?: string;
          nodes?: Json;
          edges?: Json;
          stats?: Json;
          truncated?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'graphs_analysis_id_fkey';
            columns: ['analysis_id'];
            referencedRelation: 'analyses';
            referencedColumns: ['id'];
          },
        ];
      };
      badge_hits: {
        Row: {
          repo_id: string;
          day: string;
          count: number;
        };
        Insert: {
          repo_id: string;
          day: string;
          count?: number;
        };
        Update: {
          repo_id?: string;
          day?: string;
          count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'badge_hits_repo_id_fkey';
            columns: ['repo_id'];
            referencedRelation: 'repos';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_state: {
        Row: {
          key: string;
          tokens: number;
          updated_at: string;
        };
        Insert: {
          key: string;
          tokens: number;
          updated_at?: string;
        };
        Update: {
          key?: string;
          tokens?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_badge_hit: {
        Args: {
          p_repo_id: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
