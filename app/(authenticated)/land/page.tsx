import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Land() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect('/login')
  }

  return (
    <div>
      <p>Welcome, {data.claims.email}</p>
      <form>
        <button>Sign out</button>
      </form>
    </div>
  )
}