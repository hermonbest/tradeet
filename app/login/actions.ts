'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function googleLogin() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: signupData, error } = await supabase.auth.signUp(data)

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    // If signup successful, update profile with trial_expires
    if (signupData.user) {
        const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
            .from('profiles')
            .update({ trial_expires: trialExpires })
            .eq('id', signupData.user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}
