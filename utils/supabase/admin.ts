/**
 * ⚠️ SECURITY NOTICE ⚠️
 * This file creates a Supabase admin client using the SERVICE ROLE KEY.
 * The service role key bypasses Row Level Security (RLS) and has FULL database access.
 *
 * CRITICAL: Never import or use this client in:
 * - Client Components ("use client")
 * - Browser-side code
 * - Any file that may be bundled and sent to the client
 *
 * ONLY use this in:
 * - Server Actions
 * - API Routes
 * - Server Components (default in App Router)
 * - Any secure server-side-only code
 */

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
