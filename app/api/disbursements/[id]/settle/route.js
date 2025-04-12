// app/api/disbursements/[id]/settle/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Disbursement from "@/models/disbursement";
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

    const disbursement = await Disbursement.findById(id).session(session);
    
    if (!disbursement) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Disbursement not found" },
        { status: 404 }
      );
    }

    const fundRequest = await FundRequest.findById(disbursement.requestId).session(session);
    
    if (!fundRequest) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Associated fund request not found" },
        { status: 404 }
      );
    }

    if (fundRequest.status !== "disbursed") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Only disbursed requests can be settled" },
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
    const initialBudget = budget.remainingAmount + disbursement.amount;
    const remainingBalance = budget.remainingAmount + (disbursement.amount - amountUsed);

    // Create settlement record
    const settlement = await Settlement.create([{
      disbursementId: disbursement._id,
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

    // Update disbursement status
    disbursement.status = "completed";
    await disbursement.save({ session });

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
    console.log("Error while settling disbursement: ", error);
    return NextResponse.json(
      { message: "Error while settling disbursement" },
      { status: 500 }
    );
  }
}