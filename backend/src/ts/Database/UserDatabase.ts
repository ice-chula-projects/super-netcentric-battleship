import type { AuthUser, AuthPassword } from "../Authentication/types.js"
import fs from "fs/promises"
import path from "path"

type DatabaseState = {
  users: AuthUser[]
}

export class UserDatabase {
  private filename: string

  constructor(filename: string) {
    this.filename = path.resolve(filename)
  }

  async loadDatabase(): Promise<DatabaseState> {
    try {
      const data = await fs.readFile(this.filename, "utf8")
      return JSON.parse(data) as DatabaseState
    } catch (err: any) {
      if (err.code === "ENOENT") {
        const initialState = { users: [] }
        await this.saveDatabase(initialState)
        return initialState as DatabaseState
      }
      throw err
    }
  }

  async saveDatabase(initialState: DatabaseState): Promise<void> {
    await fs.mkdir(path.dirname(this.filename), {
      recursive: true
    })
    await fs.writeFile(this.filename, JSON.stringify(initialState, null, 2), "utf8")
  }

  async getUserFromUuid(uuid: string) {
    const state = await this.loadDatabase()
    const user = state.users.find(user => user.id === uuid)
    if (!user) {
      throw new Error("User not found")
    }
    return user
  }

  async getUserFromName(username: string): Promise<AuthUser | null> {
    const state = await this.loadDatabase()
    return state.users.find(
      user => user.username === username
    ) ?? null;
  }

  async setUsername(uuid: string, username: string) {
    const state = await this.loadDatabase()
    const user = state.users.find(user => user.id === uuid)

    if (!user) {
      throw new Error("User not found")
    }
    if (user.username === username) {
      throw new Error("Username is the same")
    }
    
    const usernameTaken = state.users.some(
      other => other.username === username
    )
    if (usernameTaken) {
      throw new Error("Username already taken")
    }
    
    user.username = username
    await this.saveDatabase(state)
  }

  async setPassword(uuid: string, password: AuthPassword) {
    const state = await this.loadDatabase()
    const user = state.users.find(user => user.id === uuid)

    if (!user) {
      throw new Error("User not found")
    }

    user.password = password
    await this.saveDatabase(state)
  }

  async createUser(user: AuthUser): Promise<void> {
    const state = await this.loadDatabase()

    // if UUID is duplicate
    if (state.users.some(existing => existing.id === user.id)) {
      throw new Error("User already exists")
    }
  
    // if Username was taken
    if (state.users.some(
      existing => existing.username.toLowerCase() === user.username.toLowerCase())
    ) {
      throw new Error("Username already taken")
    }
    state.users.push(user)
    await this.saveDatabase(state)
  }
}
