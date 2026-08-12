export type UserRole = 'admin' | 'agent' | 'manager'

export type UserRow = {
  id: string
  full_name: string | null
  department: string | null
  role: UserRole
  email: string | null
  created_at: string
}