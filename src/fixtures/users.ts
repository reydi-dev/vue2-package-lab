export type UserStatus = 'active' | 'invited' | 'suspended'

export interface User {
  id: number
  name: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
}

const firstNames = ['Ava', 'Noah', 'Mina', 'Arman', 'Lina', 'Omid', 'Sara', 'Kian', 'Nika', 'Dara']
const lastNames = ['Azadi', 'Bennett', 'Chen', 'Darvishi', 'Evans', 'Farahani', 'Gupta', 'Hosseini']
const roles = ['Engineer', 'Designer', 'Analyst', 'Support', 'Manager']
const statuses: UserStatus[] = ['active', 'invited', 'suspended']

export function createUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const first = firstNames[index % firstNames.length]
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length]
    const month = String((index % 12) + 1).padStart(2, '0')
    const day = String((index % 27) + 1).padStart(2, '0')

    return {
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}.${id}@example.test`.toLowerCase(),
      role: roles[index % roles.length],
      status: statuses[index % statuses.length],
      createdAt: `2024-${month}-${day}`,
    }
  })
}

export const localUsers = createUsers(72)
export const serverUsers = createUsers(140)
