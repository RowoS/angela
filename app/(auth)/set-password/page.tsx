import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { roleHomeRoute } from '@/lib/actions/role-actions'
import { ResetPasswordForm } from '@/components/SetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Already cleared the flag — nothing to gate, send them where they belong.
  if (!user.passwordResetRequired) {
    redirect(roleHomeRoute(user.role))
  }

  const { error } = await searchParams

  return (
    <main>
      <div className="flex flex-col items-center flex-1 justify-center h-screen w-screen bg-[#FAFAFA]">
        <ResetPasswordForm error={error} />
      </div>
    </main>
  )
}