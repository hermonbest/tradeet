import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) console.error(listError)

    const emails = ['creator@tradeet.com', 'user1@tradeet.com', 'user2@tradeet.com']
    const users = authUsers?.users.filter(u => emails.includes(u.email)) || []

    console.log('Auth Users found:', users.map(u => ({ email: u.email, id: u.id })))

    const { data: profiles } = await supabase.from('profiles').select('id, email').in('email', emails)
    console.log('Profiles found:', profiles)
}

check()
