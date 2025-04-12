
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import FundRequest from "@/models/fundRequest";

export async function POST(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const { approverId, rejectionReason } = await req.json();

    if (!approverId || !rejectionReason) {
      return NextResponse.json(
        { message: "Approver ID and rejection reason are required" },
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
        { message: "Only submitted or under review requests can be rejected" },
        { status: 400 }
      );
    }

    fundRequest.status = "REJECTED";
    fundRequest.approverId = approverId;
    fundRequest.rejectionReason = rejectionReason;
    
    await fundRequest.save();

    return NextResponse.json({
      message: "Fund request rejected successfully",
      fundRequest,
    });
  } catch (error) {
    console.log("Error while rejecting fund request: ", error);
    return NextResponse.json(
      { message: "Error while rejecting fund request" },
      { status: 500 }
    );
  }
}