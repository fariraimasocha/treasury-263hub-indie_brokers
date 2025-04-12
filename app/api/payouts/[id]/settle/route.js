// app/api/payouts/[id]/settle/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import payout from "@/models/payout";
import FundRequest from "@/models/fundRequest";
import Budget from "@/models/budget";
import Settlement from "@/models/settlement";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connect();
    const { id } = params;
    const { amountUsed, comment, attachments, settledBy } = await req.json();

    if (!amountUsed || !comment || !settledBy) {
      return NextResponse.json(
        { message: "Amount used, comment, and settler ID are required" },
        { status: 400 }
      );
    }

    const payout = await payout.findById(id).session(session);
    
    if (!payout) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "payout not found" },
        { status: 404 }
      );
    }

    const fundRequest = await FundRequest.findById(payout.requestId).session(session);
    
    if (!fundRequest) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Associated fund request not found" },
        { status: 404 }
      );
    }

    if (fundRequest.status !== "payoutd") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Only payoutd requests can be settled" },
        { status: 400 }
      );
    }

    // Get current budget
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

    // Calculate remaining balance
    const initialBudget = budget.remainingAmount + payout.amount;
    const remainingBalance = budget.remainingAmount + (payout.amount - amountUsed);

    // Create settlement record
    const settlement = await Settlement.create([{
      payoutId: payout._id,
      requestId: fundRequest._id,
      initialBudget,
      amountUsed,
      remainingBalance,
      comment,
      attachments: attachments || [],
      settledBy,
      settledAt: new Date(),
      status: "completed"
    }], { session });

    // Update fund request status
    fundRequest.status = "settled";
    await fundRequest.save({ session });

    // Update payout status
    payout.status = "completed";
    await payout.save({ session });

    // Update budget with actual amount used
    budget.remainingAmount = remainingBalance;
    await budget.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      message: "Settlement completed successfully",
      settlement: settlement[0],
    }, { status: 201 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("Error while settling payout: ", error);
    return NextResponse.json(
      { message: "Error while settling payout" },
      { status: 500 }
    );
  }
}