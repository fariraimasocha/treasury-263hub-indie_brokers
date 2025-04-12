import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import FundRequest from "@/models/fundRequest";

export async function POST(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const { approverId, notes } = await req.json();

    if (!approverId) {
      return NextResponse.json(
        { message: "Approver ID is required" },
        { status: 400 }
      );
    }

    const fundRequest = await FundRequest.findById(id);
    
    if (!fundRequest) {
      return NextResponse.json(
        { message: "Fund request not found" },
        { status: 404 }
      );
    }

    if (fundRequest.status !== "SUBMITTED" && fundRequest.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { message: "Only submitted or under review requests can be approved" },
        { status: 400 }
      );
    }

    fundRequest.status = "APPROVED";
    fundRequest.approverId = approverId;
    fundRequest.approvedAt = new Date();
    if (notes) fundRequest.notes = notes;
    
    await fundRequest.save();

    return NextResponse.json({
      message: "Fund request approved successfully",
      fundRequest,
    });
  } catch (error) {
    console.log("Error while approving fund request: ", error);
    return NextResponse.json(
      { message: "Error while approving fund request" },
      { status: 500 }
    );
  }
}