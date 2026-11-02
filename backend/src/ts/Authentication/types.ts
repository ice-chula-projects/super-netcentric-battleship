export type AuthPassword = {
  salt: string // salted
  hash: string // hashed with salt
  iterations: number
  keyLength: number
  algorithm: string
}

export type AuthUser = {
  id: string // UUIDv4
  username: string
  password: AuthPassword
}