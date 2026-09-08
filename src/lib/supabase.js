import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ismgmavxqmfenfgovrzt.supabase.co'
const supabaseKey = 'sb_publishable_9WQCNuMv7lIFWG0ifkStjg_x6zuWtWs' 

export const supabase = createClient(supabaseUrl, supabaseKey)
