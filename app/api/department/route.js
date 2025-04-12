import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Department from "@/models/department";

export async function POST(req) {
  try {
    await connect();

    const { name } = await req.json();

    if (!name ) {
      return NextResponse.json(
        { message: "Department name is required." },
        { status: 400 }
      );
    }

    await Department.create({
      name,
    });

    return NextResponse.json(
      {
        message: "Department created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while creating department: ", error);
    return NextResponse.json(
      { message: "Error while creating department" },
      { status: 500 }
    );
  }
}