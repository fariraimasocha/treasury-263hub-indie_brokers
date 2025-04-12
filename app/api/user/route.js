import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import User from "@/models/user";

export async function POST(req) {
  try {
    await connect();

    const { name, email, role, departmentId } = await req.json();

    if (!name || !email || !departmentId) {
      return NextResponse.json(
        { message: "Name, email, and department are required." },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      role: role || "REQUESTER",
      departmentId,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while creating user: ", error);
    return NextResponse.json(
      { message: "Error while creating user" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connect();

    const users = await User.find().populate("departmentId");

    return NextResponse.json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("Error while fetching users: ", error);
    return NextResponse.json(
      { message: "Error while fetching users" },
      { status: 500 }
    );
  }
}