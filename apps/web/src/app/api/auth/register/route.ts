import { NextResponse } from "next/server";
import { prisma, hashPassword } from "@daiwanmaru/core";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        console.log("[REGISTER] Checking if user exists:", email);
        // Check if user already exists
        const existingUser = await (prisma.user as any).findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("[REGISTER] User already exists:", email);
            return NextResponse.json({ ok: true, message: "If the email is valid, a verification link has been sent." });
        }

        console.log("[REGISTER] Hashing password...");
        const hashedPassword = await hashPassword(password);

        console.log("[REGISTER] Starting transaction...");
        // Transaction to create user and password credential
        await prisma.$transaction(async (tx: any) => {
            console.log("[REGISTER] Creating user...");
            const user = await tx.user.create({
                data: {
                    email,
                    status: "ACTIVE",
                    emailVerified: new Date(), // DEV: Auto-verify for testing
                },
            });

            console.log("[REGISTER] Creating password credential for userId:", user.id);
            await tx.passwordCredential.create({
                data: {
                    userId: user.id,
                    passwordHash: hashedPassword,
                },
            });
        });

        console.log("[REGISTER] Success!");

        // TODO: Send verification email
        // For now, we'll simulate success

        return NextResponse.json({ ok: true, message: "Registration successful. Please check your email for verification." });

    } catch (error: any) {
        console.error("[REGISTER_ERROR]", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
