import { createClient } from '@supabase/supabase-js';

// Cliente "público", usado no navegador. Só tem permissão de leitura/escrita
// conforme as regras (RLS) que você definir no Supabase.
export function getSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Cliente "administrativo", usado SOMENTE em código de servidor (API routes,
// cron job). Usa a service role key, que ignora RLS — nunca exponha essa
// chave no navegador.
export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
