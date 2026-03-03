import { createClient } from '@supabase/supabase-js'

// This client uses the service role key and bypasses RLS.
// ONLY use this on the server, never expose it to the browser.
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.')
    }

    console.log('[ADMIN_CLIENT] Creating admin client with service role key (length: ' + serviceKey.length + ')');

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
