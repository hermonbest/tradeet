import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/login?message=Authentication failed')
    }

    // Check if profile exists, if not create it with trial_expires
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, trial_expires')
        .eq('id', data.user.id)
        .single()

    if (!profile) {
        // Create profile with 7-day trial
        const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            role: 'free',
            trial_expires: trialExpires,
        })
    } else if (!profile.trial_expires) {
        // For existing users without trial_expires, set it (legacy)
        const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
            .from('profiles')
            .update({ trial_expires: trialExpires })
            .eq('id', data.user.id)
    }

    redirect('/')
}