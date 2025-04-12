import User from "@/models/user";
import { connect } from "@/utils/connect";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connect();
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
