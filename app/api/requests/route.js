import { connect } from "@/utils/connect";
import { NextResponse } from "next/server";
import Request from "@/models/request";

export async function GET(request) {
  try {
    await connect();
    const requests = await Request.find({});
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" });
  }
}

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { dept, budget, year, quater, comment } = body;

    console.log("Creating request with data:", {
      dept,
      budget,
      year,
      quater,
      comment,
    });

    const request = new Request({
      dept,
      budget,
      year,
      quater,
      comment,
    });

    await request.save();
    return NextResponse.json(request);
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      {
        error: "Failed to create request",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
