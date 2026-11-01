import * as crypto from "crypto"
import { promisify } from "util"

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

export default class AuthManager {
  private iterations: number
  private keyLength: number
  private algorithm: string
  pbkdf2 = promisify(crypto.pbkdf2);

  constructor(iterations: number = 220_000, keyLength: number = 64, algorithm: string = "sha512") {
    this.iterations = iterations
    this.keyLength = keyLength
    this.algorithm = algorithm
  }

  async createSalt(): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, salt) => {
        if (err) {
          return reject(err);
        }
        resolve(salt.toString('hex'));
      });
    });
  }

  async hashPassword(password: string): Promise<AuthPassword> {
    const salt = await this.createSalt()
    const hash = await this.hashPasswordWithSalt(password, salt)
    return {
      salt,
      hash,
      iterations: this.iterations,
      keyLength: this.keyLength,
      algorithm: this.algorithm
    }
  }

  async hashPasswordWithSalt(password: string, salt: string) {
    const hash = await this.pbkdf2(
      password,
      salt,
      this.iterations,
      this.keyLength,
      this.algorithm
    )
    return hash.toString("hex")
  }

  async verifyPassword(
    password: string,
    stored: AuthPassword
  ): Promise<boolean> {
    const hash = await this.hashPasswordWithSalt(password, stored.salt)
    
    const actual = Buffer.from(hash, "hex")
    const expected = Buffer.from(stored.hash, "hex")
    if (actual.length !== expected.length) {
      return false
    }
    return crypto.timingSafeEqual(actual, expected)
  }
}
