'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Shield, Copy, Check, Lock } from 'lucide-react'
import {
  createUser,
  updateUserRoleDepartment
} from '@/lib/actions/user-actions'
import type { UserRow, UserRole } from '@/lib/utils/user-utils'

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#818cf8',
  agent: '#34d399',
  manager: '#fb923c',
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access — manage categories, SLAs, users, all reports',
  agent: 'View and manage tickets — assign, update status, comment, reassign',
  manager: 'Read-only access to department tickets and summary reports',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 6,
  border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit',
  outline: 'none', color: '#0f172a', boxSizing: 'border-box',
}

function initials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

interface UserSettingsFormProps {
  initialUsers: UserRow[]
  currentUserId: string
}

export function UserSettingsForm({ initialUsers, currentUserId }: UserSettingsFormProps) {
  const [creating, setCreating] = useState(false)
  const [revealedPassword, setRevealedPassword] = useState<{ email: string; password: string } | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Role reference card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>System Roles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {(['admin', 'agent', 'manager'] as UserRole[]).map((role) => (
            <div key={role} style={{ padding: '12px 14px', borderRadius: 9, border: `1px solid ${ROLE_COLORS[role]}33`, backgroundColor: ROLE_COLORS[role] + '0e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Shield size={13} style={{ color: ROLE_COLORS[role] }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: ROLE_COLORS[role], textTransform: 'capitalize' }}>{role}</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{ROLE_DESCRIPTIONS[role]}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, backgroundColor: '#fafbff', border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
          <strong>Note:</strong> Employees (ticket requesters) are not system users. Their identity is captured via QR badge scan at ticket creation and closure.
        </div>
      </div>

      {revealedPassword && (
        <TempPasswordBanner
          email={revealedPassword.email}
          password={revealedPassword.password}
          onDismiss={() => setRevealedPassword(null)}
        />
      )}

      {/* Users table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>System Users</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Admins, Agents, and Managers with portal access</div>
          </div>
          <button
            onClick={() => setCreating((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={13} /> {creating ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {creating && (
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbff' }}>
            <CreateUserForm
              onCreated={(email, password) => {
                setRevealedPassword({ email, password })
                setCreating(false)
              }}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {initialUsers.length === 0 && !creating && (
          <div style={{ padding: '32px 22px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            No users yet.
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafbff' }}>
              {['User', 'Department', 'Role', 'Status', ''].map((h, i) => (
                <th key={i} style={{ padding: '9px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u, i) => (
              <UserTableRow key={u.id} user={u} isLast={i === initialUsers.length - 1} currentUserId={currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TempPasswordBanner({
  email,
  password,
  onDismiss,
}: {
  email: string
  password: string
  onDismiss: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (permissions, non-secure context) —
      // the password stays visible in the banner either way, so
      // there's nothing more to do here than let the admin select it.
    }
  }

  return (
    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
        Account created for {email}
      </div>
      <div style={{ fontSize: 12, color: '#92400e', marginBottom: 10 }}>
        This temporary password is shown once. Copy it and share it with the user directly — they&apos;ll be required to set their own password on first login.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
          {password}
        </code>
        <button
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid #fde68a', backgroundColor: '#fff', color: '#92400e', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={onDismiss}
          style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: '#92400e', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function CreateUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: (email: string, password: string) => void
  onCancel: () => void
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<UserRole>('agent')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        const { tempPassword } = await createUser({ full_name: fullName, email, department, role })
        onCreated(email.trim().toLowerCase(), tempPassword)
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to create user.')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isPending} style={inputStyle} placeholder="Jane Doe" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending} style={inputStyle} placeholder="jane.doe@company.com" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Department</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} disabled={isPending} style={inputStyle} placeholder="e.g. Finance" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={isPending} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !fullName.trim() || !email.trim()}
          style={{ padding: '7px 18px', borderRadius: 7, border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Creating...' : 'Create User'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={{ padding: '7px 18px', borderRadius: 7, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel

        </button>
        {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      </div>
    </div>
  )
}

function UserTableRow({ user, isLast, currentUserId }: { user: UserRow; isLast: boolean; currentUserId: string }) {
  const [editing, setEditing] = useState(false)
  const [role, setRole] = useState<UserRole>(user.role)
  const [department, setDepartment] = useState(user.department ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isProtectedAdmin = user.role === 'admin' && user.id !== currentUserId;

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await updateUserRoleDepartment(user.id, { role, department })
        setEditing(false)
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to update user.')
      }
    })
  }

  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: ROLE_COLORS[user.role] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${ROLE_COLORS[user.role]}44` }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: ROLE_COLORS[user.role] }}>{initials(user.full_name).toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user.full_name ?? '—'}</div>
            {user.email && <div style={{ fontSize: 11, color: '#94a3b8' }}>{user.email}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 22px', fontSize: 13, color: '#64748b' }}>
        {editing ? (
          <input value={department} onChange={(e) => setDepartment(e.target.value)} disabled={isPending} style={{ ...inputStyle, width: 140 }} />
        ) : (
          user.department ?? '—'
        )}
      </td>
      <td style={{ padding: '12px 22px' }}>
        {editing ? (
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={isPending} style={{ ...inputStyle, width: 120, cursor: 'pointer' }}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: ROLE_COLORS[user.role] }}>
            <Shield size={12} />
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        )}
      </td>
      <td style={{ padding: '12px 22px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: 10, padding: '2px 9px' }}>Active</span>
      </td>
      <td style={{ padding: '12px 22px' }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleSave} disabled={isPending} style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isPending ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} disabled={isPending} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        ) : isProtectedAdmin ? (
          <span
            title="Admins cannot modify other admin accounts"
            style={{ display: 'inline-flex', color: '#cbd5e1', cursor: 'not-allowed' }}
          >
            <Lock size={14} />
          </span>
        ) : (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <Edit2 size={14} />
          </button>
        )}
        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</div>}
      </td>
    </tr>
  )
}