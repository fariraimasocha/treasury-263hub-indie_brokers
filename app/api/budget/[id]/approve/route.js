// app/api/budgets/[id]/approve/route.js
import { NextResponse } from "next/server";
import { connect } from "@/utils/connect";
import Budget from "@/models/budget";

export async function POST(req, { params }) {
  try {
    await connect();
    const { id } = params;

    const budget = await Budget.findById(id);
    
    if (!budget) {
      return NextResponse.json(
        { message: "Budget not found" },
        { status: 404 }
      );
    }

    if (budget.status !== "pending") {
      return NextResponse.json(
        { message: "Only pending budgets can be approved" },
        { status: 400 }
      );
    }

    budget.status = "approved";
    await budget.save();

    return NextResponse.json({
      message: "Budget approved successfully",
      budget,
    });
  } catch (error) {
    console.log("Error while approving budget: ", error);
    return NextResponse.json(
      { message: "Error while approving budget" },
      { status: 500 }
    );
  }
}