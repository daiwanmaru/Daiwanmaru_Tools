import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma, comparePassword } from "@daiwanmaru/core"

if (!process.env.AUTH_SECRET) {
    console.error("CRITICAL: AUTH_SECRET is missing! Auth.js will fail in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "not-set",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "not-set",
            allowDangerousEmailAccountLinking: true,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID || "not-set",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "not-set",
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("[AUTH] Missing credentials");
                    return null;
                }

                console.log("[AUTH] Attempting login for:", credentials.email);
                const user = await (prisma.user as any).findUnique({
                    where: { email: credentials.email as string },
                    include: { password: true }
                })

                if (!user) {
                    console.log("[AUTH] User not found:", credentials.email);
                    return null;
                }

                if (!user.password) {
                    console.log("[AUTH] User has no password set (likely OAuth only):", credentials.email);
                    return null;
                }

                const isValid = await comparePassword(credentials.password as string, user.password.passwordHash)

                if (!isValid) {
                    console.log("[AUTH] Invalid password for:", credentials.email);
                    return null;
                }

                // Spec: check user status
                if (user.status !== "ACTIVE") {
                    console.log("[AUTH] User disabled:", credentials.email);
                    throw new Error("USER_DISABLED");
                }

                // Spec: check email verified
                if (!user.emailVerified) {
                    console.log("[AUTH] Email not verified:", credentials.email);
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                console.log("[AUTH] Login successful for:", credentials.email);
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.plan = user.plan;
                // @ts-ignore
                token.status = user.status;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.plan = token.plan;
                // @ts-ignore
                session.user.status = token.status;
            }
            return session
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
        newUser: "/auth/new-user"
    }
})
