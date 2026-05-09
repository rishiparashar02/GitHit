import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url?.trim() || !key?.trim()) return null
  if (!client) client = createClient(url.trim(), key.trim())
  return client
}

export function isVisitTrackingConfigured(): boolean {
  return getClient() !== null
}

function asCount(data: unknown): number {
  if (typeof data === 'number' && Number.isFinite(data)) return Math.trunc(data)
  if (typeof data === 'string') {
    const n = Number.parseInt(data, 10)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export async function incrementGithitVisit(): Promise<number> {
  const sb = getClient()
  if (!sb) throw new Error('Supabase env not configured')
  const { data, error } = await sb.rpc('increment_githit_visit')
  if (error) throw error
  return asCount(data)
}

export async function getGithitVisitCount(): Promise<number> {
  const sb = getClient()
  if (!sb) throw new Error('Supabase env not configured')
  const { data, error } = await sb.rpc('get_githit_visit_count')
  if (error) throw error
  return asCount(data)
}
