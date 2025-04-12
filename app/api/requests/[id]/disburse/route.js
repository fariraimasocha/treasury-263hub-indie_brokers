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

    if (fundRequest.status !== "approved") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Only approved requests can be disbursed" },
        { status: 400 }
      );
    }

    // Check budget availability
    const budget = await Budget.findOne({ 
      dept: fundRequest.dept,
      year: fundRequest.year,
      quater: fundRequest.quater,
      status: "approved"
    }).session(session);

    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "No approved budget found for this department, year and quarter" },
        { status: 404 }
      );
    }

    // Check if there's enough remaining budget
    if (!budget.remainingAmount || budget.remainingAmount < fundRequest.amount) {
      // Reject the request due to insufficient budget
      fundRequest.status = "rejected";
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
      notes,
      status: "pending"
    }], { session });

    // Update fund request status
    fundRequest.status = "disbursed";
    await fundRequest.save({ session });

    // Update budget
    budget.remainingAmount = (budget.remainingAmount || budget.budget) - fundRequest.amount;
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