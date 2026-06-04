import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Slot = {
  id: number
  date: string
  time: string
  taken: boolean
  created_at?: string
}

export type Rdv = {
  id: number
  name: string
  service: string
  price: number
  date: string
  time: string
  phone: string
  status: 'pending' | 'confirmed' | 'done' | 'cancelled'
  created_at?: string
}
