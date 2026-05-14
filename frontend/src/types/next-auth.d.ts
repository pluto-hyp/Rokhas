import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    idToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string
  }
}
