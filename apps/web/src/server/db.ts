import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

let serviceClientInstance: SupabaseClient<Database> | null = null;

/**
 * Normalizes repo owner and name to lowercase as required by Supabase check constraints.
 */
export function normalizeRepo(owner: string, name: string) {
  return {
    owner: owner.trim().toLowerCase(),
    name: name.trim().toLowerCase(),
  };
}

/**
 * Returns a typed Supabase client with the service role key.
 * This client bypasses RLS and must NEVER be exposed or imported on the client side.
 */
export function getServiceClient(
  supabaseUrl?: string,
  serviceRoleKey?: string,
): SupabaseClient<Database> {
  const url = supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.',
    );
  }

  // If custom credentials passed (e.g. for testing), return isolated client
  if (supabaseUrl || serviceRoleKey) {
    return createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!serviceClientInstance) {
    serviceClientInstance = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceClientInstance;
}

/**
 * Helper to get a repo by owner and name (both lowercase).
 */
export async function getRepo(client: SupabaseClient<Database>, owner: string, name: string) {
  const normalized = normalizeRepo(owner, name);
  const { data, error } = await client
    .from('repos')
    .select('*')
    .eq('owner', normalized.owner)
    .eq('name', normalized.name)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Helper to upsert a repo row.
 */
export async function upsertRepo(
  client: SupabaseClient<Database>,
  owner: string,
  name: string,
  defaultBranch?: string | null,
) {
  const normalized = normalizeRepo(owner, name);
  const { data, error } = await client
    .from('repos')
    .upsert(
      {
        owner: normalized.owner,
        name: normalized.name,
        default_branch: defaultBranch ?? null,
        last_analyzed_at: new Date().toISOString(),
      },
      { onConflict: 'owner,name' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
