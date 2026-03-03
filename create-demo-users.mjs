import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createDemoUsers() {
    const demoUsers = [
        {
            email: 'creator@tradeet.com',
            password: 'demo123Password!',
            role: 'free',
            affiliate_code: 'CREATOR20',
            is_influencer: true,
            description: 'Content Creator (Influencer)'
        },
        {
            email: 'user1@tradeet.com',
            password: 'demo123Password!',
            role: 'free',
            affiliate_code: 'USERONE',
            is_influencer: false,
            description: 'Normal User 1'
        },
        {
            email: 'user2@tradeet.com',
            password: 'demo123Password!',
            role: 'free',
            affiliate_code: 'USERTWO',
            is_influencer: false,
            description: 'Normal User 2'
        }
    ]

    for (const u of demoUsers) {
        console.log(`\n--- Processing ${u.description}: ${u.email} ---`)

        let userId;

        // Try to create user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true
        })

        if (authError) {
            console.log(`Note: ${authError.message}`);
            // Find existing user ID
            const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', u.email).single()
            if (existingProfile) {
                userId = existingProfile.id
            }
        } else if (authUser?.user) {
            userId = authUser.user.id
            console.log(`Auth user created: ${userId}`)
        }

        if (userId) {
            await updateProfile(userId, u)
        } else {
            console.error(`Could not find or create user for ${u.email}`)
        }
    }
}

async function updateProfile(userId, userData) {
    console.log(`Updating profile for ${userData.email}...`)

    // Check constraint might be issue. Let's try to update WITHOUT role first if it fails.
    const updateData = {
        affiliate_code: userData.affiliate_code,
        is_influencer: userData.is_influencer,
        role: userData.role
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

    if (profileError) {
        if (profileError.message.includes('constraint')) {
            console.warn(`Constraint error with role '${userData.role}'. Retrying without role update...`)
            const { error: retryError } = await supabase
                .from('profiles')
                .update({
                    affiliate_code: userData.affiliate_code,
                    is_influencer: userData.is_influencer
                })
                .eq('id', userId)

            if (retryError) {
                console.error(`Final error updating profile for ${userData.email}:`, retryError.message)
            } else {
                console.log(`Profile updated successfully (skipped role update).`)
            }
        } else {
            console.error(`Error updating profile for ${userData.email}:`, profileError.message)
        }
    } else {
        console.log(`Profile updated successfully with code: ${userData.affiliate_code}`)
    }
}

createDemoUsers().catch(console.error)
