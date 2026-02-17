import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma, comparePassword } from "@daiwanmaru/core"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: { password: true }
                })

                if (!user || !user.password) return null

                const isValid = await comparePassword(credentials.password as string, user.password.passwordHash)

                if (!isValid) return null

                // Spec: check user status
                if (user.status !== "ACTIVE") throw new Error("USER_DISABLED")
                // Spec: check email verified
                if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED")

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    plan: user.plan,
                    status: user.status
                }
            }
        })
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // @ts-ignore
                session.user.plan = (user as any).plan;
                // @ts-ignore
                session.user.status = (user as any).status;
            }
            return session
        }
    },
    session: {
        strategy: "database"
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
        newUser: "/auth/new-user"
    }
})
