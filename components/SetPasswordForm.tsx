'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { completePasswordReset } from '@/lib/actions/auth-actions'

const PASSWORD_MIN_LENGTH = 8

export function ResetPasswordForm({ error }: { error?: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const tooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword
  const canSubmit = password.length >= PASSWORD_MIN_LENGTH && password === confirmPassword

  return (
    <form
      action={completePasswordReset}
      className="flex flex-col justify-center gap-8 py-8 pr-10 pl-8 w-fit h-fit bg-white items-center border border-[#F2F2F2] rounded-lg"
    >
      <div className="flex flex-col w-fit h-fit gap-4">
        <div className="flex flex-row gap-1.5 justify-center">
          <div className="flex">
            <Image
              src="/logo-icon-dark.svg"
              alt="Brand Logo"
              width={27}
              height={28}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-row items-center text-lg">
            <p className="font-redhat text-[#26343A] font-black">Sci</p>
            <p className="bg-linear-to-r from-[#008AAC] to-[#71BED1] bg-clip-text text-transparent">.</p>
            <p className="font-redhat text-[#26343A] font-black">Part</p>
          </div>
        </div>
        <div className="font-redhat gap-0 flex flex-col items-center">
          <p className="font-black text-xl text-[#26343A]">Set a New Password</p>
          <p className="font-normal text-xs text-[#26343A] text-center max-w-64">
            First login — choose a permanent password to continue.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          type="password"
          name="password"
          placeholder="New Password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-80 bg-[#FAFAFA] border border-[#E2E2E2]"
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12 w-80 bg-[#FAFAFA] border border-[#E2E2E2]"
        />
        {tooShort && (
          <p className="text-xs text-red-600 px-1">Must be at least {PASSWORD_MIN_LENGTH} characters.</p>
        )}
        {mismatch && <p className="text-xs text-red-600 px-1">Passwords do not match.</p>}
        {error && <p className="text-xs text-red-600 px-1">{decodeURIComponent(error)}</p>}
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={!canSubmit}
        className="w-full h-12 bg-linear-to-r from-[#008AAC] to-[#71BED1] font-sans font-bold disabled:opacity-50"
      >
        Set Password &amp; Continue
      </Button>
    </form>
  )
}