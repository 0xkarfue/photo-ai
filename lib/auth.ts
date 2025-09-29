import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })

        if (!user) {
          return null
        }

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!validPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.username,
          email: user.username // Using username as email for simplicity
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}










// import Google from "next-auth/providers/google"
// import { prisma } from "./db"

// export const authOptions = {
//     providers: [
//         Google({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//     ],
//     callbacks: {
//         //@ts-ignore
//         async signIn({ user }) {
//             try {
//                 const username = user.email!

//                 await prisma.user.upsert({
//                     where: {
//                         username: username,
//                     },
//                     update: {},
//                     create: {
//                         username: username,
//                         password: "", 
//                     },
//                 })
//                 return true
//             } catch (error) {
//                 console.error("Error during sign in:", error)
//                 return false
//             }
//         }
//     }
// }