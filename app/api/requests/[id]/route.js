app/api/fund-requests/[id]/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import FundRequest from "@/models/fundRequest";

export async function GET(req, { params }) {
  try {
    await connect();
    const { id } = params;

    const fundRequest = await FundRequest.findById(id)
      .populate("departmentId")
      .populate("requesterId")
      .populate("approverId");

    if (!fundRequest) {
      return NextResponse.json(
        { message: "Fund request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Fund request fetched successfully",
      fundRequest,
    });
  } catch (error) {
    console.log("Error while fetching fund request: ", error);
    return NextResponse.json(
      { message: "Error while fetching fund request" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const updates = await req.json();

    // If status is being updated to SUBMITTED, set submittedAt
    if (updates.status === "SUBMITTED") {
      updates.submittedAt = new Date();
    }

    const fundRequest = await FundRequest.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!fundRequest) {
      return NextResponse.json(
        { message: "Fund request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Fund request updated successfully",
      fundRequest,
    });
  } catch (error) {
    console.log("Error while updating fund request: ", error);
    return NextResponse.json(
      { message: "Error while updating fund request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connect();
    const { id } = params;

    // Only allow deletion of DRAFT requests
    const fundRequest = await FundRequest.findById(id);
    
    if (!fundRequest) {
      return NextResponse.json(
        { message: "Fund request not found" },
        { status: 404 }
      );
    }

    if (fundRequest.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Only draft requests can be deleted" },
        { status: 400 }
      );
    }

    await FundRequest.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Fund request deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting fund request: ", error);
    return NextResponse.json(
      { message: "Error while deleting fund request" },
      { status: 500 }
    );
  }
}

