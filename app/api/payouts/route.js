import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import payout from "@/models/payout";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    let query = {};
    if (requestId) query.requestId = requestId;

    const payouts = await payout.find(query)
      .populate("requestId")
      .populate("payoutdBy");

    return NextResponse.json({
      message: "payouts fetched successfully",
      payouts,
    });
  } catch (error) {
    console.log("Error while fetching payouts: ", error);
    return NextResponse.json(
      { message: "Error while fetching payouts" },
      { status: 500 }
    );
  }
}

