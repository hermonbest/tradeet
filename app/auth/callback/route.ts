import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        
        // This exchanges the "code" from Google for a real user session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Your Profile & Trial Logic
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    // Create profile with 7-day trial
                    const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    await supabase.from('profiles').insert({
                        id: user.id,
                        email: user.email,
                        role: 'free',
                        trial_expires: trialExpires,
                    })
                } else {
                    // Profile exists - update trial_expires if missing
                    if (!profile.trial_expires) {
                        const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                        await supabase
                            .from('profiles')
                            .update({ trial_expires: trialExpires })
                            .eq('id', user.id)
                    }
                    // Also update email if it's missing in the profile
                    if (!profile.email && user.email) {
                        await supabase
                            .from('profiles')
                            .update({ email: user.email })
                            .eq('id', user.id)
                    }
                }
                
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return to login if something fails
    return NextResponse.redirect(`${origin}/login?message=Authentication failed`)
}