// app/api/budgets/[id]/reject/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Budget from "@/models/budget";

export async function POST(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const budget = await Budget.findById(id);
    
    if (!budget) {
      return NextResponse.json(
        { message: "Budget not found" },
        { status: 404 }
      );
    }

    if (budget.status !== "pending") {
      return NextResponse.json(
        { message: "Only pending budgets can be rejected" },
        { status: 400 }
      );
    }

    budget.status = "rejected";
    budget.comment = budget.comment + " | Rejected: " + reason;
    await budget.save();

    return NextResponse.json({
      message: "Budget rejected successfully",
      budget,
    });
  } catch (error) {
    console.log("Error while rejecting budget: ", error);
    return NextResponse.json(
      { message: "Error while rejecting budget" },
      { status: 500 }
    );
  }
}