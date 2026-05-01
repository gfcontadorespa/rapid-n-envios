import { createClient } from '@supabase/supabase-js';

// Usamos el SERVICE_ROLE_KEY porque este cliente solo se ejecutará en el servidor 
// (en el Webhook) de forma segura. Nos permite leer la BD saltando las reglas de RLS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
