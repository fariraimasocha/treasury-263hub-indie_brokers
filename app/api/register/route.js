import { connect } from "@/utils/connect";
import User from "@/models/user";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        await connect();

        const { name, email, phone, role, verified, password } = await req.json();
        const exists = await User.findOne({ $or: [{ email }] });
        if (exists) {
            return NextResponse.json({ message: "email already exists." }, { status: 409 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, phone, verified, role, password: hashedPassword });

        return NextResponse.json({ message: "User Registered" }, { status: 201 });

    } catch (error) {
        console.error("Error while registering user", error);
        return NextResponse.json({ message: "Error while registering the user" }, { status: 500 });
    }
}