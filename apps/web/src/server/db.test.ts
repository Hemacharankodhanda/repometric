import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { normalizeRepo, getServiceClient, getRepo, upsertRepo } from './db';
import type { Database } from '../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

describe('Supabase db helper (server-only)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('normalizeRepo', () => {
    it('lowercases owner and repo name and trims whitespace', () => {
      const res = normalizeRepo('  FaceBook ', ' React  ');
      expect(res).toEqual({ owner: 'facebook', name: 'react' });
    });
  });

  describe('server-only isolation', () => {
    it('declares "server-only" import at the very top of db.ts', () => {
      const dbPath = path.resolve(__dirname, 'db.ts');
      const content = fs.readFileSync(dbPath, 'utf-8');
      expect(content.startsWith("import 'server-only';")).toBe(true);
    });
  });

  describe('getServiceClient', () => {
    it('throws error when env vars are missing', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => getServiceClient()).toThrowError(/Missing Supabase credentials/);
    });

    it('instantiates client when credentials are provided', () => {
      const client = getServiceClient('https://test.supabase.co', 'test-service-key');
      expect(client).toBeDefined();
      expect(typeof client.from).toBe('function');
    });
  });

  describe('repo insert and read operations', () => {
    it('inserts and reads one repos row with lowercase normalization', async () => {
      const fakeRow = {
        id: '11111111-2222-3333-4444-555555555555',
        owner: 'facebook',
        name: 'react',
        default_branch: 'main',
        last_analyzed_at: '2026-10-19T10:00:00Z',
        created_at: '2026-10-19T10:00:00Z',
      };

      // Mock typed Supabase client
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: fakeRow, error: null }),
          }),
        }),
      });

      const upsertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: fakeRow, error: null }),
        }),
      });

      const mockClient = {
        from: vi.fn((table: string) => {
          if (table === 'repos') {
            return {
              select: selectMock,
              upsert: upsertMock,
            };
          }
          throw new Error(`Unexpected table ${table}`);
        }),
      } as unknown as SupabaseClient<Database>;

      // 1. Insert/upsert row
      const upserted = await upsertRepo(mockClient, 'FaceBook', 'React', 'main');
      expect(upserted).toEqual(fakeRow);
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'facebook',
          name: 'react',
          default_branch: 'main',
        }),
        { onConflict: 'owner,name' },
      );

      // 2. Read row
      const fetched = await getRepo(mockClient, 'FACEBOOK', 'REACT');
      expect(fetched).toEqual(fakeRow);
      expect(mockClient.from).toHaveBeenCalledWith('repos');
    });
  });
});
