import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import config from './config'
import { logSupabaseError } from './logger'
import type { SimulationParams } from '@/types/simulation'

// Lazy Supabase client — créé uniquement à l'appel, pas au module evaluation
// (évite l'erreur de build si les env vars Supabase ne sont pas définies)
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis.')
    }
    _client = createClient(config.supabaseUrl, config.supabaseAnonKey)
  }
  return _client
}

export interface SharedSimulation {
  id: string
  params: SimulationParams
  created_at: string
}

export async function insertSharedSimulation(params: SimulationParams): Promise<string> {
  const { data, error } = await getClient()
    .from('shared_simulations')
    .insert({ params })
    .select('id')
    .single()

  if (error || !data) {
    logSupabaseError({ operation: 'insert', table: 'shared_simulations', error: error ?? 'No data returned' })
    throw new Error(error?.message ?? 'Erreur lors de la sauvegarde de la simulation.')
  }

  return data.id as string
}

export async function getSharedSimulation(id: string): Promise<SharedSimulation | null> {
  try {
    const { data, error } = await getClient()
      .from('shared_simulations')
      .select('id, params, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      if (error) logSupabaseError({ operation: 'select', table: 'shared_simulations', error })
      return null
    }
    return data as SharedSimulation
  } catch (err) {
    logSupabaseError({ operation: 'select', table: 'shared_simulations', error: err })
    return null
  }
}
