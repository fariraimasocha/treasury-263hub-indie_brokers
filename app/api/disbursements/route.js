import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Disbursement from "@/models/disbursement";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    let query = {};
    if (requestId) query.requestId = requestId;

    const disbursements = await Disbursement.find(query)
      .populate("requestId")
      .populate("disbursedBy");

    return NextResponse.json({
      message: "Disbursements fetched successfully",
      disbursements,
    });
  } catch (error) {
    console.log("Error while fetching disbursements: ", error);
    return NextResponse.json(
      { message: "Error while fetching disbursements" },
      { status: 500 }
    );
  }
}

