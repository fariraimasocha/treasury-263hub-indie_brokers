// app/api/fund-requests/[id]/disburse/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import FundRequest from "@/models/request";
import Disbursement from "@/models/disbursement";
import Budget from "@/models/budget";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connect();
    const { id } = params;
    const { disbursedBy, transactionReference, notes } = await req.json();

    if (!disbursedBy || !transactionReference) {
      return NextResponse.json(
        { message: "Disburser ID and transaction reference are required" },
        { status: 400 }
      );
    }

    const fundRequest = await FundRequest.findById(id).session(session);
    
    if (!fundRequest) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Fund request not found" },
        { status: 404 }
      );
    }

    if (fundRequest.status !== "APPROVED") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Only approved requests can be disbursed" },
        { status: 400 }
      );
    }

    // Check budget availability
    const budget = await Budget.findOne({ 
      departmentId: fundRequest.departmentId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).session(session);

    if (!budget || budget.remainingAmount < fundRequest.amount) {
      // Reject the request due to insufficient budget
      fundRequest.status = "REJECTED";
      fundRequest.rejectionReason = "Insufficient budget for disbursement";
      await fundRequest.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      return NextResponse.json(
        { message: "Fund request rejected due to insufficient budget" },
        { status: 400 }
      );
    }

    // Create disbursement record
    const disbursement = await Disbursement.create([{
      requestId: fundRequest._id,
      amount: fundRequest.amount,
      disbursedBy,
      disbursedAt: new Date(),
      transactionReference,
      notes
    }], { session });

    // Update fund request status
    fundRequest.status = "DISBURSED";
    await fundRequest.save({ session });

    // Update budget
    budget.remainingAmount -= fundRequest.amount;
    await budget.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      message: "Funds disbursed successfully",
      disbursement: disbursement[0],
    }, { status: 201 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("Error while disbursing funds: ", error);
    return NextResponse.json(
      { message: "Error while disbursing funds" },
      { status: 500 }
    );
  }
}