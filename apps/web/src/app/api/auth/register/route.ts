import { NextResponse } from "next/server";
import { prisma, hashPassword } from "@daiwanmaru/core";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await (prisma.user as any).findUnique({
            where: { email },
        });

        if (existingUser) {
            // Spec: avoid email enumeration. 
            // In a real production app, we'd still return 200 and say "Check your email".
            // For now, let's keep it simple but follow the spec's spirit.
            return NextResponse.json({ ok: true, message: "If the email is valid, a verification link has been sent." });
        }

        const hashedPassword = await hashPassword(password);

        // Transaction to create user and password credential
        await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    status: "ACTIVE",
                    emailVerified: new Date(), // DEV: Auto-verify for testing
                },
            });

            await tx.passwordCredential.create({
                data: {
                    userId: user.id,
                    passwordHash: hashedPassword,
                },
            });
        });

        // TODO: Send verification email
        // For now, we'll simulate success

        return NextResponse.json({ ok: true, message: "Registration successful. Please check your email for verification." });

    } catch (error: any) {
        console.error("[REGISTER_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
